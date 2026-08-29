"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, RotateCcw, X, Check } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  subtitle,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={() => {
        if (!loading) onCancel();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-[#181818] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={() => {
            if (!loading) onCancel();
          }}
          aria-label="Tutup"
          className="absolute top-4 right-4 rounded-full bg-white/[0.06] p-1.5 text-neutral-400 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          {variant === "danger" && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-400 shrink-0">
              <Trash2 className="h-6 w-6" />
            </div>
          )}
          {variant === "warning" && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-400 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
          )}
          {variant === "primary" && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
          )}

          <div className="pr-6">
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="font-mono text-xs text-neutral-400 mt-0.5 break-all">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Modal Body Description */}
        <div className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
          <p>{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50 text-center"
          >
            {cancelText}
          </button>

          {variant === "primary" ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,107,0,0.3)] transition-all hover:bg-primary-light hover:brightness-105 disabled:opacity-50 active:scale-95 text-center"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? "Memproses…" : confirmText}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)] transition-all hover:bg-rose-500 disabled:opacity-50 active:scale-95 text-center"
            >
              <Trash2 className="h-4 w-4" />
              <span>{loading ? "Memproses…" : confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
