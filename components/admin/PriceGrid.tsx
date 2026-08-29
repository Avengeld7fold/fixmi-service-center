"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Trash2, Search, X, ArrowDown, ArrowUp } from "lucide-react";
import { formatThousands, parseThousands, type DevicePrice, type ServiceType } from "@/lib/data";
import ConfirmModal from "./ConfirmModal";

interface PriceGridProps {
  service: ServiceType;
  categoryName: string;
  onChange: (next: ServiceType) => void;
}

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

  const updatePrice = (originalIndex: number, variantKey: string, raw: string) => {
    const price = parseThousands(raw);
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
      // Hanya navigasi jika bukan di tengah multiline
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
      title: "Hapus Baris Model?",
      subtitle: `${model} · ${service.Name} (${categoryName})`,
      description: `Apakah Anda yakin ingin menghapus baris model "${model}"? Perubahan akan disimpan saat Anda menekan tombol Simpan Perubahan.`,
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
      description: `Apakah Anda yakin ingin menghapus ${count} baris model terpilih? Data harga pada baris-baris ini akan dihilangkan dari tabel.`,
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
      <div className="p-3.5 sm:p-5 space-y-3">
        {/* ── Toolbar Filter Model Cepat & Tambah Model ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.08]">
          {/* Kolom Cari Model */}
          <div className="relative flex-1 min-w-[180px] w-full sm:max-w-md flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Cari model HP, mis. 15 Pro, Note 12…"
              aria-label="Cari model HP di layanan ini"
              className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] pl-9 pr-8 py-2 text-xs sm:text-sm text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-neutral-500"
            />
            {modelSearch && (
              <button
                type="button"
                onClick={() => setModelSearch("")}
                aria-label="Reset pencarian"
                className="absolute right-2.5 rounded-full p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter & Tombol Tambah */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            <span className="font-mono text-xs text-neutral-400">
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
                className="inline-flex items-center gap-1 rounded-xl border border-white/[0.10] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-primary/50 active:scale-95"
              >
                <ArrowUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline">Tambah di Atas</span>
                <span className="sm:hidden">+ Atas</span>
              </button>

              <button
                type="button"
                onClick={addRowBottom}
                title="Tambah model baru di baris paling bawah"
                className="inline-flex items-center gap-1 rounded-xl border border-white/[0.10] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-primary/50 active:scale-95"
              >
                <ArrowDown className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline">Tambah di Bawah</span>
                <span className="sm:hidden">+ Bawah</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabel Harga ── */}
        <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-white/[0.08] bg-white/[0.01] scrollbar-thin scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25 scrollbar-track-transparent">
          <table ref={tableRef} className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-white/[0.03]">
                <th className="sticky left-0 z-10 min-w-[10rem] sm:min-w-[14rem] border-b border-r border-white/[0.08] bg-[#161618] px-3 py-2.5">
                  <span className="flex items-center gap-3">
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
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--fixmi-primary)]"
                    />
                    <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-text-secondary">
                      Tipe / Model HP
                    </span>
                    {/* Tombol hapus massal */}
                    {selected.size > 0 && (
                      <button
                        type="button"
                        onClick={bulkDelete}
                        aria-label={`Hapus ${selected.size} model terpilih`}
                        title={`Hapus ${selected.size} model terpilih`}
                        className="inline-flex items-center gap-1.5 rounded-[6px] bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-500 shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hapus ({selected.size})</span>
                      </button>
                    )}
                  </span>
                </th>
                {service.variants.map((v) => (
                  <th
                    key={v.Key}
                    className="min-w-[8.5rem] border-b border-panel-border px-3 py-2.5 text-right font-mono text-[0.6875rem] uppercase tracking-wider text-text-secondary"
                  >
                    {v.Label}
                  </th>
                ))}
                <th className="w-12 border-b border-panel-border" aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={service.variants.length + 2}
                    className="py-10 text-center text-xs sm:text-sm text-text-muted"
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
                      <p>Belum ada daftar model HP pada layanan ini. Klik tombol di atas untuk menambah model.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ dp, originalIndex }, visibleRowIdx) => (
                  <tr
                    key={originalIndex}
                    className={`border-b border-panel-border transition-colors hover:bg-white/[0.02] ${
                      selected.has(originalIndex) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="sticky left-0 z-10 border-r border-panel-border bg-panel px-3 py-1.5">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected.has(originalIndex)}
                          onChange={() => toggleRow(originalIndex)}
                          aria-label={`Pilih ${dp.DeviceModel || `baris ${originalIndex + 1}`}`}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--fixmi-primary)]"
                        />
                        <input
                          data-row={visibleRowIdx}
                          data-col={0}
                          value={dp.DeviceModel}
                          onChange={(e) => updateModel(originalIndex, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, visibleRowIdx, 0)}
                          placeholder="Ketik tipe/model HP, mis. iPhone 15 Pro…"
                          aria-label={`Nama model baris ${originalIndex + 1}`}
                          className="w-full rounded-[6px] border border-transparent bg-transparent px-2 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-background"
                        />
                      </span>
                    </td>
                    {service.variants.map((v, colIdx) => (
                      <td key={v.Key} className="px-2 py-1.5 text-right">
                        <input
                          data-row={visibleRowIdx}
                          data-col={colIdx + 1}
                          inputMode="numeric"
                          value={formatThousands(dp.prices[v.Key])}
                          onChange={(e) => updatePrice(originalIndex, v.Key, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, visibleRowIdx, colIdx + 1)}
                          placeholder="–"
                          aria-label={`Harga ${dp.DeviceModel || `baris ${originalIndex + 1}`} pilihan ${v.Label}`}
                          className="w-full rounded-[6px] border border-transparent bg-transparent px-2 py-1.5 text-right font-mono text-sm tabular-nums text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:bg-background"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(originalIndex)}
                        aria-label={`Hapus model ${dp.DeviceModel || `baris ${originalIndex + 1}`}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>
            💡 <strong>Tips Cepat:</strong> Gunakan tombol <code>Enter</code> atau <code>↓ / ↑</code> untuk berpindah baris input seperti di Excel.
          </span>
        </div>
      </div>

      {/* ── Custom Centered Confirmation Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        description={confirmModal.description}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
