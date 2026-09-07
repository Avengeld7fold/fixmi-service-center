const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const FFMPEG = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');
const LCD_IMAGE = path.join(__dirname, '../public/images/services/LCD.webp');
const OUTPUT_SERVICES_WEBP = path.join(__dirname, '../public/images/services/Booting.webp');
const OUTPUT_SERVICE_WEBP = path.join(__dirname, '../public/images/service/Booting.webp');
const OUTPUT_ROOT_WEBP = path.join(__dirname, '../public/booting.webp');

const TARGET_WIDTH = 441;
const TARGET_HEIGHT = 735;
const TARGET_FPS = 20;

const RAW_DIR = '/tmp/fixmi_webp_raw_frames';
const MASKED_DIR = '/tmp/fixmi_webp_masked_frames';

async function generateSilhouetteMask(width, height) {
  const { data, info } = await sharp(LCD_IMAGE)
    .resize(width, height, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const isOutside = new Uint8Array(w * h);
  const queue = [];

  function addPixel(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (isOutside[idx]) return;
    if (data[idx * 4 + 3] < 200) {
      isOutside[idx] = 1;
      queue.push(x, y);
    }
  }

  for (let x = 0; x < w; x++) {
    addPixel(x, 0);
    addPixel(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    addPixel(0, y);
    addPixel(w - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    addPixel(x + 1, y);
    addPixel(x - 1, y);
    addPixel(x, y + 1);
    addPixel(x, y - 1);
  }

  const mask = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    if (isOutside[i]) {
      mask[i * 4] = 0;
      mask[i * 4 + 1] = 0;
      mask[i * 4 + 2] = 0;
      mask[i * 4 + 3] = 0;
    } else {
      mask[i * 4] = 255;
      mask[i * 4 + 1] = 255;
      mask[i * 4 + 2] = 255;
      mask[i * 4 + 3] = 255;
    }
  }

  return sharp(mask, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function main() {
  const inputFile = process.argv[2] || path.join(__dirname, '../public/Booting.mp4');
  console.log(`=== Generating Pure Animated WebP (441x735, Transparent Corners) ===`);
  console.log(`Input: ${inputFile}`);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`);
  }

  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(MASKED_DIR, { recursive: true });

  console.log(`1. Extracting frames at ${TARGET_FPS} FPS...`);
  execSync(`"${FFMPEG}" -y -i "${inputFile}" -vf "fps=${TARGET_FPS}" "${RAW_DIR}/frame_%04d.png"`, { stdio: 'inherit' });
  const frames = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Extracted ${frames.length} frames.`);

  console.log(`2. Generating precision silhouette mask...`);
  const mask = await generateSilhouetteMask(TARGET_WIDTH, TARGET_HEIGHT);

  console.log(`3. Masking and resizing to ${TARGET_WIDTH}x${TARGET_HEIGHT}...`);
  for (let i = 0; i < frames.length; i += 10) {
    const batch = frames.slice(i, i + 10);
    await Promise.all(batch.map(file => {
      return sharp(path.join(RAW_DIR, file))
        .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'fill' })
        .ensureAlpha()
        .composite([{ input: mask, blend: 'dest-in' }])
        .png({ compressionLevel: 6 })
        .toFile(path.join(MASKED_DIR, file));
    }));
  }

  console.log(`4. Encoding ultra-lightweight animated WebP...`);
  execSync(
    `"${FFMPEG}" -y -framerate ${TARGET_FPS} -i "${MASKED_DIR}/frame_%04d.png" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 70 -loop 0 "${OUTPUT_SERVICES_WEBP}"`,
    { stdio: 'inherit' }
  );

  fs.mkdirSync(path.dirname(OUTPUT_SERVICE_WEBP), { recursive: true });
  fs.copyFileSync(OUTPUT_SERVICES_WEBP, OUTPUT_SERVICE_WEBP);
  fs.copyFileSync(OUTPUT_SERVICES_WEBP, OUTPUT_ROOT_WEBP);

  const stats = fs.statSync(OUTPUT_SERVICES_WEBP);
  console.log(`✓ SUCCESS! Generated Booting.webp (${(stats.size / 1024).toFixed(0)} KB)`);

  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
