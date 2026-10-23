import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

test("admin nested scroll regions bypass Lenis and remain keyboard reachable", async () => {
  const root = process.cwd();
  const adminDir = path.join(root, "components/admin");
  const files = await readdir(adminDir);
  const scrollTagPattern = /<(?:div|ul|ol)\b[^<>]*>/g;
  const lenisPrevent = /\bdata-lenis-prevent(?:\s|=|>)/;
  const scrollRegions = [];

  for (const file of files.filter((name) => name.endsWith(".tsx"))) {
    const source = await readFile(path.join(adminDir, file), "utf8");
    for (const [tag] of source.matchAll(scrollTagPattern)) {
      if (/\boverflow-y-(?:auto|scroll)\b/.test(tag)) {
        assert.match(tag, lenisPrevent, `${file} contains a nested vertical scroller intercepted by Lenis`);
        scrollRegions.push(`${file}:vertical`);
      }
      if (/\bclassName="admin-sheet"/.test(tag)) {
        assert.match(tag, lenisPrevent, `${file} sheet scrolling must bypass Lenis`);
      }
      if (/\bclassName="[^"]*admin-price-scroller\b/.test(tag)) {
        assert.match(tag, lenisPrevent, `${file} price table scrolling must bypass Lenis`);
      }
    }
  }

  assert.ok(scrollRegions.length >= 3, "expected admin icon, import, and backup vertical scroll regions");
  const iconPicker = await readFile(path.join(adminDir, "IconPickerModal.tsx"), "utf8");
  assert.match(iconPicker, /aria-label="Daftar ikon layanan"[\s\S]{0,80}tabIndex=\{0\}/,
    "icon list must be exposed as a named keyboard-focusable region");
});
