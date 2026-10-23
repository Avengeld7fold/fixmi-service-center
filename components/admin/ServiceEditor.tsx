"use client";
import AdminSymbol from "./AdminSymbol";


import { useState } from "react";
import { Plus } from "lucide-react";
import ServiceIcon from "@/components/pricelist/ServiceIcon";
import PriceGrid from "./PriceGrid";
import ConfirmModal from "./ConfirmModal";
import IconPickerModal from "./IconPickerModal";
import MacDisclosureButton from "./MacDisclosureButton";
import { MAX_VARIANTS, slugify, type ServiceType } from "@/lib/data";

interface ServiceEditorProps {
  service: ServiceType;
  categoryName: string;
  categorySlug?: string;
  onChange: (next: ServiceType) => void;
  onDelete: () => void;
  open: boolean;
  onToggle: () => void;
  isDragging?: boolean;
  isOver?: boolean;
  dragRowProps?: React.HTMLAttributes<HTMLElement>;
}

/**
 * macOS Service Editor Accordion Row (macOS 26 Tahoe Specification)
 * Referensi Resmi: Ref 06, Ref 28, Ref 29
 */
export default function ServiceEditor({
  service,
  categoryName,
  categorySlug,
  onChange,
  onDelete,
  open,
  onToggle,
  isDragging,
  isOver,
  dragRowProps,
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
      title: `Hapus Pilihan “${label}”?`,
      subtitle: `${label} · ${service.Name} (${categoryName})`,
      description: `Kolom pilihan “${label}” dan seluruh harga pada kolom ini akan dihapus dari tabel model perangkat.`,
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
        className={`admin-service relative overflow-hidden rounded-[12px] border transition-all duration-200 ${
          isDragging
            ? "opacity-90 scale-[1.01] border-primary/70 shadow-[0_16px_36px_rgba(0,0,0,0.3)] ring-2 ring-primary/40 z-30 bg-panel-raised"
            : isOver
            ? "border-primary ring-2 ring-primary/40 bg-primary/5 "
            : "border-panel-border bg-panel hover:border-black/20 dark:hover:border-white/20"
        }`}
      >
        {isOver && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_8px_rgba(0,122,255,0.6)] z-30 animate-pulse" />
        )}

        {/* Header service — macOS outline row style */}
        <div
          {...dragRowProps}
          className={`flex items-center gap-3 px-4 py-3 transition-colors select-none cursor-grab active:cursor-grabbing touch-none ${
            isDragging ? "bg-panel-raised" : "hover:bg-panel-raised/50"
          }`}
        >
          {/* ── Tombol Ubah Ikon ── */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setOpenIconPicker(true);
            }}
            title="Klik untuk mengganti ikon"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-panel-raised border border-panel-border transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97] group/icon cursor-pointer"
          >
            <ServiceIcon name={service.icon} className="h-4 w-4 text-primary group-hover/icon:scale-105 transition-transform" />
          </button>

          {/* ── Nama Layanan & Info ── */}
          <div className="flex-1 min-w-0 pointer-events-none">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground truncate">
              <span className="truncate">{service.Name}</span>
              {service.Name_en && (
                <span className="hidden sm:inline-block shrink-0 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 px-2 py-0.5 font-mono text-[10px] font-normal text-text-muted">
                  EN: {service.Name_en}
                </span>
              )}
            </div>
            <span className="block text-[11px] text-text-muted truncate mt-0.5">
              {service.Brand ? `${service.Brand} · ${service.Series} · ` : ""}
              {service.device_prices.length} model · {service.variants.length} pilihan kualitas
            </span>
          </div>

          {/* ── Tombol Toggle Accordion (macOS Disclosure Ref 27 & 28) ── */}
          <MacDisclosureButton
            expanded={open}
            size="regular"
            ariaLabel={open ? "Tutup panel layanan" : "Buka panel layanan"}
            ariaControls={panelId}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          />
        </div>

        {/* Panel kolaps */}
        <div
          id={panelId}
          inert={!open}
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            {/* Pengaturan layanan: nama service, icon picker, hirarki merk/series, dan hapus */}
            <div className="border-t border-panel-border px-4 py-3 bg-panel-raised/30">
              <p className="mb-2 text-[11px] font-medium text-text-muted">
                Pengaturan Layanan
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                {/* Tombol Ganti Ikon */}
                <button
                  type="button"
                  onClick={() => setOpenIconPicker(true)}
                  title="Ganti ikon layanan"
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-[7px] border border-panel-border bg-panel px-2.5 text-xs font-medium text-foreground transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97] shrink-0"
                >
                  <ServiceIcon name={service.icon} className="h-3 w-3 text-primary" />
                  <span>Ubah Ikon</span>
                </button>

                <input
                  value={service.Name}
                  onChange={(e) => onChange({ ...service, Name: e.target.value, title: e.target.value })}
                  placeholder="Nama layanan (ID)"
                  aria-label="Nama layanan (ID)"
                  className="flex-1 min-w-[150px] sm:min-w-[180px] h-7 rounded-[7px] border border-panel-border bg-background px-2.5 text-xs font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                <input
                  value={service.Name_en || ""}
                  onChange={(e) => onChange({ ...service, Name_en: e.target.value || undefined })}
                  placeholder="English Name (opsional)"
                  aria-label="Nama layanan (EN)"
                  className="flex-1 min-w-[150px] sm:min-w-[180px] h-7 rounded-[7px] border border-panel-border bg-background px-2.5 text-xs font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                />

                {/* Kolom Merk & Series hanya muncul di kategori Android atau layanan ber-Brand */}
                {(categorySlug === "android" || Boolean(service.Brand)) && (
                  <>
                    <input
                      value={brandDraft}
                      onChange={(e) => setBrandDraft(e.target.value)}
                      onBlur={commitHierarchy}
                      placeholder="Merk (opsional)"
                      aria-label="Merk perangkat"
                      className="flex-1 min-w-[120px] sm:min-w-[150px] h-7 rounded-[7px] border border-panel-border bg-background px-2.5 text-xs font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      value={seriesDraft}
                      onChange={(e) => setSeriesDraft(e.target.value)}
                      onBlur={commitHierarchy}
                      placeholder="Series (opsional)"
                      aria-label="Seri perangkat"
                      className="flex-1 min-w-[130px] sm:min-w-[160px] h-7 rounded-[7px] border border-panel-border bg-background px-2.5 text-xs font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={onDelete}
                  className="sm:ml-auto inline-flex h-7 items-center justify-center gap-1.5 rounded-[7px] border border-[#FF3B30]/25 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] px-2.5 text-xs font-medium transition-all active:scale-[0.97] shrink-0"
                >
<AdminSymbol name="trash" className="w-3.5 h-3.5 object-contain" />
                  <span>Hapus Layanan</span>
                </button>
              </div>
            </div>

            {/* Manajemen varian kualitas */}
            <div className="border-y border-panel-border px-4 py-3 bg-panel">
              <p className="mb-2 text-[11px] font-medium text-text-muted">
                Pilihan Kualitas Suku Cadang & Garansi
              </p>
              <div className="space-y-2">
                {service.variants.map((v) => (
                  <div key={v.Key} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      value={v.Label}
                      onChange={(e) => updateVariant(v.Key, "Label", e.target.value)}
                      aria-label={`Nama pilihan ${v.Key}`}
                      className="w-full sm:w-40 h-7 rounded-[7px] border border-panel-border bg-background px-2.5 font-mono text-xs font-semibold uppercase text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      value={v.Note}
                      onChange={(e) => updateVariant(v.Key, "Note", e.target.value)}
                      placeholder="Garansi (mis. 90 Hari)"
                      aria-label={`Keterangan garansi ${v.Key}`}
                      className="w-full sm:flex-1 h-7 rounded-[7px] border border-panel-border bg-background px-2.5 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <div className="flex justify-end sm:block">
                      <button
                        type="button"
                        onClick={() => removeVariant(v.Key)}
                        aria-label={`Hapus pilihan ${v.Label}`}
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] text-text-muted transition-all hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] active:scale-[0.97]"
                      >
<AdminSymbol name="trash" className="w-3.5 h-3.5 object-contain" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tambah varian kualitas */}
              {service.variants.length < MAX_VARIANTS && (
                <div className="mt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Nama kualitas (mis. OLED Premium)"
                    className="w-full sm:w-40 h-7 rounded-[7px] border border-panel-border bg-background px-2.5 font-mono text-xs uppercase text-foreground placeholder:text-text-muted placeholder:normal-case outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Garansi (opsional, mis. 90 Hari)"
                    className="w-full sm:flex-1 h-7 rounded-[7px] border border-panel-border bg-background px-2.5 text-xs text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex h-7 items-center justify-center gap-1 rounded-[7px] bg-primary hover:bg-[#0066D6] px-3 text-xs font-semibold text-white  transition-all active:scale-[0.97] shrink-0"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    <span>Tambah Kualitas</span>
                  </button>
                </div>
              )}
              {variantError && (
                <p role="alert" className="mt-1.5 text-xs text-[#FF3B30] font-medium">
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
