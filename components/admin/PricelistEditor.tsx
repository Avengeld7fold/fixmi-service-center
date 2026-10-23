"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@/components/admin/AdminIcons";
import { savePricelistAction } from "@/app/admin/actions";
import ServiceEditor from "./ServiceEditor";
import ConfirmModal from "./ConfirmModal";
import MacDisclosureButton from "./MacDisclosureButton";
import IconPickerModal from "./IconPickerModal";
import ServiceIcon from "@/components/pricelist/ServiceIcon";
import { brandImage, slugify, type Category, type ServiceType } from "@/lib/data";
import { moveBrandServices } from "@/lib/pricelist-order";

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

export default function PricelistEditor({
  categories,
  initialCategorySlug,
}: {
  categories: Category[];
  initialCategorySlug?: string;
}) {
  const router = useRouter();
  const slugs = categories.map((c) => c.Slug);

  const [baseline, setBaseline] = useState(() => JSON.stringify(categories));
  const [draft, setDraft] = useState<Category[]>(() => structuredClone(categories));
  const [activeSlug, setActiveSlug] = useState(() => {
    if (initialCategorySlug && slugs.includes(initialCategorySlug)) {
      return initialCategorySlug;
    }
    return uiPos.cat && slugs.includes(uiPos.cat) ? uiPos.cat : (categories[0]?.Slug ?? "");
  });

  const isRestoredRef = useRef(false);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Multi-expandable services support dengan persistensi sessionStorage & URL hash
  // Inisialisasi awal identik antara Server & Client untuk mencegah hydration mismatch error
  const [openSvcSlugs, setOpenSvcSlugs] = useState<Set<string>>(() => new Set());
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  // 1. Matikan auto scroll restoration browser & pulihkan state accordion dan posisi scroll saat mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    try {
      const storedSvcs = sessionStorage.getItem(`fixmi_admin_open_svcs_${activeSlug}`);
      if (storedSvcs) {
        const parsed = JSON.parse(storedSvcs);
        if (Array.isArray(parsed)) {
          // Restore persisted editor UI state after the browser has mounted.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setOpenSvcSlugs(new Set(parsed));
        }
      } else if (window.location.hash) {
        const hashSlug = window.location.hash.replace(/^#/, "");
        if (hashSlug) setOpenSvcSlugs(new Set([hashSlug]));
      }

      const storedBrand = sessionStorage.getItem(`fixmi_admin_brand_${activeSlug}`);
      if (storedBrand) setOpenBrand(storedBrand);

      const storedSeries = sessionStorage.getItem(`fixmi_admin_series_${activeSlug}`);
      if (storedSeries) setOpenSeries(storedSeries);
    } catch {}

    // Pulihkan posisi scroll yang tersimpan sebelum refresh
    const savedY =
      sessionStorage.getItem(`fixmi_admin_scroll_y_${activeSlug}`) ||
      sessionStorage.getItem("fixmi_admin_scroll_y");

    let t1: NodeJS.Timeout | undefined;
    let t2: NodeJS.Timeout | undefined;
    let t3: NodeJS.Timeout | undefined;

    if (savedY) {
      const targetY = parseInt(savedY, 10);
      if (!isNaN(targetY) && targetY > 0) {
        window.scrollTo({ top: targetY, behavior: "instant" });
        requestAnimationFrame(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
        });
        t1 = setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
        }, 60);
        t2 = setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
        }, 180);
        t3 = setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
        }, 350);
      }
    }

    const tRestore = setTimeout(() => {
      isRestoredRef.current = true;
    }, 100);

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
      clearTimeout(tRestore);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Simpan posisi scroll secara real-time saat user melakukan scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    const recordScroll = () => {
      const y = window.scrollY;
      sessionStorage.setItem("fixmi_admin_scroll_y", String(y));
      if (activeSlug) {
        sessionStorage.setItem(`fixmi_admin_scroll_y_${activeSlug}`, String(y));
      }
    };

    window.addEventListener("scroll", recordScroll, { passive: true });
    window.addEventListener("beforeunload", recordScroll);

    return () => {
      window.removeEventListener("scroll", recordScroll);
      window.removeEventListener("beforeunload", recordScroll);
    };
  }, [activeSlug]);

  // 3. Catat posisi accordion ke uiPos dan sessionStorage setiap berubah
  useEffect(() => {
    if (!isRestoredRef.current) return;

    uiPos.cat = activeSlug;
    uiPos.svcs = Array.from(openSvcSlugs);
    uiPos.brand = openBrand;
    uiPos.series = openSeries;

    if (typeof window !== "undefined" && activeSlug) {
      try {
        sessionStorage.setItem(
          `fixmi_admin_open_svcs_${activeSlug}`,
          JSON.stringify(Array.from(openSvcSlugs))
        );
        if (openBrand) sessionStorage.setItem(`fixmi_admin_brand_${activeSlug}`, openBrand);
        else sessionStorage.removeItem(`fixmi_admin_brand_${activeSlug}`);
        if (openSeries) sessionStorage.setItem(`fixmi_admin_series_${activeSlug}`, openSeries);
        else sessionStorage.removeItem(`fixmi_admin_series_${activeSlug}`);
      } catch {}
    }
  }, [activeSlug, openSvcSlugs, openBrand, openSeries]);

  // Navigasi tab kategori secara instan & mulus (zero lag, zero glitch, zero flickering)
  const handleSelectCategory = (slug: string, shouldPushState = true) => {
    if (slug === activeSlug) return;
    setActiveSlug(slug);

    // Update URL di browser secara shallow tanpa memicu network roundtrip RSC atau re-render server
    if (shouldPushState && typeof window !== "undefined") {
      window.history.pushState(null, "", `/admin/pricelist/${slug}`);
    }

    // Pulihkan state layanan yang terbuka untuk kategori yang baru dipilih dari sessionStorage
    try {
      const storedSvcs = sessionStorage.getItem(`fixmi_admin_open_svcs_${slug}`);
      setOpenSvcSlugs(storedSvcs ? new Set(JSON.parse(storedSvcs)) : new Set());
      const storedBrand = sessionStorage.getItem(`fixmi_admin_brand_${slug}`);
      setOpenBrand(storedBrand || null);
      const storedSeries = sessionStorage.getItem(`fixmi_admin_series_${slug}`);
      setOpenSeries(storedSeries || null);
    } catch {
      setOpenSvcSlugs(new Set());
      setOpenBrand(null);
      setOpenSeries(null);
    }

    // Pertahankan posisi scroll saat ini 100% di posisi user berada (tetap di 20%, 50%, dll)
    if (typeof window !== "undefined") {
      const currentY = window.scrollY;
      sessionStorage.setItem("fixmi_admin_scroll_y", String(currentY));
      sessionStorage.setItem(`fixmi_admin_scroll_y_${slug}`, String(currentY));
    }
  };

  // Tangani tombol Back / Forward browser tanpa memicu flickering
  useEffect(() => {
    const handlePopState = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && slugs.includes(last) && last !== activeSlug) {
        handleSelectCategory(last, false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs, activeSlug]);

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

  // Pulihkan draf ketikan Tambah Layanan saat activeSlug berubah atau mount
  useEffect(() => {
    if (typeof window !== "undefined" && activeSlug) {
      try {
        const draftStr = sessionStorage.getItem(`fixmi_admin_draft_add_${activeSlug}`);
        if (draftStr) {
          const parsed = JSON.parse(draftStr);
          // Restore the draft only after the browser has mounted.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (parsed.name) setNewName(parsed.name);
          if (parsed.brand) setNewBrand(parsed.brand);
          if (parsed.series) setNewSeries(parsed.series);
          if (parsed.icon) setNewIcon(parsed.icon);
        } else {
          setNewName("");
          setNewBrand("");
          setNewSeries("");
          setNewIcon("smartphone");
        }
      } catch {}
    }
  }, [activeSlug]);

  // Simpan draf saat admin mengetik
  useEffect(() => {
    if (typeof window !== "undefined" && activeSlug) {
      try {
        if (newName || newBrand || newSeries) {
          sessionStorage.setItem(
            `fixmi_admin_draft_add_${activeSlug}`,
            JSON.stringify({
              name: newName,
              brand: newBrand,
              series: newSeries,
              icon: newIcon,
            })
          );
        } else {
          sessionStorage.removeItem(`fixmi_admin_draft_add_${activeSlug}`);
        }
      } catch {}
    }
  }, [newName, newBrand, newSeries, newIcon, activeSlug]);

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
      if (typeof window !== "undefined" && activeSlug) {
        try {
          sessionStorage.setItem(
            `fixmi_admin_open_svcs_${activeSlug}`,
            JSON.stringify(Array.from(next))
          );
        } catch {}
      }
      return next;
    });
  };

  const expandAllSvcs = () => {
    const all = new Set(activeCategory.service_types.map((s) => s.Slug));
    setOpenSvcSlugs(all);
    if (typeof window !== "undefined" && activeSlug) {
      try {
        sessionStorage.setItem(
          `fixmi_admin_open_svcs_${activeSlug}`,
          JSON.stringify(Array.from(all))
        );
      } catch {}
    }
  };

  const collapseAllSvcs = () => {
    setOpenSvcSlugs(new Set());
    if (typeof window !== "undefined" && activeSlug) {
      try {
        sessionStorage.setItem(
          `fixmi_admin_open_svcs_${activeSlug}`,
          JSON.stringify([])
        );
      } catch {}
    }
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

  // ── Hold & Drag Reorder State (iPhone style) ──
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const [overSlug, setOverSlug] = useState<string | null>(null);
  const draggingSlugRef = useRef<string | null>(null);
  const overSlugRef = useRef<string | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragActiveRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const moveServiceBySlug = (fromSlug: string, toSlug: string) => {
    if (!fromSlug || !toSlug || fromSlug === toSlug) return;
    setDraft((prev) =>
      prev.map((cat) => {
        if (cat.Slug !== activeCategory.Slug) return cat;
        const list = [...cat.service_types];
        const fromIdx = list.findIndex((s) => s.Slug === fromSlug);
        const toIdx = list.findIndex((s) => s.Slug === toSlug);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return cat;
        const [moved] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, moved);
        return { ...cat, service_types: list };
      })
    );
    setMessage(null);
  };

  const createDragRowProps = (slug: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      // Hanya izinkan primary button (left click) atau layar sentuh
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      // Jangan mulai drag jika yang diklik adalah tombol ikon atau chevron
      if (target.closest("button")) return;

      const clientX = e.clientX;
      const clientY = e.clientY;
      startPosRef.current = { x: clientX, y: clientY };
      isDragActiveRef.current = false;
      draggingSlugRef.current = slug;

      const currentTarget = e.currentTarget;
      try {
        currentTarget.setPointerCapture(e.pointerId);
      } catch {}

      // Timer hold ~160ms seperti haptic touch di iPhone
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        isDragActiveRef.current = true;
        setDraggingSlug(slug);
        setOverSlug(null);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
      }, 160);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (!draggingSlugRef.current) return;

      // Jika drag bergerak melebihi 6px sebelum timer selesai, langsung aktifkan drag
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      if (!isDragActiveRef.current && (dy > 6 || dx > 6)) {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        isDragActiveRef.current = true;
        setDraggingSlug(slug);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
      }

      if (!isDragActiveRef.current) return;

      // Auto-scroll saat mendekati batas atas/bawah layar
      const y = e.clientY;
      if (y < 90) {
        window.scrollBy({ top: -14, behavior: "auto" });
      } else if (y > window.innerHeight - 90) {
        window.scrollBy({ top: 14, behavior: "auto" });
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el?.closest<HTMLElement>("[data-service-slug]");
      const targetSlug = card?.dataset.serviceSlug;
      if (targetSlug && targetSlug !== slug) {
        if (overSlugRef.current !== targetSlug) {
          overSlugRef.current = targetSlug;
          setOverSlug(targetSlug);
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            try {
              navigator.vibrate(15);
            } catch {}
          }
        }
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

      const from = draggingSlugRef.current;
      const wasDrag = isDragActiveRef.current;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      if (wasDrag && from) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const card = el?.closest<HTMLElement>("[data-service-slug]");
        const targetSlug = card?.dataset.serviceSlug || overSlugRef.current;

        if (targetSlug && targetSlug !== from) {
          moveServiceBySlug(from, targetSlug);
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            try {
              navigator.vibrate(35);
            } catch {}
          }
        }
      } else if (!wasDrag && from === slug) {
        // Bukan drag (hanya tap singkat) -> buka/tutup accordion
        toggleSvc(slug);
      }

      draggingSlugRef.current = null;
      overSlugRef.current = null;
      isDragActiveRef.current = false;
      setDraggingSlug(null);
      setOverSlug(null);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      draggingSlugRef.current = null;
      overSlugRef.current = null;
      isDragActiveRef.current = false;
      setDraggingSlug(null);
      setOverSlug(null);
    },
  });

  const [draggingBrand, setDraggingBrand] = useState<string | null>(null);
  const [overBrand, setOverBrand] = useState<string | null>(null);
  const brandDragRef = useRef<string | null>(null);
  const brandOverRef = useRef<string | null>(null);
  const brandHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandScrollFrameRef = useRef<number | null>(null);
  const brandDragActiveRef = useRef(false);
  const brandStartRef = useRef({ x: 0, y: 0 });
  const brandPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => () => {
    if (brandHoldRef.current) clearTimeout(brandHoldRef.current);
    if (brandScrollFrameRef.current !== null) cancelAnimationFrame(brandScrollFrameRef.current);
  }, []);

  const moveBrand = (fromBrand: string, toBrand: string) => {
    if (fromBrand === toBrand) return;
    setDraft((prev) => prev.map((cat) => cat.Slug === activeSlug
      ? { ...cat, service_types: moveBrandServices(cat.service_types, fromBrand, toBrand) }
      : cat
    ));
    setMessage(null);
  };

  const resetBrandDrag = () => {
    if (brandHoldRef.current) clearTimeout(brandHoldRef.current);
    if (brandScrollFrameRef.current !== null) cancelAnimationFrame(brandScrollFrameRef.current);
    brandHoldRef.current = null;
    brandScrollFrameRef.current = null;
    brandDragRef.current = null;
    brandOverRef.current = null;
    brandDragActiveRef.current = false;
    setDraggingBrand(null);
    setOverBrand(null);
  };

  const updateBrandOver = (brand: string, x: number, y: number) => {
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-brand-name]");
    const targetBrand = target?.dataset.brandName ?? null;
    if (targetBrand !== brandOverRef.current) {
      brandOverRef.current = targetBrand;
      setOverBrand(targetBrand === brand ? null : targetBrand);
    }
  };

  const scrollBrandWhileHeld = (brand: string) => {
    const { x, y } = brandPointerRef.current;
    const step = y < 90 ? -14 : y > window.innerHeight - 90 ? 14 : 0;
    if (!brandDragActiveRef.current || !step) {
      brandScrollFrameRef.current = null;
      return;
    }
    window.scrollBy(0, step);
    updateBrandOver(brand, x, y);
    brandScrollFrameRef.current = requestAnimationFrame(() => scrollBrandWhileHeld(brand));
  };

  const createBrandDragProps = (brand: string) => ({
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement).closest("[data-brand-action]")) return;
      brandDragRef.current = brand;
      brandStartRef.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
      brandHoldRef.current = setTimeout(() => {
        brandDragActiveRef.current = true;
        setDraggingBrand(brand);
        navigator.vibrate?.(25);
      }, 160);
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (brandDragRef.current !== brand) return;
      if (!brandDragActiveRef.current) {
        const dx = Math.abs(event.clientX - brandStartRef.current.x);
        const dy = Math.abs(event.clientY - brandStartRef.current.y);
        if (dx > 6 || dy > 6) {
          if (brandHoldRef.current) clearTimeout(brandHoldRef.current);
          brandHoldRef.current = null;
          brandDragRef.current = null;
        }
        return;
      }

      brandPointerRef.current = { x: event.clientX, y: event.clientY };
      updateBrandOver(brand, event.clientX, event.clientY);
      if (brandScrollFrameRef.current === null && (event.clientY < 90 || event.clientY > window.innerHeight - 90)) {
        brandScrollFrameRef.current = requestAnimationFrame(() => scrollBrandWhileHeld(brand));
      }
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const wasDrag = brandDragActiveRef.current;
      const fromBrand = brandDragRef.current;
      if (wasDrag) {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-brand-name]");
        const targetBrand = target?.dataset.brandName ?? brandOverRef.current;
        if (targetBrand && targetBrand !== brand) moveBrand(brand, targetBrand);
      } else if (fromBrand === brand) {
        setOpenBrand((prev) => (prev === brand ? null : brand));
        setOpenSeries(null);
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      resetBrandDrag();
    },
    onPointerCancel: resetBrandDrag,
  });

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
      title: `Hapus Layanan “${svcLabel}”?`,
      subtitle: `${svcLabel} · ${activeCategory.Name}`,
      description: `Layanan “${svcLabel}” dan seluruh harga model di dalamnya akan dihapus dari katalog ${activeCategory.Name}.`,
      confirmText: "Hapus",
      cancelText: "Batal",
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
          if (typeof window !== "undefined" && activeSlug) {
            try {
              sessionStorage.setItem(
                `fixmi_admin_open_svcs_${activeSlug}`,
                JSON.stringify(Array.from(next))
              );
            } catch {}
          }
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
      variants: [{ Key: "harga", Label: "HARGA", Label_en: "PRICE", Note: "" }],
      device_prices: [{ DeviceModel: "", prices: { harga: null } }],
      title: name,
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
    setOpenSvcSlugs((prev) => {
      const next = new Set([...prev, slug]);
      if (typeof window !== "undefined" && activeSlug) {
        try {
          sessionStorage.setItem(
            `fixmi_admin_open_svcs_${activeSlug}`,
            JSON.stringify(Array.from(next))
          );
        } catch {}
      }
      return next;
    });
    setOpenBrand(brand || null);
    setOpenSeries(brand ? `${brand}::${series || "Semua Model"}` : null);
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-service-slug="${slug}"]`)
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          block: "center",
        });
    });
    setNewName("");
    setNewBrand("");
    setNewSeries("");
    setNewIcon("smartphone");
    setIconManuallyPicked(false);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`fixmi_admin_draft_add_${activeSlug}`);
        window.history.replaceState(null, "", `/admin/pricelist/${activeSlug}#${slug}`);
      } catch {}
    }
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
      title: "Buang Semua Perubahan?",
      description: "Perubahan yang belum Anda simpan akan dibuang dan kembali ke data tersimpan.",
      confirmText: "Buang Perubahan",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: () => {
        setDraft(JSON.parse(baseline));
        setMessage(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <>
      <div className="admin-catalog space-y-4">
        {/* ── macOS Segmented Control Tab Kategori (Ref 49, 50) ── */}
        <div
          ref={tabBarRef}
          role="tablist"
          aria-label="Pilih kategori perangkat"
          className="admin-category-tabs sticky top-0 z-20 flex items-center justify-start border-b border-panel-border py-2.5 -mx-2 px-2 bg-background/90 backdrop-blur-[20px] overflow-x-auto scrollbar-none sm:flex-wrap max-w-full transition-colors"
        >
          <div className="inline-flex p-1 rounded-[10px] bg-black/5 dark:bg-white/10 border border-black/[0.05] dark:border-white/[0.08]  gap-0.5">
            {draft.map((c) => {
              const active = c.Slug === activeCategory.Slug;
              return (
                <button
                  key={c.Slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleSelectCategory(c.Slug)}
                  className={`inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-xs font-medium transition-all duration-120 shrink-0 select-none active:scale-[0.98] ${
                    active
                      ? "bg-primary text-white shadow-[0_1px_2px_rgba(0,122,255,0.3)] font-semibold"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{c.Name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-semibold transition-colors ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {c.service_types.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Quick Expand Controls ── */}
        {activeCategory.service_types.length > 0 && (
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="admin-section-label">
              Daftar Layanan Service {activeCategory.Name} ({activeCategory.service_types.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAllSvcs}
                className="admin-button admin-button--plain hover:text-primary transition-colors underline text-xs"
              >
                Buka Semua
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={collapseAllSvcs}
                className="admin-button admin-button--plain hover:text-primary transition-colors underline text-xs"
              >
                Tutup Semua
              </button>
            </div>
          </div>
        )}

        {/* ── macOS grouped form: layanan baru ── */}
        <section className="admin-add-service rounded-[12px] border border-panel-border bg-panel p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-foreground">Tambah layanan</h2>
            <p id="admin-add-service-help" className="mt-1 text-xs text-text-muted">
              {brandedMode
                ? "Tentukan merk, seri bila perlu, lalu nama perbaikannya."
                : `Buat jenis perbaikan baru untuk ${activeCategory.Name}.`}{" "}
              Satu baris model langsung disiapkan agar Anda bisa mengisi harga.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              addService();
            }}
            className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:items-end ${
              brandedMode
                ? "xl:grid-cols-[minmax(130px,1fr)_minmax(140px,1fr)_minmax(170px,1.2fr)_auto_auto]"
                : "xl:grid-cols-[minmax(180px,1fr)_auto_auto]"
            }`}
          >
            {brandedMode && (
              <>
                <label className="admin-add-service-field grid gap-1.5 text-xs font-medium text-foreground">
                  Merk <span className="text-text-muted">(wajib)</span>
                  <input
                    value={newBrand}
                    onChange={(e) => {
                      setNewBrand(e.target.value);
                      setAddError("");
                    }}
                    placeholder="Mis. Samsung atau Xiaomi"
                    aria-label="Merk layanan baru"
                    aria-required="true"
                    aria-describedby={addError ? "admin-add-service-error" : undefined}
                    className="min-h-11 w-full rounded-[8px] border border-panel-border bg-background px-3 text-sm font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 sm:min-h-9"
                  />
                </label>
                <label className="admin-add-service-field grid gap-1.5 text-xs font-medium text-foreground">
                  Seri <span className="text-text-muted">(opsional)</span>
                  <input
                    value={newSeries}
                    onChange={(e) => {
                      setNewSeries(e.target.value);
                      setAddError("");
                    }}
                    placeholder="Mis. Galaxy A Series"
                    aria-label="Seri layanan baru"
                    className="min-h-11 w-full rounded-[8px] border border-panel-border bg-background px-3 text-sm font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 sm:min-h-9"
                  />
                </label>
              </>
            )}
            <label className="admin-add-service-field grid gap-1.5 text-xs font-medium text-foreground">
              Nama layanan
              <input
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Mis. Ganti LCD atau Baterai"
                aria-label="Nama layanan baru"
                aria-required="true"
                aria-describedby={addError ? "admin-add-service-error" : undefined}
                className="min-h-11 w-full rounded-[8px] border border-panel-border bg-background px-3 text-sm font-medium text-foreground placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 sm:min-h-9"
              />
            </label>
            <div className="grid gap-1.5 text-xs font-medium text-foreground">
              <span>Ikon layanan</span>
              <button
                type="button"
                onClick={() => setOpenAddIconPicker(true)}
                title="Pilih ikon layanan"
                aria-label="Pilih ikon layanan"
                className="admin-button inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[8px] border border-panel-border bg-panel-raised px-3 text-xs font-medium text-foreground transition-all hover:bg-black/5 active:scale-[0.97] dark:hover:bg-white/10 sm:min-h-9"
              >
                <ServiceIcon name={newIcon} className="h-4 w-4 text-primary" />
                <span>Pilih ikon</span>
              </button>
            </div>
            <button
              type="submit"
              className="admin-button admin-button--primary inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[8px] bg-primary px-4 text-sm font-semibold text-white transition-all hover:bg-[#0066D6] active:scale-[0.97] sm:col-span-2 xl:col-span-1 sm:min-h-9"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Buat layanan</span>
            </button>
            {addError && (
              <p id="admin-add-service-error" role="alert" className="text-xs font-medium text-[#FF3B30] sm:col-span-2 xl:col-span-full">
                {addError}
              </p>
            )}
          </form>
        </section>

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
        <div className="admin-service-list">
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
                  isDragging={draggingSlug === svc.Slug}
                  isOver={overSlug === svc.Slug}
                  dragRowProps={createDragRowProps(svc.Slug)}
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
                  isDragging={draggingSlug === svc.Slug}
                  isOver={overSlug === svc.Slug}
                  dragRowProps={createDragRowProps(svc.Slug)}
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
                      data-brand-name={brand}
                      className={`overflow-hidden rounded-[12px] border bg-panel transition-colors ${
                        overBrand === brand && draggingBrand !== brand
                          ? "border-primary ring-2 ring-primary/40"
                          : draggingBrand === brand ? "border-primary/70 opacity-80" : "border-panel-border"
                      }`}
                    >
                      {/* ── Level merk ── */}
                      <button
                        type="button"
                        {...createBrandDragProps(brand)}
                        aria-expanded={brandOpen}
                        aria-label={`${brand}. Tahan lalu geser untuk mengubah urutan, atau ketuk untuk membuka.`}
                        className={`flex w-full min-w-0 touch-none select-none cursor-grab active:cursor-grabbing items-center gap-2 px-3 py-4 text-left outline-none transition-colors focus-visible:bg-panel-raised sm:gap-4 sm:px-5 ${
                          draggingBrand === brand ? "bg-panel-raised" : "hover:bg-panel-raised"
                        }`}
                      >
                        {/* ── Tombol Ganti Ikon Merk ── */}
                        <span
                          data-brand-action
                          onPointerDown={(e) => e.stopPropagation()}
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
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-panel-raised font-mono text-base font-bold text-primary transition-all hover:bg-white/[0.15] hover:scale-105 active:scale-95 group/brand-icon cursor-pointer border border-transparent hover:border-white/20 "
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
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-semibold text-foreground">{brand}</span>
                          <span className="block text-xs text-text-muted">
                            {namedSeries > 0
                              ? `${namedSeries} series · ${svcCount} jenis service`
                              : `${svcCount} jenis service`}
                          </span>
                        </span>
                        <MacDisclosureButton expanded={brandOpen} size="regular" asSpan />
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
                                    className="admin-button flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-panel-raised focus-visible:bg-panel-raised"
                                  >
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                                    <span className="flex-1 text-sm font-medium text-foreground">{series}</span>
                                    <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-text-muted">
                                      {svcList.length} service
                                    </span>
                                    <MacDisclosureButton expanded={seriesOpen} size="small" asSpan />
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

        {/* ── macOS Floating Save Dock (Ref 09, 10, 17) ── */}
        {dirty && (
          <div className="sticky bottom-4 z-30 mt-8 rounded-[18px] border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#252528]/90 p-3 sm:px-4 sm:py-3 shadow-[0_20px_50px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[40px] saturate-[180%]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0 shadow-[0_0_8px_rgba(0,122,255,0.6)]" />
                <span className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                  Ada perubahan yang belum disimpan
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={discard}
                  disabled={saving}
                  className="admin-button flex-1 sm:flex-initial rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C] hover:bg-[#D8D8DC] dark:hover:bg-[#48484A] text-neutral-900 dark:text-white px-4 py-1.5 text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50 text-center"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="admin-button admin-button--primary flex-1 sm:flex-initial rounded-full bg-primary hover:bg-[#0066D6] text-white px-5 py-1.5 text-xs font-semibold  transition-all active:scale-[0.97] disabled:opacity-50 text-center"
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
        confirmText={confirmModal.confirmText || "Hapus"}
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
