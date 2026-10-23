"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, ExternalLink, LogOut, MoreHorizontal, RefreshCw } from "@/components/admin/AdminIcons";
import { logoutAction, syncFrontendCacheAction } from "@/app/admin/actions";
import ExportModal, { type ExportCategoryOption } from "./ExportModal";

interface AdminNavProps { showExport?: boolean; exportCategories?: ExportCategoryOption[]; }

export default function AdminNav({ showExport = false, exportCategories = [] }: AdminNavProps) {
  const pathname = usePathname();
  const [exportOpen, setExportOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = () => { setMenuOpen(false); menuButton.current?.focus(); };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const frame = requestAnimationFrame(() => menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus());
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !menu.current?.contains(event.target) && !menuButton.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("pointerdown", outside); };
  }, [menuOpen]);
  const title = pathname.startsWith("/admin/pricelist") ? "Daftar Harga" : pathname.startsWith("/admin/promo") ? "Promo & Banner" : pathname.startsWith("/admin/gallery") ? "Galeri" : "Ringkasan";
  const category = pathname.split("/").filter(Boolean)[2];
  const href = pathname.startsWith("/admin/pricelist") ? `/pricelist${category ? "/" + category : ""}` : pathname.startsWith("/admin/promo") ? "/promo" : pathname.startsWith("/admin/gallery") ? "/gallery" : "/";
  async function sync() {
    if (syncing) return;
    setSyncing(true);
    setStatus("");
    if (timer.current) clearTimeout(timer.current);
    try { const result = await syncFrontendCacheAction(); setStatus(result.ok ? "Tersinkron" : "Gagal menyinkronkan. Coba lagi."); if (result.ok) timer.current = setTimeout(() => setStatus(""), 4000); }
    catch { setStatus("Gagal menyinkronkan"); }
    finally { setSyncing(false); }
  }
  return (
    <header className="admin-toolbar">
      <h1>{title}</h1>
      <div className="admin-toolbar-actions">
        <a href={href} target="_blank" rel="noopener noreferrer" className="admin-control" title="Lihat website"><ExternalLink aria-hidden="true" /><span>Lihat Web</span></a>
        {showExport && <button type="button" className="admin-control" aria-label="Ekspor" onClick={() => setExportOpen(true)}><Download aria-hidden="true" /><span>Ekspor</span></button>}
        <div className="admin-actions-menu" onKeyDown={event => {
          if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
          if (event.key === "Tab") setMenuOpen(false);
          if (menuOpen && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') || []);
            const current = items.indexOf(document.activeElement as HTMLButtonElement);
            const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
            items[index]?.focus();
          }
        }}>
          <button ref={menuButton} type="button" className="admin-control" aria-label="Tindakan lainnya" aria-haspopup="menu" aria-expanded={menuOpen} aria-controls="admin-action-menu" onClick={() => setMenuOpen(open => !open)} onKeyDown={event => {if(event.key === "ArrowDown") {event.preventDefault(); setMenuOpen(true);}}}><MoreHorizontal aria-hidden="true" /></button>
          <div ref={menu} id="admin-action-menu" role="menu" aria-label="Tindakan admin" inert={!menuOpen} className="admin-actions-popover" data-open={menuOpen}>
            <button role="menuitem" type="button" className="admin-menu-item" disabled={syncing} aria-busy={syncing} onClick={sync}><RefreshCw aria-hidden="true" className={syncing ? "animate-spin" : ""} /><span>{syncing ? "Menyinkronkan…" : "Sync Cache"}</span></button>
            <form role="none" action={logoutAction}><button role="menuitem" type="submit" className="admin-menu-item"><LogOut aria-hidden="true" /><span>Keluar</span></button></form>
          </div>
        </div>
        <span className="admin-toolbar-status" role="status">{status}</span>
      </div>
      {showExport && <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} categories={exportCategories} />}
    </header>
  );
}
