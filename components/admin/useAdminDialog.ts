"use client";

import { useEffect, useRef, useState } from "react";

const FOCUSABLE = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function useAdminDialog<T extends HTMLElement = HTMLElement>(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<T>(null);
  const closeRef = useRef(onClose);
  const [mounted, setMounted] = useState(isOpen);
  if (isOpen && !mounted) setMounted(true);
  const present = isOpen || mounted;
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const panel = dialogRef.current;
    if (!present || !panel) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = panel.dataset.entered === "true";
    const style = getComputedStyle(panel);
    const from = { opacity: previous ? style.opacity : "0", transform: previous ? style.transform : "translateY(-6px) scale(.98)" };
    panel.dataset.entered = "true";
    const animation = panel.animate([from, {opacity: isOpen ? "1" : "0", transform: isOpen || reduced ? "none" : "translateY(-6px) scale(.98)"}], {duration: reduced ? 0 : isOpen ? 200 : 160, easing: "cubic-bezier(.16,1,.3,1)", fill:"forwards"});
    animation.onfinish = () => { if (!isOpen) setMounted(false); };
    return () => {
      // Preserve the presentation value when an exit is reversed midway.
      if (panel.isConnected) animation.commitStyles();
      animation.cancel();
    };
  }, [isOpen, present]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => initialFocusRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(element => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen]);

  return { dialogRef, initialFocusRef, present };
}
