"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollingProps {
  children: ReactNode;
}

const NATIVE_SCROLL_QUERY = "(pointer: coarse), (prefers-reduced-motion: reduce)";

function subscribeToNativeScroll(onChange: () => void) {
  const mediaQuery = window.matchMedia(NATIVE_SCROLL_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getNativeScrollSnapshot() {
  return window.matchMedia(NATIVE_SCROLL_QUERY).matches;
}

function getServerNativeScrollSnapshot() {
  return false;
}

/**
 * Lenis root (rAF bawaan Lenis) + sinkronisasi GSAP ScrollTrigger:
 * setiap scroll Lenis memicu ScrollTrigger.update sehingga animasi
 * GSAP selalu mengikuti posisi scroll yang dihaluskan.
 *
 * PENTING: jangan set `scroll-behavior: smooth` di CSS — konflik fatal
 * dengan Lenis (dua animasi saling lawan = scroll macet).
 */
export default function SmoothScrolling({ children }: SmoothScrollingProps) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const useNativeScroll = useSyncExternalStore(
    subscribeToNativeScroll,
    getNativeScrollSnapshot,
    getServerNativeScrollSnapshot,
  );

  const prevPathnameRef = useRef(pathname);

  // Reset scroll ke paling atas (top: 0) saat berpindah ke halaman/rute baru yang berbeda
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // Jangan reset scroll ke nol jika hanya berpindah sub-kategori di halaman pricelist (admin maupun publik)
    const isPricelistSubRoute =
      (prev.startsWith("/admin/pricelist") && pathname.startsWith("/admin/pricelist")) ||
      (prev.startsWith("/pricelist") && pathname.startsWith("/pricelist"));

    if (!isPricelistSubRoute) {
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.scrollTo(0, { immediate: true });
      }
    }

    // Beri jeda 50ms agar DOM rute baru selesai di-mount sebelum me-recalc limit & trigger
    const timer = setTimeout(() => {
      lenisRef.current?.lenis?.resize();
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (useNativeScroll) return;

    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    // Lenis memantau tinggi konten lewat ResizeObserver di <html>, tapi html
    // ber-class h-full (tinggi terkunci = viewport) sehingga observer itu buta
    // saat konten memanjang (akordeon pricelist expand, dll).
    // Pantau <body> (yang ikut tinggi konten) dan refresh limit Lenis.
    let rafId: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        lenisRef.current?.lenis?.resize();
      });
    });
    ro.observe(document.body);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenis?.off("scroll", ScrollTrigger.update);
      ro.disconnect();
    };
  }, [useNativeScroll]);

  // Native touch scrolling avoids an always-running animation loop on phones.
  if (useNativeScroll) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
