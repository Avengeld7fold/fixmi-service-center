"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronsUpDown } from "lucide-react";
import { savePricelistAction } from "@/app/admin/actions";
import ServiceEditor from "./ServiceEditor";
import ConfirmModal from "./ConfirmModal";
import IconPickerModal from "./IconPickerModal";
import ServiceIcon from "@/components/pricelist/ServiceIcon";
import { brandImage, slugify, type Category, type ServiceType } from "@/lib/data";

// Posisi UI yang bertahan melewati remount. Editor di-remount lewat
// key={version} setiap save/import/restore — tanpa ini admin selalu
// terlempar kembali ke tab pertama (iPhone) dan semua panel tertutup.
const uiPos: {
  cat: string | null;
  svcs: string[];
  brand: string | null;
  series: string | null;
} = { cat: null, svcs: [], brand: null, series: null };

function autoDetectIcon(name: string, brand?: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("lcd") || lower.includes("layar") || lower.includes("screen") || lower.includes("display")) return "smartphone";
  if (lower.includes("baterai") || lower.includes("battery") || lower.includes("batre")) return "battery";
  if (lower.includes("charger") || lower.includes("port") || lower.includes("cas") || lower.includes("charging")) return "plug";
  if (lower.includes("kamera") || lower.includes("camera") || lower.includes("lens")) return "camera";
  if (lower.includes("face id") || lower.includes("truedepth") || lower.includes("sensor")) return "scan-face";
  if (lower.includes("fingerprint") || lower.includes("touch id") || lower.includes("sidik jari")) return "fingerprint";
  if (lower.includes("touchscreen") || lower.includes("touch") || lower.includes("kaca depan")) return "touchpad";
  if (lower.includes("power") || lower.includes("on off") || lower.includes("flexible on") || lower.includes("tombol")) return "power";
  if (lower.includes("volume") || lower.includes("switch") || lower.includes("mute")) return "toggle-left";
  if (lower.includes("speaker") || lower.includes("buzzer") || lower.includes("earpiece") || lower.includes("suara")) return "volume-2";
  if (lower.includes("mic") || lower.includes("mikrofon")) return "mic";
  if (lower.includes("backdoor") || lower.includes("backglass") || lower.includes("housing") || lower.includes("casing") || lower.includes("body")) return "layers";
  if (lower.includes("mesin") || lower.includes("motherboard") || lower.includes("ic") || lower.includes("cpu") || lower.includes("mati total")) return "cpu";
  if (lower.includes("air") || lower.includes("water") || lower.includes("korosi") || lower.includes("pembersihan")) return "droplets";
  if (lower.includes("restorasi") || lower.includes("poles") || lower.includes("ganti kaca")) return "sparkles";

  // Cek apakah ada logo merk Android yang cocok
  if (brand && brandImage(brand)) {
    return `brand:${slugify(brand)}`;
  }
  if (brandImage(name)) {
    return `brand:${slugify(name)}`;
  }
  return "wrench";
}

export default function PricelistEditor({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [baseline, setBaseline] = useState(() => JSON.stringify(categories));
  const [draft, setDraft] = useState<Category[]>(() => structuredClone(categories));
  const [activeSlug, setActiveSlug] = useState(() =>
    uiPos.cat && categories.some((c) => c.Slug === uiPos.cat)
      ? uiPos.cat
      : categories[0]?.Slug ?? ""
  );

  // Multi-expandable services support
  const [openSvcSlugs, setOpenSvcSlugs] = useState<Set<string>>(
    () => new Set(uiPos.svcs)
  );
  const [openBrand, setOpenBrand] = useState<string | null>(() => uiPos.brand);
  const [openSeries, setOpenSeries] = useState<string | null>(() => uiPos.series);

  // Catat posisi ke uiPos setiap berubah
  useEffect(() => {
    uiPos.cat = activeSlug;
    uiPos.svcs = Array.from(openSvcSlugs);
    uiPos.brand = openBrand;
    uiPos.series = openSeries;
  }, [activeSlug, openSvcSlugs, openBrand, openSeries]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Form tambah layanan service baru
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newSeries, setNewSeries] = useState("");
  const [newIcon, setNewIcon] = useState("smartphone");
  const [iconManuallyPicked, setIconManuallyPicked] = useState(false);
  const [openAddIconPicker, setOpenAddIconPicker] = useState(false);
  const [addError, setAddError] = useState("");
  // Modal pemilih icon untuk level Merk Android
  const [brandIconModal, setBrandIconModal] = useState<{
    isOpen: boolean;
    brandName: string;
    currentIcon: string;
  }>({
    isOpen: false,
    brandName: "",
    currentIcon: "",
  });

  const updateBrandIcon = (brand: string, iconId: string) => {
    setMessage(null);
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.Slug !== activeCategory.Slug) return cat;
        const nextBrandIcons = {
          ...(cat.brand_icons || {}),
          [brand]: iconId,
        };
        return {
          ...cat,
          brand_icons: nextBrandIcons,
        };
      })
    );
  };

  const draftJson = JSON.stringify(draft);
  const dirty = draftJson !== baseline;
  const activeCategory = draft.find((c) => c.Slug === activeSlug) ?? draft[0];

  // ── Unsaved Changes Guard (beforeunload) ──
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const toggleSvc = (slug: string) => {
    setOpenSvcSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const expandAllSvcs = () => {
    setOpenSvcSlugs(new Set(activeCategory.service_types.map((s) => s.Slug)));
  };

  const collapseAllSvcs = () => {
    setOpenSvcSlugs(new Set());
  };

  const updateService = (svcSlug: string, next: ServiceType) => {
    setMessage(null);
    const prevSvc = activeCategory.service_types.find((s) => s.Slug === svcSlug);
    if (prevSvc && (prevSvc.Brand !== next.Brand || prevSvc.Series !== next.Series)) {
      const brand = next.Brand ?? null;
      setOpenBrand(brand);
      setOpenSeries(brand ? `${brand}::${next.Series ?? "Semua Model"}` : null);
    }
    setDraft((prev) =>
      prev.map((cat) =>
        cat.Slug !== activeCategory.Slug
          ? cat
          : { ...cat, service_types: cat.service_types.map((s) => (s.Slug === svcSlug ? next : s)) }
      )
    );
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const removeService = (svcSlug: string, svcLabel: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Jenis Layanan?",
      subtitle: `"${svcLabel}" · ${activeCategory.Name}`,
      description: `Apakah Anda yakin ingin menghapus layanan "${svcLabel}" beserta seluruh daftar harga modelnya dari kategori ${activeCategory.Name}? Perubahan akan berlaku permanen setelah disimpan.`,
      onConfirm: () => {
        setMessage(null);
        setDraft((prev) =>
          prev.map((cat) =>
            cat.Slug !== activeCategory.Slug
              ? cat
              : { ...cat, service_types: cat.service_types.filter((s) => s.Slug !== svcSlug) }
          )
        );
        setOpenSvcSlugs((prev) => {
          const next = new Set(prev);
          next.delete(svcSlug);
          return next;
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Mode form tambah: kategori ber-merk (Android) memakai 3 kolom
  // Merk (wajib) → Series (opsional) → jenis service; kategori lain cukup 1 kolom nama service.
  const brandedMode =
    activeCategory.service_types.some((s) => s.Brand) || activeCategory.Slug === "android";

  const handleNameChange = (val: string) => {
    setNewName(val);
    setAddError("");
    if (!iconManuallyPicked && (val.trim() || newBrand.trim())) {
      setNewIcon(autoDetectIcon(val, newBrand));
    }
  };

  const addService = () => {
    const name = newName.trim();
    const brand = brandedMode ? newBrand.trim() : "";
    const series = brandedMode ? newSeries.trim() : "";
    if (brandedMode && !brand)
      return setAddError("Merk wajib diisi — contoh: Samsung, Oppo, Xiaomi.");
    if (!name) return setAddError("Nama layanan perbaikan tidak boleh kosong — contoh: Service LCD / Ganti Baterai.");

    // Slug unik per kategori; service ber-merk memakai prefix "brand-series--"
    const base = brand ? `${slugify(`${brand} ${series}`)}--${slugify(name)}` : slugify(name);
    if (!base || base === "--") return setAddError("Nama layanan tidak valid.");
    let slug = base;
    for (let i = 2; activeCategory.service_types.some((s) => s.Slug === slug); i++) {
      slug = `${base}-${i}`;
    }

    const svc: ServiceType = {
      Name: name,
      Slug: slug,
      ...(brand ? { Brand: brand } : {}),
      ...(series ? { Series: series } : {}),
      icon: newIcon,
      variants: [{ Key: "harga", Label: "HARGA", Note: "" }],
      device_prices: [],
      title: "",
    };

    setMessage(null);
    setAddError("");
    setDraft((prev) =>
      prev.map((cat) =>
        cat.Slug !== activeCategory.Slug
          ? cat
          : { ...cat, service_types: [...cat.service_types, svc] }
      )
    );
    // Langsung buka layanan baru (beserta grup merk/series-nya bila ada).
    setOpenSvcSlugs((prev) => new Set([...prev, slug]));
    setOpenBrand(brand || null);
    setOpenSeries(brand ? `${brand}::${series || "Semua Model"}` : null);
    setNewName("");
    setNewBrand("");
    setNewSeries("");
    setNewIcon("smartphone");
    setIconManuallyPicked(false);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const result = await savePricelistAction(draftJson);
    setSaving(false);
    if (result.ok) {
      setBaseline(draftJson);
      setMessage({ kind: "ok", text: "Perubahan tersimpan — halaman /pricelist sudah diperbarui." });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: result.error ?? "Gagal menyimpan data." });
    }
  };

  const discard = () => {
    setConfirmModal({
      isOpen: true,
      title: "Batalkan Semua Perubahan?",
      description: "Seluruh perubahan yang belum Anda simpan akan dikembalikan ke data awal. Lanjutkan?",
      confirmText: "Ya, Batalkan",
      cancelText: "Kembali Mengedit",
      variant: "warning",
      onConfirm: () => {
        setDraft(JSON.parse(baseline));
        setMessage(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <>
      <div className="mt-8 space-y-6">
        {/* ── Tab Kategori (Smooth swipe on mobile) ── */}
        <div
          role="tablist"
          aria-label="Pilih kategori perangkat"
          className="flex items-center gap-2 border-b border-white/[0.08] pb-4 overflow-x-auto scrollbar-none sm:flex-wrap max-w-full"
        >
          {draft.map((c) => {
            const active = c.Slug === activeCategory.Slug;
            return (
              <button
                key={c.Slug}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveSlug(c.Slug);
                  setOpenBrand(null);
                  setOpenSeries(null);
                  setOpenSvcSlugs(new Set());
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 shrink-0 active:scale-[0.98] ${
                  active
                    ? "border border-primary/50 bg-white/[0.08] text-white shadow-[0_0_15px_rgba(255,107,0,0.1)] ring-1 ring-primary/20"
                    : "border border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span>{c.Name}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "bg-white/[0.06] text-neutral-400"
                  }`}
                >
                  {c.service_types.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Quick Expand Controls ── */}
        {activeCategory.service_types.length > 0 && (
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-mono uppercase tracking-wider text-[0.6875rem]">
              Daftar Layanan Service {activeCategory.Name} ({activeCategory.service_types.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAllSvcs}
                className="hover:text-primary transition-colors underline text-xs"
              >
                Buka Semua
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={collapseAllSvcs}
                className="hover:text-primary transition-colors underline text-xs"
              >
                Tutup Semua
              </button>
            </div>
          </div>
        )}

        {/* ── Form Tambah Layanan Baru ── */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-400">
            Tambah Layanan di {activeCategory.Name}
          </p>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
              {/* Tombol Pilih Ikon untuk Layanan Baru */}
              <button
                type="button"
                onClick={() => setOpenAddIconPicker(true)}
                title="Pilih ikon layanan"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white transition-all duration-150 hover:border-primary/50 hover:bg-white/[0.08] active:scale-95 shrink-0"
              >
                <span className="flex h-4 w-4 items-center justify-center text-primary">
                  <ServiceIcon name={newIcon} className="h-3.5 w-3.5" />
                </span>
                <span>Ikon</span>
              </button>

              {brandedMode && (
                <>
                  <input
                    value={newBrand}
                    onChange={(e) => {
                      setNewBrand(e.target.value);
                      setAddError("");
                    }}
                    placeholder="Merk (wajib), mis. Samsung"
                    aria-label="Merk layanan baru"
                    className="flex-1 min-w-[130px] sm:min-w-[160px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                  <input
                    value={newSeries}
                    onChange={(e) => {
                      setNewSeries(e.target.value);
                      setAddError("");
                    }}
                    placeholder="Series (opsional), mis. Galaxy A Series"
                    aria-label="Series layanan baru"
                    className="flex-1 min-w-[140px] sm:min-w-[180px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </>
              )}
              <input
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={
                  brandedMode
                    ? "Jenis perbaikan, mis. Service LCD / Baterai"
                    : "Nama layanan, mis. Ganti Baterai / Speaker"
                }
                aria-label="Jenis perbaikan layanan baru"
                className="flex-1 min-w-[160px] sm:min-w-[200px] rounded-xl border border-white/[0.10] bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-neutral-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-light hover:brightness-105 active:scale-95 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tambah Layanan</span>
              </button>
            </div>
            {addError && (
              <p role="alert" className="text-xs text-primary font-medium">
                {addError}
              </p>
            )}
          </div>
        </div>

        {/* Modal Pemilih Ikon untuk Layanan Baru */}
        <IconPickerModal
          isOpen={openAddIconPicker}
          currentIcon={newIcon}
          categorySlug={activeCategory.Slug}
          serviceTitle={newName ? `Layanan "${newName}"` : "Layanan Baru"}
          onSelect={(iconId) => {
            setNewIcon(iconId);
            setIconManuallyPicked(true);
          }}
          onClose={() => setOpenAddIconPicker(false)}
        />

        {/* ── Daftar Layanan Aktif ── */}
        <div key={activeCategory.Slug} className="fade-rise space-y-6">
          {(() => {
            const list = activeCategory.service_types;
            const branded = list.filter((s) => s.Brand);
            if (branded.length === 0) {
              return list.map((svc) => (
                <ServiceEditor
                  key={svc.Slug}
                  service={svc}
                  categoryName={activeCategory.Name}
                  categorySlug={activeCategory.Slug}
                  onChange={(next) => updateService(svc.Slug, next)}
                  onDelete={() => removeService(svc.Slug, svc.Name)}
                  open={openSvcSlugs.has(svc.Slug)}
                  onToggle={() => toggleSvc(svc.Slug)}
                />
              ));
            }

            const brands = new Map<string, Map<string, typeof branded>>();
            for (const s of branded) {
              const b = s.Brand!;
              const ser = s.Series || "Semua Model";
              if (!brands.has(b)) brands.set(b, new Map());
              const sm = brands.get(b)!;
              if (!sm.has(ser)) sm.set(ser, []);
              sm.get(ser)!.push(s);
            }

            const renderEditors = (svcList: typeof branded) =>
              svcList.map((svc) => (
                <ServiceEditor
                  key={`${svc.Slug}|${svc.Brand ?? ""}|${svc.Series ?? ""}`}
                  service={svc}
                  categoryName={activeCategory.Name}
                  categorySlug={activeCategory.Slug}
                  onChange={(next) => updateService(svc.Slug, next)}
                  onDelete={() =>
                    removeService(
                      svc.Slug,
                      svc.Brand ? `${svc.Brand} · ${svc.Series} · ${svc.Name}` : svc.Name
                    )
                  }
                  open={openSvcSlugs.has(svc.Slug)}
                  onToggle={() => toggleSvc(svc.Slug)}
                />
              ));

            return (
              <>
                {[...brands.entries()].map(([brand, seriesMap]) => {
                  const brandOpen = openBrand === brand;
                  const svcCount = [...seriesMap.values()].reduce((n, l) => n + l.length, 0);
                  const namedSeries = [...seriesMap.keys()].filter((k) => k !== "Semua Model").length;
                  return (
                    <div
                      key={brand}
                      className="overflow-hidden rounded-[12px] border border-panel-border bg-panel"
                    >
                      {/* ── Level merk ── */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenBrand((prev) => (prev === brand ? null : brand));
                          setOpenSeries(null);
                        }}
                        aria-expanded={brandOpen}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left outline-none transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised"
                      >
                        {/* ── Tombol Ganti Ikon Merk ── */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            const current =
                              activeCategory.brand_icons?.[brand] || `brand:${slugify(brand)}`;
                            setBrandIconModal({
                              isOpen: true,
                              brandName: brand,
                              currentIcon: current,
                            });
                          }}
                          title={`Klik untuk mengganti logo/ikon merk ${brand}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-panel-raised font-mono text-base font-bold text-primary transition-all hover:bg-white/[0.15] hover:scale-105 active:scale-95 group/brand-icon cursor-pointer border border-transparent hover:border-white/20 shadow-sm"
                        >
                          {activeCategory.brand_icons?.[brand] ? (
                            <ServiceIcon
                              name={activeCategory.brand_icons[brand]}
                              className="h-6 w-6 object-contain group-hover/brand-icon:scale-110 transition-transform"
                            />
                          ) : brandImage(brand) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={brandImage(brand)!}
                              alt={`Logo ${brand}`}
                              className="h-6 w-6 object-contain group-hover/brand-icon:scale-110 transition-transform"
                              loading="lazy"
                            />
                          ) : (
                            brand.charAt(0)
                          )}
                        </span>
                        <span className="flex-1">
                          <span className="block text-base font-semibold text-foreground">{brand}</span>
                          <span className="block text-xs text-text-muted">
                            {namedSeries > 0
                              ? `${namedSeries} series · ${svcCount} jenis service`
                              : `${svcCount} jenis service`}
                          </span>
                        </span>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-panel-border bg-background text-text-muted transition-transform duration-200 ${
                            brandOpen ? "rotate-180 text-primary border-primary/40" : ""
                          }`}
                          aria-hidden="true"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </button>

                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-out"
                        style={{ gridTemplateRows: brandOpen ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <div className="space-y-3 border-t border-panel-border px-4 py-4 lg:px-5">
                            {[...seriesMap.entries()].map(([series, svcList]) => {
                              const seriesKey = `${brand}::${series}`;
                              const seriesOpen = openSeries === seriesKey;
                              if (series === "Semua Model") {
                                return (
                                  <div key={seriesKey} className="space-y-3">
                                    {renderEditors(svcList)}
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={seriesKey}
                                  className="overflow-hidden rounded-[10px] border border-panel-border bg-background/40"
                                >
                                  {/* ── Level series ── */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenSeries((prev) => (prev === seriesKey ? null : seriesKey));
                                    }}
                                    aria-expanded={seriesOpen}
                                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised"
                                  >
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                                    <span className="flex-1 text-sm font-medium text-foreground">{series}</span>
                                    <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-text-muted">
                                      {svcList.length} service
                                    </span>
                                    <span
                                      className={`flex h-7 w-7 items-center justify-center rounded-lg border border-panel-border bg-background text-text-muted transition-transform duration-200 ${
                                        seriesOpen ? "rotate-180 text-primary border-primary/40" : ""
                                      }`}
                                      aria-hidden="true"
                                    >
                                      <ChevronDown className="h-3.5 w-3.5" />
                                    </span>
                                  </button>

                                  <div
                                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                                    style={{ gridTemplateRows: seriesOpen ? "1fr" : "0fr" }}
                                  >
                                    <div className="overflow-hidden">
                                      <div className="space-y-3 border-t border-panel-border p-3">
                                        {renderEditors(svcList)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>

        {/* ── Floating Sticky Save Bar ── */}
        {dirty && (
          <div className="sticky bottom-4 z-30 mt-8 rounded-2xl border border-primary/50 bg-[#141416]/95 p-3.5 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-white">
                  Ada perubahan yang belum disimpan
                </span>
              </div>
              <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={discard}
                  disabled={saving}
                  className="flex-1 sm:flex-initial rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs sm:text-sm font-medium text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50 active:scale-95 text-center"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="flex-1 sm:flex-initial rounded-xl bg-primary px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-light hover:brightness-105 disabled:opacity-50 active:scale-95 text-center"
                >
                  {saving ? "Menyimpan…" : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <p
            role="status"
            className={`mt-4 text-sm font-medium ${
              message.kind === "ok" ? "text-emerald-400" : "text-primary"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* ── Custom Centered Confirmation Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText || "Ya, Lanjutkan"}
        cancelText={confirmModal.cancelText || "Batal"}
        variant={confirmModal.variant || "danger"}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* ── Modal Pemilih Ikon Merk Android ── */}
      <IconPickerModal
        isOpen={brandIconModal.isOpen}
        currentIcon={brandIconModal.currentIcon}
        categorySlug={activeCategory.Slug}
        serviceTitle={`Merk "${brandIconModal.brandName}"`}
        onSelect={(iconId) => {
          updateBrandIcon(brandIconModal.brandName, iconId);
          setBrandIconModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setBrandIconModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
