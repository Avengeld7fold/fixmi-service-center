"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, Sparkles, Image as ImageIcon, ExternalLink, LogOut, Download } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

interface AdminNavProps {
  showExport?: boolean;
}

export default function AdminNav({ showExport = false }: AdminNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      href: "/admin/pricelist",
      publicHref: "/pricelist",
      label: "Daftar Harga & Layanan",
      shortLabel: "Daftar Harga",
      icon: Receipt,
    },
    {
      href: "/admin/promo",
      publicHref: "/promo",
      label: "Promo & Banner",
      shortLabel: "Promo",
      icon: Sparkles,
    },
    {
      href: "/admin/gallery",
      publicHref: "/gallery",
      label: "Galeri Dokumentasi Repair",
      shortLabel: "Galeri Repair",
      icon: ImageIcon,
    },
  ];

  const currentItem = NAV_ITEMS.find((item) => pathname.startsWith(item.href)) ?? NAV_ITEMS[0];

  return (
    <nav className="mb-8 sm:mb-10 lg:mb-12 flex flex-col gap-3.5 sm:gap-4 border-b border-white/[0.08] pb-4 sm:pb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Navigation Tabs (Smooth horizontal scroll on mobile, flex on sm+) */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-x-auto scrollbar-none max-w-full">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 shrink-0 active:scale-[0.98] ${
                  active
                    ? "border border-primary/50 bg-white/[0.08] text-white shadow-[0_0_15px_rgba(255,107,0,0.12)] ring-1 ring-primary/25"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${active ? "text-primary" : "text-neutral-400"}`} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
          {/* Quick link to live public site */}
          <a
            href={currentItem.publicHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka halaman publik di tab baru"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 sm:px-3.5 sm:py-2 text-[0.6875rem] sm:text-xs font-medium text-neutral-300 transition-all duration-150 hover:bg-white/[0.08] hover:text-white hover:border-white/20"
          >
            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Lihat Web</span>
            <span className="sm:hidden">Web</span>
          </a>

          {/* Export Excel only if showExport is true */}
          {showExport && (
            <a
              href="/api/admin/export"
              title="Unduh data harga dalam format Excel"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 sm:px-3.5 sm:py-2 text-[0.6875rem] sm:text-xs font-medium text-white transition-all duration-150 hover:bg-white/[0.08] hover:border-primary/50"
            >
              <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </a>
          )}

          {/* Logout Button */}
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar dari sesi admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 sm:px-3.5 sm:py-2 text-[0.6875rem] sm:text-xs font-medium text-neutral-400 transition-all duration-150 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400"
            >
              <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
