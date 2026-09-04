"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";

interface LanguageSwitcherProps {
  variant?: "navbar" | "drawer" | "footer";
  className?: string;
}

// ponytail: each variant had 2 copy-pasted buttons — extracted to data-driven render
type LocaleOption = { code: "id" | "en"; flag: string; label: string };

const LOCALES: LocaleOption[] = [
  { code: "id", flag: "🇮🇩", label: "INDONESIA" },
  { code: "en", flag: "🇬🇧", label: "ENGLISH" },
];

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
        {LOCALES.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => switchLocale(opt.code)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-mono tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.97] ${
              locale === opt.code
                ? "bg-primary text-[#121212] font-bold shadow-[0_2px_8px_rgba(255,107,0,0.3)] ring-1 ring-primary/40"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            aria-pressed={locale === opt.code}
            aria-label={opt.code === "id" ? "Ganti bahasa ke Bahasa Indonesia" : "Switch language to English"}
          >
            <span className="text-xs">{opt.flag}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`inline-flex items-center gap-2 text-xs font-mono select-none ${className}`}>
        <span className="flex items-center gap-1.5 text-neutral-400 text-[0.6875rem] font-mono tracking-wider">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          <span>{locale === "en" ? "LANGUAGE:" : "BAHASA:"}</span>
        </span>
        <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] p-1 border border-white/[0.08]">
          {LOCALES.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => switchLocale(opt.code)}
              className={`px-2.5 py-0.5 rounded-full text-[0.6875rem] font-mono font-bold tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                locale === opt.code
                  ? "bg-primary text-[#121212] shadow-[0_1px_4px_rgba(255,107,0,0.35)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              aria-pressed={locale === opt.code}
              aria-label={opt.code === "id" ? "Bahasa Indonesia" : "English"}
            >
              {opt.code.toUpperCase()}
            </button>
          ))}
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
      {LOCALES.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => switchLocale(opt.code)}
          className={`px-3 py-1 rounded-full text-[0.6875rem] font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
            locale === opt.code
              ? "bg-primary text-[#121212] shadow-[0_1px_6px_rgba(255,107,0,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
          }`}
          aria-pressed={locale === opt.code}
        >
          {opt.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
