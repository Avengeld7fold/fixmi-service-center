"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import ServiceIcon from "@/components/pricelist/ServiceIcon";
import PriceGrid from "./PriceGrid";
import ConfirmModal from "./ConfirmModal";
import IconPickerModal from "./IconPickerModal";
import { MAX_VARIANTS, slugify, type ServiceType } from "@/lib/data";

interface ServiceEditorProps {
  service: ServiceType;
  categoryName: string;
  categorySlug?: string;
  onChange: (next: ServiceType) => void;
  onDelete: () => void;
  open: boolean;
  onToggle: () => void;
  index?: number;
  totalCount?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDragging?: boolean;
  isOver?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  cardDropProps?: React.HTMLAttributes<HTMLElement>;
}

export default function ServiceEditor({
  service,
  categoryName,
  categorySlug,
  onChange,
  onDelete,
  open,
  onToggle,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  isDragging,
  isOver,
  dragHandleProps,
  cardDropProps,
}: ServiceEditorProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newNote, setNewNote] = useState("");
  const [variantError, setVariantError] = useState("");
  const [openIconPicker, setOpenIconPicker] = useState(false);

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

  // Merk/Series diedit sebagai draft lokal dan di-commit saat blur
  const [brandDraft, setBrandDraft] = useState(service.Brand ?? "");
  const [seriesDraft, setSeriesDraft] = useState(service.Series ?? "");
  const commitHierarchy = () => {
    const brand = brandDraft.trim();
    const series = seriesDraft.trim();
    if (brand === (service.Brand ?? "") && series === (service.Series ?? "")) return;
    const next = { ...service };
    if (brand) next.Brand = brand;
    else delete next.Brand;
    if (brand && series) next.Series = series;
    else delete next.Series;
    onChange(next);
  };

  const updateVariant = (key: string, field: "Label" | "Note", value: string) => {
    onChange({
      ...service,
      variants: service.variants.map((v) => (v.Key === key ? { ...v, [field]: value } : v)),
    });
  };

  const removeVariant = (key: string) => {
    const variant = service.variants.find((v) => v.Key === key);
    const label = variant?.Label || key;

    setConfirmModal({
      isOpen: true,
      title: "Hapus Pilihan Kualitas / Garansi?",
      subtitle: `Pilihan "${label}" · ${service.Name} (${categoryName})`,
      description: `Apakah Anda yakin ingin menghapus kolom pilihan "${label}"? Seluruh data harga pada kolom ini akan ikut terhapus dari tabel model perangkat.`,
      onConfirm: () => {
        onChange({
          ...service,
          variants: service.variants.filter((v) => v.Key !== key),
          device_prices: service.device_prices.map((dp) => {
            const prices = { ...dp.prices };
            delete prices[key];
            return { ...dp, prices };
          }),
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const addVariant = () => {
    const label = newLabel.trim();
    if (!label) return setVariantError("Nama pilihan kualitas tidak boleh kosong.");
    const key = slugify(label);
    if (!key) return setVariantError("Nama pilihan kualitas tidak valid.");
    if (service.variants.some((v) => v.Key === key))
      return setVariantError(`Pilihan "${label}" sudah ada.`);
    if (service.variants.length >= MAX_VARIANTS)
      return setVariantError(`Maksimum ${MAX_VARIANTS} kolom pilihan kualitas per jenis layanan.`);

    onChange({
      ...service,
      variants: [...service.variants, { Key: key, Label: label.toUpperCase(), Note: newNote.trim() }],
      device_prices: service.device_prices.map((dp) => ({
        ...dp,
        prices: { ...dp.prices, [key]: null },
      })),
    });
    setNewLabel("");
    setNewNote("");
    setVariantError("");
  };

  const panelId = `admin-svc-${service.Slug}`;

  return (
    <>
      <div
        data-service-slug={service.Slug}
        {...cardDropProps}
        className={`relative overflow-hidden rounded-[12px] border transition-all duration-200 ${
          isDragging
            ? "opacity-50 scale-[0.99] border-primary/60 shadow-[0_10px_30px_rgba(255,107,0,0.25)] ring-2 ring-primary/40 z-20"
            : isOver
            ? "border-primary ring-2 ring-primary/50 bg-primary/[0.04] shadow-[0_4px_24px_rgba(255,107,0,0.2)]"
            : "border-panel-border bg-panel hover:border-white/[0.15]"
        }`}
      >
        {isOver && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_12px_#ff6b00] z-30 animate-pulse" />
        )}

        {/* Header service */}
        <div className="flex items-center gap-2 sm:gap-3.5 px-3.5 sm:px-5 py-3.5 sm:py-4 transition-colors hover:bg-panel-raised/50">
          {/* ── Drag Grip Handle & Sequence Badge ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {dragHandleProps && (
              <div
                {...dragHandleProps}
                role="button"
                tabIndex={0}
                title="Tahan & geser untuk mengubah urutan layanan"
                aria-label={`Tahan dan geser untuk memindahkan layanan ${service.Name}`}
                className="flex h-9 w-7 sm:w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-primary hover:bg-white/[0.08] active:bg-primary/20 active:text-primary cursor-grab active:cursor-grabbing touch-none select-none transition-all"
              >
                <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            {typeof index === "number" && (
              <span
                title={`Urutan #${index + 1}`}
                className="inline-flex items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-neutral-400 select-none"
              >
                #{index + 1}
              </span>
            )}
            {(onMoveUp || onMoveDown) && (
              <div className="hidden sm:flex flex-col gap-0.5 shrink-0 ml-0.5">
                <button
                  type="button"
                  disabled={!onMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.();
                  }}
                  title="Pindah urutan ke atas"
                  aria-label={`Pindah ${service.Name} ke atas`}
                  className="flex h-3.5 w-4 items-center justify-center rounded text-neutral-500 hover:text-primary hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={!onMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.();
                  }}
                  title="Pindah urutan ke bawah"
                  aria-label={`Pindah ${service.Name} ke bawah`}
                  className="flex h-3.5 w-4 items-center justify-center rounded text-neutral-500 hover:text-primary hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* ── Tombol Ubah Ikon ── */}
          <button
            type="button"
            onClick={() => setOpenIconPicker(true)}
            title="Klik untuk mengganti ikon"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-panel-raised transition-all hover:bg-white/[0.12] hover:scale-105 active:scale-95 group/icon cursor-pointer border border-transparent hover:border-white/10"
          >
            <ServiceIcon name={service.icon} className="h-5 w-5 text-primary group-hover/icon:scale-110 transition-transform" />
          </button>

          {/* ── Nama Layanan & Info (Klik untuk buka/tutup accordion) ── */}
          <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle();
              }
            }}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex-1 min-w-0 cursor-pointer text-left select-none outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg p-1"
          >
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground truncate">
              <span className="truncate">{service.Name}</span>
              {service.Name_en && (
                <span className="hidden sm:inline-block shrink-0 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-normal text-primary">
                  EN: {service.Name_en}
                </span>
              )}
            </div>
            <span className="block text-[11px] sm:text-xs text-text-muted truncate mt-0.5">
              {service.Brand ? `${service.Brand} · ${service.Series} · ` : ""}
              {service.device_prices.length} model perangkat · {service.variants.length} pilihan kualitas
            </span>
          </div>

          {/* ── Tombol Toggle Accordion ── */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Tutup panel layanan" : "Buka panel layanan"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-panel-border bg-background text-text-muted transition-transform duration-200 cursor-pointer hover:border-white/20 hover:text-white ${
              open ? "rotate-180 text-primary border-primary/40" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Panel kolaps */}
        <div
          id={panelId}
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            {/* Pengaturan layanan: nama service, icon picker, hirarki merk/series, dan hapus */}
            <div className="border-t border-panel-border px-4 sm:px-6 py-4">
              <p className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                Pengaturan Layanan
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
                {/* Tombol Ganti Ikon */}
                <button
                  type="button"
                  onClick={() => setOpenIconPicker(true)}
                  title="Ganti ikon layanan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition-all duration-150 hover:border-primary/50 hover:bg-white/[0.08] active:scale-95 shrink-0"
                >
                  <span className="flex h-4 w-4 items-center justify-center text-primary">
                    <ServiceIcon name={service.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span>Ubah Ikon</span>
                </button>

                <input
                  value={service.Name}
                  onChange={(e) => onChange({ ...service, Name: e.target.value, title: e.target.value })}
                  placeholder="Nama layanan (ID), mis. Ganti LCD"
                  aria-label="Nama layanan (ID)"
                  className="flex-1 min-w-[150px] sm:min-w-[180px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />

                <input
                  value={service.Name_en || ""}
                  onChange={(e) => onChange({ ...service, Name_en: e.target.value || undefined })}
                  placeholder="English Name (opsional), mis. Screen Replacement"
                  aria-label="Nama layanan (EN)"
                  className="flex-1 min-w-[150px] sm:min-w-[180px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />

                {/* Kolom Merk & Series hanya muncul di kategori Android atau layanan ber-Brand */}
                {(categorySlug === "android" || Boolean(service.Brand)) && (
                  <>
                    <input
                      value={brandDraft}
                      onChange={(e) => setBrandDraft(e.target.value)}
                      onBlur={commitHierarchy}
                      placeholder="Merk (opsional), mis. Samsung"
                      aria-label="Merk perangkat"
                      className="flex-1 min-w-[130px] sm:min-w-[160px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                    <input
                      value={seriesDraft}
                      onChange={(e) => setSeriesDraft(e.target.value)}
                      onBlur={commitHierarchy}
                      placeholder="Series (opsional), mis. Galaxy A Series"
                      aria-label="Seri perangkat"
                      className="flex-1 min-w-[140px] sm:min-w-[180px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={onDelete}
                  className="sm:ml-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-neutral-400 transition-all duration-150 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-95 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Hapus Layanan</span>
                </button>
              </div>
            </div>

            {/* Manajemen varian kualitas */}
            <div className="border-y border-panel-border px-4 sm:px-6 py-4">
              <p className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
                Pilihan Kualitas Suku Cadang & Garansi
              </p>
              <div className="space-y-2.5">
                {service.variants.map((v) => (
                  <div key={v.Key} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                    <input
                      value={v.Label}
                      onChange={(e) => updateVariant(v.Key, "Label", e.target.value)}
                      aria-label={`Nama pilihan ${v.Key}`}
                      className="w-full sm:w-44 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 font-mono text-xs font-semibold uppercase text-white outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                    <input
                      value={v.Note}
                      onChange={(e) => updateVariant(v.Key, "Note", e.target.value)}
                      placeholder="Garansi (mis. 90 Hari)"
                      aria-label={`Keterangan garansi ${v.Key}`}
                      className="w-full sm:flex-1 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs text-neutral-300 placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                    <div className="flex justify-end sm:block">
                      <button
                        type="button"
                        onClick={() => removeVariant(v.Key)}
                        aria-label={`Hapus pilihan ${v.Label}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tambah varian kualitas */}
              {service.variants.length < MAX_VARIANTS && (
                <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Nama kualitas (mis. OLED Premium)"
                    className="w-full sm:w-44 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 font-mono text-xs uppercase text-white placeholder:text-neutral-500 placeholder:normal-case outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Keterangan garansi (opsional, mis. Garansi 90 Hari)"
                    className="w-full sm:flex-1 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2 text-xs text-neutral-300 placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/[0.08] hover:border-primary/50 active:scale-95 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>Tambah Kualitas</span>
                  </button>
                </div>
              )}
              {variantError && (
                <p role="alert" className="mt-2 text-xs text-primary font-medium">
                  {variantError}
                </p>
              )}
            </div>

            {/* Grid harga */}
            <PriceGrid service={service} categoryName={categoryName} onChange={onChange} />
          </div>
        </div>
      </div>

      {/* ── Modal Pilih Ikon ── */}
      <IconPickerModal
        isOpen={openIconPicker}
        currentIcon={service.icon}
        categorySlug={categorySlug || (categoryName.toLowerCase().includes("android") ? "android" : undefined)}
        serviceTitle={service.Name}
        onSelect={(iconId) => onChange({ ...service, icon: iconId })}
        onClose={() => setOpenIconPicker(false)}
      />

      {/* ── Custom Centered Confirmation Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        description={confirmModal.description}
        confirmText="Ya, Hapus Pilihan"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
