"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoveLeft, MoveRight, Search, X } from "lucide-react";
import { formatThousands, type ServiceType } from "@/lib/data";

interface PriceTableProps {
  service: ServiceType;
  categoryName: string;
}

export default function PriceTable({ service, categoryName }: PriceTableProps) {
  const [query, setQuery] = useState("");

  // Afordansi geser horizontal: true selama masih ada kolom terpotong di
  // kanan → tampilkan hint "Geser tabel" + gradien fade tepi kanan. Otomatis
  // hilang begitu digulir sampai ujung (atau semua kolom muat).
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canRight, setCanRight] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const rafId = useRef<number | null>(null);

  const updateHint = () => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const el = scrollRef.current;
      if (!el) return;
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
      setCanLeft(el.scrollLeft > 8);
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // ResizeObserver menembak sekali saat observe → status awal tanpa
    // setState langsung di badan efek.
    const ro = new ResizeObserver(updateHint);
    ro.observe(el);
    const table = el.querySelector("table");
    if (table) ro.observe(table);
    return () => {
      ro.disconnect();
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return service.device_prices;
    return service.device_prices.filter((d) => {
      if (d.DeviceModel.toLowerCase().includes(q)) return true;
      return service.variants.some(
        (v) =>
          v.Label.toLowerCase().includes(q) ||
          (v.Note && v.Note.toLowerCase().includes(q))
      );
    });
  }, [query, service.device_prices, service.variants]);

  const variants = service.variants;

  return (
    <div className="pt-4">
      {/* Pencarian + penghitung model */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-[22rem]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari model / layanan…"
            aria-label="Cari model"
            className="w-full rounded-[12px] border border-panel-border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-text-muted outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-text-muted">
          {rows.length} model
        </p>
      </div>

      {/* Hint geser (pola fixmibali "Geser tabel untuk detail →"). Baris tetap
          ter-mount selama tabel bisa digeser (dua arah) — unmount saat mentok
          membuat tabel lompat/berkedip. Mentok kanan → hint berbalik arah (←). */}
      {(canRight || canLeft) && (
        <p className="mb-2 flex items-center justify-end text-right ml-auto w-full gap-1.5 font-mono text-[0.625rem] sm:text-[0.6875rem] uppercase tracking-widest text-primary">
          {canRight ? (
            <>
              Geser tabel untuk detail
              <MoveRight className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            </>
          ) : (
            <>
              <MoveLeft className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
              Geser tabel untuk detail
            </>
          )}
        </p>
      )}

      {/* Tabel "frozen panes" (pola fixmibali.com): tinggi dibatasi max-h dan
          tabel menggulir DI DALAM kotak ini — halaman tidak ikut memanjang.
          Header sticky top, kolom model sticky left, sel pojok sticky dua arah.
          -mx-2 menetralkan padding panel mobile (px-2) → tabel rata tepi panel.
          data-lenis-prevent WAJIB: tanpa ini Lenis menyedot event wheel ke
          scroll halaman sehingga kotak ini tidak pernah bisa digulir di desktop.
          [overscroll-behavior:contain] mencegah loncatan scroll ke Lenis saat mentok. */}
      <div className="relative -mx-2 lg:mx-0">
        <div
          ref={scrollRef}
          onScroll={updateHint}
          data-lenis-prevent
          className="max-h-[30rem] overflow-auto [overscroll-behavior:contain] [transform:translateZ(0)] [-webkit-overflow-scrolling:touch] touch-pan-x touch-pan-y"
        >
        {/* border-separate WAJIB (bukan border-collapse): sticky pada sel tabel
            rusak di iOS Safari saat border-collapse. Konsekuensi: border baris
            harus di sel (border pada <tr> tidak dirender saat separate). */}
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {/* Sel pojok: sticky dua arah (top + left), z tertinggi */}
              <th className="sticky left-0 top-0 z-30 min-w-[8.5rem] lg:min-w-[11rem] border-b border-r border-panel-border bg-panel px-3 lg:px-4 pb-3 pt-2 align-bottom [transform:translateZ(0)] [will-change:transform]">
                <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-foreground">
                  {service.Name}
                </span>
                <span className="mt-0.5 block text-[0.625rem] font-normal tracking-wide text-text-muted">
                  {categoryName} Models
                </span>
              </th>
              {variants.map((v) => (
                <th
                  key={v.Key}
                  className="sticky top-0 z-20 min-w-[7.5rem] lg:min-w-[8.5rem] border-b border-panel-border bg-panel px-3 lg:px-4 pb-3 pt-2 align-bottom text-right [transform:translateZ(0)] [will-change:transform]"
                >
                  <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-foreground">
                    {v.Label}
                  </span>
                  {v.Note && (
                    <span className="mt-0.5 block text-[0.625rem] font-normal normal-case tracking-wide text-text-muted">
                      {v.Note}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={variants.length + 1}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  {query
                    ? `Tidak ada model yang cocok dengan “${query}”.`
                    : "Belum ada data model untuk service ini."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.DeviceModel}
                  className="group transition-colors hover:bg-panel-raised"
                >
                  <td className="sticky left-0 z-10 border-b border-panel-border/60 border-r border-r-panel-border border-l-2 border-l-transparent bg-panel px-3 lg:px-4 py-3.5 text-sm font-medium text-foreground whitespace-nowrap transition-[colors,border-color] duration-200 group-hover:bg-panel-raised group-hover:border-l-primary [transform:translateZ(0)] [will-change:transform]">
                    {row.DeviceModel}
                  </td>
                  {variants.map((v) => {
                    const price = row.prices[v.Key];
                    return (
                      <td
                        key={v.Key}
                        className="border-b border-panel-border/60 px-3 lg:px-4 py-3.5 text-right font-mono text-sm tabular-nums whitespace-nowrap"
                      >
                        {price == null ? (
                          <span className="text-text-muted/40" aria-label="Tidak tersedia">
                            –
                          </span>
                        ) : (
                          <>
                            <span className="mr-1.5 text-[0.6875rem] text-primary/80">Rp</span>
                            <span className="text-primary font-medium">
                              {formatThousands(price)}
                            </span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Gradien fade tepi kanan — isyarat visual masih ada kolom di kanan.
            z-40 di atas sel sticky (z-10..30); pointer-events-none agar tidak
            menghalangi gesture. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-40 w-10 bg-gradient-to-l from-panel to-transparent transition-opacity duration-300 ${
            canRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
