"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./StaggeredMenu.css";
import LanguageSwitcher from "./LanguageSwitcher";

/* ─── Types ─── */
interface StaggeredMenuItem {
  label: string;
  ariaLabel?: string;
  link: string;
}

interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

interface StaggeredMenuCtaItem {
  label: string;
  link: string;
  ariaLabel?: string;
}

interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  ctaItem?: StaggeredMenuCtaItem;
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onNavigate?: (href: string) => void;
}

const getPrelayerColors = (colors?: string[]): string[] => {
  const raw = colors && colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
  const arr = [...raw];
  if (arr.length >= 3) {
    arr.splice(Math.floor(arr.length / 2), 1);
  }
  return arr;
};

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  colors = ["#B497CF", "#5227FF"],
  items = [],
  ctaItem,
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = "#fff",
  openMenuButtonColor = "#fff",
  accentColor = "#5227FF",
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
  onNavigate,
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLDivElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const prelayerColors = React.useMemo(() => getPrelayerColors(colors), [colors]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      let preLayers: HTMLDivElement[] = [];
      if (preContainer) {
        preLayers = Array.from(
          preContainer.querySelectorAll<HTMLDivElement>(".sm-prelayer")
        );
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1, force3D: true });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    gsap.killTweensOf([panel, ...layers]);

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel"));
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
    );
    const socialTitle = panel.querySelector(".sm-socials-title");
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link"));

    const offscreen = position === "left" ? -100 : 100;
    const layerStates = layers.map((el) => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10, force3D: true });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { "--sm-num-opacity": 0 } as gsap.TweenVars);
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const ctaWrap = panel.querySelector(".sm-cta-wrap");
    if (ctaWrap) {
      gsap.set(ctaWrap, { y: 20, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start, force3D: true },
        { xPercent: 0, duration: 0.5, ease: "power4.out", force3D: true },
        i * 0.07
      );
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;
    tl.fromTo(
      panel,
      { xPercent: panelStart, force3D: true },
      { xPercent: 0, duration: panelDuration, ease: "power4.out", force3D: true },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          force3D: true,
          stagger: { each: 0.1, from: "start" },
        },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.08, from: "start" },
          } as gsap.TweenVars,
          itemsStart + 0.1
        );
      }
    }

    if (ctaWrap) {
      const ctaStart = panelInsertTime + panelDuration * 0.3;
      tl.to(
        ctaWrap,
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power3.out",
        },
        ctaStart
      );
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" });
            },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    closeTweenRef.current?.kill();
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (panel) gsap.killTweensOf([...layers, panel]);

    const tl = buildOpenTimeline();
    tl?.play(0);
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    gsap.killTweensOf(all);

    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      force3D: true,
      onComplete: () => {
        const itemEls = panel.querySelectorAll(".sm-panel-itemLabel");
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10, force3D: true });
        const numberEls = panel.querySelectorAll(
          ".sm-panel-list[data-numbering] .sm-panel-item"
        );
        if (numberEls.length) {
          gsap.set(numberEls, { "--sm-num-opacity": 0 } as gsap.TweenVars);
        }
        const socialTitle = panel.querySelector(".sm-socials-title");
        const socialLinks = panel.querySelectorAll(".sm-socials-link");
        const ctaWrap = panel.querySelector(".sm-cta-wrap");
        if (ctaWrap) gsap.set(ctaWrap, { y: 20, opacity: 0 });
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
      },
    });
  }, [position]);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateColor(target);
  }, [playOpen, playClose, animateColor, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateColor(false);
    }
  }, [playClose, animateColor, onMenuClose]);

  // Click-away listener
  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (onNavigate) {
        e.preventDefault();
        closeMenu();
        setTimeout(() => onNavigate(href), 80);
      } else {
        closeMenu();
      }
    },
    [onNavigate, closeMenu]
  );

  return (
    <div
      className={
        (className ? className + " " : "") +
        "staggered-menu-wrapper" +
        (isFixed ? " fixed-wrapper" : "")
      }
      style={accentColor ? ({ "--sm-accent": accentColor } as React.CSSProperties) : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      {/* Backdrop */}
      <div className="sm-backdrop" onClick={closeMenu} aria-hidden="true" />

      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {prelayerColors.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      {/* Toggle button — standard 3-line hamburger */}
      <button
        ref={toggleBtnRef}
        className="sm-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={toggleMenu}
        type="button"
      >
        <span className="sm-hamburger-box">
          <span className={`sm-hamburger-inner ${open ? "open" : ""}`} />
        </span>
      </button>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          <LanguageSwitcher variant="drawer" className="mb-6" />
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items && items.length ? (
              items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <a
                    className="sm-panel-item"
                    href={it.link}
                    aria-label={it.ariaLabel}
                    data-index={idx + 1}
                    onClick={(e) => handleItemClick(e, it.link)}
                  >
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </a>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>

          {/* CTA Action Button (e.g. CONTACT NOW) */}
          {ctaItem && (
            <div className="sm-cta-wrap pt-1">
              <a
                className="inline-flex items-center justify-center gap-2 self-start min-h-[40px] px-5 py-2 rounded-xl bg-primary text-[#121212] font-bold text-xs tracking-[0.08em] uppercase no-underline transition-all duration-200 active:scale-[0.97] hover:brightness-105"
                style={{
                  fontFamily: "var(--font-neue-montreal), sans-serif",
                  boxShadow:
                    "0 4px 14px -3px rgba(255, 107, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
                }}
                href={ctaItem.link}
                aria-label={ctaItem.ariaLabel || ctaItem.label}
                onClick={(e) => handleItemClick(e, ctaItem.link)}
              >
                <span>{ctaItem.label}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-[#121212] shrink-0"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          )}

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
