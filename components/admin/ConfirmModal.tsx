"use client";

import { createPortal } from "react-dom";
import { ArchiveRestore, TriangleAlert, Trash2 } from "lucide-react";
import { useAdminDialog } from "./useAdminDialog";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  /** Mendukung varian bertumpuk 3-tombol jika ada aksi sekunder */
  alternateText?: string;
  onAlternate?: () => void;
}

/**
 * Apple HIG Native Alert Modal (macOS Tahoe Specification)
 * Referensi Resmi: Ref 03, Ref 04, Ref 18
 * https://developer.apple.com/design/human-interface-guidelines/alerts
 */
export default function ConfirmModal({
  isOpen,
  title,
  subtitle,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
  alternateText,
  onAlternate,
}: ConfirmModalProps) {
  const closeDialog = () => {
    if (!loading) onCancel();
  };
  const { dialogRef, initialFocusRef } = useAdminDialog<HTMLButtonElement>(isOpen, closeDialog);

  if (!isOpen || typeof document === "undefined") return null;

  const isStacked = Boolean(alternateText && onAlternate);

  return createPortal(
    <div
      onClick={closeDialog}
      className="admin-modal-backdrop"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mac-alert-title"
        aria-describedby="mac-alert-desc"
        onClick={(e) => e.stopPropagation()}
        className="admin-alert"
      >
        {/cadangan|backup|pulihkan|restore/i.test(title)
          ? <ArchiveRestore className="admin-alert-icon" aria-hidden="true" />
          : variant === "danger"
          ? <Trash2 className="admin-alert-icon" aria-hidden="true" />
          : <TriangleAlert className="admin-alert-icon" aria-hidden="true" />}

        {/* 1. Alert Title (SF Pro 15px Bold, rata tengah) */}
        <h3
          id="mac-alert-title"
          className="text-[15px] font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.3] px-1"
        >
          {title}
        </h3>

        {/* Subtitle opsional */}
        {subtitle && (
          <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate px-1">
            {subtitle}
          </p>
        )}

        {/* 2. Alert Body Description (SF Pro 12px Regular, rata tengah) */}
        <p
          id="mac-alert-desc"
          className="text-[12px] font-normal text-neutral-600 dark:text-neutral-300 leading-normal mt-1.5 mb-4 px-1"
        >
          {description}
        </p>

        {/* 3. Button Layout (Ref 03 Side-by-side vs Ref 04 Stacked) */}
        {isStacked ? (
          /* Stacked 3 Buttons (Atas: Primary/Confirm, Tengah: Alternate Destructive, Bawah: Cancel) */
          <div className="flex flex-col gap-2">
            <button
              ref={initialFocusRef}
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full h-[32px] rounded-full text-[13px] font-semibold text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 ${
                variant === "danger"
                  ? "bg-[#FF3B30] hover:bg-[#E0352B]"
                  : "bg-primary hover:bg-[#0066D6]"
              }`}
            >
              {loading ? "Memproses…" : confirmText}
            </button>

            {alternateText && onAlternate && (
              <button
                type="button"
                onClick={onAlternate}
                disabled={loading}
                className="w-full h-[32px] rounded-full text-[13px] font-semibold bg-[#FFD2D2] dark:bg-[rgba(255,69,58,0.22)] text-[#FF3B30] dark:text-[#FF453A] border border-[#FF3B30]/15 hover:bg-[#FFC4C4] dark:hover:bg-[rgba(255,69,58,0.30)] transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {alternateText}
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full h-[32px] rounded-full text-[13px] font-medium bg-[#E5E5EA] dark:bg-[#3A3A3C] text-neutral-900 dark:text-white hover:bg-[#D8D8DC] dark:hover:bg-[#48484A] transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        ) : (
          /* Side-by-side 2 Buttons (Kiri: Cancel Netral, Kanan: Confirm/Hapus) */
          <div className="flex items-center gap-2">
            <button
              ref={initialFocusRef}
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-[32px] rounded-full text-[13px] font-medium bg-[#E5E5EA] dark:bg-[#3A3A3C] text-neutral-900 dark:text-white hover:bg-[#D8D8DC] dark:hover:bg-[#48484A] transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 h-[32px] rounded-full text-[13px] font-semibold text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 ${
                variant === "danger"
                  ? "bg-[#FF3B30] hover:bg-[#E0352B]"
                  : "bg-primary hover:bg-[#0066D6]"
              }`}
            >
              {loading ? "Memproses…" : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.querySelector(".admin-shell") || document.body
  );
}
