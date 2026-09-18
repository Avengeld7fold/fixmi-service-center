import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    revalidatePath("/pricelist");
    revalidatePath("/en/pricelist");
    revalidatePath("/pricelist/[kategori]", "page");
    revalidatePath("/en/pricelist/[kategori]", "page");

    const categories = ["iphone", "ipad", "macbook", "iwatch", "android"];
    for (const cat of categories) {
      revalidatePath(`/pricelist/${cat}`);
      revalidatePath(`/en/pricelist/${cat}`);
    }

    revalidatePath("/promo");
    revalidatePath("/en/promo");
    revalidatePath("/gallery");
    revalidatePath("/en/gallery");

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      message: "Cache frontend untuk semua kategori pricelist, promo, dan galeri berhasil disegarkan!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal revalidate", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
