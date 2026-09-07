const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const FFMPEG = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');
const INPUT_MP4 = path.join(__dirname, '../public/Booting.mp4');
const LCD_IMAGE = path.join(__dirname, '../public/images/services/LCD.webp');
const OUTPUT_SERVICES_GIF = path.join(__dirname, '../public/images/services/Booting.gif');
const OUTPUT_SERVICE_DIR = path.join(__dirname, '../public/images/service');
const OUTPUT_SERVICE_GIF = path.join(OUTPUT_SERVICE_DIR, 'Booting.gif');
const OUTPUT_ROOT_GIF = path.join(__dirname, '../public/booting.gif');

// Exact dimensions matching LCD.webp
const TARGET_WIDTH = 441;
const TARGET_HEIGHT = 735;

const RAW_DIR = '/tmp/fixmi_mp4_raw_frames';
const MASKED_DIR = '/tmp/fixmi_mp4_masked_frames';
const PALETTE_FILE = '/tmp/fixmi_mp4_palette.png';

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
      mask[i * 4 + 3] = 0; // Transparent corner
    } else {
      mask[i * 4] = 255;
      mask[i * 4 + 1] = 255;
      mask[i * 4 + 2] = 255;
      mask[i * 4 + 3] = 255; // Opaque phone screen
    }
  }

  return sharp(mask, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function main() {
  console.log('=== Booting.mp4 to Transparent GIF Converter ===');
  console.log(`Target Dimensions: ${TARGET_WIDTH} x ${TARGET_HEIGHT} (matching LCD.webp)`);
  console.log(`Source Video: ${INPUT_MP4}`);

  if (!fs.existsSync(INPUT_MP4)) {
    throw new Error(`Input file not found: ${INPUT_MP4}`);
  }

  console.log('\n1. Preparing temporary workspaces...');
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(MASKED_DIR, { recursive: true });

  console.log('\n2. Extracting frames from Booting.mp4 with ffmpeg (24 fps native)...');
  execSync(`"${FFMPEG}" -y -i "${INPUT_MP4}" -vf fps=24 "${RAW_DIR}/frame_%04d.png"`, { stdio: 'inherit' });

  const rawFrames = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Extracted ${rawFrames.length} frames.`);

  console.log(`\n3. Generating pixel-perfect iPhone silhouette mask (${TARGET_WIDTH}x${TARGET_HEIGHT})...`);
  const maskBuffer = await generateSilhouetteMask(TARGET_WIDTH, TARGET_HEIGHT);

  console.log('\n4. Masking and resizing frames to 441x735 with transparent background...');
  const batchSize = 10;
  for (let i = 0; i < rawFrames.length; i += batchSize) {
    const batch = rawFrames.slice(i, i + batchSize);
    await Promise.all(batch.map(async (file) => {
      const inputPath = path.join(RAW_DIR, file);
      const outputPath = path.join(MASKED_DIR, file);
      await sharp(inputPath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'fill' })
        .ensureAlpha()
        .composite([{ input: maskBuffer, blend: 'dest-in' }])
        .png({ compressionLevel: 6 })
        .toFile(outputPath);
    }));
    process.stdout.write(`Processed ${Math.min(i + batchSize, rawFrames.length)}/${rawFrames.length} frames...\r`);
  }
  console.log('\nAll frames masked and resized to 441x735 successfully!');

  console.log('\n5. Generating high-fidelity color palette reserving alpha transparency...');
  execSync(
    `"${FFMPEG}" -y -framerate 24 -i "${MASKED_DIR}/frame_%04d.png" -vf "palettegen=reserve_transparent=1" "${PALETTE_FILE}"`,
    { stdio: 'inherit' }
  );

  console.log('\n6. Encoding animated GIF with sierra2_4a dithering...');
  execSync(
    `"${FFMPEG}" -y -framerate 24 -i "${MASKED_DIR}/frame_%04d.png" -i "${PALETTE_FILE}" -lavfi "paletteuse=alpha_threshold=128:dither=sierra2_4a" "${OUTPUT_SERVICES_GIF}"`,
    { stdio: 'inherit' }
  );

  console.log('\n7. Deploying to destination paths:');
  console.log(`   - Saved to: ${OUTPUT_SERVICES_GIF}`);

  if (!fs.existsSync(OUTPUT_SERVICE_DIR)) {
    fs.mkdirSync(OUTPUT_SERVICE_DIR, { recursive: true });
  }
  fs.copyFileSync(OUTPUT_SERVICES_GIF, OUTPUT_SERVICE_GIF);
  console.log(`   - Copied to: ${OUTPUT_SERVICE_GIF}`);

  fs.copyFileSync(OUTPUT_SERVICES_GIF, OUTPUT_ROOT_GIF);
  console.log(`   - Mirrored to: ${OUTPUT_ROOT_GIF}`);

  const servicesMp4 = path.join(__dirname, '../public/images/services/Booting.mp4');
  fs.copyFileSync(INPUT_MP4, servicesMp4);
  console.log(`   - Source MP4 archived to: ${servicesMp4}`);

  const stats = fs.statSync(OUTPUT_SERVICES_GIF);
  console.log('\n=== SUCCESS ===');
  console.log(`Transparent GIF created: 441 x 735 px`);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size.toLocaleString()} bytes)`);

  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.rmSync(PALETTE_FILE, { force: true });
}

main().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
