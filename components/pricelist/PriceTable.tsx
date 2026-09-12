"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MoveLeft, MoveRight, Search, X, MessageCircle } from "lucide-react";
import { formatThousands, type ServiceType } from "@/lib/data";
import { whatsappUrl } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import {
  getLocalizedServiceName,
  getLocalizedVariantLabel,
  getLocalizedVariantNote,
} from "@/lib/i18n/service-translation";

interface PriceTableProps {
  service: ServiceType;
  categoryName: string;
  sub?: boolean;
}

export default function PriceTable({ service, categoryName, sub = false }: PriceTableProps) {
  const { dict, locale } = useI18n();
  const isEn = locale === "en";
  const [query, setQuery] = useState("");

  // Afordansi geser horizontal: true selama masih ada kolom terpotong di
  // kanan → tampilkan hint "Geser tabel" + gradien fade tepi kanan. Otomatis
  // hilang begitu digulir sampai ujung (atau semua kolom muat).
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [canRight, setCanRight] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const rafId = useRef<number | null>(null);

  const isSyncing = useRef(false);

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

  /** Sync header horizontal position from body + update hint. */
  const handleBodyScroll = () => {
    if (!isSyncing.current && headerRef.current && scrollRef.current) {
      isSyncing.current = true;
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    }
    updateHint();
  };

  /** Sync body horizontal position from header + update hint. */
  const handleHeaderScroll = () => {
    if (!isSyncing.current && headerRef.current && scrollRef.current) {
      isSyncing.current = true;
      scrollRef.current.scrollLeft = headerRef.current.scrollLeft;
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    }
    updateHint();
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
      if (
        Object.values(d.prices).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(q)
        )
      ) {
        return true;
      }
      return service.variants.some(
        (v) =>
          v.Label.toLowerCase().includes(q) ||
          (v.Note && v.Note.toLowerCase().includes(q))
      );
    });
  }, [query, service.device_prices, service.variants]);

  const variants = service.variants;

  const isSeriesCol = useCallback(
    (v: { Key: string; Label: string; Type?: string }) => {
      const k = v.Key.toLowerCase();
      const l = v.Label.toLowerCase();
      if (
        k.includes("series") ||
        l.includes("series") ||
        k.includes("model") ||
        l.includes("model")
      ) {
        return true;
      }
      return service.device_prices.some((d) => {
        const val = d.prices[v.Key];
        return (
          typeof val === "string" &&
          (val.includes("/") || /^A\d{3,4}/.test(val.trim()))
        );
      });
    },
    [service.device_prices]
  );

  const tableMinWidth = useMemo(() => {
    let remSum = 11.5;
    for (const v of variants) {
      if (isSeriesCol(v)) {
        remSum += 13.5;
      } else if (v.Type === "text") {
        remSum += 8.5;
      } else {
        remSum += 8.0;
      }
    }
    return `max(100%, ${remSum}rem)`;
  }, [variants, isSeriesCol]);

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
            placeholder={dict.pricelist.searchPlaceholder}
            aria-label={dict.pricelist.searchPlaceholder}
            className={`w-full rounded-[12px] border py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-text-muted outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
              sub ? "border-[#282828] bg-[#121212]" : "border-panel-border bg-background"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={dict.common.close}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-text-muted">
          {rows.length} {isEn ? "models" : "model"}
        </p>
      </div>

      {/* Hint geser (pola fixmibali "Geser tabel untuk detail →"). Baris tetap
          ter-mount selama tabel bisa digeser (dua arah) — unmount saat mentok
          membuat tabel lompat/berkedip. Mentok kanan → hint berbalik arah (←). */}
      {(canRight || canLeft) && (
        <p className="mb-2 flex items-center justify-end text-right ml-auto w-full gap-1.5 font-mono text-[0.625rem] sm:text-[0.6875rem] uppercase tracking-widest text-primary">
          {canRight ? (
            <>
              {isEn ? "Swipe table for details" : "Geser tabel untuk detail"}
              <MoveRight className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            </>
          ) : (
            <>
              <MoveLeft className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
              {isEn ? "Swipe table for details" : "Geser tabel untuk detail"}
            </>
          )}
        </p>
      )}

      {/* ─── Split-table layout ─────────────────────────────────────────
           Header lives OUTSIDE the vertical scroll container so it never
           scrolls away. This bypasses the WebKit bug where nested
           overflow-hidden ancestors (accordion) break position:sticky;top:0.

           headerRef  → overflow-x-auto, scrollLeft synced bidirectionally
           scrollRef  → overflow-auto,   the primary vertical+horizontal scroller
           Both tables share table-fixed, identical <colgroup>, and identical minWidth
           so columns align with mathematical precision down to the sub-pixel. */}
      <div className="relative -mx-2 lg:mx-0">
        {/* Header — never scrolls vertically */}
        <div
          ref={headerRef}
          onScroll={handleHeaderScroll}
          className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
        >
          <table
            className="w-full table-fixed border-separate border-spacing-0 text-left"
            style={{ minWidth: tableMinWidth }}
          >
            <colgroup>
              <col className="w-[11.5rem] lg:w-[14.5rem]" />
              {variants.map((v) => (
                <col
                  key={v.Key}
                  className={
                    isSeriesCol(v)
                      ? "w-[13.5rem] lg:w-[16rem]"
                      : v.Type === "text"
                      ? "w-[8.5rem] lg:w-[10.5rem]"
                      : "w-[8rem] lg:w-[10rem]"
                  }
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th
                  className={`sticky left-0 z-30 w-[11.5rem] lg:w-[14.5rem] min-w-[11.5rem] lg:min-w-[14.5rem] max-w-[11.5rem] lg:max-w-[14.5rem] border-b border-r px-3.5 lg:px-4 pb-3 pt-2 text-center align-middle font-instrument ${
                    sub ? "border-[#262626] bg-[#161616]" : "border-panel-border bg-panel"
                  }`}
                >
                  <span className="block font-instrument text-[0.6875rem] uppercase tracking-[0.14em] text-foreground text-center">
                    {getLocalizedServiceName(service, locale)}
                  </span>
                  <span className="mt-0.5 block font-instrument text-[0.625rem] font-normal tracking-wide text-text-muted text-center">
                    {categoryName} {isEn ? "Models" : "Model"}
                  </span>
                </th>
                {variants.map((v) => (
                  <th
                    key={v.Key}
                    className={`border-b px-3 lg:px-4 pb-3 pt-2 text-center align-middle font-instrument ${
                      sub ? "border-[#262626] bg-[#161616]" : "border-panel-border bg-panel"
                    }`}
                  >
                    <span className="block font-instrument text-[0.6875rem] uppercase tracking-[0.14em] text-foreground text-center leading-snug">
                      {getLocalizedVariantLabel(v, locale)}
                    </span>
                    {v.Note && (
                      <span className="mt-0.5 block font-instrument text-[0.625rem] font-normal normal-case tracking-wide text-text-muted text-center leading-tight">
                        {getLocalizedVariantNote(v.Note, locale)}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        {/* Body — scrolls vertically & horizontally */}
        <div
          ref={scrollRef}
          onScroll={handleBodyScroll}
          data-lenis-prevent
          className="max-h-[30rem] overflow-auto [overscroll-behavior:contain] touch-pan-x touch-pan-y [scrollbar-width:thin]"
        >
          <table
            className="w-full table-fixed border-separate border-spacing-0 text-left"
            style={{ minWidth: tableMinWidth }}
          >
            <colgroup>
              <col className="w-[11.5rem] lg:w-[14.5rem]" />
              {variants.map((v) => (
                <col
                  key={v.Key}
                  className={
                    isSeriesCol(v)
                      ? "w-[13.5rem] lg:w-[16rem]"
                      : v.Type === "text"
                      ? "w-[8.5rem] lg:w-[10.5rem]"
                      : "w-[8rem] lg:w-[10rem]"
                  }
                />
              ))}
            </colgroup>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={variants.length + 1}
                    className="px-4 py-8 text-center"
                  >
                    {query ? (
                      <p className="text-sm text-text-muted">
                        {isEn ? `No models matching "${query}".` : `Tidak ada model yang cocok dengan "${query}".`}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 py-2">
                        <p className="text-sm text-text-muted">
                          {isEn
                            ? "Device model pricing for this service is currently being updated."
                            : "Daftar harga model perangkat untuk layanan ini sedang diperbarui."}
                        </p>
                        <a
                          href={whatsappUrl(
                            isEn
                              ? `Hello FIXMI, I would like to ask for an estimated repair quote for ${getLocalizedServiceName(service, "en")} (${categoryName}).`
                              : `Halo FIXMI, saya ingin konsultasi estimasi biaya ${getLocalizedServiceName(service, "id")} (${categoryName}).`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white active:scale-95"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{isEn ? "Ask Price Quote via WhatsApp" : "Tanya Estimasi Biaya via WhatsApp"}</span>
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.DeviceModel}
                    className={`group transition-colors ${
                      sub ? "hover:bg-[#1E1E1E]" : "hover:bg-panel-raised"
                    }`}
                  >
                    <td
                      className={`sticky left-0 z-10 w-[11.5rem] lg:w-[14.5rem] min-w-[11.5rem] lg:min-w-[14.5rem] max-w-[11.5rem] lg:max-w-[14.5rem] border-b border-r border-l-2 border-l-transparent px-3.5 lg:px-4 py-3.5 text-xs sm:text-sm font-medium text-foreground leading-snug break-words transition-[colors,border-color] duration-200 group-hover:border-l-primary ${
                        sub
                          ? "border-[#262626] bg-[#161616] group-hover:bg-[#1E1E1E]"
                          : "border-panel-border/60 border-r-panel-border bg-panel group-hover:bg-panel-raised"
                      }`}
                    >
                      {row.DeviceModel}
                    </td>
                    {variants.map((v) => {
                      const val = row.prices[v.Key];
                      const isSeries = isSeriesCol(v);
                      const isText = v.Type === "text" || typeof val === "string";

                      return (
                        <td
                          key={v.Key}
                          className={`border-b px-3 lg:px-4 py-3.5 text-center font-mono text-sm tabular-nums ${
                            sub ? "border-[#262626]" : "border-panel-border/60"
                          } ${isSeries ? "whitespace-normal" : "whitespace-nowrap"} ${
                            isText ? "text-foreground font-normal" : ""
                          }`}
                        >
                          {val == null || val === "" || val === 0 ? (
                            <span className="text-text-muted select-none">–</span>
                          ) : isSeries && typeof val === "string" ? (
                            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 py-0.5">
                              {val
                                .split(/[/,]/)
                                .map((c) => c.trim())
                                .filter(Boolean)
                                .map((code) => (
                                  <span
                                    key={code}
                                    className="inline-flex items-center rounded-[5px] border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.7rem] sm:text-xs font-medium text-neutral-200 shadow-sm"
                                  >
                                    {code}
                                  </span>
                                ))}
                            </div>
                          ) : isText ? (
                            <span className="text-foreground/90 font-medium">
                              {String(val)}
                            </span>
                          ) : (
                            <>
                              <span className="mr-1.5 text-primary font-bold font-instrument">Rp</span>
                              <span className="text-primary font-bold font-instrument">
                                {formatThousands(val as number)}
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

        {/* Gradien fade tepi kanan */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-40 w-10 transition-opacity duration-300 ${
            sub ? "bg-gradient-to-l from-[#161616] to-transparent" : "bg-gradient-to-l from-panel to-transparent"
          } ${canRight ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
