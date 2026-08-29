"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import StaggeredMenu from "./StaggeredMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { whatsappUrl } from "@/lib/constants";

const SOCIAL_ITEMS = [
  { label: "Instagram", link: "https://instagram.com/fixmi.id" },
  { label: "WhatsApp", link: whatsappUrl() },
  { label: "TikTok", link: "https://tiktok.com/@fixmi.id" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isBookNowHovered, setIsBookNowHovered] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const { dict, getLocalizedPath } = useI18n();

  const navLinks = [
    { href: getLocalizedPath("/"), label: dict.nav.home },
    { href: getLocalizedPath("/pricelist"), label: dict.nav.pricelist },
    { href: getLocalizedPath("/promo"), label: dict.nav.promo },
    { href: getLocalizedPath("/gallery"), label: dict.nav.gallery },
    { href: getLocalizedPath("/about"), label: dict.nav.about },
  ];

  const staggeredItems = navLinks.map((l) => ({
    label: l.label,
    ariaLabel: `Go to ${l.label}`,
    link: l.href,
  }));

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Kunci scroll saat menu mobile terbuka.
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

  // Halaman admin punya shell sendiri — navbar publik disembunyikan.
  if (pathname.startsWith("/admin")) return null;

  // Di home (/ atau /en), navbar TRANSPARAN agar canvas hero tembus.
  const isHome = pathname === "/" || pathname === "/en";

  return (
    <header
      className="relative z-50 w-full"
      style={{ background: isHome ? "transparent" : "var(--fixmi-bg-primary)" }}
    >
      {/* Orange reveal strip — GPU accelerated scaleY with strong ease-out */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none h-2 transition-[transform,opacity] duration-200 ease-out origin-top"
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
        style={{
          maxWidth: "90rem",
          marginLeft: "auto",
          marginRight: "auto",
          height: "4.5rem",
        }}
      >
        {/* Logo — Left */}
        <Link href={getLocalizedPath("/")} className="group flex items-center gap-2.5 no-underline shrink-0 active:scale-[0.97] transition-transform duration-150 ease-out">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[1.625rem] h-[1.625rem] transition-transform duration-300 ease-out group-hover:rotate-12"
            style={{ color: "var(--fixmi-primary)" }}
          >
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-neue-montreal), sans-serif",
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: "var(--fixmi-primary)",
              lineHeight: 1,
            }}
          >
            FIXMI
          </span>
        </Link>

        {/* Desktop Menu — Center */}
        <ul className="hidden lg:flex items-center gap-2 list-none m-0 p-0">
          {navLinks.map((link) => {
            const cleanPath = pathname.replace(/^\/en(\/|$)/, "/");
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
                    isActive
                      ? "text-primary font-medium"
                      : "text-text-secondary hover:text-primary"
                  }`}
                  style={{
                    padding: "0.5rem 1.25rem",
                    fontFamily: "var(--font-neue-montreal), sans-serif",
                    fontSize: "0.9375rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {link.label}
                  {/* Orange underline — animates left to right on hover */}
                  <span
                    className="absolute bottom-0.5 left-5 right-5 h-[1px] transition-transform duration-250 ease-out origin-left scale-x-0 group-hover:scale-x-100"
                    style={{ background: "var(--fixmi-primary)" }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Desktop: Language Switcher + Book Now CTA */}
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
                fontFamily: "var(--font-neue-montreal), sans-serif",
                fontSize: "0.9375rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#121212",
                background: "var(--fixmi-primary)",
                borderBottomLeftRadius: "1rem",
                borderBottomRightRadius: "1rem",
                borderTopLeftRadius: "0rem",
                borderTopRightRadius: "0rem",
                textTransform: "uppercase" as const,
                whiteSpace: "nowrap",
                transform: isBookNowHovered ? "translateY(0.5rem)" : "translateY(0)",
                zIndex: 10,
              }}
              onMouseEnter={() => setIsBookNowHovered(true)}
              onMouseLeave={() => setIsBookNowHovered(false)}
            >
              {dict.common.bookNow.toUpperCase()}

              {/* Left inverse corner fillet */}
              <svg
                className="absolute pointer-events-none transition-[transform,opacity] duration-200 ease-out"
                viewBox="0 0 12 12"
                style={{
                  top: 0,
                  left: "-0.75rem",
                  width: "0.75rem",
                  height: "0.75rem",
                  fill: "var(--fixmi-primary)",
                  opacity: isBookNowHovered ? 1 : 0,
                  transform: isBookNowHovered ? "scale(1)" : "scale(0.85)",
                  transformOrigin: "top right",
                }}
              >
                <path d="M0,0 Q12,0 12,12 L12,0 Z" />
              </svg>

              {/* Right inverse corner fillet */}
              <svg
                className="absolute pointer-events-none transition-[transform,opacity] duration-200 ease-out"
                viewBox="0 0 12 12"
                style={{
                  top: 0,
                  right: "-0.75rem",
                  width: "0.75rem",
                  height: "0.75rem",
                  fill: "var(--fixmi-primary)",
                  opacity: isBookNowHovered ? 1 : 0,
                  transform: isBookNowHovered ? "scale(1)" : "scale(0.85)",
                  transformOrigin: "top left",
                }}
              >
                <path d="M0,12 Q0,0 12,0 L0,0 Z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ─── Mobile: Language Switcher + StaggeredMenu Toggle ─── */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="navbar" />
          <StaggeredMenu
            position="right"
            items={staggeredItems}
            socialItems={SOCIAL_ITEMS}
            displaySocials={true}
            displayItemNumbering={false}
            menuButtonColor="var(--fixmi-primary)"
            openMenuButtonColor="#ffffff"
            changeMenuColorOnOpen={true}
            colors={["oklch(16% 0.006 240)", "oklch(20% 0.007 240)"]}
            accentColor="var(--fixmi-primary)"
            isFixed={false}
            closeOnClickAway={true}
            onMenuOpen={() => {
              setIsMobileMenuOpen(true);
            }}
            onMenuClose={() => {
              setIsMobileMenuOpen(false);
            }}
            onNavigate={(href) => {
              router.push(href);
            }}
          />
        </div>
      </nav>
    </header>
  );
}
