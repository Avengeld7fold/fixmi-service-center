"use client";

import Image from "next/image";
import ServiceIcon, { CATEGORY_ICON } from "./ServiceIcon";
import type { Category } from "@/lib/data";

interface CategoryCardsProps {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export default function CategoryCards({ categories, activeSlug, onSelect }: CategoryCardsProps) {
  return (
    <div
      className="flex gap-5 overflow-x-auto overflow-y-hidden pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {categories.map((category) => {
        const active = category.Slug === activeSlug;
        return (
          <button
            key={category.Slug}
            type="button"
            onClick={() => onSelect(category.Slug)}
            onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })}
            aria-pressed={active}
            style={{ scrollSnapAlign: "start" }}
            className={`group relative flex w-36 sm:w-40 md:w-44 aspect-square shrink-0 flex-col items-center justify-between rounded-[16px] lg:rounded-[20px] border bg-panel p-4 sm:p-5 lg:p-6 outline-none transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 active:scale-[0.97] lg:w-full lg:aspect-square focus-visible:border-primary ${
              active
                ? "border-primary shadow-[0_4px_20px_rgba(255,107,0,0.15)]"
                : "border-panel-border hover:border-primary hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
            }`}
          >
            {/* Active card gradient overlay — subtle primary tint */}
            {active && (
              <span
                className="pointer-events-none absolute inset-0 rounded-[19px] bg-gradient-to-b from-primary/8 to-transparent"
                aria-hidden="true"
              />
            )}
            {/* Zoom halus pada gambar perangkat saat hover — kartu sendiri
                hanya terangkat sedikit agar tidak berlebihan. */}
            <span className="relative flex-1 w-full min-h-0 mb-4 flex items-center justify-center transition-transform duration-250 ease-out group-hover:scale-[1.06]">
              {category.Image ? (
                <Image
                  src={category.Image}
                  alt={category.Name}
                  fill
                  sizes="(max-width: 1024px) 10rem, 15rem"
                  className="object-contain"
                />
              ) : (
                <ServiceIcon
                  name={CATEGORY_ICON[category.Slug] ?? "wrench"}
                  className="h-14 w-14 text-text-muted"
                  strokeWidth={1.5}
                />
              )}
            </span>
            <span
              className={`text-sm lg:text-base font-bold tracking-wide transition-colors ${
                active ? "text-white" : "text-text-secondary group-hover:text-white"
              }`}
            >
              {category.Name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
