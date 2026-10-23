import type { Metadata } from "next";
import { ADMIN_IDENTITY } from "@/lib/admin/identity";
import AdminChrome from "@/components/admin/AdminChrome";
import "./admin.css";

export const metadata: Metadata = {
  title: ADMIN_IDENTITY.adminName,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell"><AdminChrome>{children}</AdminChrome></div>;
}
