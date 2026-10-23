"use client";

import { createPortal } from "react-dom";
import { ArchiveRestore, TriangleAlert, Trash2 } from "./AdminIcons";
import { useAdminDialog } from "./useAdminDialog";

export interface ConfirmModalProps {
  isOpen: boolean; title: string; subtitle?: string; description: string;
  confirmText?: string; cancelText?: string; variant?: "danger" | "warning" | "primary"; icon?: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
  alternateText?: string; onAlternate?: () => void;
}

export default function ConfirmModal({isOpen, title, subtitle, description, confirmText = "Hapus", cancelText = "Batal", variant = "danger", onConfirm, onCancel, loading = false, alternateText, onAlternate}: ConfirmModalProps) {
  const close = () => { if (!loading) onCancel(); };
  const {dialogRef, initialFocusRef, present} = useAdminDialog<HTMLButtonElement>(isOpen, close);
  if (!present || typeof document === "undefined") return null;
  const Icon = /cadangan|backup|pulihkan|restore/i.test(title) ? ArchiveRestore : variant === "danger" ? Trash2 : TriangleAlert;
  const stacked = Boolean(alternateText && onAlternate);
  const cancel = <button ref={initialFocusRef} type="button" className="admin-button" onClick={onCancel} disabled={loading}>{cancelText}</button>;
  return createPortal(
    <div className="admin-modal-backdrop" onClick={close} inert={!isOpen}>
      <div ref={dialogRef} className="admin-alert" role="alertdialog" aria-modal="true" aria-labelledby="mac-alert-title" aria-describedby="mac-alert-desc" aria-busy={loading} onClick={event => event.stopPropagation()}>
        <Icon className="admin-alert-icon" />
        <h3 id="mac-alert-title">{title}</h3>
        {subtitle && <p className="mt-1 break-words">{subtitle}</p>}
        <p id="mac-alert-desc" className="mt-2">{description}</p>
        <div className={`admin-alert-actions ${stacked ? "is-stacked" : ""}`}>
          {!stacked && cancel}
          <button type="button" className={`admin-button ${variant === "danger" ? "admin-button--danger" : "admin-button--primary"}`} onClick={onConfirm} disabled={loading}>{loading ? "Memproses…" : confirmText}</button>
          {stacked && <button type="button" className="admin-button admin-button--danger" onClick={onAlternate} disabled={loading}>{alternateText}</button>}
          {stacked && cancel}
        </div>
      </div>
    </div>, document.querySelector(".admin-shell") || document.body
  );
}
