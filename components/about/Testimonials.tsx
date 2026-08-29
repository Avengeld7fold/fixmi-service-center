"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initial: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Dari konsultasi awal sampai serah terima, tim FIXMI melebihi ekspektasi. Sangat profesional, transparan, dan benar-benar berkomitmen pada kualitas. iPhone saya yang mati total kembali hidup tepat waktu.",
    name: "James D.",
    role: "Pemilik iPhone 14 Pro Max",
    initial: "J",
  },
  {
    quote:
      "MacBook saya kena cairan dan sudah divonis mati di tempat lain. FIXMI melakukan micro-soldering pada logic board dan berhasil menyelamatkan semua data saya. Presisi kelas laboratorium.",
    name: "Sarah W.",
    role: "Desainer Grafis",
    initial: "S",
  },
  {
    quote:
      "Harga transparan sejak awal, tanpa biaya tersembunyi. Teknisinya menjelaskan setiap tahap perbaikan dengan sabar. Sekarang FIXMI jadi langganan servis semua gadget keluarga.",
    name: "Budi H.",
    role: "Pemilik Galaxy S24 Ultra",
    initial: "B",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const t = TESTIMONIALS[index];
  const go = (dir: number) =>
    setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="mx-auto flex max-w-4xl items-center gap-3 sm:gap-5">
      {/* Panah kiri */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Testimoni sebelumnya"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Kartu — foto kiri, kutipan kanan (gaya Mason) */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden rounded-[1.5rem] border border-border bg-surface sm:grid-cols-[16rem_1fr]">
        <div className="relative flex min-h-[12rem] items-center justify-center bg-surface-alt p-8">
          {/* Notch sudut ala Mason */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-7 -left-7 z-10 hidden h-14 w-14 rotate-45 bg-background sm:block"
          />
          <span
            className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-surface text-4xl font-bold text-primary"
            style={{ fontFamily: "var(--font-bayon), sans-serif" }}
          >
            {t.initial}
          </span>
        </div>

        <div className="flex flex-col justify-center p-8 lg:p-10">
          <div className="mb-4 flex gap-1" aria-label="Rating 5 dari 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            ))}
          </div>
          <blockquote className="text-base leading-relaxed text-foreground md:text-lg">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-text-secondary">{t.role}</p>
            </div>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ke testimoni ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-primary" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panah kanan */}
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Testimoni berikutnya"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
