"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CSSProperties } from "react";

/**
 * FixmiLoader — overlay loading layar penuh untuk FIXMI.
 *
 * Progress NYATA: `progress` (0..100) datang dari sumber sebenarnya
 * (useAssetPreloader). Nilai yang ditampilkan di-ease ke arah progress tiap
 * frame agar cincin tetap mulus walau progress datang bertahap. Saat mencapai
 * 100 (dan minDuration terlewati), memutar state "Selesai ✓" lalu fade/zoom out
 * dan memanggil onDone().
 */

const R = 137;
const CIRC = 2 * Math.PI * R;

interface LoaderMessage {
  at: number;
  label: string;
}

const DEFAULT_MESSAGES: LoaderMessage[] = [
  { at: 0, label: "Menyiapkan Alat" },
  { at: 16, label: "Menyolder Komponen" },
  { at: 34, label: "Mengencangkan Baut" },
  { at: 52, label: "Mengisi Daya Battery" },
  { at: 70, label: "Membersihkan Konektor" },
  { at: 85, label: "Test Akhir Perangkat" },
  { at: 95, label: "Hampir selesai" },
];

const KEYFRAMES = `
@keyframes fixmi-float{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-10px) scale(.99,1.01)}}
@keyframes fixmi-glow{0%,100%{transform:scale(.92);opacity:.4}50%{transform:scale(1.12);opacity:.62}}
@keyframes fixmi-pop{0%{transform:scale(1,1)}18%{transform:scale(.84,.84)}42%{transform:scale(1.18,1.14)}60%{transform:scale(.94,.96)}78%{transform:scale(1.05,1.03)}100%{transform:scale(1,1)}}
@keyframes fixmi-flip{0%{transform:scaleX(1) scaleY(1)}25%{transform:scaleX(.06) scaleY(1.07)}50%{transform:scaleX(1) scaleY(1)}75%{transform:scaleX(.06) scaleY(1.07)}100%{transform:scaleX(1) scaleY(1)}}
@keyframes fixmi-shine{0%{transform:translateX(-130%) rotate(16deg)}30%{transform:translateX(130%) rotate(16deg)}100%{transform:translateX(130%) rotate(16deg)}}
@keyframes fixmi-letter{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes fixmi-bolt{0%,86%,100%{filter:none}90%,95%{filter:drop-shadow(0 0 5px #FFE9A0) brightness(1.5)}}
@keyframes fixmi-check{0%{opacity:0;transform:translateX(-50%) scale(.3)}60%{opacity:1;transform:translateX(-50%) scale(1.16)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
@keyframes fixmi-msg-in{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
@keyframes fixmi-dot{0%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-5px)}}
@keyframes fixmi-spark-fly{0%{transform:translate(0,0) scale(.4) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.1) rotate(200deg);opacity:0}}
@keyframes fixmi-content-in{0%{opacity:0;transform:translateY(10px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fixmi-content-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}
@media (prefers-reduced-motion: reduce){
  .fixmi-loader *,.fixmi-loader *::before,.fixmi-loader *::after{
    animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;
  }
}
`;

// Ease nilai tampil ke arah `target` tiap animation frame.
function useSmoothProgress(target: number) {
  const [shown, setShown] = useState(0);
  const cur = useRef(0);
  const raf = useRef(0);
  useEffect(() => {
    const tick = () => {
      const next = cur.current + (target - cur.current) * 0.12; // ease eksponensial
      const v = Math.abs(target - next) < 0.05 ? target : next;
      cur.current = v;
      setShown(v);
      if (v !== target) raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return shown;
}

interface Spark {
  id: number;
  dx: string;
  dy: string;
  size: number;
  color: string;
}

type Phase = "loading" | "done" | "exiting" | "hidden";

interface FixmiLoaderProps {
  progress?: number;
  onDone?: () => void;
  logoSrc?: string;
  background?: string;
  showPercent?: boolean;
  minDuration?: number;
  messages?: LoaderMessage[];
}

export default function FixmiLoader({
  progress = 0,
  onDone,
  logoSrc = "/fixmi-logo.png",
  background = "#121212",
  showPercent = true,
  minDuration = 700,
  messages = DEFAULT_MESSAGES,
}: FixmiLoaderProps) {
  const target = Math.max(0, Math.min(100, progress));
  const shown = useSmoothProgress(target);

  const [phase, setPhase] = useState<Phase>("loading");
  const [popping, setPopping] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const mountTime = useRef(0);

  useEffect(() => {
    mountTime.current = typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  // Selesai: progress nyata penuh DAN cincin menyusul DAN waktu minimum lewat.
  useEffect(() => {
    if (phase !== "loading") return;
    if (target >= 100 && shown >= 99.5) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const wait = Math.max(0, minDuration - (now - mountTime.current));
      const t = setTimeout(() => setPhase("done"), wait);
      return () => clearTimeout(t);
    }
  }, [target, shown, phase, minDuration]);

  // done -> exiting -> hidden
  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(() => setPhase("exiting"), 1100);
      return () => clearTimeout(t);
    }
    if (phase === "exiting") {
      const t = setTimeout(() => {
        setPhase("hidden");
        if (onDone) onDone();
      }, 620);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  // sesekali balik seperti koin
  useEffect(() => {
    if (phase !== "loading") return;
    let timer: ReturnType<typeof setTimeout>;
    let flipEnd: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setFlipping(true);
        flipEnd = setTimeout(() => setFlipping(false), 930);
        schedule();
      }, 4200 + Math.random() * 4200);
    };
    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(flipEnd);
    };
  }, [phase]);

  const poke = useCallback(() => {
    const colors = ["#F26A0E", "#FF8A2A", "#FFC02E", "#FFFFFF"];
    const next: Spark[] = Array.from({ length: 10 }, (_, i) => {
      const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 110 + Math.random() * 70;
      return {
        id: Math.random(),
        dx: Math.cos(ang) * dist + "px",
        dy: Math.sin(ang) * dist + "px",
        size: 10 + Math.random() * 10,
        color: colors[i % colors.length],
      };
    });
    setSparks(next);
    setPopping(true);
    setTimeout(() => {
      setPopping(false);
      setSparks([]);
    }, 660);
  }, []);

  if (phase === "hidden") return null;

  const p = shown;
  const theta = (p / 100) * Math.PI * 2 - Math.PI / 2;
  const dotX = 150 + R * Math.cos(theta);
  const dotY = 150 + R * Math.sin(theta);
  const ringOffset = CIRC * (1 - p / 100);
  const isDone = phase === "done" || phase === "exiting";
  const message = isDone
    ? "Selesai"
    : (messages.filter((m) => p >= m.at).pop() || messages[0]).label;
  const logoAnim = popping
    ? "fixmi-pop 0.6s cubic-bezier(.35,0,.2,1)"
    : flipping
      ? "fixmi-flip 0.92s ease-in-out"
      : "none";
  const contentAnim =
    phase === "exiting"
      ? "fixmi-content-out 0.6s cubic-bezier(.4,0,.2,1) forwards"
      : "fixmi-content-in 0.55s cubic-bezier(.2,.7,.3,1)";

  return (
    <div
      className="fixmi-loader"
      role="status"
      aria-label="Memuat halaman"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: contentAnim,
        }}
      >
        {/* cincin + logo */}
        <div style={{ position: "relative", width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* progress ring */}
          <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
            <defs>
              <linearGradient id="fixmi-prog" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB877" />
                <stop offset="100%" stopColor="#F26A0E" />
              </linearGradient>
            </defs>
            <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,138,42,.12)" strokeWidth="4" />
            <circle
              cx="150" cy="150" r={R} fill="none"
              stroke="url(#fixmi-prog)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={ringOffset}
              transform="rotate(-90 150 150)"
            />
            <circle cx={dotX} cy={dotY} r="5" fill="#FFC79A" style={{ filter: "drop-shadow(0 0 5px rgba(255,138,42,.9))" }} />
          </svg>

          {/* glow */}
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 196, height: 196, margin: "-98px 0 0 -98px", background: "radial-gradient(circle, rgba(255,138,42,.5) 0%, rgba(255,138,42,0) 68%)", borderRadius: "50%", animation: "fixmi-glow 2.6s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />

          {/* logo mengambang */}
          <div style={{ animation: "fixmi-float 3s ease-in-out infinite", transformOrigin: "50% 100%", position: "relative", zIndex: 2 }}>
            <div onClick={poke} style={{ position: "relative", width: 190, height: 190, animation: logoAnim, transformOrigin: "50% 50%", cursor: "pointer" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", clipPath: "circle(50% at 50% 50%)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="FIXMI Service Center" draggable={false} style={{ width: "100%", height: "100%", display: "block" }} />

                {/* plakat animasi di atas wordmark yang ter-bake */}
                <div style={{ position: "absolute", left: "9%", right: "9%", top: "33.5%", display: "flex", flexDirection: "column", borderRadius: 9, overflow: "hidden", boxShadow: "0 0 0 2.5px #FFFFFF, 0 2px 6px rgba(180,80,10,.35)", fontFamily: "'Arial Black', Arial, sans-serif" }}>
                  <div style={{ background: "linear-gradient(180deg,#F0701C,#DD5A0E)", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, padding: "5px 6px 4px" }}>
                    {"Fixmi".split("").map((c, i) => (
                      <span key={i} style={{ display: "inline-block", fontSize: 29, lineHeight: 1, fontWeight: 900, fontStyle: "italic", color: "#FFFFFF", animation: "fixmi-letter 2.8s ease-in-out infinite", animationDelay: i * 0.12 + "s" }}>{c}</span>
                    ))}
                    <div style={{ width: 17, height: 27, marginLeft: 3, background: "#FFFFFF", clipPath: "polygon(58% 0%,0% 58%,38% 58%,30% 100%,100% 38%,56% 38%)", animation: "fixmi-bolt 3.4s linear infinite" }} />
                  </div>
                  <div style={{ background: "#FFFFFF", textAlign: "center", padding: "3px 4px 4px", fontSize: 15, lineHeight: 1.15, fontWeight: 900, fontStyle: "italic", letterSpacing: ".01em", whiteSpace: "nowrap" }}>
                    <span style={{ color: "#E05A00" }}>SERVICE</span>{" "}
                    <span style={{ color: "#3A3F45" }}>CENTER</span>
                  </div>
                </div>

                {/* sapuan kilau */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(255,255,255,0) 42%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 58%)", animation: "fixmi-shine 3.6s ease-in-out infinite", pointerEvents: "none", mixBlendMode: "screen" }} />
              </div>
            </div>
          </div>

          {/* badge sukses */}
          {isDone && (
            <div style={{ position: "absolute", left: "50%", bottom: 8, width: 48, height: 48, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 8px 20px rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fixmi-check .5s cubic-bezier(.2,.8,.3,1.3) both", zIndex: 5 }}>
              <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="#E8600C" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 L10 18 L20 6" /></svg>
            </div>
          )}

          {/* percikan klik */}
          {sparks.map((sp) => (
            <div
              key={sp.id}
              style={{
                position: "absolute", left: "50%", top: "50%", width: sp.size, height: sp.size, margin: "-6px 0 0 -6px",
                background: sp.color, clipPath: "polygon(50% 0%,65% 35%,100% 50%,65% 65%,50% 100%,35% 65%,0% 50%,35% 35%)",
                animation: "fixmi-spark-fly .7s cubic-bezier(.2,.7,.4,1) forwards",
                "--dx": sp.dx, "--dy": sp.dy, pointerEvents: "none", zIndex: 4,
              } as CSSProperties}
            />
          ))}
        </div>

        {/* pesan */}
        <div key={message} style={{ marginTop: 34, height: 26, fontSize: 19, fontWeight: 700, color: isDone ? "#5FD08A" : "#FF8A2A", letterSpacing: ".02em", animation: "fixmi-msg-in .4s ease-out", display: "flex", alignItems: "baseline", gap: 3 }}>
          <span>{message}</span>
          {!isDone && (
            <span style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ display: "inline-block", animation: "fixmi-dot 1.2s infinite 0s" }}>.</span>
              <span style={{ display: "inline-block", animation: "fixmi-dot 1.2s infinite .15s" }}>.</span>
              <span style={{ display: "inline-block", animation: "fixmi-dot 1.2s infinite .3s" }}>.</span>
            </span>
          )}
        </div>

        {/* persen */}
        {showPercent && (
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: "#FFA85C", letterSpacing: ".08em", fontVariantNumeric: "tabular-nums" }}>
            {Math.round(p)}%
          </div>
        )}
      </div>
    </div>
  );
}
