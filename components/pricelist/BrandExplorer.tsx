"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ServiceAccordion from "./ServiceAccordion";
import ServiceIcon from "./ServiceIcon";
import { brandImage, type ServiceType } from "@/lib/data";

interface BrandExplorerProps {
  services: ServiceType[]; // hanya service ber-Brand
  categoryName: string;
  brandIcons?: Record<string, string>;
}

/**
 * Penjelajah bertingkat pola fixmibali.com: Merk → Series → jenis service.
 * Level daun memakai ServiceAccordion yang sudah ada (judul + tabel harga).
 * Single-open per level; animasi tinggi sama dengan ServiceAccordion
 * (grid-template-rows) agar bahasanya konsisten.
 */
export default function BrandExplorer({ services, categoryName, brandIcons }: BrandExplorerProps) {
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  // Kelompokkan: Map<Brand, Map<Series, ServiceType[]>> — memoized untuk performa tinggi.
  const brands = useMemo(() => {
    const map = new Map<string, Map<string, ServiceType[]>>();
    for (const svc of services) {
      const brand = svc.Brand!;
      const series = svc.Series ?? "Semua Model";
      if (!map.has(brand)) map.set(brand, new Map());
      const seriesMap = map.get(brand)!;
      if (!seriesMap.has(series)) seriesMap.set(series, []);
      seriesMap.get(series)!.push(svc);
    }
    return map;
  }, [services]);

  const toggleBrand = (brand: string) => {
    setOpenBrand((prev) => (prev === brand ? null : brand));
    setOpenSeries(null); // ganti merk = tutup series lama
  };

  return (
    <div className="space-y-2.5 lg:space-y-4">
      {[...brands.entries()].map(([brand, seriesMap]) => {
        const brandOpen = openBrand === brand;
        const customBrandIcon = brandIcons?.[brand];
        // Counter merk: jumlah series bernama; merk tanpa series → jumlah service.
        const namedSeries = [...seriesMap.keys()].filter((k) => k !== "Semua Model").length;
        const svcTotal = [...seriesMap.values()].reduce((n, l) => n + l.length, 0);
        return (
          <div
            key={brand}
            data-reveal
            className="overflow-hidden rounded-[10px] lg:rounded-[12px] border border-panel-border bg-panel"
          >
            {/* ── Level 1: Merk ── */}
            <button
              type="button"
              onClick={() => toggleBrand(brand)}
              aria-expanded={brandOpen}
              className="group flex min-h-[3.5rem] lg:min-h-[4.5rem] w-full items-center gap-3 lg:gap-4 px-3.5 lg:px-5 text-left outline-none transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised"
            >
              <span className="flex h-9 w-9 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-[8px] lg:rounded-[10px] bg-panel-raised font-mono text-sm lg:text-base font-bold text-primary transition-transform duration-300 ease-out group-hover:scale-105">
                {customBrandIcon ? (
                  <ServiceIcon
                    name={customBrandIcon}
                    className="h-6 w-6 lg:h-7 lg:w-7 object-contain"
                  />
                ) : brandImage(brand) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandImage(brand)!}
                    alt={`Logo ${brand}`}
                    className="h-6 w-6 lg:h-7 lg:w-7 object-contain"
                    loading="lazy"
                  />
                ) : (
                  brand.charAt(0)
                )}
              </span>
              <span className="flex-1 text-sm lg:text-base font-medium text-foreground">
                {brand}
              </span>
              <span className="font-mono text-[0.625rem] lg:text-[0.6875rem] uppercase tracking-widest text-text-muted">
                {namedSeries > 0 ? `${namedSeries} series` : `${svcTotal} service`}
              </span>
              <ChevronDown
                className={`h-4 w-4 lg:h-5 lg:w-5 text-primary transition-transform duration-300 ease-out ${
                  brandOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: brandOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                {/* Mobile: indentasi tipis (px-1.5) agar tabel di level terdalam
                    tetap lebar hampir selebar layar (pola fixmibali). */}
                <div className="space-y-2 border-t border-panel-border px-1.5 py-2 lg:px-5 lg:py-4">
                  {[...seriesMap.entries()].map(([series, svcList]) => {
                    const seriesKey = `${brand}::${series}`;
                    const seriesOpen = openSeries === seriesKey;
                    // Merk tanpa series (Realme, Oppo, dll — pola fixmibali):
                    // service langsung di bawah merk, tanpa akordeon series.
                    if (series === "Semua Model") {
                      return (
                        <ServiceAccordion
                          key={seriesKey}
                          services={svcList}
                          categoryName={categoryName}
                          sub
                        />
                      );
                    }
                    return (
                      <div
                        key={seriesKey}
                        className="overflow-hidden rounded-[8px] lg:rounded-[10px] border border-panel-border bg-background/40"
                      >
                        {/* ── Level 2: Series — chevron berputar ke bawah saat
                            terbuka (indikator panah ala fixmibali); ukuran baris
                            SAMA dengan level merk & service agar konsisten. ── */}
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSeries((prev) => (prev === seriesKey ? null : seriesKey))
                          }
                          aria-expanded={seriesOpen}
                          className="group flex min-h-[3.5rem] lg:min-h-[4.5rem] w-full items-center gap-3 lg:gap-4 px-3.5 lg:px-5 text-left outline-none transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised"
                        >
                          <span className="flex h-9 w-9 lg:h-11 lg:w-11 shrink-0 items-center justify-center">
                            <ChevronRight
                              className={`h-[1.125rem] w-[1.125rem] lg:h-5 lg:w-5 text-primary transition-transform duration-300 ease-out ${
                                seriesOpen ? "rotate-90" : "group-hover:translate-x-0.5"
                              }`}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="flex-1 text-sm lg:text-base font-medium text-foreground">
                            {series}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 lg:h-5 lg:w-5 text-primary transition-transform duration-300 ease-out ${
                              seriesOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>

                        <div
                          className="grid transition-[grid-template-rows] duration-300 ease-out"
                          style={{ gridTemplateRows: seriesOpen ? "1fr" : "0fr" }}
                        >
                          <div className="overflow-hidden">
                            {/* ── Level 3: jenis service (ikon ↳ ala fixmibali) ── */}
                            <div className="border-t border-panel-border p-1.5 lg:p-3">
                              <ServiceAccordion
                                key={seriesKey}
                                services={svcList}
                                categoryName={categoryName}
                                sub
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
