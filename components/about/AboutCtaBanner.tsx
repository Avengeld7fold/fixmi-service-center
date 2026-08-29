"use client";

import { MessageCircle, ArrowRight } from "lucide-react";
import { whatsappUrl } from "@/lib/constants";

export default function AboutCtaBanner() {
  return (
    <section className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pb-16 sm:pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 md:p-10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h3
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] leading-snug"
              style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
            >
              Konsultasikan Masalah Perangkat Anda Bersama Kami
            </h3>
            <p className="mt-2 text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              Kunjungi workshop resmi FIXMI di Jalan Raya Uluwatu No. 79, Kedonganan, Kuta, atau hubungi teknisi kami via WhatsApp untuk diagnosa awal tanpa biaya.
            </p>
          </div>

          <a
            href={whatsappUrl(
              "Halo FIXMI Service Center, saya membaca profil FIXMI di website dan ingin konsultasi perbaikan perangkat:\n\n• Tipe Perangkat: \n• Kendala / Kerusakan: "
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 sm:gap-3 rounded-xl bg-primary px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-semibold text-white tracking-[-0.01em] transition-all duration-200 ease-out hover:bg-primary-light hover:brightness-105 active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_rgba(255,107,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white stroke-[2]" aria-hidden="true" />
            <span>Chat Teknisi via WhatsApp</span>
            <ArrowRight
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-white"
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
