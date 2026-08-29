import * as THREE from "three";

/**
 * Simulasi fluida GPU (Navier-Stokes) untuk mask reveal hero — port mandiri
 * dari pipeline yang dipakai landonorris.com (arsitektur mnmxmx/fluid-three,
 * shader & konfigurasi diekstrak verbatim dari bundle mereka):
 *
 *   ExternalForce (splat delta mouse) → Advection (BFECC) → Divergence
 *   → Poisson (Jacobi, 4 iterasi) → Pressure subtract → Output (|velocity|)
 *
 * Output = tekstur mask; hero menyampling `texture2D(uFluid, vUv).r` lalu
 * `step(0.1, …)` — tepi cair tegas ala Lando. Pass viscous sengaja tidak
 * di-port (Lando menjalankan isViscous: false).
 */

export interface FluidOptions {
  iterations_poisson: number;
  dissipation: number;
  mouse_force: number;
  resolution: number;
  cursor_size: number;
  straightness: number;
  dt: number;
  BFECC: boolean;
}

// Nilai persis dari bundle landonorris.com.
const DEFAULTS: FluidOptions = {
  iterations_poisson: 4,
  dissipation: 0.96,
  mouse_force: 50,
  resolution: 0.1,
  cursor_size: 18,
  straightness: 1,
  dt: 0.014,
  BFECC: true,
};

const FACE_VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
uniform vec2 px;
uniform vec2 boundarySpace;
varying vec2 uv;
void main(){
  vec3 pos = position;
  vec2 scale = 1.0 - boundarySpace * 2.0;
  pos.xy = pos.xy * scale;
  uv = vec2(0.5) + pos.xy * 0.5;
  gl_Position = vec4(pos, 1.0);
}
`;

const MOUSE_VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;
void main(){
  vec2 pos = position.xy * scale * 2.0 * px + center;
  vUv = uv;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

// Splat gaya kursor — persis bundle Lando.
const FORCE_FRAG = /* glsl */ `
precision highp float;
uniform vec2 force;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;
void main(){
  vec2 circle = (vUv - 0.5) * 2.0;
  float d = 1.0 - min(length(circle), 1.0);
  d *= d;
  gl_FragColor = vec4(force * d, 0.0, 1.0);
}
`;

// Advection BFECC + dissipation — persis bundle Lando.
const ADVECTION_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform float dissipation;
uniform bool isBFECC;
uniform vec2 fboSize;
uniform vec2 px;
varying vec2 uv;
void main(){
  vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
  vec2 vel;
  if(isBFECC == false){
    vec2 uv2 = uv - texture2D(velocity, uv).xy * dt * ratio;
    vel = texture2D(velocity, uv2).xy;
  } else {
    vec2 spot_new = uv;
    vec2 vel_old = texture2D(velocity, uv).xy;
    vec2 spot_old = spot_new - vel_old * dt * ratio;
    vec2 vel_new1 = texture2D(velocity, spot_old).xy;
    vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
    vec2 error = spot_new2 - spot_new;
    vec2 spot_new3 = spot_new - error / 2.0;
    vec2 vel_2 = texture2D(velocity, spot_new3).xy;
    vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
    vel = texture2D(velocity, spot_old2).xy;
  }
  gl_FragColor = vec4(vel * dissipation, 0.0, 0.0);
}
`;

// Divergence — persis bundle Lando.
const DIVERGENCE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;
varying vec2 uv;
void main(){
  float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
  float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
  float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
  float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
  float divergence = (x1 - x0 + y1 - y0) / 2.0;
  gl_FragColor = vec4(divergence / dt);
}
`;

// Poisson dengan "straightness" — persis bundle Lando.
const POISSON_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float straightness;
uniform vec2 px;
varying vec2 uv;
void main(){
  float p0 = texture2D(pressure, uv+vec2(px.x * 2.0, 0.0)).r;
  float p1 = texture2D(pressure, uv-vec2(px.x * 2.0, 0.0)).r;
  float p2 = texture2D(pressure, uv+vec2(0.0, px.y * 2.0)).r;
  float p3 = texture2D(pressure, uv-vec2(0.0, px.y * 2.0)).r;
  float div = texture2D(divergence, uv).r;
  float newP = (p0 + p1 + p2 + p3) / (4.0 + straightness) - div;
  gl_FragColor = vec4(newP);
}
`;

// Kurangi gradien tekanan dari velocity (proyeksi bebas-divergensi).
const PRESSURE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform vec2 px;
uniform float dt;
varying vec2 uv;
void main(){
  float p0 = texture2D(pressure, uv+vec2(px.x, 0.0)).r;
  float p1 = texture2D(pressure, uv-vec2(px.x, 0.0)).r;
  float p2 = texture2D(pressure, uv+vec2(0.0, px.y)).r;
  float p3 = texture2D(pressure, uv-vec2(0.0, px.y)).r;
  vec2 v = texture2D(velocity, uv).xy;
  vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
  v = v - gradP * dt;
  gl_FragColor = vec4(v, 0.0, 1.0);
}
`;

// Mask akhir = besaran velocity.
const OUTPUT_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D velocity;
uniform float outputScale;
varying vec2 uv;
void main(){
  float len = length(texture2D(velocity, uv).xy);
  gl_FragColor = vec4(vec3(len * outputScale), 1.0);
}
`;

interface Pass {
  scene: THREE.Scene;
  material: THREE.RawShaderMaterial;
}

function createFbo(w: number, h: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export class FluidSim {
  readonly options: FluidOptions;

  private renderer: THREE.WebGLRenderer;
  private camera = new THREE.Camera();
  private fboSize = new THREE.Vector2();
  private cellScale = new THREE.Vector2();

  private vel0!: THREE.WebGLRenderTarget;
  private vel1!: THREE.WebGLRenderTarget;
  private div!: THREE.WebGLRenderTarget;
  private pressure0!: THREE.WebGLRenderTarget;
  private pressure1!: THREE.WebGLRenderTarget;
  private out!: THREE.WebGLRenderTarget;

  private advection!: Pass;
  private force!: Pass;
  private divergence!: Pass;
  private poisson!: Pass;
  private pressure!: Pass;
  private output!: Pass;

  private coords = new THREE.Vector2();
  private diff = new THREE.Vector2();
  private hasPointer = false;

  /** Tekstur mask (r = |velocity|) untuk disampling shader hero. */
  get texture(): THREE.Texture {
    return this.out.texture;
  }

  constructor(
    renderer: THREE.WebGLRenderer,
    width: number,
    height: number,
    options: Partial<FluidOptions> = {}
  ) {
    this.renderer = renderer;
    this.options = { ...DEFAULTS, ...options };
    this.allocate(width, height);
    this.buildPasses();
  }

  private allocate(width: number, height: number) {
    const w = Math.max(8, Math.round(width * this.options.resolution));
    const h = Math.max(8, Math.round(height * this.options.resolution));
    this.fboSize.set(w, h);
    this.cellScale.set(1 / w, 1 / h);
    this.vel0 = createFbo(w, h);
    this.vel1 = createFbo(w, h);
    this.div = createFbo(w, h);
    this.pressure0 = createFbo(w, h);
    this.pressure1 = createFbo(w, h);
    this.out = createFbo(w, h);
  }

  private makePass(
    frag: string,
    uniforms: Record<string, THREE.IUniform>,
    vert: string = FACE_VERT,
    blending: THREE.Blending = THREE.NoBlending
  ): Pass {
    const material = new THREE.RawShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      blending,
      depthTest: false,
      depthWrite: false,
      transparent: blending !== THREE.NoBlending,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    return { scene, material };
  }

  private buildPasses() {
    const px = { value: this.cellScale };
    const boundary = { value: this.cellScale }; // isBounce false → ruang tepi 1 sel

    this.advection = this.makePass(ADVECTION_FRAG, {
      px,
      boundarySpace: boundary,
      velocity: { value: this.vel0.texture },
      fboSize: { value: this.fboSize },
      dt: { value: this.options.dt },
      dissipation: { value: this.options.dissipation },
      isBFECC: { value: this.options.BFECC },
    });

    this.force = this.makePass(
      FORCE_FRAG,
      {
        px,
        force: { value: new THREE.Vector2() },
        center: { value: new THREE.Vector2() },
        scale: {
          value: new THREE.Vector2(this.options.cursor_size, this.options.cursor_size),
        },
      },
      MOUSE_VERT,
      THREE.AdditiveBlending
    );

    this.divergence = this.makePass(DIVERGENCE_FRAG, {
      px,
      boundarySpace: boundary,
      velocity: { value: this.vel1.texture },
      dt: { value: this.options.dt },
    });

    this.poisson = this.makePass(POISSON_FRAG, {
      px,
      boundarySpace: boundary,
      pressure: { value: this.pressure0.texture },
      divergence: { value: this.div.texture },
      straightness: { value: this.options.straightness },
    });

    this.pressure = this.makePass(PRESSURE_FRAG, {
      px,
      boundarySpace: boundary,
      pressure: { value: this.pressure0.texture },
      velocity: { value: this.vel1.texture },
      dt: { value: this.options.dt },
    });

    this.output = this.makePass(OUTPUT_FRAG, {
      px,
      boundarySpace: { value: new THREE.Vector2() }, // mask sampai tepi penuh
      velocity: { value: this.vel0.texture },
      outputScale: { value: 1.0 },
    });
  }

  private renderPass(pass: Pass, target: THREE.WebGLRenderTarget, clear = true) {
    this.renderer.setRenderTarget(target);
    if (clear) this.renderer.clear();
    this.renderer.render(pass.scene, this.camera);
  }

  /**
   * Pointer dalam NDC [-1, 1]. diff = perpindahan NDC sejak frame lalu —
   * gaya splat ∝ kecepatan gerak (persis perilaku Lando).
   */
  updatePointer(x: number, y: number) {
    if (this.hasPointer) {
      this.diff.set(x - this.coords.x, y - this.coords.y);
      // Lompatan besar (pointer masuk ulang) jangan jadi ledakan gaya.
      if (this.diff.length() > 0.5) this.diff.set(0, 0);
    }
    this.coords.set(x, y);
    this.hasPointer = true;
  }

  /** Jalankan satu langkah simulasi. Panggil sekali per frame. */
  step() {
    const o = this.options;
    const prevTarget = this.renderer.getRenderTarget();
    const prevAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;

    // 1. Advection: vel0 → vel1
    this.advection.material.uniforms.velocity.value = this.vel0.texture;
    this.renderPass(this.advection, this.vel1);

    // 2. Splat gaya kursor (additive ke vel1) — rumus persis bundle Lando.
    const forceX = (this.diff.x / 2) * o.mouse_force;
    const forceY = (this.diff.y / 2) * o.mouse_force;
    const cursorX = o.cursor_size * this.cellScale.x;
    const cursorY = o.cursor_size * this.cellScale.y;
    const centerX = Math.min(
      Math.max(this.coords.x, -1 + cursorX + this.cellScale.x * 2),
      1 - cursorX - this.cellScale.x * 2
    );
    const centerY = Math.min(
      Math.max(this.coords.y, -1 + cursorY + this.cellScale.y * 2),
      1 - cursorY - this.cellScale.y * 2
    );
    const fu = this.force.material.uniforms;
    fu.force.value.set(forceX, forceY);
    fu.center.value.set(centerX, centerY);
    this.renderPass(this.force, this.vel1, false);
    this.diff.set(0, 0); // gaya hanya saat ada gerakan baru

    // 3. Divergence: vel1 → div
    this.divergence.material.uniforms.velocity.value = this.vel1.texture;
    this.renderPass(this.divergence, this.div);

    // 4. Poisson (Jacobi ping-pong)
    let p0 = this.pressure0;
    let p1 = this.pressure1;
    for (let i = 0; i < o.iterations_poisson; i++) {
      this.poisson.material.uniforms.pressure.value = p0.texture;
      this.renderPass(this.poisson, p1);
      [p0, p1] = [p1, p0];
    }

    // 5. Kurangi gradien tekanan: (vel1, p0) → vel0
    this.pressure.material.uniforms.pressure.value = p0.texture;
    this.pressure.material.uniforms.velocity.value = this.vel1.texture;
    this.renderPass(this.pressure, this.vel0);

    // 6. Mask output: |vel0| → out
    this.output.material.uniforms.velocity.value = this.vel0.texture;
    this.renderPass(this.output, this.out);

    this.renderer.setRenderTarget(prevTarget);
    this.renderer.autoClear = prevAutoClear;
  }

  resize(width: number, height: number) {
    const w = Math.max(8, Math.round(width * this.options.resolution));
    const h = Math.max(8, Math.round(height * this.options.resolution));
    if (w === this.fboSize.x && h === this.fboSize.y) return;
    this.fboSize.set(w, h);
    this.cellScale.set(1 / w, 1 / h);
    for (const fbo of [this.vel0, this.vel1, this.div, this.pressure0, this.pressure1, this.out]) {
      fbo.setSize(w, h);
    }
  }

  dispose() {
    for (const fbo of [this.vel0, this.vel1, this.div, this.pressure0, this.pressure1, this.out]) {
      fbo.dispose();
    }
    for (const pass of [this.advection, this.force, this.divergence, this.poisson, this.pressure, this.output]) {
      pass.material.dispose();
      pass.scene.children.forEach((c) => {
        if (c instanceof THREE.Mesh) c.geometry.dispose();
      });
    }
  }
}
