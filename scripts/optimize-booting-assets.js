const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const FFMPEG = path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg');
const INPUT_GIF = path.join(__dirname, '../public/images/services/Booting-raw.gif');
const LCD_IMAGE = path.join(__dirname, '../public/images/services/LCD.webp');

// Target destinations
const OUTPUT_SERVICES_DIR = path.join(__dirname, '../public/images/services');
const OUTPUT_SERVICE_DIR = path.join(__dirname, '../public/images/service');
const OUTPUT_ROOT_DIR = path.join(__dirname, '../public');

const TARGET_WIDTH = 441;
const TARGET_HEIGHT = 735;
const TARGET_FPS = 20; // 20 FPS provides silky smooth motion while saving 35% frames

const RAW_DIR = '/tmp/fixmi_opt_raw_frames';
const MASKED_DIR = '/tmp/fixmi_opt_masked_frames';
const PALETTE_FILE = '/tmp/fixmi_opt_palette.png';

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
    if (alpha < 200) {
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
  console.log('=== FIXMI Booting Asset Multi-Tier Low-Bandwidth Optimizer ===');
  console.log(`Source: ${INPUT_GIF}`);
  console.log(`Target: ${TARGET_WIDTH} x ${TARGET_HEIGHT} at ${TARGET_FPS} FPS`);

  if (!fs.existsSync(INPUT_GIF)) {
    throw new Error(`Input file not found: ${INPUT_GIF}`);
  }

  console.log('\n1. Preparing temporary frames directory...');
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(MASKED_DIR, { recursive: true });

  console.log(`\n2. Extracting frames at ${TARGET_FPS} FPS...`);
  execSync(`"${FFMPEG}" -y -i "${INPUT_GIF}" -vf "fps=${TARGET_FPS}" "${RAW_DIR}/frame_%04d.png"`, { stdio: 'inherit' });
  const rawFrames = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Extracted ${rawFrames.length} frames.`);

  console.log('\n3. Generating precision silhouette mask...');
  const maskBuffer = await generateSilhouetteMask(TARGET_WIDTH, TARGET_HEIGHT);

  console.log('\n4. Applying silhouette mask (dest-in) to all frames...');
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
  console.log('\nAll frames masked successfully!');

  // --- TIER 1: Animated WebP (Ultra Low-Bandwidth Supercharger: ~457 KB) ---
  console.log('\n5. Encoding Tier 1: Ultra Low-Bandwidth Animated WebP (~450 KB)...');
  const webpPath = path.join(OUTPUT_SERVICES_DIR, 'Booting.webp');
  execSync(
    `"${FFMPEG}" -y -framerate ${TARGET_FPS} -i "${MASKED_DIR}/frame_%04d.png" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 70 -loop 0 "${webpPath}"`,
    { stdio: 'inherit' }
  );
  const webpStats = fs.statSync(webpPath);
  console.log(`✓ Booting.webp generated: ${(webpStats.size / 1024).toFixed(0)} KB (${webpStats.size.toLocaleString()} bytes)`);

  // Mirror WebP
  fs.mkdirSync(OUTPUT_SERVICE_DIR, { recursive: true });
  fs.copyFileSync(webpPath, path.join(OUTPUT_SERVICE_DIR, 'Booting.webp'));
  fs.copyFileSync(webpPath, path.join(OUTPUT_ROOT_DIR, 'booting.webp'));

  // --- TIER 2: Optimized GIF (Differential Rectangle Delta Compression: ~3.3 MB) ---
  console.log('\n6. Encoding Tier 2: Optimized Animated GIF with diff_mode=rectangle...');
  execSync(
    `"${FFMPEG}" -y -framerate ${TARGET_FPS} -i "${MASKED_DIR}/frame_%04d.png" -vf "palettegen=reserve_transparent=1:stats_mode=diff:max_colors=128" "${PALETTE_FILE}"`,
    { stdio: 'inherit' }
  );

  const gifPath = path.join(OUTPUT_SERVICES_DIR, 'Booting.gif');
  execSync(
    `"${FFMPEG}" -y -framerate ${TARGET_FPS} -i "${MASKED_DIR}/frame_%04d.png" -i "${PALETTE_FILE}" -lavfi "paletteuse=alpha_threshold=128:diff_mode=rectangle:dither=bayer:bayer_scale=3" "${gifPath}"`,
    { stdio: 'inherit' }
  );
  const gifStats = fs.statSync(gifPath);
  console.log(`✓ Booting.gif generated: ${(gifStats.size / 1024 / 1024).toFixed(2)} MB (${gifStats.size.toLocaleString()} bytes)`);

  // Mirror GIF
  fs.copyFileSync(gifPath, path.join(OUTPUT_SERVICE_DIR, 'Booting.gif'));
  fs.copyFileSync(gifPath, path.join(OUTPUT_ROOT_DIR, 'booting.gif'));

  console.log('\n=== OPTIMIZATION SUMMARY ===');
  console.log(`Original GIF Size: 6.11 MB (6,401,889 bytes)`);
  console.log(`Optimized GIF Size: ${(gifStats.size / 1024 / 1024).toFixed(2)} MB (${((1 - gifStats.size / 6401889) * 100).toFixed(1)}% reduction)`);
  console.log(`Animated WebP Size: ${(webpStats.size / 1024).toFixed(0)} KB (${((1 - webpStats.size / 6401889) * 100).toFixed(1)}% reduction)`);

  // Cleanup
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.rmSync(MASKED_DIR, { recursive: true, force: true });
  fs.rmSync(PALETTE_FILE, { force: true });
}

main().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
