"use client";

/**
 * FIXMI — Footer (Store Locator)
 *
 * Visual Craftsmanship: Minimalist Card Frame & Accent Arrow
 * Active Indicator Rail removed in favor of clean card frame contrast & glowing arrow.
 */

import { useState } from "react";
import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import LanguageSwitcher from "./LanguageSwitcher";

type StoreKey = "head" | "branch" | "other";

interface Store {
  name: string;
  label: string;
  region: string;
  city: string;
  rating: string;
  reviews: string;
  address: string;
  phone: string;
  hours: string[];
  map: string; // query untuk Google Maps
}

const STORES: Record<StoreKey, Store> = {
  head: {
    name: "FIXMI Service Center",
    label: "Head Store",
    region: "Kedonganan · Badung",
    city: "Kedonganan",
    rating: "4.9",
    reviews: "420+",
    address:
      "Link. Kubu Alit Kedonganan, Jl. Raya Uluwatu, Kedonganan, Kec. Kuta, Kabupaten Badung, Bali 80361",
    phone: "0819-9933-6722",
    hours: [
      "Senin – Sabtu 09.00 – 21.00 WITA",
      "Minggu 09.00 – 18.00 WITA",
    ],
    map: "Fixmi Service Center Kedonganan Jl Raya Uluwatu Bali 80361",
  },
  branch: {
    name: "FIXMI Taman Griya",
    label: "Cabang Jimbaran",
    region: "Jimbaran · Badung",
    city: "Jimbaran",
    rating: "4.8",
    reviews: "190+",
    address:
      "Taman Griya, Jl. Nuansa Utama No. 33, Jimbaran, Kuta Selatan, Kabupaten Badung, Bali 80361",
    phone: "0819-9933-6722",
    hours: ["Senin – Sabtu 09.00 – 21.00 WITA", "Minggu 09.00 – 18.00 WITA"],
    map: "Fixmi Service Center Phone Taman Griya Jl Nuansa Utama Jimbaran Bali",
  },
  other: {
    name: "Mobicare by FIXMI",
    label: "Cabang Denpasar",
    region: "Denpasar Barat",
    city: "Denpasar",
    rating: "4.9",
    reviews: "310+",
    address:
      "Cellular World Arena, Jl. Teuku Umar No. 57, Dauh Puri Kauh, Kec. Denpasar Barat, Kota Denpasar, Bali 80113",
    phone: "0819-9933-6722",
    hours: ["Senin – Sabtu 09.00 – 21.00 WITA", "Minggu 09.00 – 18.00 WITA"],
    map: "Mobicare Service Center Cellular World Arena Jl Teuku Umar Denpasar Bali",
  },
};

const ORDER: StoreKey[] = ["head", "branch", "other"];
const DISPLAY = "var(--font-bayon), sans-serif";

const waLink = (phone: string) => {
  const cleanPhone = "62" + phone.replace(/[^0-9]/g, "").replace(/^0/, "");
  const msg = `Halo FIXMI Service Center, saya mau konsultasi perbaikan gadget:

• Tipe Gadget: 
• Kendala / Kerusakan: `;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
};

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-10.4a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88Z",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.82.12v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.51a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.92z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.08 24 18.09 24 12.07",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const { dict } = useI18n();
  const [active, setActive] = useState<StoreKey>("head");

  // Halaman admin dan contact/book now punya store locator sendiri — footer global disembunyikan
  if (pathname.startsWith("/admin") || pathname === "/contact" || pathname === "/en/contact") return null;

  const s = STORES[active];
  const q = encodeURIComponent(s.map);

  return (
    <footer className="border-t border-white/[0.08] bg-[#121212] text-neutral-300">
      <div className="mx-auto w-full max-w-[80rem] px-5 md:px-10 lg:px-14">
        {/* ── Brand Header ── */}
        <div className="flex flex-col gap-2 border-b border-white/[0.08] py-12 lg:py-14">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-bold italic tracking-[-0.03em] text-[#f5f5f5]">
              fixmi
            </span>
            <svg width="16" height="27" viewBox="0 0 24 40" fill="var(--fixmi-primary)" aria-hidden="true" className="shrink-0 drop-shadow-[0_0_8px_rgba(255,107,0,0.35)]">
              <path d="M14 0 3 23h7l-2 17 13-25h-8l3-15z" />
            </svg>
            <span className="text-lg font-bold tracking-wide">
              <span className="text-primary">SERVICE</span>{" "}
              <span className="text-[#f5f5f5]">CENTER</span>
            </span>
          </div>
          <p className="text-sm text-neutral-400">
            Phone Service <span className="text-primary font-semibold">·</span> Sparepart{" "}
            <span className="text-primary font-semibold">·</span> Tech Academy
          </p>
        </div>

        {/* ── Store locator ── */}
        <div className="py-12 lg:py-16">
          <div>
            <h2
              className="max-w-[18ch] text-[clamp(2.25rem,4vw,3.5rem)] uppercase leading-[1.15] text-[#f5f5f5]"
              style={{ fontFamily: DISPLAY, letterSpacing: "0.04em" }}
            >
              Temukan toko kami
            </h2>
            <p className="mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed text-neutral-400">
              Tiga gerai di Bali. Pilih lokasi untuk alamat lengkap, jam buka, dan
              arahkan rute langsung dari peta.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_1.2fr] lg:gap-12">
            {/* Directory + spec */}
            <div>
              <div className="space-y-2">
                {ORDER.map((key) => {
                  const st = STORES[key];
                  const on = key === active;
                  return (
                    <button
                      key={key}
                      data-key={key}
                      type="button"
                      onClick={() => setActive(key)}
                      aria-pressed={on}
                      className={`group flex w-full items-center justify-between gap-4 rounded-xl border px-4.5 py-3.5 text-left outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        on
                          ? "border-white/[0.16] bg-white/[0.05] shadow-sm"
                          : "border-transparent bg-transparent hover:border-white/[0.08] hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span
                          className={`block text-[0.95rem] transition-colors duration-150 ${
                            on ? "font-semibold text-[#f5f5f5]" : "font-medium text-neutral-300 group-hover:text-[#f5f5f5]"
                          }`}
                        >
                          {st.label}
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-xs transition-colors duration-150 ${
                            on ? "text-neutral-400" : "text-neutral-500"
                          }`}
                        >
                          {st.region}
                        </span>
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 shrink-0 transition-[transform,opacity] duration-250 ease-out ${
                          on
                            ? "text-primary translate-x-0 opacity-100"
                            : "-translate-x-1 text-neutral-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {/* Spec sheet */}
              <dl key={active} className="footer-spec mt-8">
                <div style={{ ["--row" as string]: 0 } as CSSProperties} className="grid grid-cols-[5rem_1fr] gap-4 border-t border-white/[0.08] py-4 sm:grid-cols-[6rem_1fr]">
                  <dt className="pt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    Alamat
                  </dt>
                  <dd className="text-sm leading-relaxed text-neutral-200">{s.address}</dd>
                </div>
                <div style={{ ["--row" as string]: 1 } as CSSProperties} className="grid grid-cols-[5rem_1fr] gap-4 border-t border-white/[0.08] py-4 sm:grid-cols-[6rem_1fr]">
                  <dt className="pt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    WhatsApp
                  </dt>
                  <dd>
                    <a
                      href={waLink(s.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-neutral-100 transition-[border-color,background-color,color,transform] duration-200 ease-out hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-primary" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                      </svg>
                      <span className="font-mono text-[0.92rem] font-medium tabular-nums">{s.phone}</span>
                    </a>
                  </dd>
                </div>
                <div style={{ ["--row" as string]: 2 } as CSSProperties} className="grid grid-cols-[5rem_1fr] gap-4 border-y border-white/[0.08] py-4 sm:grid-cols-[6rem_1fr]">
                  <dt className="pt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    Jam Buka
                  </dt>
                  <dd className="space-y-1 text-sm leading-relaxed text-neutral-300">
                    {s.hours.map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Map */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#161616] shadow-2xl">
              <iframe
                key={active}
                src={`https://www.google.com/maps?q=${q}&z=15&output=embed`}
                className="block h-[20rem] w-full border-0 lg:h-auto lg:flex-1 lg:min-h-[26rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta lokasi ${s.name}`}
              />
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/[0.08] bg-[#161616]/95 px-4 py-3.5 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-sm font-medium text-[#f5f5f5]">{s.name}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-300">
                    <svg width="12" height="12" viewBox="0 0 24 40" fill="var(--fixmi-primary)" className="h-3 w-3" aria-hidden="true">
                      <path d="M12 2l2.9 6.26 6.1.5-4.6 4.3 1.4 6.44L12 16.9 6.2 19.5l1.4-6.44L3 8.76l6.1-.5z" />
                    </svg>
                    <span className="font-mono tabular-nums text-[#f5f5f5] font-semibold">{s.rating}</span>
                    <span className="text-neutral-400">({s.reviews})</span>
                  </span>
                </div>
                <div className="flex items-center gap-5 text-xs font-medium">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-300 transition-[color,transform] duration-150 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Rute
                    <span aria-hidden="true">→</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${q}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-300 transition-[color,transform] duration-150 ease-out hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    Buka di Maps
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] py-6 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <span className="text-xs text-neutral-400">
              © 2016–2026 FIXMI Service Center. {dict.common.allRightsReserved}
            </span>
            <LanguageSwitcher variant="footer" />
          </div>
          <div className="-mr-2 flex items-center gap-1">
            {SOCIALS.map((soc) => (
              <a
                key={soc.label}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={soc.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-primary active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={soc.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
