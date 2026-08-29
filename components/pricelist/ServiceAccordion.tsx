"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown } from "lucide-react";
import ServiceIcon from "./ServiceIcon";
import PriceTable from "./PriceTable";
import type { ServiceType } from "@/lib/data";

interface ServiceAccordionProps {
  services: ServiceType[];
  categoryName: string;
  /** true = level anak di dalam series/merk (pola fixmibali): ikon ↳ tanpa chip. */
  sub?: boolean;
}

export default function ServiceAccordion({ services, categoryName, sub = false }: ServiceAccordionProps) {
  // Single-open. State lokal di sini; parent me-remount lewat key={activeSlug}
  // saat kategori berganti → akordeon otomatis tertutup tanpa effect (§3.1.3).
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  // Lazy Mount + State Retention: lacak slug mana saja yang pernah dibuka 1x.
  const [openedSlugs, setOpenedSlugs] = useState<Set<string>>(() => new Set());

  const toggle = (slug: string) => {
    setOpenSlug((prev) => {
      const next = prev === slug ? null : slug;
      if (next && !openedSlugs.has(next)) {
        setOpenedSlugs((old) => new Set(old).add(next));
      }
      return next;
    });
  };

  // Cascade baris tabel saat panel dibuka: fade + naik dengan stagger cepat.
  const listRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!openSlug || !listRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rows = listRef.current.querySelectorAll(`#svc-panel-${openSlug} tbody tr`);
      if (!rows.length) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          stagger: 0.015,
          delay: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform", // biar hover row tetap bersih setelahnya
        }
      );
    },
    { dependencies: [openSlug], scope: listRef }
  );

  if (services.length === 0) return null;

  return (
    <div ref={listRef} className="space-y-2.5 lg:space-y-4">
      {services.map((service) => {
        const open = openSlug === service.Slug;
        const hasBeenOpened = openedSlugs.has(service.Slug);
        const btnId = `svc-btn-${service.Slug}`;
        const panelId = `svc-panel-${service.Slug}`;

        return (
          <div
            key={service.Slug}
            data-reveal
            className="overflow-hidden rounded-[10px] lg:rounded-[12px] border border-panel-border bg-panel"
          >
            <button
              id={btnId}
              type="button"
              onClick={() => toggle(service.Slug)}
              aria-expanded={open}
              aria-controls={panelId}
              className="group flex min-h-[3.5rem] lg:min-h-[4.5rem] w-full items-center gap-3 lg:gap-4 px-3.5 lg:px-5 text-left outline-none transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised"
            >
              <span className="flex h-9 w-9 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-[8px] lg:rounded-[10px] bg-panel-raised transition-transform duration-300 ease-out group-hover:scale-105">
                <ServiceIcon name={service.icon} className="h-[1.125rem] w-[1.125rem] lg:h-5 lg:w-5 text-primary" />
              </span>
              <span className="flex-1 text-sm lg:text-base font-medium text-foreground">
                {service.title}
              </span>
              {/* Chevron rotates 180° when open — universal expand/collapse affordance */}
              <ChevronDown
                className={`h-4 w-4 lg:h-5 lg:w-5 text-primary transition-transform duration-300 ease-out ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Panel ekspansi — Lazy Mount + State Retention: PriceTable hanya di-mount jika pernah dibuka 1x */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                contentVisibility: open ? "visible" : "auto",
              }}
            >
              <div className="overflow-hidden">
                {hasBeenOpened && (
                  <div className="border-t border-panel-border px-2 pb-2.5 lg:px-5 lg:pb-5">
                    <PriceTable service={service} categoryName={categoryName} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
