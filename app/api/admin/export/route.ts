import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { buildPricelistXlsx } from "@/lib/admin/export-xlsx";
import { getPricelist } from "@/lib/pricelist-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (!(await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get("category") || undefined;
  const serviceSlug = searchParams.get("service") || undefined;

  const categories = await getPricelist();
  const buffer = await buildPricelistXlsx(categories, { categorySlug, serviceSlug });
  const date = new Date().toISOString().slice(0, 10);

  let fileIdentifier = "semua";
  if (categorySlug && serviceSlug) {
    fileIdentifier = `${categorySlug}-${serviceSlug}`;
  } else if (categorySlug) {
    fileIdentifier = categorySlug;
  }

  const safeFilename = `pricelist-${fileIdentifier.replace(/[^a-zA-Z0-9_-]/g, "")}-${date}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
    },
  });
}
