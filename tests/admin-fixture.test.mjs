import assert from "node:assert/strict";
import { createRequire } from "node:module";
import * as fsPromises from "node:fs/promises";
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const root = process.cwd();
const require = createRequire(import.meta.url);

// Evaluate the existing writer with its filesystem root redirected to a disposable fixture.
function loadSource(source, dependencies, fixture) {
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", "process", output)(
    name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
    exports,
    { cwd: () => fixture },
  );
  return exports;
}

test("admin save, validation and backup/restore stay inside a disposable fixture", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "mobicare-admin-qa-"));
  const originalPath = path.join(root, "data/pricelist.json");
  const original = await readFile(originalPath, "utf8");
  try {
    await mkdir(path.join(fixture, "data"));
    const sample = [
      { Name: "QA Device", Slug: "qa-device", description: "", Image: null,
        service_types: [{ Name: "QA Repair", Slug: "qa-repair", variants: [{ Key: "original", Label: "Original", Note: "" }],
          device_prices: [{ DeviceModel: "QA Model", prices: { original: 125000 } }] }] },
      { Name: "QA Empty Category", Slug: "qa-empty", description: "", Image: null, service_types: [] },
    ];
    await writeFile(path.join(fixture, "data/pricelist.json"), JSON.stringify(sample));
    const data = loadSource(await readFile(path.join(root, "lib/data.ts"), "utf8"), { "@/data/gallery.json": [] }, fixture);
    const revalidated = [];
    const writer = loadSource(await readFile(path.join(root, "lib/admin/pricelist-write.ts"), "utf8"),
      { "@/lib/data": data, "next/cache": { revalidatePath: url => revalidated.push(url) } }, fixture);
    const backup = await writer.createManualBackup();
    const edited = structuredClone(sample);
    edited[0].service_types[0].device_prices[0].prices.original = 175000;
    await writer.writePricelist(edited);
    assert.equal(JSON.parse(await readFile(path.join(fixture, "data/pricelist.json")))[0].service_types[0].device_prices[0].prices.original, 175000);
    const replacedModel = structuredClone(edited);
    replacedModel[0].service_types[0].device_prices[0].DeviceModel = "QA Model Pengganti";
    await writer.writePricelist(replacedModel);
    const replacementSnapshotName = (await readdir(path.join(fixture, "data/backups")))
      .find(name => name.includes("hapus-1-model-perangkat"));
    assert.ok(replacementSnapshotName, "replacing one model with another must create a pre-change snapshot even when row count is unchanged");
    assert.equal(JSON.parse(await readFile(path.join(fixture, "data/backups", replacementSnapshotName)))[0].service_types[0].device_prices[0].DeviceModel, "QA Model");
    await writer.writePricelist(replacedModel.filter(category => category.Slug !== "qa-empty"));
    assert.ok((await readdir(path.join(fixture, "data/backups"))).some(name => name.includes("hapus-kategori-qa-empty")), "deleting an empty category must also create a pre-change snapshot");
    const beforeInvalid = await readFile(path.join(fixture, "data/pricelist.json"), "utf8");
    await assert.rejects(writer.writePricelist([]));
    assert.equal(await readFile(path.join(fixture, "data/pricelist.json"), "utf8"), beforeInvalid);
    await assert.rejects(writer.restoreBackup("../outside.json"));
    await writer.restoreBackup(backup);
    assert.equal(JSON.parse(await readFile(path.join(fixture, "data/pricelist.json")))[0].service_types[0].device_prices[0].prices.original, 125000);
    const backups = await readdir(path.join(fixture, "data/backups"));
    assert.ok(backups.includes(backup), "restored backup remains available");
    const currentSnapshot = backups.find(name => name !== backup);
    assert.ok(currentSnapshot, "restore creates a snapshot of the pre-restore state");
    assert.equal(JSON.parse(await readFile(path.join(fixture, "data/backups", currentSnapshot)))[0].service_types[0].device_prices[0].prices.original, 175000);

    const currentState = await readFile(path.join(fixture, "data/pricelist.json"), "utf8");
    const writerNoSnapshot = loadSource(await readFile(path.join(root, "lib/admin/pricelist-write.ts"), "utf8"),
      { "@/lib/data": data, "next/cache": { revalidatePath: () => {} }, "node:fs/promises": { ...fsPromises, copyFile: async () => { throw new Error("snapshot blocked"); } } }, fixture);
    await assert.rejects(writerNoSnapshot.restoreBackup(backup), /snapshot/i);
    assert.equal(await readFile(path.join(fixture, "data/pricelist.json"), "utf8"), currentState, "restore must fail closed when snapshot cannot be made");
    await readFile(path.join(fixture, "data/backups", backup), "utf8");
    assert.ok(revalidated.includes("/pricelist"));
    assert.equal(await readFile(originalPath, "utf8"), original, "operational dataset must stay unchanged");
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
