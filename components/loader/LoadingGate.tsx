"use client";

import { useState, useEffect } from "react";
import FixmiLoader from "./FixmiLoader";
import { useAssetPreloader } from "./useAssetPreloader";

/**
 * LoadingGate — bungkus aplikasi.
 *
 * SEMENTARA DIMATIKAN DENGAN FLAG `DISABLE_LOADER_IN_DEV = true`
 * agar proses pengembangan & testing berjalan instant tanpa perlu menunggu animasi loading.
 * Ubah kembali menjadi `false` saat aplikasi siap dipublikasikan/live.
 */
const DISABLE_LOADER_IN_DEV = true;

const CRITICAL_ASSETS = [
  "/fixmi-logo.png",
  "/images/iphone-broken.png",
  "/images/iphone-fixed.png",
  "/images/iphone-depth.png",
];

export default function LoadingGate({ children }: { children: React.ReactNode }) {
  const { progress } = useAssetPreloader(CRITICAL_ASSETS, {
    waitForFonts: true,
    waitForWindowLoad: false,
  });
  const [revealed, setRevealed] = useState(DISABLE_LOADER_IN_DEV);

  useEffect(() => {
    if (DISABLE_LOADER_IN_DEV) {
      (window as unknown as Record<string, unknown>).__fixmiLoaded = true;
      window.dispatchEvent(new Event("fixmi:loaded"));
    }
  }, []);

  return (
    <>
      {children}
      {!revealed && (
        <FixmiLoader
          progress={progress}
          onDone={() => {
            setRevealed(true);
            // Sinyal global untuk splash intro hero
            (window as unknown as Record<string, unknown>).__fixmiLoaded = true;
            window.dispatchEvent(new Event("fixmi:loaded"));
          }}
          background="#020202"
          minDuration={800}
        />
      )}
    </>
  );
}
