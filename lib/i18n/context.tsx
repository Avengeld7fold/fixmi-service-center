"use client";

import React, { createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Dictionary, Locale } from "./types";
import { getDictionary } from "./getDictionary";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  switchLocale: (target: Locale) => void;
  getLocalizedPath: (path: string, targetLocale?: Locale) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  // Inferred locale from pathname if starting with /en
  const currentLocale: Locale = useMemo(() => {
    if (initialLocale) return initialLocale;
    return pathname.startsWith("/en") ? "en" : "id";
  }, [pathname, initialLocale]);

  const dict = useMemo(() => getDictionary(currentLocale), [currentLocale]);

  const getLocalizedPath = (targetPath: string, targetLocale: Locale = currentLocale): string => {
    // Normalize path by removing existing /en prefix
    let cleanPath = targetPath.startsWith("/en")
      ? targetPath.replace(/^\/en(\/|$)/, "/")
      : targetPath;
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    if (cleanPath === "//") cleanPath = "/";

    if (targetLocale === "en") {
      return cleanPath === "/" ? "/en" : `/en${cleanPath}`;
    }
    return cleanPath;
  };

  const switchLocale = (target: Locale) => {
    if (target === currentLocale) return;

    let cleanPath = pathname.startsWith("/en")
      ? pathname.replace(/^\/en(\/|$)/, "/")
      : pathname;
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

    let targetUrl = target === "en"
      ? (cleanPath === "/" ? "/en" : `/en${cleanPath}`)
      : cleanPath;

    // Retain query parameters (e.g. ?device=iphone) from client window without triggering Suspense CSR bailout
    if (typeof window !== "undefined" && window.location.search) {
      const q = window.location.search;
      if (q && q !== "?") {
        targetUrl += q;
      }
    }

    router.push(targetUrl, { scroll: false });
  };

  const value = useMemo(
    () => ({
      locale: currentLocale,
      dict,
      switchLocale,
      getLocalizedPath,
    }),
    [currentLocale, dict, pathname]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    const dict = getDictionary("id");
    return {
      locale: "id",
      dict,
      switchLocale: () => {},
      getLocalizedPath: (p) => p,
    };
  }
  return context;
}
