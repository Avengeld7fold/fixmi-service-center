/**
 * Pembatas percobaan login — anti brute force.
 *
 * Penyimpanan di memori proses: cocok untuk deploy satu instance (cPanel
 * "Setup Node.js App"). Bila kelak diskalakan ke banyak instance, ganti Map ini
 * dengan Redis/KV agar hitungan dibagikan antar proses.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const LOCKOUT_MS = 15 * 60 * 1000;

interface Entry {
  fails: number;
  firstFailAt: number;
  lockedUntil: number;
}

const attempts = new Map<string, Entry>();

/** Buang entri kedaluwarsa agar Map tidak tumbuh tanpa batas. */
function sweep(now: number) {
  for (const [key, e] of attempts) {
    if (now > e.lockedUntil && now - e.firstFailAt > WINDOW_MS) attempts.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Sisa detik sampai boleh mencoba lagi (0 bila diizinkan). */
  retryAfterSeconds: number;
  remaining: number;
}

export function checkLoginAttempt(key: string): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const e = attempts.get(key);
  if (!e) return { allowed: true, retryAfterSeconds: 0, remaining: MAX_ATTEMPTS };

  if (now < e.lockedUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((e.lockedUntil - now) / 1000),
      remaining: 0,
    };
  }
  // Jendela lewat → hitungan direset.
  if (now - e.firstFailAt > WINDOW_MS) {
    attempts.delete(key);
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_ATTEMPTS };
  }
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, MAX_ATTEMPTS - e.fails),
  };
}

export function recordLoginFailure(key: string): RateLimitResult {
  const now = Date.now();
  const e = attempts.get(key);
  if (!e || now - e.firstFailAt > WINDOW_MS) {
    attempts.set(key, { fails: 1, firstFailAt: now, lockedUntil: 0 });
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_ATTEMPTS - 1 };
  }
  e.fails += 1;
  if (e.fails >= MAX_ATTEMPTS) {
    e.lockedUntil = now + LOCKOUT_MS;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
      remaining: 0,
    };
  }
  return { allowed: true, retryAfterSeconds: 0, remaining: MAX_ATTEMPTS - e.fails };
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key);
}
