import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
const isFixmi = packageJson.name === "fixmi";
const peerRoot = path.resolve(path.dirname(root), isFixmi ? "Mobicare" : "Fixmi");

function parseEnv(source) {
  const values = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

test("cookie admin memakai identitas project sendiri", async () => {
  const auth = await fs.readFile(path.join(root, "lib/admin/auth.ts"), "utf8");
  const expected = isFixmi ? "fixmi_admin" : "mobicare_admin";
  assert.match(auth, new RegExp(`SESSION_COOKIE\\s*=\\s*["']${expected}["']`));
});

test("semua penyimpanan runtime berakar pada project aktif", async () => {
  const sources = await Promise.all([
    fs.readFile(path.join(root, "lib/admin/pricelist-write.ts"), "utf8"),
    fs.readFile(path.join(root, "lib/pricelist-server.ts"), "utf8"),
    fs.readFile(path.join(root, "lib/promo-server.ts"), "utf8"),
    fs.readFile(path.join(root, "lib/gallery-server.ts"), "utf8"),
    fs.readFile(path.join(root, "app/admin/actions.ts"), "utf8"),
  ]);
  const combined = sources.join("\n");
  assert.match(combined, /process\.cwd\(\)/);
  assert.doesNotMatch(combined, /Documents\/Projects\/(Fixmi|Mobicare)/);
  assert.match(combined, /"public", "images", "promo"/);
  assert.match(combined, /"public", "images", "gallery"/);
});

test("data, media, password, dan session secret tidak berbagi boundary dengan peer", async (context) => {
  try {
    await fs.access(path.join(peerRoot, "package.json"));
  } catch {
    context.skip("Repo pasangan tidak tersedia di mesin ini.");
    return;
  }

  for (const relative of ["data", path.join("public", "images")]) {
    const [currentStat, peerStat, currentReal, peerReal] = await Promise.all([
      fs.lstat(path.join(root, relative)),
      fs.lstat(path.join(peerRoot, relative)),
      fs.realpath(path.join(root, relative)),
      fs.realpath(path.join(peerRoot, relative)),
    ]);
    assert.equal(currentStat.isSymbolicLink(), false);
    assert.equal(peerStat.isSymbolicLink(), false);
    assert.notEqual(currentReal, peerReal);
  }

  const [currentEnv, peerEnv] = await Promise.all([
    fs.readFile(path.join(root, ".env.local"), "utf8").then(parseEnv),
    fs.readFile(path.join(peerRoot, ".env.local"), "utf8").then(parseEnv),
  ]);
  assert.ok(currentEnv.ADMIN_PASSWORD && currentEnv.ADMIN_SESSION_SECRET);
  assert.ok(peerEnv.ADMIN_PASSWORD && peerEnv.ADMIN_SESSION_SECRET);
  assert.notEqual(currentEnv.ADMIN_PASSWORD, peerEnv.ADMIN_PASSWORD);
  assert.notEqual(currentEnv.ADMIN_SESSION_SECRET, peerEnv.ADMIN_SESSION_SECRET);
});
