"use client";

import React, { useRef, useEffect, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { FluidSim } from "./hero/FluidSim";

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: 2.5D parallax depth shift with dynamic Shader Breathing.
// Mask reveal = tekstur simulasi fluida (FluidSim, ala landonorris.com),
// bukan lagi SDF trail parametrik.
const fragmentShader = `
  uniform sampler2D uTextureBroken;
  uniform sampler2D uTextureFixed;
  uniform sampler2D uDepthMap;
  uniform sampler2D uFluid;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uViewportAspect;
  uniform float uPhoneAspect;
  uniform float uTextureAspect;
  uniform float uReveal;
  uniform float uThreshold;
  uniform float uRadius;
  uniform float uPhoneShiftY;
  varying vec2 vUv;

  void main() {
    // === Canvas Extension Compensation ===
    // Canvas diperpanjang ke bawah (wave divider) → vUv.y menjangkau area
    // yang lebih besar. iPhone texture harus tetap di-map ke area WINDOW saja.
    // heightRatio = canvasHeight/windowHeight (dari rasio aspect: lebar sama).
    float heightRatio = uPhoneAspect / uViewportAspect;
    // Titik tengah viewport asli dalam UV canvas.
    // UV y=0 = bottom canvas (wave area), y=1 = top (navbar).
    // Extension di bawah → center viewport asli lebih ke atas.
    float origCenterY = 1.0 - 0.5 / heightRatio;
    // Transform Y: memetakan area window viewport ke textureUv [0,1]
    vec2 adjustedUv = vUv;
    adjustedUv.y = (vUv.y - origCenterY) * heightRatio + 0.5;

    // 1. Calculate texture UV mapped to center of the viewport (contain fit aspect ratio correction)
    vec2 textureUv = adjustedUv;
    if (uPhoneAspect > uTextureAspect) {
      // Landscape (desktop): fit height, scale and center width.
      textureUv.x = (adjustedUv.x - 0.5) * (uPhoneAspect / uTextureAspect) + 0.5;
    } else {
      // Portrait (mobile/tablet): fit width, center height.
      float cy = 0.5 + uPhoneShiftY;
      textureUv.y = (adjustedUv.y - cy) * (uTextureAspect / uPhoneAspect) + 0.5;
    }

    // Check if the current pixel is inside the texture boundaries
    bool inBounds = (textureUv.x >= 0.0 && textureUv.x <= 1.0 && textureUv.y >= 0.0 && textureUv.y <= 1.0);

    // 2. Read depth map value (only if within bounds to avoid wrapping artifacts)
    float depthValue = 0.0;
    if (inBounds) {
      depthValue = texture2D(uDepthMap, textureUv).r;
    }

    // 3. Parallax Effect with dynamic Shader Breathing (dynamic depth intensity modulates over time)
    // Toned down to make the 3D parallax effect look extremely natural, subtle, and premium
    // Portrait (mobile) diberi depth jauh lebih kuat — layar kecil butuh
    // pergeseran lebih besar agar efek 3D depth-map benar-benar terasa.
    float baseDepth = uPhoneAspect > uTextureAspect ? 0.012 : 0.02;
    float breathing = sin(uTime * 1.5) * (uPhoneAspect > uTextureAspect ? 0.0025 : 0.005);
    float dynamicDepth = baseDepth + breathing;

    vec2 mouseOffset = uMouse - vec2(0.5);
    vec2 parallaxOffset = mouseOffset * depthValue * dynamicDepth;
    vec2 distortedUv = textureUv + parallaxOffset;

    // Re-check bounds for parallax UV
    bool inParallaxBounds = (distortedUv.x >= 0.0 && distortedUv.x <= 1.0 && distortedUv.y >= 0.0 && distortedUv.y <= 1.0);

    // 4. Sample broken and fixed textures using parallax-displaced UVs
    vec4 colorBroken = vec4(0.0);
    vec4 colorFixed = vec4(0.0);
    
    if (inParallaxBounds) {
      colorBroken = texture2D(uTextureBroken, distortedUv);
      colorFixed = texture2D(uTextureFixed, distortedUv);
    }

    // 5. Mask fluida ala landonorris.com: |velocity| dari simulasi
    //    Navier-Stokes, threshold 0.1 (nilai Lando) di semua perangkat.
    float fluid = texture2D(uFluid, vUv).r;
    float mask = step(uThreshold, fluid);

    // Clamp radial opsional di sekitar uMouse. Saat ini uRadius 3.0 di semua
    // perangkat = praktis tanpa batas (paritas Lando); uniform dipertahankan
    // sebagai tuas desain bila kelak ingin brush terkendali lagi.
    vec2 md = (vUv - uMouse) * vec2(uViewportAspect, 1.0);
    mask *= 1.0 - smoothstep(uRadius * 0.65, uRadius, length(md));

    // Combine with uReveal for hover state visibility control
    mask *= uReveal;

    // 6. Global Slash Visibility (Warna Tebasan)
    // Blend texture color of iPhone fixed & broken, multiplied by viewport boundary
    vec4 texColor = mix(colorBroken, colorFixed, mask) * (inParallaxBounds ? 1.0 : 0.0);

    // Calculate phone presence based on alpha of mixed textures
    float phonePresence = inParallaxBounds ? mix(colorBroken.a, colorFixed.a, mask) : 0.0;

    // Add a soft, semi-transparent glowing trail ONLY in empty space (where phone is not present) to prevent color distortion on the phone body
    float glowOpacity = mask * 0.15 * (1.0 - phonePresence);
    vec4 finalColor = texColor + vec4(0.9, 0.95, 1.0, 1.0) * glowOpacity;

    // 7. Logika Alpha Discard to support background transparency (only render if image or slash is visible)
    if (finalColor.a < 0.05) discard;

    // Output final color
    gl_FragColor = finalColor;
  }
`;

interface TexturesState {
  broken: THREE.Texture;
  fixed: THREE.Texture;
  depth: THREE.Texture;
  aspect: number;
}

function DiagnosticLoader({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono select-none pointer-events-none bg-background z-20">
      <div className="mb-2 text-xs uppercase tracking-widest text-primary animate-pulse">
        INITIALIZING WEBGL 2.5D SHADER
      </div>
      <div className="w-64 h-1 bg-surface-alt border border-border rounded overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-[0.625rem] text-text-muted uppercase">
        Texture Bindings: {Math.round(progress)}%
      </div>
    </div>
  );
}

interface MagicShaderPlaneProps {
  textures: TexturesState;
}

function MagicShaderPlane({ textures }: MagicShaderPlaneProps) {
  const { width: viewportWidth, height: viewportHeight } = useThree((state) => state.viewport);
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Ref for the main 3D Mesh to enable Idle Floating
  const meshRef = useRef<THREE.Mesh>(null);

  // Simulasi fluida (mask reveal) — resolusi 0.1× layar, parameter DEFAULTS
  // Lando di semua perangkat.
  const simRef = useRef<FluidSim | null>(null);

  useEffect(() => {
    // Parameter DEFAULTS (persis landonorris.com) untuk SEMUA perangkat.
    // PENTING: FluidSim di-feed ukuran DRAWING BUFFER (device pixels =
    // CSS × dpr), BUKAN ukuran CSS. Lando memakai buffer 750px di mobile
    // (375 CSS × dpr 2) → fboSize 75 → brush 18/75 = 0.24 lebar. Kalau
    // di-feed CSS 375, fboSize 37.5 → brush 0.48 (2× terlalu besar).
    const sim = new FluidSim(gl, gl.domElement.width, gl.domElement.height, {});
    simRef.current = sim;
    return () => {
      sim.dispose();
      simRef.current = null;
    };
  }, [gl]);

  useEffect(() => {
    simRef.current?.resize(gl.domElement.width, gl.domElement.height);
  }, [size.width, size.height, gl]);

  // ── Idle choreography ala landonorris.com (didekode dari bundle asli) ──
  // Saat user diam 2 dtk (2,5 dtk pertama setelah load), kursor virtual
  // menyapu layar mengikuti GSAP timeline cosine (2 siklus horizontal ×
  // ½ siklus vertikal, amplitudo 75%/50% NDC), jeda napas 3 dtk antar sapuan.
  const idle = useRef({ moving: true, progress: { x: 0, y: 0 } });
  const idleTl = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    if (prefersReduced) return;
    const st = idle.current;
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 3 });
    tl.fromTo(st.progress, { y: 0 }, { y: 1, duration: 2.5, ease: "none" }, 0)
      .fromTo(st.progress, { x: 0 }, { x: 1, duration: 2.5, ease: "power1.inOut" }, 0)
      .fromTo(st.progress, { y: 1 }, { y: 0, duration: 2.5, ease: "none" }, 4)
      .fromTo(st.progress, { x: 1 }, { x: 0, duration: 2.5, ease: "power1.inOut" }, 4);
    idleTl.current = tl;

    let moveTimeout: ReturnType<typeof setTimeout>;
    const goIdle = () => {
      st.moving = false;
      tl.seek(0);
      tl.play();
    };
    const onMove = () => {
      st.moving = true;
      tl.pause();
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(goIdle, 2000);
    };
    const initial = setTimeout(goIdle, 2500);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("touchmove", onMove);
    return () => {
      clearTimeout(initial);
      clearTimeout(moveTimeout);
      tl.kill();
      idleTl.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Input seluruh halaman, SEMUA perangkat (pola Lando: mousemove +
  // touchstart/touchmove di document, bukan canvas) — kursor/jari di area
  // teks pun menggerakkan fluida selama hero terlihat. touchmove tetap
  // passive sehingga scroll halaman tidak terganggu (persis Lando). ──
  const pagePointer = useRef(new THREE.Vector2());
  const pageActive = useRef(false);
  useEffect(() => {
    const el = gl.domElement;
    // Cache rect canvas — getBoundingClientRect memaksa layout reflow, jadi
    // jangan panggil pada SETIAP pointermove. Cache di-invalidate saat
    // scroll/resize dan dihitung ulang lazily pada event pointer berikutnya.
    let cachedRect: DOMRect | null = null;
    const invalidateRect = () => {
      cachedRect = null;
    };
    const setFrom = (clientX: number, clientY: number) => {
      if (!cachedRect) cachedRect = el.getBoundingClientRect();
      const r = cachedRect;
      if (r.width === 0 || r.bottom < 0 || r.top > window.innerHeight) return;
      pagePointer.current.set(
        ((clientX - r.left) / r.width) * 2 - 1,
        -(((clientY - r.top) / r.height) * 2 - 1)
      );
      pageActive.current = true;
    };
    const onPointer = (e: PointerEvent) => setFrom(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length === 1) setFrom(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", invalidateRect, { passive: true });
    window.addEventListener("resize", invalidateRect);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Splash intro (REVEAL_DURATION 1.1 dtk ala Lando): setelah loading
  // screen selesai, satu sapuan sintetik melintasi layar membuka reveal,
  // lalu meluruh alami oleh dissipation. ──
  const splash = useRef<{ started: number | null; pending: boolean }>({
    started: null,
    pending: false,
  });
  const revealOn = useRef(false);
  useEffect(() => {
    if (prefersReduced) return;
    const trigger = () => {
      splash.current.pending = true;
    };
    if ((window as unknown as Record<string, unknown>).__fixmiLoaded) trigger();
    else window.addEventListener("fixmi:loaded", trigger, { once: true });
    return () => window.removeEventListener("fixmi:loaded", trigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize uniforms using useRef (exactly as in 2b2932b for 100% stable rendering, with aspect ratio)
  const uniforms = useRef({
    uTextureBroken: { value: textures.broken },
    uTextureFixed: { value: textures.fixed },
    uDepthMap: { value: textures.depth },
    uFluid: { value: null as THREE.Texture | null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTime: { value: 0 },
    uViewportAspect: { value: viewportWidth / viewportHeight },
    uPhoneAspect: { value: typeof window !== "undefined" ? window.innerWidth / window.innerHeight : viewportWidth / viewportHeight },
    uTextureAspect: { value: textures.aspect },
    uReveal: { value: 0.0 },
    // Nilai awal saja — uThreshold & uRadius di-override TIAP FRAME di useFrame
    // (lihat sana), supaya kebal Fast Refresh & selalu aktual. Jangan setel di
    // sini, tak akan terpakai.
    uThreshold: { value: 0.1 },
    uRadius: { value: 3.0 },
    uPhoneShiftY: { value: 0.0 },
  });

  useFrame((state) => {
    if (!materialRef.current) return;

    // Uniform KONSTAN (tekstur, radius, threshold, textureAspect) hanya perlu
    // ditulis ulang tiap frame di DEV agar kebal Fast Refresh. Di produksi
    // tidak ada Fast Refresh — nilai awal useRef sudah benar & permanen,
    // jadi kita lewati tulisan redundan tersebut demi frame time yang lebih ramping.
    if (process.env.NODE_ENV !== "production") {
      materialRef.current.uniforms.uTextureBroken.value = textures.broken;
      materialRef.current.uniforms.uTextureFixed.value = textures.fixed;
      materialRef.current.uniforms.uDepthMap.value = textures.depth;
      materialRef.current.uniforms.uTextureAspect.value = textures.aspect;
      materialRef.current.uniforms.uRadius.value = 3.0;
      materialRef.current.uniforms.uThreshold.value = 0.1;
    }

    const time = state.clock.getElapsedTime();
    
    // Update time uniform continuously
    materialRef.current.uniforms.uTime.value = time;

    // Sync viewport aspect dynamically (canvas aspect — mungkin diperpanjang)
    materialRef.current.uniforms.uViewportAspect.value = viewportWidth / viewportHeight;
    // uPhoneAspect: aspect ratio ASLI window viewport, bukan canvas
    // → iPhone positioning selalu stabil meskipun canvas diperpanjang
    const phoneAspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : viewportWidth / viewportHeight;
    materialRef.current.uniforms.uPhoneAspect.value = phoneAspect;

    // Geser iPhone hanya saat canvas portrait (mobile/tablet).
    // Gunakan phoneAspect (window), bukan canvas aspect.
    materialRef.current.uniforms.uPhoneShiftY.value =
      phoneAspect < textures.aspect ? 0.02 : 0.0;

    // 1. Idle Floating Physics: Sinusoidal mesh movement along the Y axis
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(time * 1.2) * 0.03;
    }

    const sim = simRef.current;
    const mouse = materialRef.current.uniforms.uMouse.value as THREE.Vector2;

    // ── Splash intro: sapuan sintetik 1,1 dtk (REVEAL_DURATION Lando) ──
    const sp = splash.current;
    if (sp.pending) {
      sp.pending = false;
      sp.started = time;
      revealOn.current = true;
    }
    let splashActive = false;
    if (sp.started !== null) {
      const t = (time - sp.started) / 1.1;
      if (t <= 1) {
        splashActive = true;
        // easeInOutQuad melintasi layar kiri→kanan dengan lengkung sinus
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const sx = -0.85 + e * 1.7;
        const sy = Math.sin(t * Math.PI) * 0.25 - 0.05;
        sim?.updatePointer(sx, sy);
        mouse.lerp(new THREE.Vector2(sx * 0.5 + 0.5, sy * 0.5 + 0.5), 0.15);
      } else {
        sp.started = null;
      }
    }

    // uReveal: menyala permanen setelah splash/input pertama di SEMUA
    // perangkat (pola Lando — fluida yang meluruh sendiri yang mengatur
    // visibilitas, bukan gating hover/sentuh).
    if (pageActive.current) revealOn.current = true;
    materialRef.current.uniforms.uReveal.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uReveal.value,
      revealOn.current ? 1.0 : 0.0,
      0.05
    );

    if (!splashActive) {
      if (pageActive.current && idle.current.moving) {
        // Input seluruh halaman (mouse ATAU jari); force = diff posisi antar
        // frame (persis Lando). Parallax lerp 0.03 = "berat mewah".
        sim?.updatePointer(pagePointer.current.x, pagePointer.current.y);
        mouse.lerp(
          new THREE.Vector2(
            pagePointer.current.x * 0.5 + 0.5,
            pagePointer.current.y * 0.5 + 0.5
          ),
          0.03
        );
      } else if (!idle.current.moving && idleTl.current) {
        // Idle choreography: kursor virtual menyapu layar (rumus persis
        // Lando). Fluida tetap hidup + parallax "bernapas" dengan sapuan
        // besar yang berkarakter, berhenti seketika saat user bergerak.
        const p = idle.current.progress;
        const cx = -Math.cos(p.x * Math.PI * 4) * 0.75;
        const cy = Math.cos(p.y * Math.PI) * 0.5;
        sim?.updatePointer(cx, cy);
        mouse.lerp(new THREE.Vector2(cx * 0.5 + 0.5, cy * 0.5 + 0.5), 0.03);
      }
    }

    if (sim) {
      sim.step();
      materialRef.current.uniforms.uFluid.value = sim.texture;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      scale={[viewportWidth, viewportHeight, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
      />
    </mesh>
  );
}

/**
 * Penjaga WebGL: bila Canvas/R3F melempar error (GPU tua, WebGL dimatikan,
 * context lost), tanpa boundary ini SELURUH halaman React crash putih.
 * Fallback = render kosong; teks hero (DOM biasa) tetap tampil normal.
 */
class WebGLBoundary extends React.Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Hero3D() {
  const [textures, setTextures] = useState<TexturesState | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // DPR mengikuti perilaku Lando terukur: layar sentuh kecil memakai DPR
  // penuh (canvas mereka 2.0× di 375px — piksel total tetap kecil), layar
  // lebar di-cap 1.25 (beban fragmen turun ~60% di retina).
  const isCoarse =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);

    let brokenTex: THREE.Texture;
    let fixedTex: THREE.Texture;
    let depthTex: THREE.Texture;

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setProgress((itemsLoaded / itemsTotal) * 100);
    };

    manager.onLoad = () => {
      // Ensure textures use linear filtering for smooth rendering
      brokenTex.minFilter = THREE.LinearFilter;
      fixedTex.minFilter = THREE.LinearFilter;
      depthTex.minFilter = THREE.LinearFilter;

      // Enable ClampToEdgeWrapping for extreme parallax offsets
      brokenTex.wrapS = THREE.ClampToEdgeWrapping;
      brokenTex.wrapT = THREE.ClampToEdgeWrapping;
      fixedTex.wrapS = THREE.ClampToEdgeWrapping;
      fixedTex.wrapT = THREE.ClampToEdgeWrapping;
      depthTex.wrapS = THREE.ClampToEdgeWrapping;
      depthTex.wrapT = THREE.ClampToEdgeWrapping;

      const width = brokenTex.image?.width || 0;
      const height = brokenTex.image?.height || 0;
      const aspect = width && height ? width / height : 4 / 3;

      // Set state to trigger Canvas mount
      setTextures({
        broken: brokenTex,
        fixed: fixedTex,
        depth: depthTex,
        aspect: aspect,
      });
    };

    brokenTex = loader.load("/images/iphone-broken.png?v=2");
    fixedTex = loader.load("/images/iphone-fixed.png?v=2");
    depthTex = loader.load("/images/iphone-depth.png?v=2");

    // Bebaskan memori GPU saat komponen unmount (navigasi ke halaman lain)
    return () => {
      brokenTex?.dispose();
      fixedTex?.dispose();
      depthTex?.dispose();
    };
  }, []);

  return (
    <div 
      className="w-full h-full relative overflow-hidden select-none cursor-none touch-pan-y"
    >
      {!textures ? (
        <DiagnosticLoader progress={progress} />
      ) : (
        <WebGLBoundary>
          <Canvas
            camera={{ position: [0, 0, 1], fov: 90 }}
            // antialias: false — scene ini hanya fullscreen quad shader (tanpa tepi
            // geometri), MSAA tidak memberi efek visual apa pun tetapi membebani
            // GPU tua secara signifikan. powerPreference meminta GPU diskrit bila ada.
            gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
            dpr={isCoarse ? [1, 2] : [1, 1.25]}
            className="w-full h-full touch-pan-y"
          >
            <MagicShaderPlane textures={textures} />
          </Canvas>
        </WebGLBoundary>
      )}
    </div>
  );
}
