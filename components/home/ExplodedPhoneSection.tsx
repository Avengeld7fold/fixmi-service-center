"use client";

import { useRef, useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { useI18n } from "@/lib/i18n/context";
import { X, Clock, Info, ShieldCheck, ArrowUpRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Urutan 13 Layer dari angka tertinggi (13) ke angka terkecil (1) ──
interface LayerDefinition {
  step: number;        // Step 1 s/d 13
  fileNumber: number;  // 13 down to 1
  file: string;
  name: string;
  subName: string;
  calloutId?: string;
  isOffside?: boolean;
}

const ALL_13_LAYERS: LayerDefinition[] = [
  { step: 1,  fileNumber: 13, file: "/images/services/Backglass.webp", name: "Back Glass & Rear Panel", subName: "Kaca Belakang & Cover", calloutId: "backglass" },
  { step: 2,  fileNumber: 12, file: "/images/services/NFC.webp", name: "NFC & Wireless Charging Coil", subName: "Modul Induksi Nirkabel", calloutId: "backglass", isOffside: true },
  { step: 3,  fileNumber: 11, file: "/images/services/Housing.webp", name: "Titanium Housing Chassis", subName: "Rangka & Sasis Bodi" },
  { step: 4,  fileNumber: 10, file: "/images/services/Flex-Charger.webp", name: "Flex Charger & Microphone Port", subName: "Konektor Fleksibel Cas", calloutId: "flex-charger", isOffside: true },
  { step: 5,  fileNumber: 9,  file: "/images/services/Loud-Speaker.webp", name: "Bottom Loudspeaker Module", subName: "Modul Speaker Bawah", calloutId: "speaker-housing" },
  { step: 6,  fileNumber: 8,  file: "/images/services/Taptic-Engine.webp", name: "Taptic Engine Haptic Vibration", subName: "Motor Getar Presisi", isOffside: true },
  { step: 7,  fileNumber: 7,  file: "/images/services/Flex-Power.webp", name: "Power Button & Volume Flex Cable", subName: "Fleksibel Tombol Power & Volume", calloutId: "motherboard" },
  { step: 8,  fileNumber: 6,  file: "/images/services/Logicboard.webp", name: "Logic Board Main PCB", subName: "Papan Sirkuit Utama & Chipset", calloutId: "motherboard" },
  { step: 9,  fileNumber: 5,  file: "/images/services/Back-Camera.webp", name: "Rear Triple Camera Module", subName: "Sistem Lensa Kamera Belakang", calloutId: "camera" },
  { step: 10, fileNumber: 4,  file: "/images/services/Front-Camera.webp", name: "TrueDepth Front Camera & Face ID", subName: "Kamera Depan & Sensor Biometrik", calloutId: "camera" },
  { step: 11, fileNumber: 3,  file: "/images/services/Ear-Speaker.webp", name: "Ear Speaker & Sensor Assembly", subName: "Speaker Atas & Sensor Telinga", calloutId: "speaker-housing" },
  { step: 12, fileNumber: 2,  file: "/images/services/Battery.webp", name: "High-Capacity Li-Ion Battery", subName: "Baterai Utama & Modul BMS", calloutId: "battery" },
  { step: 13, fileNumber: 1,  file: "/images/services/LCD.webp", name: "Super Retina OLED Display & Glass", subName: "Layar Sentuh & Panel Depan", calloutId: "screen" },
];

// ── 6 Layanan Callout Lingkaran dengan Rentang Scroll Perjalanan ──
interface ServiceHotspot {
  x: number;
  y: number;
  label: string;
  labelEn: string;
  step: number;
  revealStart: number;
  revealEnd: number;
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
  hotspots: ServiceHotspot[];
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
    hotspots: [
      {
        x: 50,
        y: 92,
        label: "Flex Charger",
        labelEn: "Flex Charger",
        step: 4,
        revealStart: 0.16,
        revealEnd: 0.28,
      },
    ],
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
    hotspots: [
      {
        x: 74,
        y: 32,
        label: "Logic Board",
        labelEn: "Logic Board",
        step: 7,
        revealStart: 0.44,
        revealEnd: 0.60,
      },
    ],
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
    hotspots: [
      {
        x: 40,
        y: 55,
        label: "Baterai & BMS",
        labelEn: "Battery & BMS",
        step: 12,
        revealStart: 0.80,
        revealEnd: 0.94,
      },
    ],
    symptoms: ["Battery Health <80% / Service", "Baterai Kembung / Drop Cepat", "Sering Mati Mendadak"],
    symptomsEn: ["Battery Health <80% / Service Alert", "Swollen Battery / Fast Drain", "Random Power Shutdowns"],
    fixmiSolution: "Sel Baterai High-Capacity Grade A+ dengan pemindahan modul BMS (tanpa pesan error).",
    fixmiSolutionEn: "Grade A+ High-Capacity Battery Cell with BMS Module Transfer (no unknown part warning).",
    estimatedTime: "20 - 30 Menit",
    estimatedTimeEn: "20 - 30 Minutes",
    categoryLink: "/pricelist/iphone",
  },
];

// Pre-computed static arrays — zero allocations during render cycles
const LEFT_CALLOUTS = SERVICE_CALLOUTS.filter((p) => p.side === "left");
const RIGHT_CALLOUTS = SERVICE_CALLOUTS.filter((p) => p.side === "right");
const STEP_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

interface NodeSpatialInfo {
  finalCircleX: number;
  finalCircleY: number;
  dots: { dotX: number; dotY: number }[];
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

// ── Komponen Lingkaran Callout Bersih & Minimalis (Emil Kowalski Tactile Motion, Memoized) ──
const InspectionCircleNode = memo(function InspectionCircleNode({
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
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 88px"
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
});

export default function ExplodedPhoneSection() {
  const { dict, locale, getLocalizedPath } = useI18n();
  const isEn = locale === "en";
  const lenis = useLenis();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageGridRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastQuantizedRef = useRef<number>(-1);
  const prevStepRef = useRef<number>(1);

  const [activeCalloutId, setActiveCalloutId] = useState<string>("backglass");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAssembled, setIsAssembled] = useState<boolean>(false);
  const [spatialMap, setSpatialMap] = useState<Record<string, NodeSpatialInfo>>({});
  const [bootKey, setBootKey] = useState<number>(0);

  // Pre-load Booting.webp (~457KB) for instant display at Step 14 without network lag
  useEffect(() => {
    if (typeof window !== "undefined") {
      const preloadWebP = new window.Image();
      preloadWebP.src = "/images/services/Booting.webp";
    }
  }, []);

  // State modal popover detail saat lingkaran diklik
  const [modalCallout, setModalCallout] = useState<ServiceCallout | null>(null);

  // Close modal on Escape key press and lock background scroll
  useEffect(() => {
    if (!modalCallout) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalCallout(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalCallout]);

  // Komponen / Part yang sedang aktif (sesuai lingkaran oranye yang aktif)
  const activeCallout = SERVICE_CALLOUTS.find((c) => c.id === activeCalloutId) || SERVICE_CALLOUTS[0];

  // Helper untuk hitung step progress
  const getProgressForStep = (step: number) => {
    if (step >= 14) return 1.0;
    if (step === 13) return 0.88;
    if (step <= 1) return 0.0;
    return ((step - 1) / 12) * 0.84;
  };

  // Sinkronisasi state React saat timeline berjalan
  const applyProgress = (val: number) => {
    const quantized = Math.round(val * 200) / 200;
    if (quantized === lastQuantizedRef.current) return;
    lastQuantizedRef.current = quantized;

    setScrollProgress(quantized);

    let activeStep = 1;
    if (quantized >= 0.90) {
      activeStep = 14;
    } else if (quantized >= 0.85) {
      activeStep = 13;
    } else {
      activeStep = Math.min(12, Math.max(1, Math.floor((quantized / 0.85) * 12) + 1));
    }

    if (activeStep === 14 && prevStepRef.current !== 14) {
      setBootKey((k) => k + 1);
    }
    prevStepRef.current = activeStep;
    setCurrentStep(activeStep);
    setIsAssembled(quantized >= 0.85);

    const currentLayerDef = ALL_13_LAYERS[activeStep - 1];
    if (currentLayerDef && currentLayerDef.calloutId) {
      setActiveCalloutId(currentLayerDef.calloutId);
    }
  };

  // Helper untuk navigasi langsung ke step tertentu dengan smooth scroll
  const jumpToStep = (step: number) => {
    const targetProg = getProgressForStep(step);
    const st = scrollTriggerRef.current;
    if (st) {
      const targetScroll = st.start + (st.end - st.start) * targetProg;
      if (lenis) {
        lenis.scrollTo(targetScroll, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      }
    } else {
      timelineRef.current?.progress(targetProg);
      applyProgress(targetProg);
    }
  };

  // ── GSAP Timeline & ScrollTrigger: Apple-Style Sticky Pinning 13-Layer Assembly ──
  useGSAP(
    () => {
      if (!layersContainerRef.current || !containerRef.current || !stageRef.current) return;

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

      // Standalone timeline dikendalikan oleh ScrollTrigger pinning
      const stepDuration = 0.5;
      const overlap = 0.15;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2200",
          pin: stageRef.current,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

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

      // Alokasikan waktu jeda setelah layer 13 (LCD) terpasang sempurna untuk fase Booting (Langkah 14)
      const physicalDuration = (layers.length - 2) * (stepDuration - overlap) + stepDuration;
      const totalTimelineDuration = physicalDuration / 0.85;
      tl.set({}, {}, totalTimelineDuration);

      tl.eventCallback("onUpdate", () => {
        applyProgress(tl.progress());
      });

      timelineRef.current = tl;
      scrollTriggerRef.current = tl.scrollTrigger ?? null;
    },
    { scope: containerRef }
  );

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

        const finalCircleX =
          callout.side === "left"
            ? nodeRect.right - gridRect.left + 3
            : nodeRect.left - gridRect.left - 3;
        const finalCircleY = nodeRect.top - gridRect.top + nodeRect.height / 2;

        const dots = callout.hotspots.map((spot, spotIdx) => {
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
          finalCircleX,
          finalCircleY,
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
      }, 100);
    };

    updateSpatialMap();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(throttledUpdate) : null;
    if (ro) {
      if (stageGridRef.current) ro.observe(stageGridRef.current);
      if (layersContainerRef.current) ro.observe(layersContainerRef.current);
    }

    window.addEventListener("resize", throttledUpdate);
    ScrollTrigger.addEventListener("refresh", throttledUpdate);

    const t = setTimeout(updateSpatialMap, 300);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", throttledUpdate);
      ScrollTrigger.removeEventListener("refresh", throttledUpdate);
      if (throttleTimer !== null) clearTimeout(throttleTimer);
      clearTimeout(t);
    };
  }, []);

  // ── Hitung Progress Perjalanan Mulus (Travel Progress 0.0 -> 1.0) untuk Setiap Komponen ──
  const getCalloutTravelProgress = (callout: ServiceCallout) => {
    if (callout.id === "backglass") return 1;
    if (scrollProgress < callout.revealStart) return 0;
    if (scrollProgress >= callout.revealEnd) return 1;
    const raw = (scrollProgress - callout.revealStart) / (callout.revealEnd - callout.revealStart);
    return Math.min(1, Math.max(0, 1 - Math.pow(1 - raw, 3)));
  };

  // ── Hitung Progress Perjalanan Mulus untuk Titik Hotspot Individual ──
  const getHotspotTravelProgress = (callout: ServiceCallout, spot: ServiceHotspot) => {
    if (callout.id === "backglass" && spot.step === 1) return 1;
    if (currentStep < spot.step && scrollProgress < spot.revealStart) return 0;
    if (scrollProgress < spot.revealStart) return 0;
    if (scrollProgress >= spot.revealEnd) return 1;

    const raw = (scrollProgress - spot.revealStart) / (spot.revealEnd - spot.revealStart);
    return Math.min(1, Math.max(0, 1 - Math.pow(1 - raw, 3)));
  };

  // ── Fade Out Halus Garis Putus-Putus & Lingkaran Saat LCD Mulai Turun Menutup Sasis (0.78 -> 0.85) ──
  const rawFade =
    scrollProgress <= 0.78
      ? 1
      : scrollProgress >= 0.85
      ? 0
      : (0.85 - scrollProgress) / (0.85 - 0.78);
  const assemblyFade = Math.min(1, Math.max(0, rawFade * rawFade * (3 - 2 * rawFade)));

  return (
    <div ref={containerRef} className="relative w-full bg-[#121212] text-white select-none">
      
      {/* ── PINNED STAGE CONTAINER ── */}
      <div
        ref={stageRef}
        className="relative w-full h-screen min-h-[640px] max-h-[1080px] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-hidden bg-[#121212]"
      >
        
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
        <div className="relative z-20 text-center max-w-3xl mx-auto mb-2 shrink-0">
          <h2
            className="font-bayon text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase leading-[0.95] tracking-[-0.01em] text-[#f5f5f5]"
            style={{
              fontFamily: "var(--font-bayon), sans-serif",
            }}
          >
            {dict.teardown.heading}
          </h2>

          {/* Active Sparepart / Service Component Pill */}
          <div
            onClick={() => {
              if (isAssembled) {
                jumpToStep(currentStep === 14 ? 13 : 14);
              }
            }}
            className={`mt-2 sm:mt-2.5 inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-wider text-neutral-300 bg-white/[0.04] border border-primary/40 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 shadow-lg backdrop-blur-md transition-all duration-200 select-none ${
              isAssembled ? "cursor-pointer hover:border-emerald-400/80 hover:scale-105 active:scale-95" : ""
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                currentStep === 14
                  ? "bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"
                  : isAssembled
                  ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  : "bg-primary animate-ping"
              }`}
            />
            <span className="text-white font-bold tracking-wide transition-colors duration-150">
              {currentStep === 14
                ? isEn
                  ? "Step 14/14: System Booting & QC Passed"
                  : "Langkah 14/14: Sistem Booting & Uji Fungsi Sukses"
                : isAssembled
                ? isEn
                  ? "Step 13/14: iPhone Fully Assembled (Click to Boot)"
                  : "Langkah 13/14: iPhone Terakit Sempurna (Klik untuk Booting)"
                : isEn
                ? (activeCallout?.nameEn || "Screen & Glass")
                : (activeCallout?.name || "Layar & Glass")}
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

              return spatial.dots.map((dot, dotIdx) => {
                const spot = callout.hotspots[dotIdx];
                if (!spot) return null;
                const t = getHotspotTravelProgress(callout, spot);
                if (t <= 0.01) return null;

                const isActive = activeCalloutId === callout.id;
                // Titik Awal (p0): Tepi Lingkaran Target (Callout Node di kolom samping)
                const p0 = { x: spatial.finalCircleX, y: spatial.finalCircleY };
                // Titik Akhir (p3): Titik Hotspot pada Gambar Ponsel
                const p3 = { x: dot.dotX, y: dot.dotY };

                // Control Points Kurva Organik
                const isLeft = callout.side === "left";
                const dx = isLeft ? p3.x - p0.x : p0.x - p3.x;
                const p1 = { x: isLeft ? p0.x + dx * 0.45 : p0.x - dx * 0.45, y: p0.y };
                const p2 = { x: isLeft ? p3.x - dx * 0.35 : p3.x + dx * 0.35, y: p3.y };

                // Hitung subkurva De Casteljau
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

                    {/* Organic Wave / Curved Dashed Line */}
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
            {LEFT_CALLOUTS.map((callout) => {
              const isActive = activeCalloutId === callout.id;
              const t = getCalloutTravelProgress(callout);
              const scale = 0.9 + t * 0.1;
              const isRevealed = (t > 0.35 || isActive) && assemblyFade > 0.1;
              const calloutOpacity = (isActive ? 1 : t) * assemblyFade;

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
                      if (isRevealed) setActiveCalloutId(callout.id);
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

          {/* ── CENTER: SEQUENTIAL 13-LAYER IPHONE ASSEMBLY WITH DEPTH OF FIELD FOCUS ── */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center py-2">
            
            {/* Clean Transparent Phone Stage Container */}
            <div
              ref={layersContainerRef}
              onClick={() => {
                if (isAssembled) {
                  jumpToStep(currentStep === 14 ? 13 : 14);
                }
              }}
              className={`relative w-[260px] sm:w-[300px] md:w-[325px] lg:w-[350px] xl:w-[380px] h-[440px] sm:h-[500px] md:h-[540px] lg:h-[580px] xl:h-[640px] flex items-center justify-center ${
                isAssembled ? "cursor-pointer active:scale-[0.99] transition-transform duration-150" : ""
              }`}
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
                    {/* Layer Graphic */}
                    <div
                      className="relative w-full h-full transition-opacity duration-200 ease-out"
                      style={{
                        opacity: layer.isOffside ? assemblyFade : 1,
                      }}
                    >
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

              {/* ── FINAL STEP 14: SCREEN BOOTING ANIMATION (Booting.webp ~457KB) ── */}
              <div
                className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none transition-opacity duration-300 ease-out"
                style={{
                  opacity: currentStep === 14 ? 1 : 0,
                  transformStyle: "preserve-3d",
                  zIndex: 25,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    key={bootKey}
                    src="/images/services/Booting.webp"
                    alt="iPhone Booting & Quality Test"
                    fill
                    unoptimized
                    priority
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 350px, 380px"
                    className="object-contain drop-shadow-[0_0_35px_rgba(255,107,0,0.3)] select-none pointer-events-none"
                  />
                </div>
              </div>

              {/* Interactive Pulsing Hotspot Dots */}
              <div className="absolute inset-0 z-40 pointer-events-auto">
                {SERVICE_CALLOUTS.map((callout) => {
                  const isActive = activeCalloutId === callout.id;

                  return callout.hotspots.map((spot, spotIdx) => {
                    const t = getHotspotTravelProgress(callout, spot);
                    const dotOpacity = t * assemblyFade;
                    if (dotOpacity <= 0.01) return null;

                    const spotLabel = isEn ? spot.labelEn : spot.label;

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
                        {/* Outer Glowing Pulsing Ring */}
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

              {/* Minimalist Apple-Style Scroll Cue */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAssembled) {
                    jumpToStep(currentStep === 14 ? 13 : 14);
                  }
                }}
                className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 transition-[transform,opacity] duration-300 ease-out flex flex-col items-center gap-1.5 select-none ${
                  isAssembled ? "cursor-pointer pointer-events-auto active:scale-95" : "pointer-events-none"
                } ${
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
                  {currentStep === 14
                    ? isEn
                      ? "Scroll Up to Disassemble"
                      : "Scroll ke Atas untuk Membongkar"
                    : isAssembled
                    ? isEn
                      ? "Scroll to Power On (Booting)"
                      : "Scroll untuk Menyalakan (Booting)"
                    : dict.teardown.scrollHint}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT CALLOUT COLUMN: CIRCULAR ZOOM NODES (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 justify-around items-center min-h-[480px]">
            {RIGHT_CALLOUTS.map((callout) => {
              const isActive = activeCalloutId === callout.id;
              const t = getCalloutTravelProgress(callout);
              const scale = 0.9 + t * 0.1;
              const isRevealed = (t > 0.35 || isActive) && assemblyFade > 0.1;
              const calloutOpacity = (isActive ? 1 : t) * assemblyFade;

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
                      if (isRevealed) setActiveCalloutId(callout.id);
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
                        sizes="56px"
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
        <div className="relative z-20 w-full max-w-md mx-auto text-center mt-2 sm:mt-3 shrink-0">
          <div className="flex items-center justify-center gap-1.5">
            {STEP_NUMBERS.map((stepNum) => {
              const isPastOrCurrent = stepNum <= currentStep;
              const isCurrent = stepNum === currentStep;
              const isBootStep = stepNum === 14;

              return (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => jumpToStep(stepNum)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                    isCurrent && isBootStep
                      ? "w-6 bg-emerald-400 shadow-[0_0_12px_#34d399]"
                      : isCurrent
                      ? "w-5 bg-primary shadow-[0_0_10px_#FF6B00]"
                      : isPastOrCurrent
                      ? isBootStep
                        ? "w-3.5 bg-emerald-400/80"
                        : "w-3 bg-primary/70"
                      : "w-1.5 bg-white/20 hover:bg-white/50"
                  }`}
                  aria-label={`Lompat ke Langkah ${stepNum}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE DETAIL MODAL (FIXMI CLINICAL DIAGNOSTIC INSTRUMENT) ── */}
      {modalCallout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-out animate-in fade-in"
          onClick={() => setModalCallout(null)}
        >
          <div
            className="relative w-full max-w-lg md:max-w-3xl rounded-[24px] border border-[#262626] bg-[#161618] shadow-2xl overflow-hidden transition-all duration-200 ease-out animate-in zoom-in-95 slide-in-from-bottom-2 max-h-[92vh] flex flex-col md:flex-row select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button — Precision Tactile */}
            <button
              type="button"
              onClick={() => setModalCallout(null)}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/15 hover:border-white/25 active:scale-90 transition-all duration-150 ease-out"
              aria-label={dict.common.close}
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── LEFT COLUMN: HARDWARE SPECIMEN VITRINE ── */}
            <div className="relative md:w-[290px] shrink-0 bg-[#0F0F12] p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#262626] min-h-[240px] md:min-h-[460px] overflow-hidden">
              {/* Subtle Diagnostic Spotlight */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,107,0,0.16),transparent_65%)]" />

              {/* Component Code Monospace Tag */}
              <div className="relative z-10 w-full flex items-center justify-start">
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{modalCallout.code}</span>
                </span>
              </div>

              {/* Floating Hardware Specimen (Generous Staging) */}
              <div className="relative z-10 my-auto py-3 w-full h-[180px] sm:h-[220px] md:h-[280px] flex items-center justify-center">
                <Image
                  src={modalCallout.circleImage}
                  alt={isEn ? modalCallout.nameEn : modalCallout.name}
                  fill
                  sizes="(max-width: 768px) 220px, 290px"
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>

              {/* Time Estimate Badge (Compact Single Line) */}
              <div className="relative z-10 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono tabular-nums text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{dict.teardown.modalEstimate}:</span>
                <span className="text-white font-semibold whitespace-nowrap">
                  {isEn ? modalCallout.estimatedTimeEn : modalCallout.estimatedTime}
                </span>
              </div>
            </div>

            {/* ── RIGHT COLUMN: CLINICAL DIAGNOSTIC INFO & ACTION ── */}
            <div className="flex-1 p-6 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#161618]">
              <div>
                {/* Header with Bayon Display Font */}
                <div className="pr-8">
                  <h3
                    className="font-bayon text-3xl sm:text-4xl uppercase tracking-wide text-[#f5f5f5] leading-none"
                    style={{ fontFamily: "var(--font-bayon), sans-serif" }}
                  >
                    {isEn ? modalCallout.nameEn : modalCallout.name}
                  </h3>
                  <span className="inline-block mt-2 font-mono text-xs text-neutral-400 tracking-wide">
                    {modalCallout.layerRange}
                  </span>
                </div>

                {/* Diagnostic Symptoms (Clean structured items) */}
                <div className="mt-6 mb-5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-2.5">
                    {dict.teardown.modalSymptoms}
                  </span>
                  <div className="space-y-2">
                    {(isEn ? modalCallout.symptomsEn : modalCallout.symptoms).map((symptom, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-150"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_6px_rgba(255,107,0,0.8)]" />
                        <span className="text-xs sm:text-[13px] text-neutral-200 leading-snug font-normal">
                          {symptom}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FIXMI Diagnostic Solution Protocol */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-mono text-xs uppercase tracking-wider text-[#f5f5f5] font-semibold">
                      {dict.teardown.modalFixmiSolution}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed pl-6">
                    {isEn ? modalCallout.fixmiSolutionEn : modalCallout.fixmiSolution}
                  </p>
                </div>
              </div>

              {/* Action Dock with Signature FIXMI Primary Button */}
              <div className="pt-6 mt-6 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                  </span>
                  <span className="font-medium tracking-wide">
                    {dict.common.officialWarranty}
                  </span>
                </div>

                <Link
                  href={getLocalizedPath(modalCallout.categoryLink)}
                  onClick={() => setModalCallout(null)}
                  className="group relative inline-flex items-center justify-center gap-2 sm:gap-2.5 min-h-[44px] px-6 py-2.5 rounded-full bg-primary text-[#121212] font-semibold text-xs sm:text-sm tracking-[-0.01em] whitespace-nowrap transition-all duration-200 ease-out hover:bg-primary-light active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 overflow-hidden text-center"
                  style={{ boxShadow: "0 6px 20px -4px rgba(255, 107, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.45)" }}
                >
                  <span className="relative z-10">{dict.whyUs.checkPriceBtn}</span>
                  <span className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/10 flex items-center justify-center transition-all duration-200 ease-out group-hover:bg-black/15 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#121212]" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
