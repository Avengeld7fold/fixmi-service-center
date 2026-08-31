"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import FixmiLoader from "./FixmiLoader";
import { useAssetPreloader } from "./useAssetPreloader";

/**
 * LoadingGate — overlay loading animasi presisi tinggi untuk FIXMI.
 *
 * Mengunci tampilan awal sampai seluruh font, logo, dan aset WebGL
 * selesai dimuat, lalu memutar transisi reveal yang halus ke konten utama.
 */
const DISABLE_LOADER_IN_DEV = false;

const CRITICAL_ASSETS = [
  "/fixmi-logo.png",
  "/images/iphone-broken.png",
  "/images/iphone-fixed.png",
  "/images/iphone-depth.png",
];

export default function LoadingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");

  const { progress } = useAssetPreloader(CRITICAL_ASSETS, {
    waitForFonts: true,
    waitForWindowLoad: false,
  });

  const [revealed, setRevealed] = useState(DISABLE_LOADER_IN_DEV || isAdmin);

  useEffect(() => {
    if (DISABLE_LOADER_IN_DEV || isAdmin) {
      (window as unknown as Record<string, unknown>).__fixmiLoaded = true;
      window.dispatchEvent(new Event("fixmi:loaded"));
    }
  }, [isAdmin]);

  return (
    <>
      {children}
      {!revealed && !isAdmin && (
        <FixmiLoader
          progress={progress}
          onDone={() => {
            setRevealed(true);
            // Sinyal global untuk splash intro hero
            (window as unknown as Record<string, unknown>).__fixmiLoaded = true;
            window.dispatchEvent(new Event("fixmi:loaded"));
          }}
          background="#121212"
          minDuration={900}
        />
      )}
    </>
  );
}
