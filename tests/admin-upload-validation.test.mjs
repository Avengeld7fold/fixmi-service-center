import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = process.cwd();
const source = await readFile(`${root}/lib/admin/upload-validation.ts`, "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const moduleExports = {};
new Function("exports", output)(moduleExports);

test("server upload accepts only bounded JPEG, PNG, and WebP content signatures", async () => {
  const cases = [
    ["image.jpg", [0xff, 0xd8, 0xff, 0x00], "jpg"],
    ["image.png", [137, 80, 78, 71, 13, 10, 26, 10], "png"],
    ["image.webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80], "webp"],
  ];
  for (const [name, bytes, extension] of cases) {
    const upload = new File([Uint8Array.from(bytes)], name);
    assert.equal((await moduleExports.readAdminImageUpload(upload)).extension, extension);
  }

  await assert.rejects(
    moduleExports.readAdminImageUpload(new File(["<svg></svg>"], "image.svg", { type: "image/svg+xml" })),
    /JPG, PNG, atau WebP/,
  );
  const oversized = new File([new Uint8Array(8 * 1024 * 1024 + 1)], "large.png");
  await assert.rejects(moduleExports.readAdminImageUpload(oversized), /maksimum 8 MB/);
  await assert.rejects(moduleExports.readAdminImageUpload(null), /Pilih file gambar/);
});
