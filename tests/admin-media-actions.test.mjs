import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const root = process.cwd();
const require = createRequire(import.meta.url);

function loadTs(source, dependencies, fixture) {
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const moduleExports = {};
  new Function("require", "exports", "process", output)(
    name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
    moduleExports,
    { cwd: () => fixture, env: { NODE_ENV: "test" } },
  );
  return moduleExports;
}

test("promo and gallery actions persist valid image uploads and promo WhatsApp note in fixture storage", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "mobicare-media-qa-"));
  const created = { promos: [], gallery: [] };
  const uploadValidator = loadTs(await readFile(path.join(root, "lib/admin/upload-validation.ts"), "utf8"), {}, fixture);
  const dependencies = {
    "next/headers": { cookies: async () => ({ get: () => ({ value: "qa" }), set() {}, delete() {} }), headers: async () => new Headers() },
    "next/navigation": { redirect() {} },
    "@/lib/admin/rate-limit": { checkLoginAttempt() {}, clearLoginAttempts() {}, recordLoginFailure() {} },
    "@/lib/admin/auth": { SESSION_COOKIE: "qa", SESSION_MAX_AGE_S: 1, createSessionToken: async () => "qa", verifyPassword: async () => true, verifySessionToken: async () => true },
    "node:fs": { promises: fs.promises },
    "node:path": path,
    "node:crypto": require("node:crypto"),
    "next/cache": { revalidatePath() {} },
    "@/lib/admin/pricelist-write": { clearAllBackups() {}, createManualBackup() {}, deleteBackup() {}, listBackups() {}, restoreBackup() {}, writePricelist() {} },
    "@/lib/admin/import-parse": { parseImportFile() {} },
    "@/lib/pricelist-server": { getPricelist: async () => [] },
    "@/lib/promo-server": { addPromoItem: async item => { const saved = { id: "qa-promo", ...item }; created.promos.push(saved); return saved; }, deletePromoItem: async () => true },
    "@/lib/gallery-server": { addGalleryImage: async item => { const saved = { id: "qa-gallery", ...item }; created.gallery.push(saved); return saved; }, deleteGalleryImage: async () => true },
    "@/lib/admin/identity": { ADMIN_IDENTITY: { brandName: "QA", serviceCenterName: "QA" } },
    "@/lib/admin/upload-validation": uploadValidator,
  };
  try {
    const actions = loadTs(await readFile(path.join(root, "app/admin/actions.ts"), "utf8"), dependencies, fixture);
    const png = new File([Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0])], "promo.png", { type: "image/png" });
    const promoForm = new FormData();
    promoForm.set("image", png);
    promoForm.set("title", "Promo QA");
    promoForm.set("waNote", "Halo, saya ingin tanya promo QA");
    const promoResult = await actions.uploadPromoAction(promoForm);
    assert.equal(promoResult.ok, true);
    assert.equal(created.promos[0].waNote, "Halo, saya ingin tanya promo QA");
    const promoFile = (await readdir(path.join(fixture, "public/images/promo")))[0];
    assert.match(promoFile, /^promo-[\da-f-]+\.png$/);
    assert.equal((await readFile(path.join(fixture, "public/images/promo", promoFile)))[0], 137);

    const galleryForm = new FormData();
    galleryForm.set("image", png);
    galleryForm.set("category", "iPhone");
    const galleryResult = await actions.uploadGalleryAction(galleryForm);
    assert.equal(galleryResult.ok, true);
    assert.equal(created.gallery.length, 1);

    const invalidForm = new FormData();
    invalidForm.set("image", new File(["<svg></svg>"], "bad.svg", { type: "image/svg+xml" }));
    const invalidResult = await actions.uploadGalleryAction(invalidForm);
    assert.equal(invalidResult.ok, false);
    assert.equal(created.gallery.length, 1, "invalid upload must not mutate gallery metadata");
    assert.equal((await readdir(path.join(fixture, "public/images/gallery"))).length, 1);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
