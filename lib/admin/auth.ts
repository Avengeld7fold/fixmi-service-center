/**
 * Sesi admin berbasis cookie HMAC — tanpa dependensi.
 * PENTING: modul ini dipakai proxy (Edge runtime), jadi hanya boleh
 * memakai Web Crypto API + process.env. Jangan import fs/node:crypto di sini.
 */

export const SESSION_COOKIE = "fixmi_admin";
export const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60; // 7 hari

const encoder = new TextEncoder();

function getSecret(): string | null {
  // Secret khusus lebih baik; fallback ke password agar setup satu env pun jalan.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function toBase64Url(buf: ArrayBuffer): string {
  let binary = "";
  for (const b of new Uint8Array(buf)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

/**
 * Cocokkan password input dengan ADMIN_PASSWORD. Perbandingan dilakukan pada
 * HMAC keduanya (bukan string mentah) supaya tahan timing attack.
 */
export async function verifyPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  const [a, b] = await Promise.all([hmac(`pw:${input}`), hmac(`pw:${expected}`)]);
  return a !== null && a === b;
}

/** Token sesi: "<expiryEpochMs>.<hmac(expiry)>" */
export async function createSessionToken(): Promise<string | null> {
  const exp = String(Date.now() + SESSION_MAX_AGE_S * 1000);
  const sig = await hmac(`session:${exp}`);
  return sig ? `${exp}.${sig}` : null;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = await hmac(`session:${exp}`);
  return expected !== null && expected === sig;
}
