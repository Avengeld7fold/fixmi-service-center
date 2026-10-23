"use client";
import AdminSymbol from "./AdminSymbol";


import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  CopyCheck,
} from "lucide-react";
import MacDisclosureButton from "./MacDisclosureButton";
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
  const [checkDuplicates, setCheckDuplicates] = useState(true);

  const activeCat = categories.find((c) => c.Slug === targetCat);
  const targetIncomplete = targetCat !== "" && targetSvc === "";

  // Set seluruh kategori terdeteksi terpilih secara default saat preview baru tersedia
  useEffect(() => {
    if (state.preview && state.preview.categories.length > 0) {
      // Preview data is an external action result; mirror its default selection.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    formData.set("checkDuplicates", String(checkDuplicates));

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
    "h-8 rounded-[8px] border border-panel-border bg-panel px-3 text-xs text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <section className="mb-6 space-y-3">
      {/* Toast Notifikasi Sukses / Error Impor */}
      {appliedMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 p-3.5 rounded-[10px] border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{appliedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedMessage("")}
            className="p-1 rounded-full text-text-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Kontainer Collapsible Panel (macOS Tahoe Box, Ref 29) */}
      <div className="overflow-hidden rounded-[14px] border border-panel-border bg-panel ">
        {/* Header Toggle Collapsible */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-black/5 dark:bg-white/10 text-primary">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">
                  Upload &amp; Import Data dari Excel / CSV
                </h2>
                {selectedFile && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
                    <FileCheck className="h-2.5 w-2.5" />
                    {selectedFile.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Klik untuk {isOpen ? "menutup" : "membuka"} panel upload file Excel untuk memperbarui banyak model sekaligus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <MacDisclosureButton expanded={isOpen} size="regular" asSpan />
          </div>
        </button>

        {/* Collapsible Body */}
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          inert={!isOpen}
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden border-t border-panel-border">
            <div className="p-4 space-y-3.5">
              {/* Tujuan import */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-panel-raised/40 p-3 rounded-[10px] border border-panel-border">
                <label htmlFor="import-target-cat" className="text-xs font-medium text-foreground shrink-0">
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
                  <option value="">
                    Otomatis (Sesuai kolom di file Excel)
                  </option>
                  {categories.map((c) => (
                    <option key={c.Slug} value={c.Slug}>
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
                    <option value="">
                      — Pilih Jenis Layanan Tujuan —
                    </option>
                    {activeCat.services.map((s) => (
                      <option key={s.Slug} value={s.Slug}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}

                {activeCat && (
                  <p className="w-full text-[11px] text-text-muted mt-0.5">
                    Semua baris model di file akan langsung dimasukkan ke layanan yang Anda pilih.
                  </p>
                )}
              </div>

              {/* Opsi Auto Duplicate Checker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel-raised/40 p-3 rounded-[10px] border border-panel-border">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border transition-colors ${
                      checkDuplicates
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <CopyCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="toggle-duplicate-checker"
                        className="text-xs font-semibold text-foreground cursor-pointer select-none"
                      >
                        Pemeriksaan Duplikat Otomatis
                      </label>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-semibold border ${
                          checkDuplicates
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25"
                        }`}
                      >
                        {checkDuplicates ? "Aktif (Ketat)" : "Nonaktif (Izinkan Duplikat)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      {checkDuplicates
                        ? "Impor ditolak jika terdeteksi nama model atau baris harga ganda di dalam file."
                        : "Data duplikat tetap diizinkan masuk (baris terakhir akan menimpa/memperbarui data sebelumnya)."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    id="toggle-duplicate-checker"
                    role="switch"
                    aria-checked={checkDuplicates}
                    aria-label="Toggle auto duplicate checker"
                    onClick={() => {
                      setCheckDuplicates((prev) => !prev);
                      setState(initialState);
                      setApplyError("");
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      checkDuplicates ? "bg-[#34C759]" : "bg-black/20 dark:bg-white/20"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white  ring-0 transition duration-150 ease-in-out ${
                        checkDuplicates ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Drag & Drop File Zone (macOS Image / File Well, Ref 30) */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-5 border border-dashed rounded-[10px] cursor-pointer transition-all duration-150 ${
                  isDragging
                    ? "border-primary bg-primary/10 "
                    : selectedFile
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                    : "border-panel-border bg-panel-raised/30 hover:border-primary/40 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />

                <div className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[8px] transition-colors ${
                      selectedFile
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-black/5 dark:bg-white/10"
                    }`}
                  >
                    {selectedFile ? (
                      <FileCheck className="h-5 w-5" />
                    ) : (

                      <AdminSymbol name="upload" className="h-5 w-5 object-contain" />
                    )}
                  </div>

                  {selectedFile ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground flex flex-wrap items-center justify-center gap-1.5">
                        <span>{selectedFile.name}</span>
                        <span className="font-mono text-[11px] text-text-muted">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {isReadyToImport
                          ? "Data telah ditinjau dan siap diimpor. Klik tombol 'Import Sekarang' di bawah."
                          : "File dipilih. Klik 'Periksa & Tinjau Data' di bawah."}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Tarik &amp; lepas file Excel (.xlsx) atau .csv ke sini
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
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
                    className="absolute top-2.5 right-2.5 rounded-full p-1 text-text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {isReadyToImport ? (
                  <button
                    type="button"
                    onClick={apply}
                    disabled={applying}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 px-5 text-xs font-semibold text-white  transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                    <span>{applying ? "Mengimpor Data…" : "Import Sekarang"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={check}
                    disabled={checking || targetIncomplete || !selectedFile}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] bg-primary hover:bg-[#0066D6] px-4 text-xs font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-50 "
                  >
                    {checking ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (

                      <AdminSymbol name="upload" className="h-3.5 w-3.5 object-contain" />
                    )}
                    <span>{checking ? "Memeriksa File…" : "Periksa & Tinjau Data"}</span>
                  </button>
                )}

                {isReadyToImport && (
                  <button
                    type="button"
                    onClick={check}
                    disabled={checking || applying}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] border border-panel-border bg-panel px-3.5 text-xs font-medium text-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97]"
                  >
                    <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
                    <span>Tinjau Ulang</span>
                  </button>
                )}

                {targetIncomplete && (
                  <p className="text-xs text-primary font-medium">Silakan pilih jenis layanan tujuan terlebih dahulu.</p>
                )}
              </div>

              {state.error && (
                <p role="alert" className="text-xs text-[#FF3B30] font-medium">
                  {state.error}
                </p>
              )}

              {applyError && (
                <p role="alert" className="text-xs text-[#FF3B30] font-medium">
                  {applyError}
                </p>
              )}

              {/* Preview Hasil Periksa File */}
              {preview && (
                <div className="mt-3 space-y-2.5">
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
                      <div className="rounded-[10px] border border-panel-border bg-panel-raised/40 p-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-panel-border">
                          <div>
                            <p className="text-[11px] font-medium text-text-muted">
                              {preview.targetNote ? "Tujuan Layanan" : "Kategori yang Ditemukan di File Excel"}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
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
                              <span className="text-text-muted">•</span>
                              <button
                                type="button"
                                onClick={deselectAllCats}
                                className="text-xs font-medium text-text-muted hover:text-foreground hover:underline cursor-pointer"
                              >
                                Batal Semua
                              </button>
                            </div>
                          )}
                        </div>

                        {preview.targetNote && (
                          <p className="mb-2.5 text-xs text-foreground font-medium">{preview.targetNote}</p>
                        )}

                        {/* Interactive Category Checkbox Cards */}
                        <div className="space-y-1.5">
                          {preview.categories.map((c) => {
                            const isChecked = selectedCategorySlugs.has(c.slug);
                            return (
                              <label
                                key={c.slug}
                                className={`flex items-start sm:items-center gap-2.5 p-2.5 rounded-[8px] border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                                    : "border-panel-border bg-panel text-text-muted opacity-70 hover:opacity-100 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCategory(c.slug)}
                                  className="accent-emerald-500 h-3.5 w-3.5 mt-0.5 sm:mt-0 rounded cursor-pointer shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-foreground">
                                      {c.name}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-medium ${
                                        isChecked
                                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                          : "bg-black/5 dark:bg-white/10 text-text-muted border border-panel-border"
                                      }`}
                                    >
                                      {isChecked ? "Akan Diimpor" : "Dilewati"}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-text-muted mt-0.5">
                                    {c.services} jenis layanan • {c.models} model perangkat • {c.prices} harga terisi
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Summary Untouched Note */}
                        <div className="mt-2.5 pt-2 border-t border-panel-border text-[11px] text-text-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-mono text-[10px] text-foreground">
                            {selectedCategorySlugs.size} dari {preview.categories.length} kategori dipilih untuk diimpor
                          </span>
                          {untouchedList.length > 0 && (
                            <span className="text-[10px] text-text-muted">
                              Data tetap aman:{" "}
                              <span className="text-foreground font-medium">
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
                    <div className="rounded-[10px] border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-500">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        Catatan Penyesuaian
                      </p>
                      <ul className="list-inside list-disc space-y-0.5 text-xs text-text-muted">
                        {preview.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error per baris */}
                  {hasErrors && (
                    <div className="rounded-[10px] border border-[#FF3B30]/30 bg-[#FF3B30]/5 p-3">
                      <p className="mb-1.5 text-[11px] font-medium text-[#FF3B30]">
                        Terdapat {preview.errors.length} baris bermasalah — perbaiki file lalu unggah ulang
                      </p>
                      <ul className="max-h-48 space-y-0.5 overflow-y-auto text-xs text-text-muted">
                        {preview.errors.map((e, i) => (
                          <li key={i}>
                            <span className="font-mono text-[#FF3B30] font-medium">Baris {e.row}:</span> {e.message}
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
