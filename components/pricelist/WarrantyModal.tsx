"use client";

import { useEffect } from "react";
import { X, ShieldCheck, Check } from "lucide-react";
import { useLenis } from "lenis/react";

/**
 * Modal Ketentuan Garansi Service. Dikontrol parent (open/onClose).
 * Escape + klik backdrop menutup; Lenis di-stop agar latar tak tergulir.
 */
const TERMS = [
  "Garansi service berlaku 30 hari sejak tanggal pengambilan perangkat.",
  "Garansi hanya mencakup sparepart yang diganti dan jasa pengerjaan terkait — bukan komponen lain di luar yang diservis.",
  "Klaim garansi WAJIB menyertakan nota/bukti service asli dari FIXMI.",
  "Garansi HANGUS bila segel garansi rusak/dilepas atau perangkat dibongkar pihak/teknisi lain.",
  "Kerusakan akibat kelalaian pengguna (human error) — terjatuh, tertekan, tertindih — tidak dicover garansi.",
  "Kerusakan akibat cairan/air, korsleting, atau tegangan listrik tidak stabil tidak dicover garansi.",
  "Data & aplikasi pribadi bukan tanggung jawab garansi. Harap backup data sebelum service.",
];

export default function WarrantyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, lenis]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="warranty-title"
      className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="fade-rise relative z-10 flex max-h-[85vh] w-full max-w-[34rem] flex-col overflow-hidden rounded-[16px] border border-panel-border bg-panel shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-panel-border px-5 py-4 lg:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-panel-raised">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2
              id="warranty-title"
              className="text-base font-semibold text-foreground lg:text-lg"
            >
              Ketentuan Garansi Service
            </h2>
            <p className="font-mono text-[0.625rem] uppercase tracking-widest text-text-muted">
              Syarat &amp; Ketentuan Berlaku
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-panel-border text-text-muted transition-[border-color,color,transform] duration-150 ease-out hover:border-primary hover:text-primary active:scale-95"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Daftar ketentuan */}
        <ul
          data-lenis-prevent
          className="flex-1 space-y-3 overflow-y-auto [overscroll-behavior:contain] px-5 py-5 lg:px-6"
        >
          {TERMS.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary" aria-hidden="true" />
              </span>
              <span className="text-sm leading-relaxed text-text-secondary">{t}</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="border-t border-panel-border px-5 py-4 lg:px-6">
          <p className="text-xs leading-relaxed text-text-muted">
            Ada pertanyaan soal garansi? Hubungi tim FIXMI — kami bantu jelaskan sebelum
            service dimulai.
          </p>
        </div>
      </div>
    </div>
  );
}
