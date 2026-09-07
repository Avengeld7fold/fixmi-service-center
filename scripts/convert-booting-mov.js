const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const FFMPEG = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');
const INPUT_MOV = path.join(__dirname, '../public/images/services/Booting.mov');
const LCD_IMAGE = path.join(__dirname, '../public/images/services/LCD.webp');
const OUTPUT_GIF = path.join(__dirname, '../public/images/services/Booting.gif');
const OUTPUT_ROOT_GIF = path.join(__dirname, '../public/booting.gif');

const RAW_DIR = '/tmp/fixmi_raw_frames';
const MASKED_DIR = '/tmp/fixmi_masked_frames';

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
    const alpha = data[idx * 4 + 3];
    // If alpha < 200, it is outside corner background
    if (alpha < 200) {
      isOutside[idx] = 1;
      queue.push(x, y);
    }
  }

  // Seed with all 4 outer borders of the image
  for (let x = 0; x < w; x++) {
    addPixel(x, 0);
    addPixel(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    addPixel(0, y);
    addPixel(w - 1, y);
  }

  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    addPixel(x + 1, y);
    addPixel(x - 1, y);
    addPixel(x, y + 1);
    addPixel(x, y - 1);
  }

  // Create clean mask buffer: transparent 0 outside, solid 255 inside
  const mask = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    if (isOutside[i]) {
      mask[i * 4] = 0;
      mask[i * 4 + 1] = 0;
      mask[i * 4 + 2] = 0;
      mask[i * 4 + 3] = 0; // Transparent
    } else {
      mask[i * 4] = 255;
      mask[i * 4 + 1] = 255;
      mask[i * 4 + 2] = 255;
      mask[i * 4 + 3] = 255; // Opaque
    }
  }

  return sharp(mask, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function main() {
  console.log('1. Preparing directories...');
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(MASKED_DIR, { recursive: true });

  console.log('2. Extracting frames from Booting.mov with ffmpeg...');
  execSync(`"${FFMPEG}" -y -i "${INPUT_MOV}" -vf fps=30 "${RAW_DIR}/frame_%04d.png"`, { stdio: 'inherit' });

  const rawFrames = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Extracted ${rawFrames.length} frames.`);

  console.log('3. Generating pixel-perfect iPhone silhouette mask...');
  const maskBuffer = await generateSilhouetteMask(440, 736);

  console.log('4. Masking frames to preserve transparent background...');
  const batchSize = 10;
  for (let i = 0; i < rawFrames.length; i += batchSize) {
    const batch = rawFrames.slice(i, i + batchSize);
    await Promise.all(batch.map(async (file) => {
      const inputPath = path.join(RAW_DIR, file);
      const outputPath = path.join(MASKED_DIR, file);
      await sharp(inputPath)
        .ensureAlpha()
        .composite([{ input: maskBuffer, blend: 'dest-in' }])
        .png({ compressionLevel: 6 })
        .toFile(outputPath);
    }));
    process.stdout.write(`Processed ${Math.min(i + batchSize, rawFrames.length)}/${rawFrames.length} frames...\r`);
  }
  console.log('\nAll frames masked successfully!');

  console.log('5. Generating color palette preserving transparency...');
  const palettePath = '/tmp/fixmi_palette.png';
  execSync(
    `"${FFMPEG}" -y -framerate 30 -i "${MASKED_DIR}/frame_%04d.png" -vf "palettegen=reserve_transparent=1" "${palettePath}"`,
    { stdio: 'inherit' }
  );

  console.log('6. Encoding animated GIF with sierra2_4a dithering...');
  execSync(
    `"${FFMPEG}" -y -framerate 30 -i "${MASKED_DIR}/frame_%04d.png" -i "${palettePath}" -lavfi "paletteuse=alpha_threshold=128:dither=sierra2_4a" "${OUTPUT_GIF}"`,
    { stdio: 'inherit' }
  );

  console.log('7. Mirroring to public/booting.gif...');
  fs.copyFileSync(OUTPUT_GIF, OUTPUT_ROOT_GIF);

  const stats = fs.statSync(OUTPUT_GIF);
  console.log(`\nSUCCESS! Transparent GIF created at: ${OUTPUT_GIF}`);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Cleanup
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.rmSync(palettePath, { force: true });
}

main().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
