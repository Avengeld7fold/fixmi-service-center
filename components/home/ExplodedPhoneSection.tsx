"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/context";
import { 
  BatteryCharging, 
  Camera, 
  Cpu, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Wrench, 
  Volume2, 
  ScanFace,
  X,
  Clock,
  Info
} from "lucide-react";

// ── Urutan 13 Layer dari angka tertinggi (13) ke angka terkecil (1) ──
interface LayerDefinition {
  step: number;        // Step 1 s/d 13
  fileNumber: number;  // 13 down to 1
  file: string;
  name: string;
  subName: string;
  calloutId?: string;
}

const ALL_13_LAYERS: LayerDefinition[] = [
  { step: 1,  fileNumber: 13, file: "/images/services/13.webp", name: "Ceramic Shield Front Glass", subName: "Kaca Depan & Pelindung", calloutId: "screen" },
  { step: 2,  fileNumber: 12, file: "/images/services/12.webp", name: "Super Retina XDR OLED Display", subName: "Panel Layar 120Hz ProMotion", calloutId: "screen" },
  { step: 3,  fileNumber: 11, file: "/images/services/11.webp", name: "Internal Thermal Shield Plate", subName: "Pelat Pendingin & Bracket", calloutId: "screen" },
  { step: 4,  fileNumber: 10, file: "/images/services/10.webp", name: "TrueDepth & Face ID Array", subName: "Kamera Depan & Biometrik", calloutId: "faceid" },
  { step: 5,  fileNumber: 9,  file: "/images/services/9.webp",  name: "True Tone Flash & LiDAR Sensor", subName: "Flash & Sensor Kedalaman", calloutId: "camera" },
  { step: 6,  fileNumber: 8,  file: "/images/services/8.webp",  name: "Triple Camera Module & OIS", subName: "Sistem 3 Lensa & Sensor", calloutId: "camera" },
  { step: 7,  fileNumber: 7,  file: "/images/services/7.webp",  name: "A-Series Bionic CPU & Power IC", subName: "Chipset & Manajemen Daya", calloutId: "motherboard" },
  { step: 8,  fileNumber: 6,  file: "/images/services/6.webp",  name: "Logic Board Main PCB", subName: "Papan Sirkuit Utama", calloutId: "motherboard" },
  { step: 9,  fileNumber: 5,  file: "/images/services/5.webp",  name: "High-Capacity Li-Ion Battery", subName: "Baterai Utama & Modul BMS", calloutId: "battery" },
  { step: 10, fileNumber: 4,  file: "/images/services/4.webp",  name: "Charging Port & Sub-Board Flex", subName: "Konektor Port USB-C", calloutId: "speaker-housing" },
  { step: 11, fileNumber: 3,  file: "/images/services/3.webp",  name: "Loudspeaker & Taptic Engine", subName: "Audio Bawah & Motor Getar", calloutId: "speaker-housing" },
  { step: 12, fileNumber: 2,  file: "/images/services/2.webp",  name: "MagSafe & Wireless Charging Coil", subName: "Induksi Pengisian Nirkabel", calloutId: "battery" },
  { step: 13, fileNumber: 1,  file: "/images/services/1.webp",  name: "Titanium Chassis & Back Glass", subName: "Bodi & Rangka Belakang", calloutId: "speaker-housing" },
];

// ── 6 Layanan Callout Lingkaran dengan Rentang Scroll Perjalanan (revealStart -> revealEnd) ──
interface ServiceCallout {
  id: string;
  name: string;
  code: string;
  side: "left" | "right";
  layerRange: string;
  minStep: number;
  revealStart: number;
  revealEnd: number;
  circleImage: string;
  icon: typeof Smartphone;
  hotspot: { x: number; y: number };
  symptoms: string[];
  fixmiSolution: string;
  estimatedTime: string;
  categoryLink: string;
}

const SERVICE_CALLOUTS: ServiceCallout[] = [
  {
    id: "screen",
    name: "Layar & Glass",
    code: "DISPLAY // 13 & 12",
    side: "left",
    layerRange: "Layer 13 & 12",
    minStep: 1,
    revealStart: 0.00,
    revealEnd: 0.12,
    circleImage: "/images/services/13.webp",
    icon: Smartphone,
    hotspot: { x: 50, y: 18 },
    symptoms: ["Kaca Retak / Pecah", "Garis Hijau / Blank Hitam", "Ghost Touch / Tidak Responsif"],
    fixmiSolution: "Penggantian Layar OLED Original + Pemindahan IC Touch & Kalibrasi TrueTone.",
    estimatedTime: "25 - 40 Menit",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "faceid",
    name: "Face ID Sensor",
    code: "BIOMETRICS // 10",
    side: "left",
    layerRange: "Layer 10",
    minStep: 4,
    revealStart: 0.18,
    revealEnd: 0.32,
    circleImage: "/images/services/10.webp",
    icon: ScanFace,
    hotspot: { x: 50, y: 8 },
    symptoms: ["Face ID 'Move a bit lower'", "Kamera Depan Mati", "Sensor Proximity Earpiece Error"],
    fixmiSolution: "Restorasi Dot Projector & Infrared Camera tanpa ganti modul utuh (Face ID tetap aktif).",
    estimatedTime: "1 - 2 Jam",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "battery",
    name: "Baterai & MagSafe",
    code: "POWER // 5 & 2",
    side: "left",
    layerRange: "Layer 5 & 2",
    minStep: 9,
    revealStart: 0.58,
    revealEnd: 0.74,
    circleImage: "/images/services/5.webp",
    icon: BatteryCharging,
    hotspot: { x: 40, y: 55 },
    symptoms: ["Battery Health <80% / Service", "Baterai Kembung / Drop Cepat", "Sering Mati Mendadak"],
    fixmiSolution: "Sel Baterai High-Capacity Grade A+ dengan pemindahan modul BMS (tanpa pesan error).",
    estimatedTime: "20 - 30 Menit",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "camera",
    name: "Kamera & Lensa",
    code: "OPTICS // 9 & 8",
    side: "right",
    layerRange: "Layer 9 & 8",
    minStep: 5,
    revealStart: 0.30,
    revealEnd: 0.46,
    circleImage: "/images/services/8.webp",
    icon: Camera,
    hotspot: { x: 26, y: 14 },
    symptoms: ["Kaca Lensa Pecah / Baret", "Kamera Bergetar / Suara Mendengung", "Hasil Foto Buram / Bercak"],
    fixmiSolution: "Penggantian Kaca Safir Laser Cut & Modul Sensor Original di ruang steril bebas debu.",
    estimatedTime: "30 - 45 Menit",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "motherboard",
    name: "Logic Board & CPU",
    code: "MOTHERBOARD // 7 & 6",
    side: "right",
    layerRange: "Layer 7 & 6",
    minStep: 7,
    revealStart: 0.44,
    revealEnd: 0.60,
    circleImage: "/images/services/6.webp",
    icon: Cpu,
    hotspot: { x: 74, y: 32 },
    symptoms: ["Mati Total (Short Circuit)", "IC Power / Baseband No Service", "Restart Terus Menerus"],
    fixmiSolution: "Pengerjaan Mikrosolder Mikroskop Level 4, Reballing CPU Dual-Layer, & Pemulihan Jalur.",
    estimatedTime: "1 - 3 Hari (Diagnosa Teliti)",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "speaker-housing",
    name: "Housing & Port",
    code: "CHASSIS // 4, 3, 1",
    side: "right",
    layerRange: "Layer 4, 3, 1",
    minStep: 10,
    revealStart: 0.72,
    revealEnd: 0.88,
    circleImage: "/images/services/1.webp",
    icon: Volume2,
    hotspot: { x: 50, y: 88 },
    symptoms: ["Kaca Belakang Hancur", "Tidak Bisa Cas / Port Goyang", "Suara Speaker Kresek / Kecil"],
    fixmiSolution: "Penggantian Backglass Laser Presisi Tanpa Bongkar Mesin & Ganti Fleksibel Charging Port.",
    estimatedTime: "40 - 60 Menit",
    categoryLink: "/pricelist/iphone",
  },
];

interface NodeSpatialInfo {
  dotX: number;
  dotY: number;
  finalCircleX: number;
  finalCircleY: number;
  dx: number;
  dy: number;
}

// ── De Casteljau Subcurve: Menghitung Kurva Parsial yang Tumbuh Mulus dari Titik iPhone ke Lingkaran ──
function getCubicBezierSubcurve(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const clampT = Math.max(0.001, Math.min(1, t));

  // Level 1
  const q1x = p0.x * (1 - clampT) + p1.x * clampT;
  const q1y = p0.y * (1 - clampT) + p1.y * clampT;
  const q2x = p1.x * (1 - clampT) + p2.x * clampT;
  const q2y = p1.y * (1 - clampT) + p2.y * clampT;
  const q3x = p2.x * (1 - clampT) + p3.x * clampT;
  const q3y = p2.y * (1 - clampT) + p3.y * clampT;

  // Level 2
  const r1x = q1x;
  const r1y = q1y;
  const r2x = q1x * (1 - clampT) + q2x * clampT;
  const r2y = q1y * (1 - clampT) + q2y * clampT;
  const r3x = q2x * (1 - clampT) + q3x * clampT;
  const r3y = q2y * (1 - clampT) + q3y * clampT;

  // Level 3 (Titik Ujung pada Parameter t)
  const s0x = p0.x;
  const s0y = p0.y;
  const s1x = r1x;
  const s1y = r1y;
  const s2x = r2x;
  const s2y = r2y;
  const s3x = r2x * (1 - clampT) + r3x * clampT;
  const s3y = r2y * (1 - clampT) + r3y * clampT;

  return {
    pathD: `M ${s0x} ${s0y} C ${s1x} ${s1y}, ${s2x} ${s2y}, ${s3x} ${s3y}`,
    tipX: s3x,
    tipY: s3y,
  };
}

// ── Komponen Lingkaran Callout Bersih & Minimalis (Emil Kowalski Tactile Motion) ──
function InspectionCircleNode({
  callout,
  isActive,
  isRevealed,
  onClick,
  onMouseEnter,
}: {
  callout: ServiceCallout;
  isActive: boolean;
  isRevealed: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="flex flex-col items-center gap-2.5 group cursor-pointer select-none active:scale-[0.94] transition-transform duration-150 ease-out"
    >
      {/* Circular Image Node with Glowing Border */}
      <div
        id={`callout-circle-node-${callout.id}`}
        className={`relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-2 p-1 transition-[transform,border-color,box-shadow,background-color] duration-200 ease-out backdrop-blur-md ${
          isActive && isRevealed
            ? "border-primary bg-primary/15 shadow-[0_0_28px_rgba(255,107,0,0.55)] scale-110 ring-4 ring-primary/25"
            : "border-white/25 bg-[#141418] hover:border-primary/80 hover:scale-105 hover:shadow-[0_0_18px_rgba(255,107,0,0.35)]"
        }`}
      >
        {/* Inner Circular Viewport */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A0A0C] flex items-center justify-center">
          <Image
            src={callout.circleImage}
            alt={callout.name}
            fill
            className="object-contain p-2.5 group-hover:scale-115 transition-transform duration-250 ease-out drop-shadow-md"
          />
          {/* Dark overlay with inspection icon on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out flex items-center justify-center">
            <Info className="w-5 h-5 text-primary animate-bounce" />
          </div>
        </div>
      </div>

      {/* Component Title Label Below Circle */}
      <div className="text-center">
        <span className="font-mono text-xs text-neutral-200 font-semibold tracking-wide block group-hover:text-primary transition-colors duration-150">
          {callout.name}
        </span>
        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">
          Klik untuk Detail
        </span>
      </div>
    </div>
  );
}

export default function ExplodedPhoneSection() {
  const { dict, getLocalizedPath } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageGridRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  const [activeCalloutId, setActiveCalloutId] = useState<string>("screen");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAssembled, setIsAssembled] = useState<boolean>(false);
  const [spatialMap, setSpatialMap] = useState<Record<string, NodeSpatialInfo>>({});
  
  // State modal popover detail saat lingkaran diklik
  const [modalCallout, setModalCallout] = useState<ServiceCallout | null>(null);

  // Komponen / Part yang sedang aktif (sesuai lingkaran oranye yang aktif)
  const activeCallout = SERVICE_CALLOUTS.find((c) => c.id === activeCalloutId) || SERVICE_CALLOUTS[0];

  // ── GSAP Timeline: Sequential Assembly dari 13.webp (Layer 13) ke 1.webp (Layer 1) ──
  useGSAP(
    () => {
      if (!layersContainerRef.current) return;

      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
      if (layers.length !== 13) return;

      // Initial state:
      gsap.set(layers[0], {
        opacity: 1,
        y: 0,
        z: 0,
        scale: 1,
        transformPerspective: 1400,
        transformOrigin: "center center",
      });

      for (let i = 1; i < layers.length; i++) {
        gsap.set(layers[i], {
          opacity: 0,
          y: -130,
          z: 150,
          scale: 1.1,
          transformPerspective: 1400,
          transformOrigin: "center center",
        });
      }

      // Standalone timeline dikendalikan secara presisi oleh wheel/touch di area gambar
      const stepDuration = 0.5;
      const overlap = 0.15;
      const tl = gsap.timeline({ paused: true });

      for (let i = 1; i < layers.length; i++) {
        const startTime = (i - 1) * (stepDuration - overlap);
        tl.to(
          layers[i],
          {
            opacity: 1,
            y: 0,
            z: 0,
            scale: 1,
            ease: "power2.out",
            duration: stepDuration,
          },
          startTime
        );
      }

      timelineRef.current = tl;
    },
    { scope: containerRef }
  );

  // ── Wheel & Touch Scrubbing: rAF Exponential Lerp Loop 120fps (Apple / Emil Fluid Motion) ──
  useEffect(() => {
    const phoneEl = layersContainerRef.current;
    if (!phoneEl) return;

    let isHovered = false;
    let rafId: number | null = null;

    const startRaf = () => {
      if (rafId !== null) return;
      const tick = () => {
        const target = targetProgressRef.current;
        const current = currentProgressRef.current;
        const diff = target - current;

        if (Math.abs(diff) > 0.0002) {
          // Exponential smoothing lerp (Apple CADisplayLink feel)
          const nextVal = current + diff * 0.16;
          currentProgressRef.current = nextVal;
          setScrollProgress(nextVal);

          if (timelineRef.current) {
            timelineRef.current.progress(nextVal);
          }

          const activeStep = Math.min(13, Math.max(1, Math.floor(nextVal * 12.9) + 1));
          setCurrentStep(activeStep);
          setIsAssembled(nextVal > 0.92);

          const currentLayerDef = ALL_13_LAYERS[activeStep - 1];
          if (currentLayerDef && currentLayerDef.calloutId) {
            setActiveCalloutId(currentLayerDef.calloutId);
          }

          rafId = requestAnimationFrame(tick);
        } else {
          currentProgressRef.current = target;
          setScrollProgress(target);
          if (timelineRef.current) {
            timelineRef.current.progress(target);
          }
          const activeStep = Math.min(13, Math.max(1, Math.floor(target * 12.9) + 1));
          setCurrentStep(activeStep);
          setIsAssembled(target > 0.92);

          const currentLayerDef = ALL_13_LAYERS[activeStep - 1];
          if (currentLayerDef && currentLayerDef.calloutId) {
            setActiveCalloutId(currentLayerDef.calloutId);
          }

          rafId = null;
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
    };

    const handleWheel = (e: WheelEvent) => {
      // Jika kursor DI LUAR area gambar ponsel, biarkan website scroll normal
      if (!isHovered) return;

      const delta = e.deltaY;
      const speed = 0.0015; // Kecepatan scrub responsif & presisi

      const current = targetProgressRef.current;
      const next = Math.max(0, Math.min(1, current + delta * speed));

      // Jika masih dalam proses merakit/membongkar (0 < prog < 1), cegah scroll website
      if ((delta > 0 && current < 1) || (delta < 0 && current > 0)) {
        e.preventDefault();
        e.stopPropagation();

        targetProgressRef.current = next;
        startRaf();
      }
    };

    // Touch Swipe Gesture untuk Perangkat Mobile
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;
      startY = currentY;

      const speed = 0.0032;
      const current = targetProgressRef.current;
      const next = Math.max(0, Math.min(1, current + deltaY * speed));

      if ((deltaY > 0 && current < 1) || (deltaY < 0 && current > 0)) {
        e.preventDefault();
        targetProgressRef.current = next;
        startRaf();
      }
    };

    phoneEl.addEventListener("mouseenter", handleMouseEnter);
    phoneEl.addEventListener("mouseleave", handleMouseLeave);
    phoneEl.addEventListener("wheel", handleWheel, { passive: false });
    phoneEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    phoneEl.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      phoneEl.removeEventListener("mouseenter", handleMouseEnter);
      phoneEl.removeEventListener("mouseleave", handleMouseLeave);
      phoneEl.removeEventListener("wheel", handleWheel);
      phoneEl.removeEventListener("touchstart", handleTouchStart);
      phoneEl.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // ── Hitung Koordinat Vektor Spasial Titik Tengah (Dot) & Posisi Akhir Lingkaran ──
  useEffect(() => {
    const updateSpatialMap = () => {
      const grid = stageGridRef.current;
      const phone = layersContainerRef.current;
      if (!grid || !phone) return;

      const gridRect = grid.getBoundingClientRect();
      const phoneRect = phone.getBoundingClientRect();

      const newMap: Record<string, NodeSpatialInfo> = {};

      SERVICE_CALLOUTS.forEach((callout) => {
        const circleNodeEl = document.getElementById(`callout-circle-node-${callout.id}`);
        if (!circleNodeEl) return;

        const nodeRect = circleNodeEl.getBoundingClientRect();

        // Posisi dot tengah pada iPhone
        const dotX = phoneRect.left - gridRect.left + (phoneRect.width * callout.hotspot.x) / 100;
        const dotY = phoneRect.top - gridRect.top + (phoneRect.height * callout.hotspot.y) / 100;

        // Posisi anchor akhir lingkaran persis pada tepi lingkaran
        const finalCircleX =
          callout.side === "left"
            ? nodeRect.right - gridRect.left + 3
            : nodeRect.left - gridRect.left - 3;
        const finalCircleY = nodeRect.top - gridRect.top + nodeRect.height / 2;

        newMap[callout.id] = {
          dotX,
          dotY,
          finalCircleX,
          finalCircleY,
          dx: 0,
          dy: 0,
        };
      });

      setSpatialMap(newMap);
    };

    updateSpatialMap();
    window.addEventListener("resize", updateSpatialMap);
    window.addEventListener("scroll", updateSpatialMap);

    const t1 = setTimeout(updateSpatialMap, 50);
    const t2 = setTimeout(updateSpatialMap, 200);
    const t3 = setTimeout(updateSpatialMap, 600);
    const t4 = setTimeout(updateSpatialMap, 1200);

    return () => {
      window.removeEventListener("resize", updateSpatialMap);
      window.removeEventListener("scroll", updateSpatialMap);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // ── Hitung Progress Perjalanan Mulus (Travel Progress 0.0 -> 1.0) untuk Setiap Komponen ──
  const getCalloutTravelProgress = (callout: ServiceCallout) => {
    if (scrollProgress < callout.revealStart) return 0;
    if (scrollProgress >= callout.revealEnd) return 1;
    const raw = (scrollProgress - callout.revealStart) / (callout.revealEnd - callout.revealStart);
    // Smooth cubic ease out
    return Math.min(1, Math.max(0, 1 - Math.pow(1 - raw, 3)));
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#121212] text-white select-none py-12 sm:py-16 lg:py-20">
      
      {/* ── MAIN STAGE CONTAINER ── */}
      <div className="relative w-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-12 overflow-hidden">
        
        {/* Background Ambient Glow & Blueprint Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[38rem] w-[38rem] rounded-full bg-primary/10 blur-[150px]" />

        {/* ── HEADER TITLE ── */}
        <div className="relative z-20 text-center max-w-3xl mx-auto mb-4">
          <h2
            className="font-bayon text-3xl sm:text-4xl lg:text-5xl uppercase leading-[0.95] tracking-[-0.01em] text-[#f5f5f5]"
            style={{
              fontFamily: "var(--font-bayon), sans-serif",
            }}
          >
            {dict.teardown.heading}
          </h2>

          {/* Active Sparepart / Service Component Pill Mengikuti Lingkaran & Garis Oranye yang Aktif */}
          <div className="mt-3.5 sm:mt-4 inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-neutral-300 bg-white/[0.04] border border-primary/40 rounded-full px-3.5 sm:px-4 py-1 sm:py-1.5 shadow-lg backdrop-blur-md transition-all duration-200">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-white font-bold tracking-wide transition-colors duration-150">
              {activeCallout?.name || "Layar & Glass"}
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE 3-COLUMN CALLOUT STAGE ── */}
        <div
          ref={stageGridRef}
          className="relative z-20 w-full max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-6 my-auto"
        >
          {/* ── DYNAMIC ORGANIC SVG DASHED LEADER LINES (DESKTOP) ── */}
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-30"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="activeLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FF6B00" floodOpacity="0.9" />
              </filter>
              <linearGradient id="activeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFA040" />
                <stop offset="50%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF4500" />
              </linearGradient>
            </defs>

            {SERVICE_CALLOUTS.map((callout) => {
              const t = getCalloutTravelProgress(callout);
              const spatial = spatialMap[callout.id];
              if (!spatial || t <= 0.01) return null;

              // Titik Awal: Dot pada iPhone
              const p0 = { x: spatial.dotX, y: spatial.dotY };
              // Titik Akhir: Tepi Lingkaran Target
              const p3 = { x: spatial.finalCircleX, y: spatial.finalCircleY };

              // Control Points Kurva Gelombang Organik
              let p1: { x: number; y: number };
              let p2: { x: number; y: number };

              if (callout.side === "left") {
                const dx = p0.x - p3.x;
                p1 = { x: p0.x - dx * 0.45, y: p0.y };
                p2 = { x: p3.x + dx * 0.35, y: p3.y };
              } else {
                const dx = p3.x - p0.x;
                p1 = { x: p0.x + dx * 0.45, y: p0.y };
                p2 = { x: p3.x - dx * 0.35, y: p3.y };
              }

              // Hitung subkurva yang tumbuh dari dot iPhone (p0) mengarah ke lingkaran (p3) saat scroll t berjalan
              const { pathD, tipX, tipY } = getCubicBezierSubcurve(p0, p1, p2, p3, t);

              const isActive = activeCalloutId === callout.id;

              return (
                <g
                  key={callout.id}
                  style={{ opacity: Math.min(1, t * 1.5) }}
                  className="cursor-pointer group/line"
                  onMouseEnter={() => setActiveCalloutId(callout.id)}
                  onClick={() => setActiveCalloutId(callout.id)}
                >
                  {/* Invisible broad stroke hit area for easy clicking on the line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={28}
                    className="cursor-pointer pointer-events-auto"
                  />

                  {/* Organic Wave / Curved Dashed Line (Tumbuh Mulai dari Dot iPhone ke Lingkaran) */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isActive ? "url(#activeLineGrad)" : "rgba(255, 255, 255, 0.4)"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? "6 5" : "4 4"}
                    strokeLinecap="round"
                    filter={isActive ? "url(#activeLineGlow)" : undefined}
                    className={`transition-[stroke,stroke-width] duration-200 pointer-events-none ${
                      isActive ? "animate-pulse" : "group-hover/line:stroke-primary/80"
                    }`}
                  />

                  {/* Leading Pulse Dot on Tip of Growing Line */}
                  <circle
                    cx={tipX}
                    cy={tipY}
                    r={isActive ? 4.5 : 3}
                    fill={isActive ? "#FF6B00" : "rgba(255, 255, 255, 0.9)"}
                    stroke={isActive ? "#FFFFFF" : "none"}
                    strokeWidth={1.5}
                    className="pointer-events-none"
                  />
                </g>
              );
            })}
          </svg>

          {/* ── LEFT CALLOUT COLUMN: CIRCULAR ZOOM NODES (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 justify-around items-center min-h-[480px]">
            {SERVICE_CALLOUTS.filter((p) => p.side === "left").map((callout) => {
              const t = getCalloutTravelProgress(callout);
              const isActive = activeCalloutId === callout.id;
              const scale = 0.9 + t * 0.1;
              const isRevealed = t > 0.35;

              return (
                <div
                  key={callout.id}
                  id={`callout-circle-${callout.id}`}
                  style={{
                    transform: `scale(${scale})`,
                    opacity: t,
                    pointerEvents: isRevealed ? "auto" : "none",
                    willChange: "transform, opacity",
                  }}
                  className="transition-[opacity,transform] duration-200 ease-out"
                >
                  <InspectionCircleNode
                    callout={callout}
                    isActive={isActive}
                    isRevealed={isRevealed}
                    onMouseEnter={() => {
                      if (isRevealed) {
                        setActiveCalloutId(callout.id);
                      }
                    }}
                    onClick={() => {
                      if (isRevealed) {
                        setActiveCalloutId(callout.id);
                        setModalCallout(callout);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── CENTER: SEQUENTIAL 13-LAYER IPHONE ASSEMBLY WITH DEPTH OF FIELD FOCUS (13.webp -> 1.webp) ── */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center py-2">
            
            {/* Clean Transparent Phone Stage Container (Tanpa Kotak / Ring) */}
            <div
              ref={layersContainerRef}
              className="relative w-[280px] sm:w-[320px] md:w-[350px] lg:w-[380px] h-[520px] sm:h-[580px] md:h-[620px] lg:h-[660px] flex items-center justify-center"
              style={{
                perspective: 1400,
                transformStyle: "preserve-3d",
              }}
            >
              {/* 13-Layer Sequence Stack with Depth of Field (DoF) Optical Focus */}
              {ALL_13_LAYERS.map((layer, index) => {
                const layerStep = index + 1;
                const isCurrentActiveLayer = currentStep === layerStep;
                const isRevealedLayer = currentStep >= layerStep;

                // Cinematic Depth of Field: Layer yang sedang aktif bersinar terang, layer lain sedikit lembut & redup
                const dofFilter = isAssembled
                  ? "none"
                  : isCurrentActiveLayer
                  ? "brightness(1.18) contrast(1.08) drop-shadow(0 0 18px rgba(255,107,0,0.25))"
                  : "brightness(0.68) blur(0.6px)";

                return (
                  <div
                    key={layer.fileNumber}
                    ref={(el) => {
                      layerRefs.current[index] = el;
                    }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none transition-[filter] duration-250 ease-out"
                    style={{
                      transformStyle: "preserve-3d",
                      willChange: "transform, opacity, filter",
                      zIndex: index + 1,
                      filter: isRevealedLayer ? dofFilter : "none",
                    }}
                  >
                    {/* Layer PNG/WebP Graphic */}
                    <div className="relative w-full h-full">
                      <Image
                        src={layer.file}
                        alt={layer.name}
                        fill
                        priority
                        className="object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.85)]"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Interactive Pulsing Hotspot Dots */}
              <div className="absolute inset-0 z-40 pointer-events-auto">
                {SERVICE_CALLOUTS.map((callout) => {
                  const t = getCalloutTravelProgress(callout);
                  const isActive = activeCalloutId === callout.id;

                  return (
                    <button
                      key={callout.id}
                      type="button"
                      onMouseEnter={() => {
                        if (t > 0.3) {
                          setActiveCalloutId(callout.id);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (t > 0.3) {
                          // Klik pada dot mengaktifkan highlight lingkaran & garis tanpa membuka kartu modal
                          setActiveCalloutId(callout.id);
                        }
                      }}
                      style={{
                        left: `${callout.hotspot.x}%`,
                        top: `${callout.hotspot.y}%`,
                        transform: `translate(-50%, -50%) scale(${t})`,
                        opacity: t,
                        pointerEvents: t > 0.4 ? "auto" : "none",
                        willChange: "transform, opacity",
                      }}
                      className="group absolute flex items-center justify-center focus:outline-none cursor-pointer active:scale-90 transition-transform duration-150 ease-out"
                      aria-label={`Pilih komponen ${callout.name}`}
                    >
                      {/* Outer Glowing Pulsing Ring (Animasi Pulsa Kedip-kedip Aktif) */}
                      <span
                        className={`absolute w-10 h-10 rounded-full transition-[transform,background-color] duration-200 ease-out ${
                          isActive
                            ? "bg-primary/60 scale-125 animate-ping"
                            : "bg-white/30 animate-pulse group-hover:bg-primary/40 group-hover:scale-110"
                        }`}
                      />
                      {/* Middle Solid White/Orange Ring */}
                      <span
                        className={`relative flex items-center justify-center w-5 h-5 rounded-full border transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
                          isActive
                            ? "bg-primary border-white shadow-[0_0_16px_#FF6B00]"
                            : "bg-neutral-900 border-white group-hover:border-primary"
                        }`}
                      >
                        {/* Inner Core Bullet */}
                        <span
                          className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                            isActive ? "bg-white" : "bg-primary"
                          }`}
                        />
                      </span>

                      {/* Floating Tooltip Pill */}
                      <span className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/95 border border-primary/40 px-2 py-0.5 font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl">
                        {callout.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Minimalist Apple-Style Scroll Cue (Hanya muncul sebelum perakitan dimulai & memudar halus saat discroll) */}
              <div
                className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-[transform,opacity] duration-300 ease-out flex flex-col items-center gap-1.5 ${
                  scrollProgress < 0.05
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-3 scale-95"
                }`}
              >
                {/* Animated Mouse Wheel Capsule */}
                <div className="w-5 h-8 rounded-full border border-primary/70 bg-black/60 backdrop-blur-md flex justify-center pt-1.5 shadow-[0_0_18px_rgba(255,107,0,0.4)]">
                  <span className="w-1 h-2 rounded-full bg-primary animate-bounce" />
                </div>
                {/* Sleek Instruction Badge */}
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-200 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 whitespace-nowrap shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Scroll Disini
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT CALLOUT COLUMN: CIRCULAR ZOOM NODES (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 justify-around items-center min-h-[480px]">
            {SERVICE_CALLOUTS.filter((p) => p.side === "right").map((callout) => {
              const t = getCalloutTravelProgress(callout);
              const isActive = activeCalloutId === callout.id;
              const scale = 0.9 + t * 0.1;
              const isRevealed = t > 0.35;

              return (
                <div
                  key={callout.id}
                  id={`callout-circle-${callout.id}`}
                  style={{
                    transform: `scale(${scale})`,
                    opacity: t,
                    pointerEvents: isRevealed ? "auto" : "none",
                    willChange: "transform, opacity",
                  }}
                  className="transition-[opacity,transform] duration-200 ease-out"
                >
                  <InspectionCircleNode
                    callout={callout}
                    isActive={isActive}
                    isRevealed={isRevealed}
                    onMouseEnter={() => {
                      if (isRevealed) {
                        setActiveCalloutId(callout.id);
                      }
                    }}
                    onClick={() => {
                      if (isRevealed) {
                        setActiveCalloutId(callout.id);
                        setModalCallout(callout);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── MOBILE CIRCULAR HORIZONTAL BAR ── */}
          <div className="flex lg:hidden col-span-1 w-full justify-start sm:justify-center gap-3 overflow-x-auto py-3 px-2 scrollbar-none touch-pan-x select-none">
            {SERVICE_CALLOUTS.map((callout) => {
              const t = getCalloutTravelProgress(callout);
              const isActive = activeCalloutId === callout.id;

              return (
                <button
                  key={callout.id}
                  type="button"
                  onMouseEnter={() => {
                    if (t > 0.5) {
                      setActiveCalloutId(callout.id);
                    }
                  }}
                  onClick={() => {
                    if (t > 0.7) {
                      setActiveCalloutId(callout.id);
                      setModalCallout(callout);
                    }
                  }}
                  style={{
                    transform: `scale(${0.5 + t * 0.5})`,
                    opacity: t,
                    pointerEvents: t > 0.7 ? "auto" : "none",
                  }}
                  className="flex flex-col items-center gap-1.5 focus:outline-none shrink-0 active:scale-95 transition-[transform,opacity] duration-150 ease-out"
                >
                  <div
                    className={`w-14 h-14 rounded-full border-2 p-0.5 transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out ${
                      isActive && t > 0.7
                        ? "border-primary bg-primary/20 scale-105 shadow-[0_0_16px_rgba(255,107,0,0.5)]"
                        : "border-white/20 bg-[#141418]"
                    }`}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A0A0C]">
                      <Image
                        src={callout.circleImage}
                        alt={callout.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-300 whitespace-nowrap">
                    {callout.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER DOTS BAR ── */}
        <div className="relative z-20 w-full max-w-md mx-auto text-center mt-6">
          {/* Visual Step Dots Bar: Step 1 (13.webp) ke Step 13 (1.webp) */}
          <div className="flex items-center justify-center gap-1.5">
            {ALL_13_LAYERS.map((layer) => (
              <span
                key={layer.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  layer.step <= currentStep
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE DETAIL MODAL POPOVER (APPLE-GRADE SUB-300MS EASING) ── */}
      {modalCallout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-opacity duration-200 ease-out animate-in fade-in"
          onClick={() => setModalCallout(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-primary/70 bg-[#121216]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(255,107,0,0.35)] transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in zoom-in-95 slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button — Tactile Active Press Feedback */}
            <button
              type="button"
              onClick={() => setModalCallout(null)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/15 active:scale-90 transition-[transform,background-color,color] duration-150 ease-out"
              aria-label="Tutup Detail"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Thumbnail + Title */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-primary/60 bg-primary/10 p-1 shrink-0 overflow-hidden shadow-[0_0_24px_rgba(255,107,0,0.35)] ring-2 ring-primary/20">
                <Image
                  src={modalCallout.circleImage}
                  alt={modalCallout.name}
                  fill
                  className="object-contain p-2 drop-shadow-lg scale-110"
                />
              </div>
              <div>
                <span className="font-mono text-xs text-primary uppercase tracking-wider block font-semibold">
                  {modalCallout.code}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] leading-tight mt-0.5">
                  {modalCallout.name}
                </h3>
                <span className="font-mono text-[11px] text-neutral-400 mt-1 inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Estimasi: <strong className="text-white">{modalCallout.estimatedTime}</strong>
                </span>
              </div>
            </div>

            {/* Symptoms / Gejala Kerusakan */}
            <div className="mb-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                GEJALA KERUSAKAN UMUM:
              </h4>
              <div className="space-y-2">
                {modalCallout.symptoms.map((symptom, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-neutral-200 hover:border-white/10 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                    <span>{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FIXMI Solution */}
            <div className="mb-6 p-4 rounded-2xl bg-primary/[0.06] border border-primary/25">
              <h4 className="font-mono text-xs uppercase tracking-wider text-primary mb-1 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> SOLUSI PERBAIKAN FIXMI:
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {modalCallout.fixmiSolution}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Garansi Resmi FIXMI
              </span>
              <Link
                href={getLocalizedPath(modalCallout.categoryLink)}
                className="rounded-full bg-primary px-6 py-2.5 font-mono text-xs sm:text-sm font-semibold text-black hover:bg-primary/90 active:scale-[0.97] transition-[transform,background-color,box-shadow] duration-180 ease-out hover:scale-105 shadow-[0_0_24px_rgba(255,107,0,0.45)] inline-flex items-center gap-2"
                onClick={() => setModalCallout(null)}
              >
                {dict.whyUs.checkPriceBtn} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
