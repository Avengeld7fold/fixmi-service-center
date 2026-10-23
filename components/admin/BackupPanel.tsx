"use client";
import AdminSymbol from "./AdminSymbol";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Clock } from "lucide-react";
import {
  createManualBackupAction,
  deleteBackupAction,
  restoreBackupAction,
  clearAllBackupsAction,
} from "@/app/admin/actions";
import ConfirmModal from "./ConfirmModal";

export interface BackupMeta {
  name: string;
  sizeBytes: number;
  modifiedAt: string;
  daysRemaining: number;
  title?: string;
  badge?: string;
}

interface BackupPanelProps {
  backups: BackupMeta[];
}

type ModalAction =
  | { type: "restore"; filename: string }
  | { type: "delete"; filename: string }
  | { type: "clear-all"; totalCount: number };

/**
 * macOS Backup & Version History Panel (macOS 26 Tahoe Specification)
 * Referensi Resmi: Ref 06, Ref 07, Ref 18, Ref 29
 */
export default function BackupPanel({ backups }: BackupPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // State modal konfirmasi
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage(null);
    const result = await createManualBackupAction();
    setCreating(false);
    if (result.ok) {
      setMessage({ kind: "ok", text: "Cadangan data manual berhasil dibuat." });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: result.error ?? "Gagal membuat cadangan data." });
    }
  };

  const handleConfirmAction = async () => {
    if (!modalAction) return;

    if (modalAction.type === "restore") {
      const filename = modalAction.filename;
      setModalAction(null);
      setBusy(filename);
      setMessage(null);
      const result = await restoreBackupAction(filename);
      setBusy("");
      if (result.ok) {
        setMessage({
          kind: "ok",
          text: `Data berhasil dipulihkan dari "${filename}". Snapshot cadangan sebelumnya tersimpan otomatis.`,
        });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Gagal memulihkan cadangan data." });
      }
    } else if (modalAction.type === "delete") {
      const filename = modalAction.filename;
      setModalAction(null);
      setBusy(filename);
      setMessage(null);
      const result = await deleteBackupAction(filename);
      setBusy("");
      if (result.ok) {
        setMessage({ kind: "ok", text: `File cadangan "${filename}" berhasil dihapus.` });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Gagal menghapus file cadangan." });
      }
    } else if (modalAction.type === "clear-all") {
      setModalAction(null);
      setBusy("clear-all");
      setMessage(null);
      const result = await clearAllBackupsAction();
      setBusy("");
      if (result.ok) {
        setMessage({ kind: "ok", text: "Seluruh riwayat file cadangan data berhasil dikosongkan." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Gagal mengosongkan file cadangan data." });
      }
    }
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso)
    );

  return (
    <>
      <section className="mt-8 rounded-[14px] border border-panel-border bg-panel  overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border px-4 py-3 bg-panel-raised/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-black/5 dark:bg-white/10">
<AdminSymbol name="backup" className="w-4.5 h-4.5 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Riwayat Cadangan Data</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 font-mono text-[9px] font-medium text-text-muted">
                  <Clock className="h-2.5 w-2.5 text-primary" />
                  30 Hari
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Snapshot dibuat otomatis saat layanan dihapus, atau buat cadangan manual kapan saja.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={creating || busy !== ""}
              title="Buat cadangan data snapshot saat ini"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-panel-border bg-panel px-2.5 text-xs font-medium text-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97] disabled:opacity-50"
            >
<AdminSymbol name="backup" className="w-3.5 h-3.5 object-contain" />
              <span>{creating ? "Mencadangkan…" : "Buat Cadangan Manual"}</span>
            </button>

            {backups.length > 0 && (
              <button
                type="button"
                onClick={() => setModalAction({ type: "clear-all", totalCount: backups.length })}
                disabled={busy !== "" || creating}
                title="Kosongkan seluruh riwayat file cadangan"
                className="inline-flex h-7 items-center gap-1 rounded-[7px] border border-[#FF3B30]/25 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] px-2.5 text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50"
              >
<AdminSymbol name="trash" className="w-3.5 h-3.5 object-contain" />
                <span>Kosongkan Semua</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {backups.length === 0 ? (
            <p className="text-xs text-text-muted">
              Belum ada cadangan data aktif dalam 30 hari terakhir. Cadangan akan otomatis dibuat saat Anda menghapus layanan penting.
            </p>
          ) : (
            <ul
              data-lenis-prevent="true"
              className="max-h-80 sm:max-h-96 space-y-2 overflow-y-auto overscroll-contain pr-1.5 select-text"
            >
              {backups.map((b) => (
                <li
                  key={b.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-panel-border bg-panel-raised/30 px-3.5 py-2.5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        {b.title || b.name}
                      </p>
                      {b.badge && (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.2 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                            b.badge.toLowerCase().includes("hapus")
                              ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {b.badge}
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-text-muted bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                        Sisa {b.daysRemaining} hari
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      {formatDate(b.modifiedAt)} · {(b.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: "restore", filename: b.name })}
                      disabled={busy !== ""}
                      className="inline-flex h-6 items-center gap-1 rounded-[5px] bg-primary hover:bg-[#0066D6] px-2.5 text-[11px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-50 "
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      <span>Pulihkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: "delete", filename: b.name })}
                      disabled={busy !== ""}
                      title="Hapus permanen file backup ini"
                      className="inline-flex h-6 items-center gap-1 rounded-[5px] border border-panel-border bg-panel px-2 text-[11px] font-medium text-text-muted transition-all hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] active:scale-[0.97] disabled:opacity-50"
                    >
<AdminSymbol name="trash" className="w-3 h-3 object-contain" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {message && (
            <p
              role={message.kind === "error" ? "alert" : "status"}
              className={`mt-3 text-xs font-medium ${message.kind === "error" ? "text-[#FF3B30]" : "text-emerald-600 dark:text-emerald-400"}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </section>

      {/* ── Apple HIG Alert Modal (Ref 03, 18) ── */}
      <ConfirmModal
        isOpen={modalAction !== null}
        title={
          modalAction?.type === "restore"
            ? "Pulihkan Data Backup?"
            : modalAction?.type === "delete"
            ? "Hapus File Backup?"
            : modalAction?.type === "clear-all"
            ? "Kosongkan Semua Backup?"
            : ""
        }
        subtitle={
          modalAction?.type === "restore" || modalAction?.type === "delete"
            ? modalAction.filename
            : modalAction?.type === "clear-all"
            ? `${modalAction.totalCount} file riwayat tersimpan`
            : undefined
        }
        description={
          modalAction?.type === "restore"
            ? "Data saat ini akan digantikan oleh cadangan ini. Snapshot data terkini akan dibuat otomatis sebelum pemulihan."
            : modalAction?.type === "delete"
            ? "File cadangan ini akan dihapus permanen dari server dan tidak dapat dipulihkan."
            : modalAction?.type === "clear-all"
            ? `Seluruh (${modalAction?.totalCount}) file cadangan akan dihapus permanen dari server.`
            : ""
        }
        confirmText={
          modalAction?.type === "restore"
            ? "Pulihkan"
            : modalAction?.type === "clear-all"
            ? "Kosongkan"
            : "Hapus"
        }
        cancelText="Batal"
        variant={modalAction?.type === "restore" ? "primary" : "danger"}
        loading={busy !== ""}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalAction(null)}
      />
    </>
  );
}
