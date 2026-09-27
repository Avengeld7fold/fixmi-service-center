/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node/CommonJS browser check. */
// Run against a production server. PLAYWRIGHT_MODULE may point to an existing installation.
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const mobile of [true, false]) {
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        isMobile: mobile,
        hasTouch: mobile,
        deviceScaleFactor: mobile ? 2 : 1,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.TEST_URL || 'http://localhost:3121', { waitUntil: 'networkidle' });
      const section = page.getByRole('heading', { name: /Anatomi Perbaikan Presisi/i }).locator('xpath=../../..');
      await section.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
      await page.waitForTimeout(1500);
      for (const step of [...Array.from({ length: 14 }, (_, i) => i + 1), 8, 14]) {
        await section.getByRole('button', { name: `Lompat ke Langkah ${step}`, exact: true }).click({ force: true });
        await page.waitForTimeout(1600);
        const label = step === 14 ? '14/14' : step === 13 ? '13/14' : `${String(step).padStart(2, '0')}/13`;
        const text = await section.innerText();
        assert.ok(text.includes(label), `Step ${step} must select ${label}, got ${text.split('\n').slice(0,4).join(' ')}`);
        if (step === 14) {
          const boot = section.getByAltText('iPhone Booting & Quality Test');
          await boot.waitFor();
          assert.ok(await boot.evaluate(img => img.complete && img.naturalWidth > 0));
        }
      }
      const frames = new Set();
      for (let i = 0; i < 4; i++) {
        await page.waitForTimeout(700);
        const frame = await section.getByAltText('iPhone Booting & Quality Test').screenshot();
        frames.add(createHash('sha256').update(frame).digest('hex'));
      }
      assert.ok(frames.size > 1, 'Boot image must animate, not just load');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1800);
      assert.equal(await section.getByAltText('iPhone Booting & Quality Test').count(), 0, 'Boot decoder must be unmounted offscreen');
      await section.getByRole('button', { name: 'Lompat ke Langkah 8', exact: true }).click({ force: true });
      await page.waitForTimeout(1800);
      const backglass = mobile
        ? section.getByRole('button', { name: /Back Glass & NFC/ })
        : section.locator('#callout-circle-backglass');
      await backglass.click();
      const close = page.locator('button').filter({ has: page.locator('svg.lucide-x') });
      await close.waitFor();
      await page.keyboard.press('Escape');
      await close.waitFor({ state: 'detached' });
      assert.deepEqual(errors, []);
      console.log(`${mobile ? 'Mobile' : 'Desktop'}: 14 steps, reverse, offscreen boot cleanup, modal passed`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
