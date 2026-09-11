import { redirect } from "next/navigation";
import { getPricelist } from "@/lib/pricelist-server";

export const dynamic = "force-dynamic";

export default async function AdminPricelistPage() {
  const categories = await getPricelist();
  const defaultSlug = categories[0]?.Slug || "iphone";
  redirect(`/admin/pricelist/${defaultSlug}`);
}
