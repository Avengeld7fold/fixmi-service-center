"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  ChevronDown,
  Check,
  X,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  importApplyAction,
  importPreviewAction,
  type ImportPreviewState,
} from "@/app/admin/actions";

export interface ImportDestination {
  Name: string;
  Slug: string;
  services: { Slug: string; title: string }[];
}

const initialState: ImportPreviewState = { preview: null, payload: null, error: "" };

export default function ImportPanel({ categories }: { categories: ImportDestination[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<ImportPreviewState>(initialState);
  const [checking, setChecking] = useState(false);
  const [targetCat, setTargetCat] = useState("");
  const [targetSvc, setTargetSvc] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string>("");
  const [applyError, setApplyError] = useState<string>("");
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<Set<string>>(new Set());

  const activeCat = categories.find((c) => c.Slug === targetCat);
  const targetIncomplete = targetCat !== "" && targetSvc === "";

  // Set seluruh kategori terdeteksi terpilih secara default saat preview baru tersedia
  useEffect(() => {
    if (state.preview && state.preview.categories.length > 0) {
      setSelectedCategorySlugs(new Set(state.preview.categories.map((c) => c.slug)));
    } else {
      setSelectedCategorySlugs(new Set());
    }
  }, [state.preview]);

  const toggleCategory = (slug: string) => {
    setSelectedCategorySlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const selectAllCats = () => {
    if (state.preview) {
      setSelectedCategorySlugs(new Set(state.preview.categories.map((c) => c.slug)));
    }
  };

  const deselectAllCats = () => {
    setSelectedCategorySlugs(new Set());
  };

  // Auto-dismiss pesan sukses impor setelah 4 detik
  useEffect(() => {
    if (!appliedMessage) return;
    const timer = setTimeout(() => {
      setAppliedMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [appliedMessage]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setState(initialState);
    setSelectedCategorySlugs(new Set());
    setApplyError("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && /\.(xlsx|csv)$/i.test(file.name)) {
      handleFileChange(file);
    } else if (file) {
      setState({ preview: null, payload: null, error: "Format file harus berupa Excel (.xlsx) atau CSV (.csv)." });
    }
  };

  const check = async () => {
    const file = selectedFile || fileRef.current?.files?.[0];
    if (!file) {
      setState({ preview: null, payload: null, error: "Silakan pilih atau tarik file Excel (.xlsx) / CSV (.csv) terlebih dahulu." });
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("targetCategory", targetCat);
    formData.set("targetService", targetSvc);

    setChecking(true);
    setApplyError("");
    const result = await importPreviewAction(formData);
    setChecking(false);
    setState(result);
  };

  const apply = async () => {
    if (!state.payload) return;
    if (selectedCategorySlugs.size === 0) {
      setApplyError("Pilih minimal 1 kategori perangkat untuk diimpor.");
      return;
    }

    setApplying(true);
    setApplyError("");
    const result = await importApplyAction(state.payload, Array.from(selectedCategorySlugs));
    setApplying(false);

    if (result.ok) {
      // 1. Catat pesan sukses
      setAppliedMessage("Data berhasil diimpor — kategori yang Anda pilih telah diperbarui di website.");
      // 2. Bersihkan file yang diupload dan staged preview
      setSelectedFile(null);
      setState(initialState);
      setSelectedCategorySlugs(new Set());
      if (fileRef.current) fileRef.current.value = "";
      // 3. Otomatis tutup drawer agar tampilan bersih
      setIsOpen(false);
      // 4. Refresh data halaman
      router.refresh();
    } else {
      setApplyError(result.error ?? "Gagal mengimpor data.");
    }
  };

  const preview = state.preview;
  const hasErrors = (preview?.errors.length ?? 0) > 0;
  const isReadyToImport =
    !hasErrors &&
    Boolean(state.payload) &&
    Boolean(preview) &&
    selectedCategorySlugs.size > 0;

  const selectClass =
    "rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20";

  return (
    <section className="mb-6 space-y-3">
      {/* Toast Notifikasi Sukses / Error Impor */}
      {appliedMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{appliedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedMessage("")}
            className="p-1 rounded-md text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Kontainer Collapsible Panel */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {/* Header Toggle Collapsible */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-3.5 px-4 sm:px-6 py-3.5 sm:py-4 text-left outline-none transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-primary">
              <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Upload &amp; Import Data dari Excel / CSV
                </h2>
                {selectedFile && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[0.625rem] text-emerald-400">
                    <FileCheck className="h-3 w-3" />
                    {selectedFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Klik untuk {isOpen ? "menutup" : "membuka"} panel upload file Excel untuk memperbarui banyak model sekaligus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-neutral-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary border-primary/40" : ""
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        </button>

        {/* Collapsible Body */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden border-t border-white/[0.08]">
            <div className="p-4 sm:p-6 space-y-4">
              {/* Tujuan import */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 bg-white/[0.02] p-3.5 sm:p-4 rounded-xl border border-white/[0.06]">
                <label htmlFor="import-target-cat" className="text-xs sm:text-sm font-medium text-neutral-300 shrink-0">
                  Tujuan Masuk Data:
                </label>
                <select
                  id="import-target-cat"
                  value={targetCat}
                  onChange={(e) => {
                    setTargetCat(e.target.value);
                    setTargetSvc("");
                    setState(initialState);
                  }}
                  className={`w-full sm:w-auto ${selectClass}`}
                >
                  <option value="" className="bg-[#1a1a1c] text-white">
                    Otomatis (Sesuai kolom di file Excel)
                  </option>
                  {categories.map((c) => (
                    <option key={c.Slug} value={c.Slug} className="bg-[#1a1a1c] text-white">
                      {c.Name}
                    </option>
                  ))}
                </select>

                {activeCat && (
                  <select
                    value={targetSvc}
                    onChange={(e) => {
                      setTargetSvc(e.target.value);
                      setState(initialState);
                    }}
                    aria-label="Jenis layanan tujuan"
                    className={`w-full sm:w-auto ${selectClass}`}
                  >
                    <option value="" className="bg-[#1a1a1c] text-white">
                      — Pilih Jenis Layanan Tujuan —
                    </option>
                    {activeCat.services.map((s) => (
                      <option key={s.Slug} value={s.Slug} className="bg-[#1a1a1c] text-white">
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}

                {activeCat && (
                  <p className="w-full text-xs text-neutral-400 mt-1">
                    Semua baris model di file akan langsung dimasukkan ke layanan yang Anda pilih.
                  </p>
                )}
              </div>

              {/* Drag & Drop File Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-5 sm:p-7 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 ${
                  isDragging
                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,107,0,0.15)]"
                    : selectedFile
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                    : "border-white/[0.12] bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />

                <div className="flex flex-col items-center text-center space-y-2.5">
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-colors ${
                      selectedFile
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-white/[0.06] text-primary"
                    }`}
                  >
                    {selectedFile ? <FileCheck className="h-5 w-5 sm:h-6 sm:w-6" /> : <Upload className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-white flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                        <span>{selectedFile.name}</span>
                        <span className="font-mono text-xs text-neutral-400">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </p>
                      <p className="text-xs text-emerald-400 font-medium">
                        {isReadyToImport
                          ? "Data telah ditinjau dan siap diimpor. Klik tombol 'Import Sekarang' di bawah."
                          : "File dipilih. Klik 'Periksa & Tinjau Data' di bawah."}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-white">
                        Tarik &amp; lepas file Excel (.xlsx) atau .csv ke sini
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        atau <span className="text-primary underline">klik untuk memilih dari komputer</span>
                      </p>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileChange(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    title="Hapus pilihan file"
                    className="absolute top-3 right-3 rounded-full bg-white/[0.08] p-1.5 text-neutral-400 hover:bg-white/[0.15] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Action Bar — Tombol dinamis berubah dari "Periksa & Tinjau Data" menjadi "Import Sekarang" saat valid */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                {isReadyToImport ? (
                  // Tombol Tahap 2: Data valid → Langsung Import Sekarang
                  <button
                    type="button"
                    onClick={apply}
                    disabled={applying}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                    <span>{applying ? "Mengimpor Data…" : "Import Sekarang"}</span>
                  </button>
                ) : (
                  // Tombol Tahap 1: Periksa & Tinjau Data
                  <button
                    type="button"
                    onClick={check}
                    disabled={checking || targetIncomplete || !selectedFile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-primary-light disabled:opacity-50 active:scale-95 shadow-sm"
                  >
                    {checking ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>{checking ? "Memeriksa File…" : "Periksa & Tinjau Data"}</span>
                  </button>
                )}

                {isReadyToImport && (
                  <button
                    type="button"
                    onClick={check}
                    disabled={checking || applying}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
                    <span>Tinjau Ulang</span>
                  </button>
                )}

                {targetIncomplete && (
                  <p className="text-xs text-primary font-medium">Silakan pilih jenis layanan tujuan terlebih dahulu.</p>
                )}
              </div>

              {state.error && (
                <p role="alert" className="text-xs sm:text-sm text-primary font-medium">
                  {state.error}
                </p>
              )}

              {applyError && (
                <p role="alert" className="text-xs sm:text-sm text-primary font-medium">
                  {applyError}
                </p>
              )}

              {/* Preview Hasil Periksa File */}
              {preview && (
                <div className="mt-4 space-y-3">
                  {/* Ringkasan & Seleksi Kategori Interaktif */}
                  {preview.categories.length > 0 && (() => {
                    const unselectedNames = preview.categories
                      .filter((c) => !selectedCategorySlugs.has(c.slug))
                      .map((c) => c.name);
                    const untouchedList = [
                      ...preview.untouched,
                      ...unselectedNames,
                    ];

                    return (
                      <div className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/[0.08]">
                          <div>
                            <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-300">
                              {preview.targetNote ? "Tujuan Layanan" : "Kategori yang Ditemukan di File Excel"}
                            </p>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {preview.targetNote
                                ? preview.targetNote
                                : "Centang kategori yang ingin diimpor. Kategori yang tidak dicentang akan dilewati dan data aslinya tetap aman."}
                            </p>
                          </div>
                          {!preview.targetNote && preview.categories.length > 1 && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={selectAllCats}
                                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                              >
                                Pilih Semua
                              </button>
                              <span className="text-neutral-600">•</span>
                              <button
                                type="button"
                                onClick={deselectAllCats}
                                className="text-xs font-medium text-neutral-400 hover:text-white hover:underline cursor-pointer"
                              >
                                Batal Semua
                              </button>
                            </div>
                          )}
                        </div>

                        {preview.targetNote && (
                          <p className="mb-3 text-sm text-white font-medium">{preview.targetNote}</p>
                        )}

                        {/* Interactive Category Checkbox Cards */}
                        <div className="space-y-2">
                          {preview.categories.map((c) => {
                            const isChecked = selectedCategorySlugs.has(c.slug);
                            return (
                              <label
                                key={c.slug}
                                className={`flex items-start sm:items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "border-emerald-500/40 bg-emerald-500/[0.07] text-white ring-1 ring-emerald-500/25"
                                    : "border-white/[0.08] bg-white/[0.01] text-neutral-400 opacity-60 hover:opacity-100 hover:bg-white/[0.03]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCategory(c.slug)}
                                  className="accent-emerald-500 h-4 w-4 mt-0.5 sm:mt-0 rounded cursor-pointer shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs sm:text-sm text-white">
                                      {c.name}
                                    </span>
                                    <span
                                      className={`text-[0.625rem] font-mono px-2 py-0.5 rounded-full font-medium ${
                                        isChecked
                                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                          : "bg-white/[0.05] text-neutral-400 border border-white/[0.08]"
                                      }`}
                                    >
                                      {isChecked ? "Akan Diimpor" : "Dilewati (Tidak Berubah)"}
                                    </span>
                                  </div>
                                  <div className="text-[0.6875rem] sm:text-xs text-neutral-400 mt-1">
                                    {c.services} jenis layanan • {c.models} model perangkat • {c.prices} harga terisi
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Summary Untouched Note */}
                        <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-xs text-neutral-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <span className="font-mono text-[0.6875rem] text-neutral-300">
                            {selectedCategorySlugs.size} dari {preview.categories.length} kategori dipilih untuk diimpor
                          </span>
                          {untouchedList.length > 0 && (
                            <span className="text-[0.6875rem] text-neutral-400">
                              Data tetap aman (tidak berubah):{" "}
                              <span className="text-neutral-300 font-medium">
                                {untouchedList.join(", ")}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Peringatan */}
                  {preview.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                      <p className="mb-2 flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-amber-400">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        Catatan Penyesuaian
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-xs text-neutral-300">
                        {preview.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error per baris */}
                  {hasErrors && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4">
                      <p className="mb-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-rose-400">
                        Terdapat {preview.errors.length} baris bermasalah — perbaiki file lalu unggah ulang
                      </p>
                      <ul className="max-h-56 space-y-1 overflow-y-auto text-xs text-neutral-300">
                        {preview.errors.map((e, i) => (
                          <li key={i}>
                            <span className="font-mono text-rose-400 font-medium">Baris {e.row}:</span> {e.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
