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
  Nfc,
  Cable,
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
  { step: 1,  fileNumber: 13, file: "/images/services/Backglass.webp", name: "Back Glass & Rear Panel", subName: "Kaca Belakang & Cover", calloutId: "backglass" },
  { step: 2,  fileNumber: 12, file: "/images/services/NFC.webp", name: "NFC & Wireless Charging Coil", subName: "Modul Induksi Nirkabel", calloutId: "backglass" },
  { step: 3,  fileNumber: 11, file: "/images/services/Housing.webp", name: "Titanium Housing Chassis", subName: "Rangka & Sasis Bodi" },
  { step: 4,  fileNumber: 10, file: "/images/services/Flex-Charger.webp", name: "Flex Charger & Microphone Port", subName: "Konektor Fleksibel Cas", calloutId: "flex-charger" },
  { step: 5,  fileNumber: 9,  file: "/images/services/Loud-Speaker.webp", name: "Bottom Loudspeaker Module", subName: "Modul Speaker Bawah", calloutId: "speaker-housing" },
  { step: 6,  fileNumber: 8,  file: "/images/services/Taptic-Engine.webp", name: "Taptic Engine Haptic Vibration", subName: "Motor Getar Presisi" },
  { step: 7,  fileNumber: 7,  file: "/images/services/Flex-Power.webp", name: "Power Button & Volume Flex Cable", subName: "Fleksibel Tombol Power & Volume", calloutId: "motherboard" },
  { step: 8,  fileNumber: 6,  file: "/images/services/Logicboard.webp", name: "Logic Board Main PCB", subName: "Papan Sirkuit Utama & Chipset", calloutId: "motherboard" },
  { step: 9,  fileNumber: 5,  file: "/images/services/Back-Camera.webp", name: "Rear Triple Camera Module", subName: "Sistem Lensa Kamera Belakang", calloutId: "camera" },
  { step: 10, fileNumber: 4,  file: "/images/services/Front-Camera.webp", name: "TrueDepth Front Camera & Face ID", subName: "Kamera Depan & Sensor Biometrik", calloutId: "camera" },
  { step: 11, fileNumber: 3,  file: "/images/services/Ear-Speaker.webp", name: "Ear Speaker & Sensor Assembly", subName: "Speaker Atas & Sensor Telinga", calloutId: "speaker-housing" },
  { step: 12, fileNumber: 2,  file: "/images/services/Battery.webp", name: "High-Capacity Li-Ion Battery", subName: "Baterai Utama & Modul BMS", calloutId: "battery" },
  { step: 13, fileNumber: 1,  file: "/images/services/LCD.webp", name: "Super Retina OLED Display & Glass", subName: "Layar Sentuh & Panel Depan", calloutId: "screen" },
];

// ── 6 Layanan Callout Lingkaran dengan Rentang Scroll Perjalanan (revealStart -> revealEnd) ──
interface ServiceHotspot {
  x: number;
  y: number;
  label?: string;
  labelEn?: string;
  step?: number;
  revealStart?: number;
  revealEnd?: number;
}

interface ServiceCallout {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  side: "left" | "right";
  layerRange: string;
  minStep: number;
  revealStart: number;
  revealEnd: number;
  circleImage: string;
  icon: typeof Smartphone;
  hotspot: { x: number; y: number };
  hotspots?: ServiceHotspot[];
  symptoms: string[];
  symptomsEn: string[];
  fixmiSolution: string;
  fixmiSolutionEn: string;
  estimatedTime: string;
  estimatedTimeEn: string;
  categoryLink: string;
}

const SERVICE_CALLOUTS: ServiceCallout[] = [
  {
    id: "backglass",
    name: "Back Glass & NFC",
    nameEn: "Back Glass & NFC",
    code: "CHASSIS // BACKGLASS & NFC",
    side: "left",
    layerRange: "Layer 1 & 2 (Backglass & NFC)",
    minStep: 1,
    revealStart: 0.00,
    revealEnd: 0.16,
    circleImage: "/images/services/Backglass.webp",
    icon: Smartphone,
    hotspot: { x: 50, y: 72 },
    hotspots: [
      {
        x: 50,
        y: 72,
        label: "Kaca Belakang",
        labelEn: "Back Glass",
        step: 1,
        revealStart: 0.00,
        revealEnd: 0.08,
      },
      {
        x: 50,
        y: 48,
        label: "NFC & MagSafe",
        labelEn: "NFC & MagSafe",
        step: 2,
        revealStart: 0.08,
        revealEnd: 0.16,
      },
    ],
    symptoms: [
      "Kaca Belakang Retak / Pecah",
      "NFC / Apple Pay Tidak Terdeteksi",
      "Wireless Charging Lambat / Tidak Mengisi"
    ],
    symptomsEn: [
      "Cracked / Shattered Rear Glass",
      "NFC / Apple Pay Failure",
      "Wireless Charging Slow / Intermittent"
    ],
    fixmiSolution: "Penggantian Kaca Belakang Laser Presisi & Modul Antena NFC / Koil MagSafe OEM Bergaransi.",
    fixmiSolutionEn: "Precision Laser Rear Glass Replacement & OEM NFC / MagSafe Inductive Coil Repair.",
    estimatedTime: "40 - 60 Menit",
    estimatedTimeEn: "40 - 60 Minutes",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "flex-charger",
    name: "Flex Charger & Mic",
    nameEn: "Flex Charger & Mic",
    code: "CONNECTIVITY // CHARGING",
    side: "left",
    layerRange: "Layer 4 (Flex-Charger)",
    minStep: 4,
    revealStart: 0.16,
    revealEnd: 0.28,
    circleImage: "/images/services/Flex-Charger.webp",
    icon: Cable,
    hotspot: { x: 50, y: 92 },
    symptoms: [
      "Tidak Bisa Cas / Cas Putus-Putus",
      "Konektor USB-C/Lightning Longgar / Goyang",
      "Mikrofon Bawah Tidak Terdengar Saat Telepon"
    ],
    symptomsEn: [
      "No Charging / Intermittent Charging",
      "Loose USB-C / Lightning Port",
      "Lower Microphone Failure During Calls"
    ],
    fixmiSolution: "Penggantian Modul Fleksibel Port Cas & Mic OEM Presisi Bergaransi.",
    fixmiSolutionEn: "OEM Precision Replacement of Charging Port & Lower Microphone Assembly.",
    estimatedTime: "25 - 40 Menit",
    estimatedTimeEn: "25 - 40 Minutes",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "speaker-housing",
    name: "Loud Speaker & Ear Speaker",
    nameEn: "Loudspeaker & Ear Speaker",
    code: "AUDIO // DUAL-SPEAKER",
    side: "left",
    layerRange: "Layer 5 & 11 (Audio Speakers)",
    minStep: 5,
    revealStart: 0.30,
    revealEnd: 0.85,
    circleImage: "/images/services/Loud-Speaker.webp",
    icon: Volume2,
    hotspot: { x: 40, y: 88 },
    hotspots: [
      {
        x: 40,
        y: 88,
        label: "Loud Speaker Bawah",
        labelEn: "Bottom Loudspeaker",
        step: 5,
        revealStart: 0.30,
        revealEnd: 0.40,
      },
      {
        x: 28,
        y: 12,
        label: "Ear Speaker Atas",
        labelEn: "Top Ear Speaker",
        step: 11,
        revealStart: 0.76,
        revealEnd: 0.85,
      },
    ],
    symptoms: [
      "Suara Speaker Bawah Kresek / Mati / Pecah",
      "Speaker Telinga Atas Suara Kecil Saat Telepon",
      "Audio Menggema / Suara Tidak Jernih"
    ],
    symptomsEn: [
      "Bottom Loudspeaker Crackling / Muted",
      "Top Ear Speaker Inaudible During Calls",
      "Distorted / Muffled Audio Output"
    ],
    fixmiSolution: "Pembersihan Akustik Ruang Suara & Penggantian Modul Loudspeaker & Ear Speaker OEM Presisi Bergaransi.",
    fixmiSolutionEn: "Acoustic Chamber Cleaning & Precision OEM Loudspeaker & Ear Speaker Replacement.",
    estimatedTime: "30 - 45 Menit",
    estimatedTimeEn: "30 - 45 Minutes",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "camera",
    name: "Kamera & Lensa",
    nameEn: "Camera & Lens",
    code: "OPTICS // DUAL-CAM",
    side: "right",
    layerRange: "Layer 9 & 10 (Dual-Camera)",
    minStep: 9,
    revealStart: 0.58,
    revealEnd: 0.74,
    circleImage: "/images/services/Back-Camera.webp",
    icon: Camera,
    hotspot: { x: 65, y: 17 },
    hotspots: [
      {
        x: 65,
        y: 17,
        label: "Kamera Belakang",
        labelEn: "Back Camera",
        step: 9,
        revealStart: 0.58,
        revealEnd: 0.67,
      },
      {
        x: 50,
        y: 6,
        label: "Kamera Depan",
        labelEn: "Front Camera",
        step: 10,
        revealStart: 0.67,
        revealEnd: 0.76,
      },
    ],
    symptoms: [
      "Kamera Belakang / Depan Buram / Blank Hitam",
      "Kaca Lensa Kamera Retak / Pecah",
      "Kamera Bergetar / Suara Mendengung (OIS Rusak)"
    ],
    symptomsEn: [
      "Rear / Front Camera Black Screen or Blurry",
      "Cracked / Shattered Lens Glass",
      "Shaking Camera / Humming OIS Malfunction"
    ],
    fixmiSolution: "Penggantian Modul Kamera Belakang & Depan OEM Serta Kaca Lensa Safir Laser Cut Bebas Debu.",
    fixmiSolutionEn: "OEM Front & Rear Camera Module Replacement & Dust-Free Laser Sapphire Lens.",
    estimatedTime: "30 - 45 Menit",
    estimatedTimeEn: "30 - 45 Minutes",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "motherboard",
    name: "Logic Board & CPU",
    nameEn: "Logic Board & CPU",
    code: "MOTHERBOARD // 7 & 6",
    side: "right",
    layerRange: "Layer 7 & 6",
    minStep: 7,
    revealStart: 0.44,
    revealEnd: 0.60,
    circleImage: "/images/services/Logicboard.webp",
    icon: Cpu,
    hotspot: { x: 74, y: 32 },
    symptoms: ["Mati Total (Short Circuit)", "IC Power / Baseband No Service", "Restart Terus Menerus"],
    symptomsEn: ["Dead Unit / Short Circuit", "Power IC / Baseband Searching...", "Continuous Bootloop / Restart"],
    fixmiSolution: "Pengerjaan Mikrosolder Mikroskop Level 4, Reballing CPU Dual-Layer, & Pemulihan Jalur.",
    fixmiSolutionEn: "Level 4 Microscope Micro-soldering, Dual-Layer CPU Reballing & PCB Trace Recovery.",
    estimatedTime: "1 - 3 Hari (Diagnosa Teliti)",
    estimatedTimeEn: "1 - 3 Days (Precision Bench)",
    categoryLink: "/pricelist/iphone",
  },
  {
    id: "battery",
    name: "Baterai & MagSafe",
    nameEn: "Battery & MagSafe",
    code: "POWER // BATTERY",
    side: "right",
    layerRange: "Layer 12 (Battery)",
    minStep: 12,
    revealStart: 0.80,
    revealEnd: 0.94,
    circleImage: "/images/services/Battery.webp",
    icon: BatteryCharging,
    hotspot: { x: 40, y: 55 },
    symptoms: ["Battery Health <80% / Service", "Baterai Kembung / Drop Cepat", "Sering Mati Mendadak"],
    symptomsEn: ["Battery Health <80% / Service Alert", "Swollen Battery / Fast Drain", "Random Power Shutdowns"],
    fixmiSolution: "Sel Baterai High-Capacity Grade A+ dengan pemindahan modul BMS (tanpa pesan error).",
    fixmiSolutionEn: "Grade A+ High-Capacity Battery Cell with BMS Module Transfer (no unknown part warning).",
    estimatedTime: "20 - 30 Menit",
    estimatedTimeEn: "20 - 30 Minutes",
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
  dots?: { dotX: number; dotY: number }[];
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
  isEn,
  onClick,
  onMouseEnter,
}: {
  callout: ServiceCallout;
  isActive: boolean;
  isRevealed: boolean;
  isEn: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
}) {
  const displayName = isEn ? callout.nameEn : callout.name;

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
            alt={displayName}
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
          {displayName}
        </span>
        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">
          {isEn ? "Click for Details" : "Klik untuk Detail"}
        </span>
      </div>
    </div>
  );
}

export default function ExplodedPhoneSection() {
  const { dict, locale, getLocalizedPath } = useI18n();
  const isEn = locale === "en";
  const containerRef = useRef<HTMLDivElement>(null);
  const stageGridRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  const [activeCalloutId, setActiveCalloutId] = useState<string>("backglass");
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
    // Nilai progress terakhir yang dikirim ke React state (quantized).
    // GSAP timeline tetap di-update SETIAP frame (animasi layer tetap 60fps mulus),
    // tetapi React state hanya di-update saat perubahan terlihat (>= 0.005)
    // sehingga komponen besar ini tidak re-render pada setiap frame settle lerp.
    let lastQuantized = -1;

    const applyProgress = (val: number, isFinal: boolean) => {
      currentProgressRef.current = val;

      // Update GSAP timeline langsung ke DOM — bebas biaya re-render React
      if (timelineRef.current) {
        timelineRef.current.progress(val);
      }

      const quantized = isFinal ? val : Math.round(val * 200) / 200;
      if (quantized === lastQuantized) return;
      lastQuantized = quantized;

      setScrollProgress(quantized);

      const activeStep = Math.min(13, Math.max(1, Math.floor(quantized * 12.9) + 1));
      setCurrentStep(activeStep);
      setIsAssembled(quantized > 0.92);

      const currentLayerDef = ALL_13_LAYERS[activeStep - 1];
      if (currentLayerDef && currentLayerDef.calloutId) {
        setActiveCalloutId(currentLayerDef.calloutId);
      }
    };

    const startRaf = () => {
      if (rafId !== null) return;
      const tick = () => {
        const target = targetProgressRef.current;
        const current = currentProgressRef.current;
        const diff = target - current;

        if (Math.abs(diff) > 0.0002) {
          // Exponential smoothing lerp (Apple CADisplayLink feel)
          applyProgress(current + diff * 0.16, false);
          rafId = requestAnimationFrame(tick);
        } else {
          applyProgress(target, true);
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

        // Posisi anchor awal kurva persis pada tepi lingkaran yang menghadap ke ponsel
        const finalCircleX =
          callout.side === "left"
            ? nodeRect.right - gridRect.left + 3
            : nodeRect.left - gridRect.left - 3;
        const finalCircleY = nodeRect.top - gridRect.top + nodeRect.height / 2;

        // Hitung koordinat dot: prioritaskan pengukuran presisi dari DOM rect elemen button
        const spots =
          callout.hotspots && callout.hotspots.length > 0
            ? callout.hotspots
            : [{ x: callout.hotspot.x, y: callout.hotspot.y }];

        const dots = spots.map((spot, spotIdx) => {
          const btnEl = document.getElementById(`callout-hotspot-dot-${callout.id}-${spotIdx}`);
          if (btnEl) {
            const btnRect = btnEl.getBoundingClientRect();
            return {
              dotX: btnRect.left - gridRect.left + btnRect.width / 2,
              dotY: btnRect.top - gridRect.top + btnRect.height / 2,
            };
          }
          return {
            dotX: phoneRect.left - gridRect.left + (phoneRect.width * spot.x) / 100,
            dotY: phoneRect.top - gridRect.top + (phoneRect.height * spot.y) / 100,
          };
        });

        newMap[callout.id] = {
          dotX: dots[0].dotX,
          dotY: dots[0].dotY,
          finalCircleX,
          finalCircleY,
          dx: 0,
          dy: 0,
          dots,
        };
      });

      setSpatialMap(newMap);
    };

    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const throttledUpdate = () => {
      if (throttleTimer !== null) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        updateSpatialMap();
      }, 150);
    };

    updateSpatialMap();
    window.addEventListener("resize", throttledUpdate);
    window.addEventListener("scroll", throttledUpdate, { passive: true });

    const t1 = setTimeout(updateSpatialMap, 50);
    const t2 = setTimeout(updateSpatialMap, 150);
    const t3 = setTimeout(updateSpatialMap, 400);
    const t4 = setTimeout(updateSpatialMap, 800);

    return () => {
      window.removeEventListener("resize", throttledUpdate);
      window.removeEventListener("scroll", throttledUpdate);
      if (throttleTimer !== null) clearTimeout(throttleTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeCalloutId]);

  // ── Hitung Progress Perjalanan Mulus (Travel Progress 0.0 -> 1.0) untuk Setiap Komponen ──
  const getCalloutTravelProgress = (callout: ServiceCallout) => {
    if (callout.id === "backglass") return 1;
    if (scrollProgress < callout.revealStart) return 0;
    if (scrollProgress >= callout.revealEnd) return 1;
    const raw = (scrollProgress - callout.revealStart) / (callout.revealEnd - callout.revealStart);
    // Smooth cubic ease out
    return Math.min(1, Math.max(0, 1 - Math.pow(1 - raw, 3)));
  };

  // ── Hitung Progress Perjalanan Mulus (Travel Progress 0.0 -> 1.0) untuk Titik Hotspot Individual (Sequential Per-Dot) ──
  const getHotspotTravelProgress = (
    callout: ServiceCallout,
    spot?: ServiceHotspot
  ) => {
    // Untuk Backglass hotspot (step 1), selalu 1 saat berada di step 1 ke atas
    if (callout.id === "backglass" && spot?.step === 1) return 1;

    const minStep = spot?.step ?? callout.minStep;
    const start = spot?.revealStart ?? callout.revealStart;
    const end = spot?.revealEnd ?? callout.revealEnd;

    // Saat scroll membongkar/merakit, cegah kemunculan titik sebelum step fisiknya tiba di stage ponsel
    // Misal: Step 9 (Back Camera) muncul terlebih dahulu dengan 1 garis, lalu Step 10 (Front Camera) menyusul di step 10
    if (currentStep < minStep && scrollProgress < start) {
      return 0;
    }

    if (scrollProgress < start) return 0;
    if (scrollProgress >= end) return 1;

    const raw = (scrollProgress - start) / (end - start);
    return Math.min(1, Math.max(0, 1 - Math.pow(1 - raw, 3)));
  };

  // ── Fade Out Halus Garis Putus-Putus & Lingkaran Saat LCD Mulai Turun Menutup Sasis (0.88 -> 0.98) ──
  // Menggunakan fungsi smoothstep (3x^2 - 2x^3) untuk transisi perlahan, mulus tanpa lonjakan
  const rawFade =
    scrollProgress <= 0.88
      ? 1
      : scrollProgress >= 0.98
      ? 0
      : (0.98 - scrollProgress) / (0.98 - 0.88);
  const assemblyFade = Math.min(1, Math.max(0, rawFade * rawFade * (3 - 2 * rawFade)));

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
            <span
              className={`h-2 w-2 rounded-full ${
                isAssembled ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-primary animate-ping"
              }`}
            />
            <span className="text-white font-bold tracking-wide transition-colors duration-150">
              {isAssembled
                ? isEn
                  ? "iPhone Fully Assembled"
                  : "iPhone Terakit Sempurna"
                : activeCallout?.name || "Layar & Glass"}
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
              const spatial = spatialMap[callout.id];
              if (!spatial) return null;

              const originDots =
                spatial.dots && spatial.dots.length > 0
                  ? spatial.dots
                  : [{ dotX: spatial.dotX, dotY: spatial.dotY }];

              const spots =
                callout.hotspots && callout.hotspots.length > 0
                  ? callout.hotspots
                  : [{ x: callout.hotspot.x, y: callout.hotspot.y }];

              return originDots.map((dot, dotIdx) => {
                const spot = spots[dotIdx];
                const t = getHotspotTravelProgress(callout, spot);
                if (t <= 0.01) return null;

                const isActive = activeCalloutId === callout.id;
                // Titik Awal (p0): Tepi Lingkaran Target (Callout Node di kolom samping)
                const p0 = { x: spatial.finalCircleX, y: spatial.finalCircleY };
                // Titik Akhir (p3): Titik Hotspot pada Gambar Ponsel
                const p3 = { x: dot.dotX, y: dot.dotY };

                // Control Points Kurva Organik: Mengalir dari Lingkaran (p0) Mengarah ke Hotspot Ponsel (p3)
                let p1: { x: number; y: number };
                let p2: { x: number; y: number };

                if (callout.side === "left") {
                  // Lingkaran di kiri (p0.x < p3.x): keluar ke kanan (+dx), masuk ke dot dari kiri (-dx)
                  const dx = p3.x - p0.x;
                  p1 = { x: p0.x + dx * 0.45, y: p0.y };
                  p2 = { x: p3.x - dx * 0.35, y: p3.y };
                } else {
                  // Lingkaran di kanan (p0.x > p3.x): keluar ke kiri (-dx), masuk ke dot dari kanan (+dx)
                  const dx = p0.x - p3.x;
                  p1 = { x: p0.x - dx * 0.45, y: p0.y };
                  p2 = { x: p3.x + dx * 0.35, y: p3.y };
                }

                // Hitung subkurva yang tumbuh dari Lingkaran (p0) mengarah dan mendarat tepat pada Dot Ponsel (p3)
                const { pathD, tipX, tipY } = getCubicBezierSubcurve(p0, p1, p2, p3, t);
                const lineOpacity = Math.min(1, t * 1.5) * assemblyFade;
                if (lineOpacity <= 0.01) return null;

                return (
                  <g
                    key={`${callout.id}-${dotIdx}`}
                    style={{ opacity: lineOpacity }}
                    className="cursor-pointer group/line transition-opacity duration-150"
                    onMouseEnter={() => {
                      if (assemblyFade > 0.1) setActiveCalloutId(callout.id);
                    }}
                    onClick={() => {
                      if (assemblyFade > 0.1) setActiveCalloutId(callout.id);
                    }}
                  >
                    {/* Invisible broad stroke hit area for easy clicking on the line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={28}
                      className={`cursor-pointer ${assemblyFade > 0.1 ? "pointer-events-auto" : "pointer-events-none"}`}
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
              });
            })}
          </svg>

          {/* ── LEFT CALLOUT COLUMN: CIRCULAR ZOOM NODES (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 justify-around items-center min-h-[480px]">
            {SERVICE_CALLOUTS.filter((p) => p.side === "left").map((callout) => {
              const isActive = activeCalloutId === callout.id;
              const t = getCalloutTravelProgress(callout);
              const scale = 0.9 + t * 0.1;
              const isRevealed = (t > 0.35 || isActive) && assemblyFade > 0.1;
              const calloutOpacity = (isActive ? 1 : t) * assemblyFade;
              const displayName = isEn ? callout.nameEn : callout.name;

              return (
                <div
                  key={callout.id}
                  id={`callout-circle-${callout.id}`}
                  style={{
                    transform: `scale(${scale})`,
                    opacity: calloutOpacity,
                    pointerEvents: isRevealed ? "auto" : "none",
                    willChange: "transform, opacity",
                  }}
                  className="transition-[opacity,transform] duration-200 ease-out"
                >
                  <InspectionCircleNode
                    callout={callout}
                    isActive={isActive}
                    isRevealed={isRevealed}
                    isEn={isEn}
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
                        priority={index === 0}
                        loading={index === 0 ? undefined : "eager"}
                        sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 350px, 380px"
                        className="object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.85)]"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Interactive Pulsing Hotspot Dots */}
              <div className="absolute inset-0 z-40 pointer-events-auto">
                {SERVICE_CALLOUTS.map((callout) => {
                  const isActive = activeCalloutId === callout.id;
                  const displayName = isEn ? callout.nameEn : callout.name;

                  const spots =
                    callout.hotspots && callout.hotspots.length > 0
                      ? callout.hotspots
                      : [{ x: callout.hotspot.x, y: callout.hotspot.y, label: displayName, labelEn: displayName }];

                  return spots.map((spot, spotIdx) => {
                    const t = getHotspotTravelProgress(callout, spot);
                    const dotOpacity = t * assemblyFade;
                    if (dotOpacity <= 0.01) return null;

                    const spotLabel = isEn
                      ? (spot.labelEn || displayName)
                      : (spot.label || displayName);

                    return (
                      <button
                        key={`${callout.id}-${spotIdx}`}
                        id={`callout-hotspot-dot-${callout.id}-${spotIdx}`}
                        type="button"
                        onMouseEnter={() => {
                          if (t > 0.3 && assemblyFade > 0.1) {
                            setActiveCalloutId(callout.id);
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (t > 0.3 && assemblyFade > 0.1) {
                            // Klik pada dot mengaktifkan highlight lingkaran & garis tanpa membuka kartu modal
                            setActiveCalloutId(callout.id);
                          }
                        }}
                        style={{
                          left: `${spot.x}%`,
                          top: `${spot.y}%`,
                          transform: `translate(-50%, -50%) scale(${t})`,
                          opacity: dotOpacity,
                          pointerEvents: dotOpacity > 0.4 ? "auto" : "none",
                          willChange: "transform, opacity",
                        }}
                        className="group absolute flex items-center justify-center focus:outline-none cursor-pointer active:scale-90 transition-transform duration-150 ease-out"
                        aria-label={`Select component ${spotLabel}`}
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
                        <span className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/95 border border-primary/40 px-2 py-0.5 font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl z-50">
                          {spotLabel}
                        </span>
                      </button>
                    );
                  });
                })}
              </div>

              {/* Minimalist Apple-Style Scroll Cue (Hanya muncul sebelum perakitan dimulai atau saat terakit penuh sebagai petunjuk) */}
              <div
                className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-[transform,opacity] duration-300 ease-out flex flex-col items-center gap-1.5 ${
                  scrollProgress < 0.05 || isAssembled
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-3 scale-95"
                }`}
              >
                {/* Animated Mouse Wheel Capsule */}
                <div className="w-5 h-8 rounded-full border border-primary/70 bg-black/60 backdrop-blur-md flex justify-center pt-1.5 shadow-[0_0_18px_rgba(255,107,0,0.4)]">
                  <span className={`w-1 h-2 rounded-full bg-primary ${isAssembled ? "animate-pulse" : "animate-bounce"}`} />
                </div>
                {/* Sleek Instruction Badge */}
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-200 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 whitespace-nowrap shadow-xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  {isAssembled
                    ? isEn
                      ? "Scroll to Disassemble"
                      : "Scroll untuk Membongkar"
                    : dict.teardown.scrollHint}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT CALLOUT COLUMN: CIRCULAR ZOOM NODES (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 justify-around items-center min-h-[480px]">
            {SERVICE_CALLOUTS.filter((p) => p.side === "right").map((callout) => {
              const isActive = activeCalloutId === callout.id;
              const t = getCalloutTravelProgress(callout);
              const scale = 0.9 + t * 0.1;
              const isRevealed = (t > 0.35 || isActive) && assemblyFade > 0.1;
              const calloutOpacity = (isActive ? 1 : t) * assemblyFade;
              const displayName = isEn ? callout.nameEn : callout.name;

              return (
                <div
                  key={callout.id}
                  id={`callout-circle-${callout.id}`}
                  style={{
                    transform: `scale(${scale})`,
                    opacity: calloutOpacity,
                    pointerEvents: isRevealed ? "auto" : "none",
                    willChange: "transform, opacity",
                  }}
                  className="transition-[opacity,transform] duration-200 ease-out"
                >
                  <InspectionCircleNode
                    callout={callout}
                    isActive={isActive}
                    isRevealed={isRevealed}
                    isEn={isEn}
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
          <div
            style={{
              opacity: assemblyFade,
              pointerEvents: assemblyFade > 0.1 ? "auto" : "none",
            }}
            className="flex lg:hidden col-span-1 w-full justify-start sm:justify-center gap-3 overflow-x-auto py-3 px-2 scrollbar-none touch-pan-x select-none transition-opacity duration-200 ease-out"
          >
            {SERVICE_CALLOUTS.map((callout) => {
              const t = getCalloutTravelProgress(callout);
              const isActive = activeCalloutId === callout.id;
              const displayName = isEn ? callout.nameEn : callout.name;

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
                        alt={displayName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-300 whitespace-nowrap">
                    {displayName}
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
              aria-label={dict.common.close}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Thumbnail + Title */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-primary/60 bg-primary/10 p-1 shrink-0 overflow-hidden shadow-[0_0_24px_rgba(255,107,0,0.35)] ring-2 ring-primary/20">
                <Image
                  src={modalCallout.circleImage}
                  alt={isEn ? modalCallout.nameEn : modalCallout.name}
                  fill
                  className="object-contain p-2 drop-shadow-lg scale-110"
                />
              </div>
              <div>
                <span className="font-mono text-xs text-primary uppercase tracking-wider block font-semibold">
                  {modalCallout.code}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#f5f5f5] leading-tight mt-0.5">
                  {isEn ? modalCallout.nameEn : modalCallout.name}
                </h3>
                <span className="font-mono text-[11px] text-neutral-400 mt-1 inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {dict.teardown.modalEstimate}: <strong className="text-white">{isEn ? modalCallout.estimatedTimeEn : modalCallout.estimatedTime}</strong>
                </span>
              </div>
            </div>

            {/* Symptoms / Gejala Kerusakan */}
            <div className="mb-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                {dict.teardown.modalSymptoms.toUpperCase()}:
              </h4>
              <div className="space-y-2">
                {(isEn ? modalCallout.symptomsEn : modalCallout.symptoms).map((symptom, i) => (
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
                <ShieldCheck className="w-4 h-4" /> {dict.teardown.modalFixmiSolution.toUpperCase()}:
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {isEn ? modalCallout.fixmiSolutionEn : modalCallout.fixmiSolution}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> {dict.common.officialWarranty}
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
