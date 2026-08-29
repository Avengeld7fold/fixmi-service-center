"use client";

import { useEffect } from "react";
import { X, ShieldCheck, Check } from "lucide-react";
import { useLenis } from "lenis/react";
import { useI18n } from "@/lib/i18n/context";

const ID_TERMS = [
  "Garansi service berlaku hingga 365 hari (1 tahun) sesuai jenis suku cadang yang diganti.",
  "Garansi mencakup suku cadang yang diganti dan jasa teknisi terkait — bukan komponen lain di luar perbaikan.",
  "Klaim garansi sangat mudah: cukup tunjukkan nota digital atau nomor WhatsApp terdaftar.",
  "Garansi gugur bila segel garansi rusak/dilepas atau perangkat dibongkar pihak lain.",
  "Kerusakan fisik akibat kelalaian pengguna (jatuh, retak, tertindih, atau terkena air) tidak termasuk garansi.",
  "Data & privasi perangkat dijamin aman. Harap backup data bila memungkinkan sebelum perbaikan.",
];

const EN_TERMS = [
  "Service warranty valid up to 365 days (1 year) depending on the replacement part category.",
  "Warranty covers replaced parts and associated labor — does not apply to unrelated hardware faults.",
  "Seamless warranty claims: simply present your digital receipt or registered WhatsApp contact.",
  "Warranty void if warranty tamper seals are damaged or if the unit is dismantled by external parties.",
  "Physical accidental damage (drops, cracked glass, excessive pressure, or liquid ingress) is excluded.",
  "Data privacy is strictly protected. Please back up your device when possible prior to service benching.",
];

export default function WarrantyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const { dict, locale } = useI18n();
  const isEn = locale === "en";
  const terms = isEn ? EN_TERMS : ID_TERMS;

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
        aria-label={dict.common.close}
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
              {dict.pricelist.warrantyModalTitle}
            </h2>
            <p className="font-mono text-[0.625rem] uppercase tracking-widest text-text-muted">
              {dict.pricelist.warrantyModalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
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
          {terms.map((t, i) => (
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
            {isEn
              ? "Have questions regarding warranty coverage? Contact FIXMI team — we will gladly explain before workbench intake."
              : "Ada pertanyaan soal garansi? Hubungi tim FIXMI — kami bantu jelaskan sebelum service dimulai."}
          </p>
        </div>
      </div>
    </div>
  );
}
