"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useAssetPreloader — progress loading NYATA (bukan palsu).
 *
 * Browser tidak menyediakan satu angka "berapa % semua sudah dimuat", jadi
 * progress nyata = melacak sekumpulan resource yang kita tentukan. Berikan URL
 * aset kritis (gambar hero, logo); hook memuatnya dan mengembalikan berapa yang
 * sudah selesai. Error tetap dihitung agar bar tidak pernah macet.
 *
 * Return: { progress (0..100), loaded, total, done }
 */
interface PreloaderOptions {
  waitForFonts?: boolean;
  waitForWindowLoad?: boolean;
}

export function useAssetPreloader(
  assets: string[] = [],
  options: PreloaderOptions = {}
) {
  const { waitForFonts = true, waitForWindowLoad = false } = options;

  // total "unit": tiap aset + opsional fonts + opsional window.load
  const extra = (waitForFonts ? 1 : 0) + (waitForWindowLoad ? 1 : 0);
  const total = assets.length + extra;

  const [loaded, setLoaded] = useState(0);
  const doneCount = useRef(0);

  useEffect(() => {
    // total 0 tak terjadi pada pemakaian nyata; state awal loaded sudah 0 dan
    // progress mengembalikan 100 saat total 0 — tak perlu setState di sini.
    if (total === 0) return;
    let cancelled = false;
    doneCount.current = 0;

    const bump = () => {
      if (cancelled) return;
      doneCount.current += 1;
      setLoaded(doneCount.current);
    };

    // 1) gambar
    const imgs = assets.map((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump; // hitung kegagalan agar bar tak tersangkut
      img.src = src;
      // jika sudah tercache, onload bisa tak menyala di sebagian browser:
      if (img.complete && img.naturalWidth > 0) {
        setTimeout(bump, 0); // tunda agar update state setelah mount
        img.onload = null;
        img.onerror = null;
      }
      return img;
    });

    // 2) fonts
    if (waitForFonts) {
      if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(bump).catch(bump);
      } else {
        setTimeout(bump, 0);
      }
    }

    // 3) window load (semua subresource + paint awal)
    if (waitForWindowLoad) {
      if (typeof document !== "undefined" && document.readyState === "complete") {
        setTimeout(bump, 0);
      } else {
        window.addEventListener("load", bump, { once: true });
      }
    }

    return () => {
      cancelled = true;
      imgs.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
      if (waitForWindowLoad) window.removeEventListener("load", bump);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const progress = total === 0 ? 100 : Math.min(100, (loaded / total) * 100);
  return { progress, loaded, total, done: loaded >= total };
}
