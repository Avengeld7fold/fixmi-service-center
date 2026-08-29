"use client";

import { useEffect } from "react";
import { RefreshCw, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/constants";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely
    console.error("Runtime application error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1 font-mono text-xs text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span>TERJADI KENDALA TEKNIS</span>
      </div>

      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-3"
        style={{ fontFamily: "var(--font-neue-montreal), sans-serif" }}
      >
        Gagal Memuat Halaman
      </h1>

      <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
        Terjadi kesalahan sementara saat memuat data. Silakan coba muat ulang atau hubungi layanan pelanggan kami.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/[0.08] border border-white/[0.12] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.15] active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Muat Ulang Halaman</span>
        </button>

        <a
          href={whatsappUrl("Halo FIXMI, saya mengalami error saat mengakses website.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.25)] transition-all hover:bg-primary-light hover:brightness-105 active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Lapor ke WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
