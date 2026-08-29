"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";

interface LanguageSwitcherProps {
  variant?: "navbar" | "drawer" | "footer";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "navbar",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, switchLocale } = useI18n();

  if (variant === "drawer") {
    return (
      <div
        className={`inline-flex items-center self-start gap-1.5 rounded-xl bg-white/[0.05] p-1 border border-white/[0.1] backdrop-blur-md select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
        role="group"
        aria-label="Pilih Bahasa / Language Selector"
      >
        <button
          type="button"
          onClick={() => switchLocale("id")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-mono tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.97] ${
            locale === "id"
              ? "bg-primary text-[#121212] font-bold shadow-[0_2px_8px_rgba(255,107,0,0.3)] ring-1 ring-primary/40"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
          }`}
          aria-pressed={locale === "id"}
          aria-label="Ganti bahasa ke Bahasa Indonesia"
        >
          <span className="text-xs">🇮🇩</span>
          <span>INDONESIA</span>
        </button>
        <button
          type="button"
          onClick={() => switchLocale("en")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-mono tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.97] ${
            locale === "en"
              ? "bg-primary text-[#121212] font-bold shadow-[0_2px_8px_rgba(255,107,0,0.3)] ring-1 ring-primary/40"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
          }`}
          aria-pressed={locale === "en"}
          aria-label="Switch language to English"
        >
          <span className="text-xs">🇬🇧</span>
          <span>ENGLISH</span>
        </button>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`inline-flex items-center gap-2 text-xs font-mono select-none ${className}`}>
        <span className="text-neutral-400 text-[0.6875rem]">🌐 BAHASA:</span>
        <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] p-1 border border-white/[0.08]">
          <button
            type="button"
            onClick={() => switchLocale("id")}
            className={`px-3 py-1 rounded-full text-[0.6875rem] font-mono tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
              locale === "id"
                ? "bg-primary text-[#121212] font-bold shadow-[0_1px_4px_rgba(255,107,0,0.3)]"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            aria-pressed={locale === "id"}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => switchLocale("en")}
            className={`px-3 py-1 rounded-full text-[0.6875rem] font-mono tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
              locale === "en"
                ? "bg-primary text-[#121212] font-bold shadow-[0_1px_4px_rgba(255,107,0,0.3)]"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  // Default: Navbar segmented pill
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-white/[0.05] p-1 border border-white/[0.1] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] select-none transition-colors hover:border-white/20 ${className}`}
      role="group"
      aria-label="Pilih Bahasa / Language Selector"
    >
      <button
        type="button"
        onClick={() => switchLocale("id")}
        className={`px-3 py-1 rounded-full text-[0.6875rem] font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
          locale === "id"
            ? "bg-primary text-[#121212] shadow-[0_1px_6px_rgba(255,107,0,0.35)]"
            : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
        }`}
        aria-pressed={locale === "id"}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`px-3 py-1 rounded-full text-[0.6875rem] font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
          locale === "en"
            ? "bg-primary text-[#121212] shadow-[0_1px_6px_rgba(255,107,0,0.35)]"
            : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
