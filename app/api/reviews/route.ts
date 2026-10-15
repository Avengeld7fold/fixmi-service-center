import { NextResponse } from "next/server";
import { FALLBACK_REVIEWS, type GoogleReview } from "@/lib/reviews";

interface GooglePlaceReview {
  author_name?: string;
  author_url?: string;
  profile_photo_url?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: number;
  translated?: boolean;
  language?: string;
  original_language?: string;
}
// Revalidate cache setiap 24 jam (86400 detik) untuk efisiensi kuota dan kecepatan loading instan
export const revalidate = 86400;

export async function GET() {
  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || "ChIJj_DAV25E0i0Rz5J1sgt3mkA";

  if (!apiKey || !placeId) {
    return NextResponse.json(FALLBACK_REVIEWS, { status: 200 });
  }

  try {
    // Ambil ulasan dari Google API (Bahasa Indonesia & Bahasa Asli/English, urutan Relevan & Terbaru)
    const [resIdRel, resIdNew, resEnRel, resEnNew] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=most_relevant&key=${apiKey}&language=id`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=newest&key=${apiKey}&language=id`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=most_relevant&key=${apiKey}&language=en`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=newest&key=${apiKey}&language=en`,
        { next: { revalidate: 86400 } }
      ),
    ]);

    const dataIdRel = resIdRel.ok ? await resIdRel.json() : null;
    const dataIdNew = resIdNew.ok ? await resIdNew.json() : null;
    const dataEnRel = resEnRel.ok ? await resEnRel.json() : null;
    const dataEnNew = resEnNew.ok ? await resEnNew.json() : null;

    const baseResult =
      dataIdRel?.result ||
      dataIdNew?.result ||
      dataEnRel?.result ||
      dataEnNew?.result;

    if (!baseResult) {
      return NextResponse.json(FALLBACK_REVIEWS, { status: 200 });
    }

    const allRawReviews = [
      ...(dataIdRel?.result?.reviews || []),
      ...(dataIdNew?.result?.reviews || []),
      ...(dataEnRel?.result?.reviews || []),
      ...(dataEnNew?.result?.reviews || []),
    ];

    // Simpan teks ulasan asli tanpa terjemahan mesin (translated === false)
    const originalMap = new Map<string, GooglePlaceReview>();

    for (const rev of allRawReviews) {
      const key = `${rev.author_name}-${rev.time}`;
      const isOriginal =
        rev.translated === false || rev.language === rev.original_language;

      if (!originalMap.has(key)) {
        originalMap.set(key, rev);
      } else {
        const existing = originalMap.get(key);
        // Prioritaskan teks asli yang bukan terjemahan
        if (isOriginal && existing?.translated) {
          originalMap.set(key, rev);
        }
      }
    }

    const finalReviews: GoogleReview[] = Array.from(originalMap.values()).map(
      (rev, idx) => ({
        id: `google-rev-${rev.time || idx}`,
        authorName: rev.author_name || "Pelanggan Terverifikasi",
        authorUrl: rev.author_url,
        profilePhotoUrl: rev.profile_photo_url,
        rating: rev.rating || 5,
        relativeTime: rev.relative_time_description || "Baru saja",
        text: rev.text || "",
        time: rev.time || Date.now() / 1000,
      })
    );

    return NextResponse.json(
      {
        name: baseResult.name || "FIXMI SERVICE CENTER",
        rating: baseResult.rating || 4.8,
        totalRatings: baseResult.user_ratings_total || 404,
        mapsUrl:
          baseResult.url ||
          "https://maps.google.com/?cid=4655164056963224271",
        reviews: finalReviews.length > 0 ? finalReviews : FALLBACK_REVIEWS.reviews,
        isLive: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (err) {
    console.error("Error fetching Google Place reviews:", err);
    return NextResponse.json(FALLBACK_REVIEWS, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  }
}

