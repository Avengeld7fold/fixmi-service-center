import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { buildPricelistXlsx } from "@/lib/admin/export-xlsx";
import { getPricelist } from "@/lib/pricelist-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  if (!(await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await getPricelist();
  const buffer = await buildPricelistXlsx(categories);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pricelist-fixmi-${date}.xlsx"`,
    },
  });
}
