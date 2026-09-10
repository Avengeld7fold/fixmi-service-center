"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollingProps {
  children: ReactNode;
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

  // Reset scroll ke paling atas (top: 0) saat berpindah halaman/rute
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(0, { immediate: true });
    }

    // Beri jeda 50ms agar DOM rute baru selesai di-mount sebelum me-recalc limit & trigger
    const timer = setTimeout(() => {
      lenisRef.current?.lenis?.resize();
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    // Lenis memantau tinggi konten lewat ResizeObserver di <html>, tapi html
    // ber-class h-full (tinggi terkunci = viewport) sehingga observer itu buta
    // saat konten memanjang (akordeon pricelist expand, dll).
    // Pantau <body> (yang ikut tinggi konten) dan refresh limit Lenis.
    const ro = new ResizeObserver(() => {
      lenisRef.current?.lenis?.resize();
    });
    ro.observe(document.body);

    return () => {
      lenis?.off("scroll", ScrollTrigger.update);
      ro.disconnect();
    };
  }, []);

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
