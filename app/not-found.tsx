import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/constants";

export const metadata = {
  title: "404 — Halaman Tidak Ditemukan",
  description: "Halaman yang Anda cari tidak tersedia di FIXMI Service Center Bali.",
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center">
      <div className="relative mb-6">
        <span
          className="text-8xl sm:text-9xl font-bold font-mono tracking-tighter text-white/10 select-none"
          style={{ fontFamily: "var(--font-bayon), sans-serif" }}
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold border border-primary/30 bg-primary/10 px-3 py-1 rounded-full">
            PAGE NOT FOUND
          </span>
        </div>
      </div>

      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-3"
        style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
      >
        Halaman Tidak Ditemukan
      </h1>

      <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        Halaman yang Anda tuju mungkin telah dipindahkan atau tautan yang dimasukkan kurang tepat.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.12] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] hover:border-white/20 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <a
          href={whatsappUrl("Halo FIXMI, saya mengalami kendala pada website / ingin tanya info servis.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.25)] transition-all hover:bg-primary-light hover:brightness-105 active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Bantuan via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
