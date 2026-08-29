"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw, Clock, Trash2 } from "lucide-react";
import { restoreBackupAction, deleteBackupAction, clearAllBackupsAction, createManualBackupAction } from "@/app/admin/actions";
import type { BackupInfo } from "@/lib/admin/pricelist-write";
import ConfirmModal from "./ConfirmModal";

type ModalAction =
  | { type: "delete"; filename: string }
  | { type: "clear-all"; totalCount: number }
  | { type: "restore"; filename: string }
  | null;

export default function BackupPanel({ backups }: { backups: BackupInfo[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [modalAction, setModalAction] = useState<ModalAction>(null);

  // Auto-dismiss pesan sukses setelah 4 detik
  useEffect(() => {
    if (!message || message.kind !== "ok") return;
    const timer = setTimeout(() => {
      setMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage(null);
    const result = await createManualBackupAction();
    setCreating(false);
    if (result.ok) {
      setMessage({ kind: "ok", text: result.message ?? "Cadangan manual berhasil dibuat." });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: result.error ?? "Gagal membuat cadangan manual." });
    }
  };

  const handleConfirmAction = async () => {
    if (!modalAction) return;

    if (modalAction.type === "restore") {
      setBusy(modalAction.filename);
      setMessage(null);
      const result = await restoreBackupAction(modalAction.filename);
      setBusy("");
      setModalAction(null);
      if (result.ok) {
        setMessage({ kind: "ok", text: "Data berhasil dipulihkan — seluruh daftar harga telah kembali ke versi tersebut." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Gagal memulihkan cadangan data." });
      }
    } else if (modalAction.type === "delete") {
      setBusy(modalAction.filename);
      setMessage(null);
      const result = await deleteBackupAction(modalAction.filename);
      setBusy("");
      setModalAction(null);
      if (result.ok) {
        setMessage({ kind: "ok", text: `File cadangan "${modalAction.filename}" berhasil dihapus permanen.` });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error ?? "Gagal menghapus file cadangan." });
      }
    } else if (modalAction.type === "clear-all") {
      setBusy("clear-all");
      setMessage(null);
      const result = await clearAllBackupsAction();
      setBusy("");
      setModalAction(null);
      if (result.ok) {
        setMessage({ kind: "ok", text: result.message ?? "Semua file cadangan data berhasil dikosongkan." });
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
      <section className="mt-8 sm:mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-white/[0.08] px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-primary">
              <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white">Riwayat Cadangan Data</h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.10] px-2 py-0.5 font-mono text-[0.625rem] font-medium text-neutral-300">
                  <Clock className="h-2.5 w-2.5 text-primary" />
                  30 Hari
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-primary/50 active:scale-95 disabled:opacity-50"
            >
              <Archive className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{creating ? "Mencadangkan…" : "Buat Cadangan Manual"}</span>
            </button>

            {backups.length > 0 && (
              <button
                type="button"
                onClick={() => setModalAction({ type: "clear-all", totalCount: backups.length })}
                disabled={busy !== "" || creating}
                title="Kosongkan seluruh riwayat file cadangan"
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Kosongkan Semua</span>
                <span className="sm:hidden">Kosongkan</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {backups.length === 0 ? (
            <p className="text-xs sm:text-sm text-neutral-400">
              Belum ada cadangan data aktif dalam 30 hari terakhir. Cadangan akan otomatis dibuat saat Anda menghapus layanan penting, atau klik tombol di atas.
            </p>
          ) : (
            <ul
              data-lenis-prevent="true"
              className="max-h-80 sm:max-h-96 space-y-2 overflow-y-auto overscroll-contain pr-1.5 scrollbar-thin scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25 scrollbar-track-transparent select-text"
            >
              {backups.map((b) => (
                <li
                  key={b.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.15] hover:bg-white/[0.04]"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {b.title || b.name}
                      </p>
                      {b.badge && (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[0.625rem] font-bold uppercase tracking-wider ${
                            b.badge.toLowerCase().includes("hapus")
                              ? "bg-rose-500/10 border border-rose-500/25 text-rose-300"
                              : "bg-primary/10 border border-primary/25 text-primary"
                          }`}
                        >
                          {b.badge}
                        </span>
                      )}
                      <span className="font-mono text-[0.625rem] text-neutral-400 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded">
                        Sisa {b.daysRemaining} hari
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {formatDate(b.modifiedAt)} · {(b.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: "restore", filename: b.name })}
                      disabled={busy !== ""}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-primary/50 disabled:opacity-60 active:scale-95"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>Pulihkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAction({ type: "delete", filename: b.name })}
                      disabled={busy !== ""}
                      title="Hapus permanen file backup ini"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-all hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-60 active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
              className={`mt-3 text-sm ${message.kind === "error" ? "text-primary" : "text-foreground"}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </section>

      {/* ── Custom Centered Confirmation Modal ── */}
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
            ? "Data pricelist saat ini akan dikembalikan ke kondisi file backup ini. Sistem akan otomatis membuat cadangan data terkini sebelum pemulihan dijalankan."
            : modalAction?.type === "delete"
            ? "File backup ini akan dihapus secara permanen dari server. Anda tidak akan dapat memulihkan versi data ini lagi."
            : modalAction?.type === "clear-all"
            ? `Apakah Anda yakin ingin menghapus seluruh (${modalAction.totalCount}) file backup? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`
            : ""
        }
        confirmText={
          modalAction?.type === "restore"
            ? "Ya, Pulihkan Data"
            : modalAction?.type === "clear-all"
            ? "Ya, Kosongkan Semua"
            : "Ya, Hapus Permanen"
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
