"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, ExternalLink, LogOut, MoreHorizontal, RefreshCw } from "lucide-react";
import { logoutAction, syncFrontendCacheAction } from "@/app/admin/actions";
import ExportModal, { type ExportCategoryOption } from "./ExportModal";

interface AdminNavProps { showExport?: boolean; exportCategories?: ExportCategoryOption[]; }

export default function AdminNav({ showExport = false, exportCategories = [] }: AdminNavProps) {
  const pathname = usePathname();
  const [exportOpen, setExportOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");
  const details = useRef<HTMLDetailsElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const title = pathname.startsWith("/admin/pricelist") ? "Daftar Harga" : pathname.startsWith("/admin/promo") ? "Promo & Banner" : pathname.startsWith("/admin/gallery") ? "Galeri" : "Ringkasan";
  const category = pathname.split("/").filter(Boolean)[2];
  const href = pathname.startsWith("/admin/pricelist") ? `/pricelist${category ? "/" + category : ""}` : pathname.startsWith("/admin/promo") ? "/promo" : pathname.startsWith("/admin/gallery") ? "/gallery" : "/";
  async function sync() {
    if (syncing) return;
    setSyncing(true);
    setStatus("");
    try { const result = await syncFrontendCacheAction(); setStatus(result.ok ? "Tersinkron" : "Gagal menyinkronkan"); }
    catch { setStatus("Gagal menyinkronkan"); }
    finally { setSyncing(false); timer.current = setTimeout(() => setStatus(""), 3000); }
  }
  return (
    <header className="admin-toolbar">
      <h1>{title}</h1>
      <div className="admin-toolbar-actions">
        <a href={href} target="_blank" rel="noopener noreferrer" className="admin-control" title="Lihat website"><ExternalLink aria-hidden="true" /><span>Lihat Web</span></a>
        {showExport && <button type="button" className="admin-control" aria-label="Ekspor" onClick={() => setExportOpen(true)}><Download aria-hidden="true" /><span>Ekspor</span></button>}
        <details ref={details} className="admin-actions-menu" onKeyDown={event => {if (event.key === "Escape") { details.current?.removeAttribute("open"); details.current?.querySelector("summary")?.focus(); }}}>
          <summary className="admin-control" aria-label="Tindakan lainnya"><MoreHorizontal aria-hidden="true" /></summary>
          <div className="admin-actions-popover">
            <button type="button" className="admin-menu-item" disabled={syncing} aria-busy={syncing} onClick={sync}><RefreshCw aria-hidden="true" className={syncing ? "animate-spin" : ""} /><span>{syncing ? "Menyinkronkan…" : "Sync Cache"}</span></button>
            <form action={logoutAction}><button type="submit" className="admin-menu-item"><LogOut aria-hidden="true" /><span>Keluar</span></button></form>
          </div>
        </details>
        <span className="admin-toolbar-status" role="status">{status}</span>
      </div>
      {showExport && <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} categories={exportCategories} />}
    </header>
  );
}
