import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = process.cwd();
const require = createRequire(import.meta.url);
const loadTs = async (file, dependencies = {}) => {
  const source = await readFile(`${root}/${file}`, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const moduleExports = {};
  new Function("require", "exports", output)(
    name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
    moduleExports,
  );
  return moduleExports;
};

test("XLSX round-trip preserves models whose prices are all unavailable", async () => {
  const data = await loadTs("lib/data.ts", { "@/data/gallery.json": [] });
  const excel = require("exceljs");
  const { buildPricelistXlsx } = await loadTs("lib/admin/export-xlsx.ts", { exceljs: excel });
  const { parseImportFile } = await loadTs("lib/admin/import-parse.ts", {
    exceljs: excel,
    "@/lib/data": data,
  });
  const categories = [{
    Name: "QA iPhone", Slug: "qa-iphone", description: "", Image: null,
    service_types: [{
      Name: "QA LCD", Slug: "qa-lcd", variants: [
        { Key: "standard", Label: "STANDARD", Note: "" },
        { Key: "premium", Label: "PREMIUM", Note: "" },
      ],
      device_prices: [
        { DeviceModel: "iPhone QA priced", prices: { standard: 125000, premium: null } },
        { DeviceModel: "iPhone QA unavailable", prices: { standard: null, premium: null } },
      ],
    }],
  }];

  const workbook = await buildPricelistXlsx(categories);
  const { merged, preview } = await parseImportFile(workbook, "qa-pricelist.xlsx", categories);
  assert.deepEqual(preview.errors, []);
  const rows = merged[0].service_types[0].device_prices;
  assert.deepEqual(rows.map(row => row.DeviceModel), ["iPhone QA priced", "iPhone QA unavailable"]);
  assert.equal(rows[1].prices.standard, null);
  assert.equal(rows[1].prices.premium, null);
});
