"use client";
import AdminSymbol from "./AdminSymbol";


import { useState, useMemo, useRef } from "react";
import { X, ArrowDown, ArrowUp } from "lucide-react";
import { formatThousands, parseThousands, type DevicePrice, type ServiceType } from "@/lib/data";
import ConfirmModal from "./ConfirmModal";

interface PriceGridProps {
  service: ServiceType;
  categoryName: string;
  onChange: (next: ServiceType) => void;
}

/**
 * macOS Finder-style List View Table (macOS 26 Tahoe Specification)
 * Referensi Resmi: Ref 07, Ref 31, Ref 65
 */
export default function PriceGrid({ service, categoryName, onChange }: PriceGridProps) {
  // Search / Quick Filter Model
  const [modelSearch, setModelSearch] = useState("");

  // Seleksi baris untuk hapus massal (indeks baris asli; direset setiap ada perubahan baris).
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Ref grid table untuk keyboard navigation
  const tableRef = useRef<HTMLTableElement>(null);

  // Modal konfirmasi state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const setRows = (device_prices: DevicePrice[]) => {
    setSelected(new Set());
    onChange({ ...service, device_prices });
  };

  const updateModel = (originalIndex: number, name: string) => {
    onChange({
      ...service,
      device_prices: service.device_prices.map((dp, i) =>
        i === originalIndex ? { ...dp, DeviceModel: name } : dp
      ),
    });
  };

  const updatePrice = (originalIndex: number, variantKey: string, raw: string, isText = false) => {
    const price = isText ? (raw.trim() === "" ? null : raw) : parseThousands(raw);
    onChange({
      ...service,
      device_prices: service.device_prices.map((dp, i) =>
        i === originalIndex ? { ...dp, prices: { ...dp.prices, [variantKey]: price } } : dp
      ),
    });
  };

  // Keyboard navigation ala Excel / Spreadsheet (Enter / ArrowDown / ArrowUp)
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const targetRow = rowIndex + 1;
      const nextInput = tableRef.current?.querySelector<HTMLInputElement>(
        `[data-row="${targetRow}"][data-col="${colIndex}"]`
      );
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === "ArrowUp") {
      if (rowIndex > 0) {
        e.preventDefault();
        const targetRow = rowIndex - 1;
        const prevInput = tableRef.current?.querySelector<HTMLInputElement>(
          `[data-row="${targetRow}"][data-col="${colIndex}"]`
        );
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
    }
  };

  const toggleRow = (originalIndex: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(originalIndex)) next.delete(originalIndex);
      else next.add(originalIndex);
      return next;
    });
  };

  // Filtered rows dengan mapping ke indeks asli
  const filteredRows = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    return service.device_prices
      .map((dp, originalIndex) => ({ dp, originalIndex }))
      .filter(({ dp }) => {
        if (!q) return true;
        return (dp.DeviceModel || "").toLowerCase().includes(q);
      });
  }, [service.device_prices, modelSearch]);

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every(({ originalIndex }) => selected.has(originalIndex));

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredRows.forEach(({ originalIndex }) => next.delete(originalIndex));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredRows.forEach(({ originalIndex }) => next.add(originalIndex));
        return next;
      });
    }
  };

  const removeRow = (originalIndex: number) => {
    const model = service.device_prices[originalIndex]?.DeviceModel || `Model #${originalIndex + 1}`;
    setConfirmModal({
      isOpen: true,
      title: `Hapus Baris “${model}”?`,
      subtitle: `${model} · ${service.Name} (${categoryName})`,
      description: `Data harga model “${model}” akan dihapus dari tabel katalog. Tindakan ini tidak dapat dibatalkan setelah disimpan.`,
      onConfirm: () => {
        setRows(service.device_prices.filter((_, i) => i !== originalIndex));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const bulkDelete = () => {
    const count = selected.size;
    setConfirmModal({
      isOpen: true,
      title: `Hapus ${count} Model Terpilih?`,
      subtitle: `${service.Name} (${categoryName})`,
      description: `Data harga ${count} baris model terpilih akan dihilangkan dari tabel katalog.`,
      onConfirm: () => {
        setRows(service.device_prices.filter((_, i) => !selected.has(i)));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const addRowBottom = () => {
    setRows([
      ...service.device_prices,
      {
        DeviceModel: "",
        prices: Object.fromEntries(service.variants.map((v) => [v.Key, null])),
      },
    ]);
  };

  const addRowTop = () => {
    setRows([
      {
        DeviceModel: "",
        prices: Object.fromEntries(service.variants.map((v) => [v.Key, null])),
      },
      ...service.device_prices,
    ]);
  };

  return (
    <>
      <div className="p-3 sm:p-4 space-y-2.5">
        {/* ── macOS Finder Toolbar (Ref 07, 65) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-[10px] border border-panel-border bg-panel-raised/40 p-2 sm:px-3 sm:py-2">
          {/* Kolom Cari Model (macOS Pill Search Field) */}
          <div className="relative flex-1 min-w-[180px] w-full sm:max-w-xs flex items-center">
<AdminSymbol name="magnifying" className="absolute left-2.5 h-3.5 w-3.5 object-contain pointer-events-none" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Cari model HP…"
              aria-label="Cari model HP di layanan ini"
              className="w-full h-7 rounded-full border border-panel-border bg-panel pl-8 pr-7 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            {modelSearch && (
              <button
                type="button"
                onClick={() => setModelSearch("")}
                aria-label="Reset pencarian"
                className="absolute right-2 rounded-full p-0.5 text-text-muted hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Counter & Tombol Tambah (macOS Toolbar Buttons) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <span className="font-mono text-[11px] text-text-muted">
              {modelSearch ? (
                <>
                  <span className="text-primary font-semibold">{filteredRows.length}</span>/{service.device_prices.length}
                </>
              ) : (
                `${service.device_prices.length} model`
              )}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={addRowTop}
                title="Tambah model baru di baris paling atas"
                className="inline-flex h-7 items-center gap-1 rounded-[7px] border border-panel-border bg-panel px-2.5 text-[11px] font-medium text-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97]"
              >
                <ArrowUp className="h-3 w-3 text-primary" aria-hidden="true" />
                <span>Tambah di Atas</span>
              </button>

              <button
                type="button"
                onClick={addRowBottom}
                title="Tambah model baru di baris paling bawah"
                className="inline-flex h-7 items-center gap-1 rounded-[7px] border border-panel-border bg-panel px-2.5 text-[11px] font-medium text-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97]"
              >
                <ArrowDown className="h-3 w-3 text-primary" aria-hidden="true" />
                <span>Tambah di Bawah</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── macOS Finder Data Table (Ref 07, 31) ── */}
        <div className="admin-price-scroller rounded-[10px] border border-panel-border bg-panel" role="region" aria-label="Tabel harga layanan" tabIndex={0}>
          <table ref={tableRef} className="admin-price-table w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-panel-border bg-panel-raised/70">
                <th className="sticky left-0 z-10 min-w-[11rem] sm:min-w-[15rem] border-r border-panel-border bg-panel-raised/95 px-3 py-2">
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selected.size > 0 && !allVisibleSelected;
                      }}
                      onChange={toggleAllVisible}
                      aria-label="Pilih semua model terlihat"
                      className="h-3.5 w-3.5 rounded-[4px] cursor-pointer accent-[#007AFF]"
                    />
                    <span className="text-[11px] font-medium text-text-muted">
                      Tipe / Model HP
                    </span>
                    {/* Tombol hapus massal */}
                    {selected.size > 0 && (
                      <button
                        type="button"
                        onClick={bulkDelete}
                        aria-label={`Hapus ${selected.size} model terpilih`}
                        title={`Hapus ${selected.size} model terpilih`}
                        className="inline-flex h-5 items-center gap-1 rounded-full bg-[#FF3B30] hover:bg-[#E0352B] px-2 text-[10px] font-semibold text-white transition-all active:scale-[0.97]  ml-auto"
                      >
<AdminSymbol name="trash" className="w-2.5 h-2.5 object-contain" />
                        <span>Hapus ({selected.size})</span>
                      </button>
                    )}
                  </span>
                </th>
                {service.variants.map((v) => (
                  <th
                    key={v.Key}
                    className="min-w-[8.5rem] border-b border-panel-border px-3 py-2 text-right text-[11px] font-medium text-text-muted"
                  >
                    {v.Label}
                  </th>
                ))}
                <th className="w-10 border-b border-panel-border" aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={service.variants.length + 2}
                    className="py-10 text-center text-xs text-text-muted"
                  >
                    {modelSearch ? (
                      <div>
                        <p>Tidak ada model yang cocok dengan &ldquo;{modelSearch}&rdquo;.</p>
                        <button
                          type="button"
                          onClick={() => setModelSearch("")}
                          className="mt-2 text-xs font-medium text-primary hover:underline"
                        >
                          Tampilkan semua model
                        </button>
                      </div>
                    ) : (
                      <p>Belum ada daftar model HP pada layanan ini. Gunakan tombol di atas untuk menambah model.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ dp, originalIndex }, visibleRowIdx) => {
                  const isRowSelected = selected.has(originalIndex);
                  return (
                    <tr
                      key={originalIndex}
                      className={`border-b border-panel-border/60 transition-colors ${
                        isRowSelected
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <td
                        className={`sticky left-0 z-10 border-r border-panel-border px-3 py-1 ${
                          isRowSelected
                            ? "bg-blue-50/90 dark:bg-[#1a2d48]/90"
                            : "bg-panel"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={() => toggleRow(originalIndex)}
                            aria-label={`Pilih ${dp.DeviceModel || `baris ${originalIndex + 1}`}`}
                            className="h-3.5 w-3.5 rounded-[4px] cursor-pointer accent-[#007AFF]"
                          />
                          <input
                            data-row={visibleRowIdx}
                            data-col={0}
                            value={dp.DeviceModel}
                            onChange={(e) => updateModel(originalIndex, e.target.value)}
                            onKeyDown={(e) => handleCellKeyDown(e, visibleRowIdx, 0)}
                            placeholder="Ketik model HP…"
                            aria-label={`Nama model baris ${originalIndex + 1}`}
                            className="w-full rounded-[5px] border border-transparent bg-transparent px-2 py-1 text-xs text-foreground font-medium outline-none transition-colors hover:border-panel-border/60 focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary/30"
                          />
                        </span>
                      </td>
                      {service.variants.map((v, colIdx) => {
                        const val = dp.prices[v.Key];
                        const isText = v.Type === "text" || typeof val === "string";

                        return (
                          <td key={v.Key} className="px-2 py-1 text-right">
                            <input
                              data-row={visibleRowIdx}
                              data-col={colIdx + 1}
                              inputMode={isText ? "text" : "numeric"}
                              value={
                                isText
                                  ? (val !== null && val !== undefined ? String(val) : "")
                                  : formatThousands(val as number)
                              }
                              onChange={(e) => updatePrice(originalIndex, v.Key, e.target.value, isText)}
                              onKeyDown={(e) => handleCellKeyDown(e, visibleRowIdx, colIdx + 1)}
                              placeholder="–"
                              aria-label={`Nilai ${dp.DeviceModel || `baris ${originalIndex + 1}`} pilihan ${v.Label}`}
                              className={`w-full rounded-[5px] border border-transparent bg-transparent px-2 py-1 text-xs tabular-nums outline-none transition-colors placeholder:text-text-muted hover:border-panel-border/60 focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary/30 ${
                                isText
                                  ? "font-mono text-center text-foreground font-normal"
                                  : "font-mono text-right text-foreground font-semibold"
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-1.5 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(originalIndex)}
                          aria-label={`Hapus model ${dp.DeviceModel || `baris ${originalIndex + 1}`}`}
                          title="Hapus baris ini"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-[5px] text-text-muted transition-colors hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
                        >
<AdminSymbol name="trash" className="w-3 h-3 object-contain" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
          <span>
            Gunakan tombol <code>Enter</code> atau <code>↓ / ↑</code> untuk berpindah baris input.
          </span>
        </div>
      </div>

      {/* ── Apple HIG Alert Modal (Ref 03, 18) ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        description={confirmModal.description}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
