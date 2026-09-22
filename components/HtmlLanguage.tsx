"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function HtmlLanguage({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const pathname = usePathname();
  const lang = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";

  return <html lang={lang} className={className}>{children}</html>;
}
