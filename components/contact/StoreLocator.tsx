"use client";

import { useState } from "react";
import { Clock, MapPin, Phone, ArrowRight } from "lucide-react";
import StoreMap from "./StoreMap";
import { STORES, mapDirectionsUrl, mapSearchUrl } from "@/lib/stores";
import { getStoreLiveStatus } from "@/lib/storeStatus";

/** 0819-9933-6722 → tel:+6281999336722 */
const telHref = (phone: string) =>
  `tel:+62${phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`;

/**
 * Store locator 3 gerai — tata letak ringkas & terstruktur untuk peta dan status live.
 */
export default function StoreLocator() {
  const [active, setActive] = useState(STORES[0].key);
  const store = STORES.find((s) => s.key === active) ?? STORES[0];

  const activeLive = getStoreLiveStatus({
    openHour: store.openHour,
    closeHourWeekday: store.closeHourWeekday,
    closeHourSunday: store.closeHourSunday,
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_1.15fr] lg:gap-10">
      {/* Daftar gerai */}
      <div className="space-y-3.5">
        {STORES.map((s) => {
          const on = s.key === active;
          const live = getStoreLiveStatus({
            openHour: s.openHour,
            closeHourWeekday: s.closeHourWeekday,
            closeHourSunday: s.closeHourSunday,
          });

          return (
            <div
              key={s.key}
              className={`group overflow-hidden rounded-xl border transition-all duration-200 ${
                on
                  ? "border-white/[0.16] bg-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]"
              }`}
            >
              {/* Area pilih gerai */}
              <button
                type="button"
                onClick={() => setActive(s.key)}
                aria-pressed={on}
                className="w-full p-5 text-left outline-none transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`text-[0.98rem] transition-colors ${
                        on ? "font-semibold text-[#f5f5f5]" : "font-medium text-neutral-300 group-hover:text-[#f5f5f5]"
                      }`}
                    >
                      {s.name}
                    </p>
                    <p
                      className={`mt-0.5 text-xs transition-colors ${
                        on ? "text-neutral-400" : "text-neutral-500"
                      }`}
                    >
                      {s.role} · {s.region}
                    </p>

                    {/* Real-time live status badge */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-mono font-medium tracking-wide ${live.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${live.dotClass}`} />
                        <span>{live.label}</span>
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-all duration-300 ease-out mt-1 ${
                      on
                        ? "text-primary translate-x-0 opacity-100"
                        : "-translate-x-1 text-neutral-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-4">
                  <p
                    className={`flex items-start gap-2.5 text-sm leading-relaxed transition-colors ${
                      on ? "text-neutral-200" : "text-neutral-400"
                    }`}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{s.address}</span>
                  </p>
                  <p
                    className={`flex items-center gap-2.5 text-sm transition-colors ${
                      on ? "text-neutral-200" : "text-neutral-400"
                    }`}
                  >
                    <Clock className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                    <span>Buka setiap hari · <span className="font-mono tabular-nums">{s.hours}</span></span>
                  </p>
                </div>
              </button>

              {/* Tombol telepon */}
              <a
                href={telHref(s.phone)}
                className="flex min-h-[2.75rem] items-center gap-2.5 border-t border-white/[0.08] bg-black/20 px-5 py-3 text-sm text-neutral-300 transition-all hover:bg-primary/[0.08] hover:text-primary active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="font-mono text-[0.92rem] font-medium tabular-nums">{s.phone}</span>
                <span className="ml-auto text-xs text-neutral-500 transition-colors group-hover:text-neutral-400">Hubungi Langsung →</span>
              </a>
            </div>
          );
        })}
      </div>

      {/* Peta gerai terpilih */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161616] shadow-2xl">
        <StoreMap
          active={active}
          onSelect={setActive}
          className="block h-[18rem] w-full min-h-0 border-0 sm:h-[24rem] lg:h-auto lg:flex-1"
        />
        {/* Bilah info bawah peta yang rapi dan kompak */}
        <div className="border-t border-white/[0.08] bg-[#161616]/98 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Sisi Kiri: Nama Gerai & Status Live */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="truncate text-sm font-semibold text-[#f5f5f5] tracking-tight">
                {store.name}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-mono font-medium tracking-wide ${activeLive.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${activeLive.dotClass}`} />
                <span>{activeLive.label}</span>
              </span>
            </div>

            {/* Sisi Kanan: Tombol Aksi Taktil Kompak */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={mapDirectionsUrl(store.map)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-200 transition-all hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <span>Petunjuk Arah</span>
                <span aria-hidden="true" className="text-primary font-bold">→</span>
              </a>
              <a
                href={mapSearchUrl(store.map)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-200 transition-all hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <span>Buka di Maps</span>
                <span aria-hidden="true" className="text-neutral-400">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
