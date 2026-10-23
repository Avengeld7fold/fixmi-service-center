import { ArchiveRestore, Camera, Download, ExternalLink, Eye, Images, LayoutDashboard, LogOut, ReceiptText, RefreshCw, Search, Sparkles, Trash2, Upload } from "lucide-react";

const SYMBOLS = { backup: ArchiveRestore, camera: Camera, upload: Upload, eye: Eye, trash: Trash2, magnifying: Search, price: ReceiptText, summary: LayoutDashboard, promo: Sparkles, gallery: Images, sync: RefreshCw, logout: LogOut, "browser-click": ExternalLink, download: Download } as const;

export default function AdminSymbol({ name, className = "" }: { name: keyof typeof SYMBOLS; className?: string }) {
  const Icon = SYMBOLS[name];
  return <Icon className={className} aria-hidden="true" strokeWidth={1.65} />;
}
