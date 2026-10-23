import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
const peerName = packageJson.name === "fixmi" ? "Mobicare" : "Fixmi";
const expectedPeerPackage = packageJson.name === "fixmi" ? "mobicare" : "fixmi";
const peerRoot = path.resolve(process.env.ADMIN_PARITY_PEER || path.join(path.dirname(root), peerName));

const coreDirectories = ["app/admin", "components/admin", "lib/admin"];
const coreFiles = [
  "app/api/admin/export/route.ts",
  "components/pricelist/ServiceIcon.tsx",
  "lib/data.ts",
  "lib/pricelist-order.ts",
  "lib/constants.ts",
  "lib/pricelist-server.ts",
  "lib/promo-server.ts",
  "lib/gallery-server.ts",
  "proxy.ts",
];
const visualAssets = [
  "public/fonts/bayon/Bayon-Regular.ttf",
  "public/fonts/geist-mono/GeistMono-Regular.ttf",
  "public/fonts/instrument-sans/InstrumentSans-Regular.ttf",
  "public/fonts/neue-montreal/NeueMontreal-Bold.otf",
  "public/fonts/neue-montreal/NeueMontreal-Italic.otf",
  "public/fonts/neue-montreal/NeueMontreal-Medium.otf",
  "public/fonts/neue-montreal/NeueMontreal-Regular.otf",
];
const themeBridgeTokens = [
  "admin-background",
  "admin-foreground",
  "admin-primary",
  "admin-primary-light",
  "admin-primary-dark",
  "admin-surface",
  "admin-surface-alt",
  "admin-surface-elevated",
  "admin-text-secondary",
  "admin-text-muted",
  "admin-border",
  "admin-divider",
  "admin-panel",
  "admin-panel-raised",
  "admin-panel-border",
  "admin-font-display",
  "admin-font-body",
  "admin-font-mono",
  "admin-font-data",
];

async function listFiles(base, relativeDirectory) {
  const directory = path.join(base, relativeDirectory);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(base, relativePath));
    else files.push(relativePath);
  }
  return files;
}

function normalizeBrand(source) {
  return source
    .replaceAll("MobiCare", "BRAND")
    .replaceAll("MOBICARE", "BRAND")
    .replaceAll("FIXMI", "BRAND")
    .replaceAll("mobicare_admin", "brand_admin")
    .replaceAll("fixmi_admin", "brand_admin");
}

function normalizeFile(file, source) {
  const normalized = normalizeBrand(source);
  return file.endsWith(".css") ? normalized.replace(/\s+/g, "") : normalized;
}

const peerPackage = JSON.parse(await fs.readFile(path.join(peerRoot, "package.json"), "utf8"));
if (peerPackage.name !== expectedPeerPackage) {
  throw new Error(`Peer admin tidak valid: mengharapkan ${expectedPeerPackage}, menemukan ${peerPackage.name}.`);
}

const files = [...coreFiles];
for (const directory of coreDirectories) files.push(...await listFiles(root, directory));
files.sort();

const peerFiles = [...coreFiles];
for (const directory of coreDirectories) peerFiles.push(...await listFiles(peerRoot, directory));
peerFiles.sort();

const missingHere = peerFiles.filter((file) => !files.includes(file));
const missingPeer = files.filter((file) => !peerFiles.includes(file));
const changed = [];
const changedAssets = [];
const themeBridgeErrors = [];

for (const file of files.filter((candidate) => peerFiles.includes(candidate))) {
  const [current, peer] = await Promise.all([
    fs.readFile(path.join(root, file), "utf8"),
    fs.readFile(path.join(peerRoot, file), "utf8"),
  ]);
  if (normalizeFile(file, current) !== normalizeFile(file, peer)) changed.push(file);
}

for (const asset of visualAssets) {
  const [current, peer] = await Promise.all([
    fs.readFile(path.join(root, asset)),
    fs.readFile(path.join(peerRoot, asset)),
  ]);
  if (!current.equals(peer)) changedAssets.push(asset);
}

for (const [base, label] of [[root, packageJson.name], [peerRoot, peerPackage.name]]) {
  const globalCss = await fs.readFile(path.join(base, "app/globals.css"), "utf8");
  const missingTokens = themeBridgeTokens.filter((token) => !globalCss.includes(`var(--${token},`));
  if (missingTokens.length) themeBridgeErrors.push(`${label}: bridge token hilang (${missingTokens.join(", ")})`);
  if (globalCss.includes("Status utilities stay inside the MobiCare palette") && !globalCss.includes("body:not(:has(.admin-shell))")) {
    themeBridgeErrors.push(`${label}: status palette publik masih dapat menimpa skin admin`);
  }
}

if (missingHere.length || missingPeer.length || changed.length || changedAssets.length || themeBridgeErrors.length) {
  if (missingHere.length) console.error(`Hanya ada di peer:\n- ${missingHere.join("\n- ")}`);
  if (missingPeer.length) console.error(`Belum ada di peer:\n- ${missingPeer.join("\n- ")}`);
  if (changed.length) console.error(`Perilaku admin berbeda:\n- ${changed.join("\n- ")}`);
  if (changedAssets.length) console.error(`Aset visual admin berbeda:\n- ${changedAssets.join("\n- ")}`);
  if (themeBridgeErrors.length) console.error(`Bridge tema admin tidak valid:\n- ${themeBridgeErrors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Admin parity OK: ${packageJson.name} ↔ ${peerPackage.name} (${files.length} file, ${visualAssets.length} aset visual).`);
}
