import Link from "next/link";
import { ArchiveRestore, ChevronRight, Images, ReceiptText, ShieldCheck, Sparkles } from "lucide-react";
import { getPricelist } from "@/lib/pricelist-server";
import { getPromoItems } from "@/lib/promo-server";
import { getGalleryImages } from "@/lib/gallery-server";
import { listBackups } from "@/lib/admin/pricelist-write";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const [categories, promos, gallery, backups] = await Promise.all([getPricelist(), getPromoItems(), getGalleryImages(), listBackups()]);
  const services = categories.flatMap(category => category.service_types);
  const stats = [
    { label: "Layanan", value: services.length, icon: ReceiptText },
    { label: "Model perangkat", value: services.reduce((sum, service) => sum + service.device_prices.length, 0), icon: ShieldCheck },
    { label: "Promo", value: promos.length, icon: Sparkles },
    { label: "Foto galeri", value: gallery.length, icon: Images },
  ];
  const links = [
    { href: `/admin/pricelist/${categories[0]?.Slug || "iphone"}`, label: "Kelola daftar harga", icon: ReceiptText },
    { href: "/admin/promo", label: "Kelola promo & banner", icon: Sparkles },
    { href: "/admin/gallery", label: "Kelola galeri", icon: Images },
  ];
  return (
    <div className="admin-page">
      <AdminNav />
      <h2 className="admin-overview-title">Workspace</h2>
      <AdminPageHeader title="Ringkasan" description="Kelola katalog layanan, promo, dan dokumentasi website." />
      <section className="admin-dashboard-grid" aria-label="Ringkasan data">
        {stats.map(({label,value,icon:Icon}) => <article className="admin-stat" key={label}><Icon aria-hidden="true" /><strong>{value.toLocaleString("id-ID")}</strong><span>{label}</span></article>)}
      </section>
      <section className="admin-dashboard-panels">
        <div className="admin-dashboard-panel">
          <h2>Akses cepat</h2>
          <div className="admin-quick-links">{links.map(({href,label,icon:Icon}) => <Link href={href} key={href}><span className="inline-flex items-center gap-2.5"><Icon aria-hidden="true" />{label}</span><ChevronRight aria-hidden="true" /></Link>)}</div>
        </div>
        <div className="admin-dashboard-panel">
          <h2 className="inline-flex items-center gap-2"><ArchiveRestore className="h-4 w-4" aria-hidden="true" />Cadangan data</h2>
          <div className="admin-backup-summary">{backups[0] ? <><strong>{backups.length} backup tersedia</strong><span>Terbaru {new Intl.DateTimeFormat("id-ID", {dateStyle:"medium",timeStyle:"short"}).format(new Date(backups[0].modifiedAt))}</span></> : <><strong>Belum ada backup</strong><span>Backup otomatis muncul setelah perubahan katalog.</span></>}</div>
        </div>
      </section>
    </div>
  );
}
