"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, LayoutDashboard, Menu, ReceiptText, Sparkles, X } from "@/components/admin/AdminIcons";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";
import AdminBrandLogo from "./AdminBrandLogo";

const GROUPS = [
  { title: "Workspace", items: [
    { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  ] },
  { title: "Katalog", items: [
    { href: "/admin/pricelist", label: "Daftar Harga", icon: ReceiptText },
    { href: "/admin/promo", label: "Promo & Banner", icon: Sparkles },
    { href: "/admin/gallery", label: "Galeri Servis", icon: Images },
  ] },
];

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(true);
  const sidebar = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    const focus = () => setActive(true);
    const blur = () => setActive(false);
    window.addEventListener("focus", focus);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("focus", focus); window.removeEventListener("blur", blur); };
  }, []);

  useEffect(() => {
    const media = matchMedia("(max-width: 719px)");
    const sync = () => {
      if (sidebar.current) sidebar.current.inert = media.matches && !menuOpen;
      if (main.current) main.current.inert = media.matches && menuOpen;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [menuOpen, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => sidebar.current?.querySelector<HTMLElement>("a[href]")?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        requestAnimationFrame(() => toggle.current?.focus());
      }
      if (event.key !== "Tab") return;
      const controls = [...(sidebar.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") || [])];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", keydown); document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  if (pathname === "/admin/login") return <>{children}</>;
  return (
    <div className={`admin-window-container ${active ? "" : "is-inactive"}`} data-menu-open={menuOpen}>
      <aside ref={sidebar} className="admin-sidebar" aria-label="Navigasi admin">
        <div className="admin-sidebar-chrome" aria-hidden="true">
          <span className="admin-traffic-dot close" /><span className="admin-traffic-dot min" /><span className="admin-traffic-dot zoom" />
        </div>
        <Link href="/admin" className="admin-brand" aria-label={ADMIN_IDENTITY.adminName}>
          <AdminBrandLogo />
          <span className="admin-brand-caption">{ADMIN_IDENTITY.adminName}</span>
        </Link>
        <nav>
          {GROUPS.map(group => <div className="admin-nav-group" key={group.title}>
            <p className="admin-sidebar-section">{group.title}</p>
            <div className="admin-navigation">{group.items.map(({href,label,icon:Icon}) => {
              const selected = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} title={label} aria-current={selected ? "page" : undefined} data-active={selected} onClick={() => setMenuOpen(false)}><Icon aria-hidden="true" /><span>{label}</span></Link>;
            })}</div>
          </div>)}
        </nav>
        <p className="admin-sidebar-footer">{ADMIN_IDENTITY.adminName}</p>
        <button type="button" className="admin-sidebar-close" aria-label="Tutup navigasi" onClick={() => {setMenuOpen(false); toggle.current?.focus();}}><X aria-hidden="true" /></button>
      </aside>
      <button className="admin-mobile-backdrop" type="button" tabIndex={-1} aria-label="Tutup navigasi" onClick={() => {setMenuOpen(false); toggle.current?.focus();}} />
      <button ref={toggle} className="admin-mobile-toggle" type="button" aria-label="Buka navigasi" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu aria-hidden="true" /></button>
      <main ref={main} className="admin-main">{children}</main>
    </div>
  );
}
