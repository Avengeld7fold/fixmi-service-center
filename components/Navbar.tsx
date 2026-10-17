"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import StaggeredMenu from "./StaggeredMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl, SOCIAL_LINKS } from "@/lib/constants";

const SOCIAL_ITEMS = [
  { label: "Instagram", link: SOCIAL_LINKS.instagram },
  { label: "WhatsApp", link: whatsappUrl() },
  { label: "TikTok", link: SOCIAL_LINKS.tiktok },
];

// ponytail: shared inline style objects — previously duplicated across elements
const NAV_FONT_STYLE = {
  fontFamily: "var(--font-neue-montreal), sans-serif",
  fontSize: "0.9375rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
} as const;

// ponytail: 2 corner fillet SVGs were near-identical — parameterized
const CornerFillet = ({ side, visible }: { side: "left" | "right"; visible: boolean }) => (
  <svg
    className="absolute pointer-events-none transition-[transform,opacity] duration-200 ease-out"
    viewBox="0 0 12 12"
    style={{
      top: 0,
      [side]: "-0.75rem",
      width: "0.75rem",
      height: "0.75rem",
      fill: "var(--fixmi-primary)",
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.85)",
      transformOrigin: side === "left" ? "top right" : "top left",
    }}
  >
    <path d={side === "left" ? "M0,0 Q12,0 12,12 L12,0 Z" : "M0,12 Q0,0 12,0 L0,0 Z"} />
  </svg>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookNowHovered, setIsBookNowHovered] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isNavPinned, setIsNavPinned] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const navVisibleRef = useRef(true);
  const navPinnedRef = useRef(false);
  const revealFrameRef = useRef<number | null>(null);
  const hasScrolledRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const { dict, getLocalizedPath } = useI18n();

  const updateNavigationForScroll = useCallback((scrollY: number, direction = 0) => {
    const currentY = Math.max(scrollY, 0);
    const delta = currentY - lastScrollY.current;
    lastScrollY.current = currentY;

    const scrolled = currentY > 8;
    if (hasScrolledRef.current !== scrolled) {
      hasScrolledRef.current = scrolled;
      setHasScrolled(scrolled);
    }

    const setNavigationVisibility = (visible: boolean) => {
      if (navVisibleRef.current === visible) return;
      navVisibleRef.current = visible;
      setIsNavVisible(visible);
    };

    const setNavigationPinned = (pinned: boolean) => {
      if (navPinnedRef.current === pinned) return;
      navPinnedRef.current = pinned;
      setIsNavPinned(pinned);
    };

    const revealNavigation = () => {
      if (navPinnedRef.current) {
        setNavigationVisibility(true);
        return;
      }

      setNavigationPinned(true);
      setNavigationVisibility(false);
      if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = requestAnimationFrame(() => {
        revealFrameRef.current = null;
        setNavigationVisibility(true);
      });
    };

    const hideNavigation = () => {
      if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
      revealFrameRef.current = null;
      setNavigationPinned(false);
      setNavigationVisibility(false);
    };

    if (currentY <= 1) {
      setNavigationPinned(false);
      setNavigationVisibility(true);
      return;
    }

    if (direction === 1 || (direction === 0 && delta > 0)) {
      hideNavigation();
      return;
    }

    if (direction === -1 || (direction === 0 && delta < 0)) {
      revealNavigation();
    }
  }, []);

  // Lenis uses virtual scrolling on desktop, while mobile/tablet use native scrolling.
  // Listening to both paths keeps the navigation behavior consistent at every breakpoint.
  const handleLenisScroll = useCallback(
    (instance: Lenis) => updateNavigationForScroll(instance.scroll, instance.direction),
    [updateNavigationForScroll],
  );

  useLenis(handleLenisScroll, [handleLenisScroll]);

  const navLinks = [
    { href: getLocalizedPath("/"), label: dict.nav.home },
    { href: getLocalizedPath("/pricelist"), label: dict.nav.pricelist },
    { href: getLocalizedPath("/promo"), label: dict.nav.promo },
    { href: getLocalizedPath("/gallery"), label: dict.nav.gallery },
    { href: getLocalizedPath("/about"), label: dict.nav.about },
  ];

  // ponytail: staggeredItems was a redundant re-mapping of navLinks — inlined
  const staggeredItems = navLinks.map((l) => ({
    label: l.label,
    ariaLabel: `Go to ${l.label}`,
    link: l.href,
  }));

  useEffect(() => {
    lastScrollY.current = Math.max(window.scrollY, 0);
    updateNavigationForScroll(lastScrollY.current);

    const handleNativeScroll = () => updateNavigationForScroll(window.scrollY);
    const handleWheel = (event: WheelEvent) =>
      updateNavigationForScroll(lastScrollY.current + event.deltaY, Math.sign(event.deltaY));
    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleNativeScroll);
      window.removeEventListener("wheel", handleWheel);
      if (revealFrameRef.current !== null) cancelAnimationFrame(revealFrameRef.current);
    };
  }, [updateNavigationForScroll]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, lenis]);

  if (pathname.startsWith("/admin")) return null;

  const isHome = pathname === "/" || pathname === "/en";

  return (
    <header className="relative z-50 h-[4.5rem] w-full">
      <div
        className={`z-50 w-full border-b transition-[transform,opacity,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          isNavPinned ? "fixed inset-x-0 top-0" : "relative"
        } ${
          isNavPinned && !isNavVisible ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
        style={{
          background: isHome && !hasScrolled ? "transparent" : "rgba(18, 18, 18, 0.96)",
          borderColor: hasScrolled ? "rgba(255, 255, 255, 0.1)" : "transparent",
        }}
        onFocusCapture={() => {
          navVisibleRef.current = true;
          navPinnedRef.current = true;
          setIsNavPinned(true);
          setIsNavVisible(true);
        }}
      >
        {/* Orange reveal strip */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none h-2 transition-[transform,opacity] duration-200 ease-out origin-top motion-reduce:transition-none"
          style={{
            background: "var(--fixmi-primary)",
            borderBottomLeftRadius: "0.5rem",
            borderBottomRightRadius: "0.5rem",
            transform: isBookNowHovered ? "scaleY(1)" : "scaleY(0)",
            opacity: isBookNowHovered ? 1 : 0,
            zIndex: 5,
          }}
        />

        <nav
          className="relative z-10 flex items-center justify-between w-full px-3 sm:px-4 md:px-12 lg:px-16"
          style={{ maxWidth: "90rem", marginLeft: "auto", marginRight: "auto", height: "4.5rem" }}
        >
        {/* Logo */}
        <Link
          href={getLocalizedPath("/")}
          className="group flex items-center no-underline shrink-0 active:scale-[0.97] transition-transform duration-150 ease-out"
          aria-label="FIXMI"
        >
          <Image
            src="/images/logo.svg"
            alt="FIXMI Service Center"
            width={172}
            height={44}
            priority
            style={{ width: "auto" }}
            className="h-9 sm:h-10 lg:h-11 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-2 list-none m-0 p-0">
          {(() => {
            const cleanPath = pathname.replace(/^\/en(\/|$)/, "/");
            return navLinks.map((link) => {
              const cleanLinkHref = link.href.replace(/^\/en(\/|$)/, "/");
              const isActive =
                pathname === link.href ||
                cleanPath === cleanLinkHref ||
                (cleanLinkHref !== "/" && cleanPath.startsWith(cleanLinkHref));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group relative inline-flex items-center no-underline whitespace-nowrap transition-colors duration-200 active:scale-[0.97] ${
                      isActive ? "text-primary font-medium" : "text-text-secondary hover:text-primary"
                    }`}
                    style={{ padding: "0.5rem 1.25rem", ...NAV_FONT_STYLE }}
                  >
                    {link.label}
                    <span
                      className="absolute bottom-0.5 left-5 right-5 h-[1px] transition-transform duration-250 ease-out origin-left scale-x-0 group-hover:scale-x-100"
                      style={{ background: "var(--fixmi-primary)" }}
                    />
                  </Link>
                </li>
              );
            });
          })()}
        </ul>

        {/* Desktop Right: Language + Book Now CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher variant="navbar" />

          <div className="relative shrink-0" style={{ width: "10.75rem", height: "4.5rem" }}>
            <Link
              href={getLocalizedPath("/contact")}
              className="absolute right-0 flex items-center justify-center no-underline whitespace-nowrap transition-transform duration-200 ease-out active:scale-[0.98]"
              style={{
                top: 0,
                height: "4rem",
                padding: "0 1.5rem",
                ...NAV_FONT_STYLE,
                fontWeight: 700,
                color: "#121212",
                background: "var(--fixmi-primary)",
                borderBottomLeftRadius: "1rem",
                borderBottomRightRadius: "1rem",
                borderTopLeftRadius: "0rem",
                borderTopRightRadius: "0rem",
                whiteSpace: "nowrap",
                transform: isBookNowHovered ? "translateY(0.5rem)" : "translateY(0)",
                zIndex: 10,
              }}
              onMouseEnter={() => setIsBookNowHovered(true)}
              onMouseLeave={() => setIsBookNowHovered(false)}
            >
              {dict.common.bookNow.toUpperCase()}
              <CornerFillet side="left" visible={isBookNowHovered} />
              <CornerFillet side="right" visible={isBookNowHovered} />
            </Link>
          </div>
        </div>

        {/* Mobile: Language + StaggeredMenu */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="navbar" />
          <StaggeredMenu
            position="right"
            items={staggeredItems}
            ctaItem={{
              label: dict.common.bookNow,
              link: getLocalizedPath("/contact"),
              ariaLabel: `Go to ${dict.common.bookNow}`,
            }}
            socialItems={SOCIAL_ITEMS}
            displaySocials={true}
            displayItemNumbering={false}
            menuButtonColor="var(--fixmi-primary)"
            openMenuButtonColor="#ffffff"
            changeMenuColorOnOpen={true}
            colors={["#FF6B00", "#242429"]}
            accentColor="var(--fixmi-primary)"
            isFixed={false}
            closeOnClickAway={true}
            onMenuOpen={() => {
              navVisibleRef.current = true;
              navPinnedRef.current = true;
              setIsNavPinned(true);
              setIsNavVisible(true);
              setIsMobileMenuOpen(true);
            }}
            onMenuClose={() => setIsMobileMenuOpen(false)}
            onNavigate={(href) => router.push(href)}
          />
        </div>
        </nav>
      </div>
    </header>
  );
}
