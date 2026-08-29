import type { NextConfig } from "next";

/**
 * Header keamanan untuk seluruh route.
 *
 * CSP tidak memakai 'unsafe-eval' dan membatasi asal script ke Google Maps saja.
 * 'unsafe-inline' masih diperlukan: Next.js menyuntik bootstrap inline, dan
 * banyak komponen memakai style inline + keyframes runtime (loader, peta).
 *
 * frame-ancestors 'none' + X-Frame-Options = kunci anti-clickjacking, jalur
 * defacement paling umum untuk situs seperti ini.
 */
// React memakai eval() HANYA di mode development (untuk rekonstruksi
// callstack). Produksi tetap tanpa 'unsafe-eval' — inilah yang dikirim ke
// pengunjung asli.
const isDev = process.env.NODE_ENV === "development";
const scriptSrc = [
  "script-src 'self' 'unsafe-inline'",
  isDev ? "'unsafe-eval' http://localhost:8400" : "",
  "https://maps.googleapis.com https://maps.gstatic.com",
]
  .filter(Boolean)
  .join(" ");

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com https://*.googleusercontent.com",
  `connect-src 'self' https://maps.googleapis.com https://*.googleapis.com${isDev ? " http://localhost:8400 ws: http:" : ""}`,
  // Peta memakai iframe embed Google sebagai fallback tanpa API key.
  "frame-src https://www.google.com https://maps.google.com",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Jangan bocorkan versi framework ke penyerang.
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.ggpht.com",
      },
    ],
  },

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // Area admin: jangan di-cache proxy/CDN, jangan diindeks mesin pencari.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
