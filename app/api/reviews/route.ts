import { NextResponse } from "next/server";

export interface GoogleReview {
  id: string;
  authorName: string;
  authorUrl?: string;
  profilePhotoUrl?: string;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
}

export interface GooglePlaceData {
  name: string;
  rating: number;
  totalRatings: number;
  mapsUrl: string;
  reviews: GoogleReview[];
  isLive: boolean;
}

// Fallback data otentik sesuai bahasa asli yang diketik reviewer
const FALLBACK_REVIEWS: GooglePlaceData = {
  name: "FIXMI SERVICE CENTER",
  rating: 4.8,
  totalRatings: 404,
  mapsUrl: "https://maps.google.com/?cid=4655164056963224271",
  isLive: false,
  reviews: [
    {
      id: "rev-1",
      authorName: "Samsul Arifin",
      authorUrl: "https://maps.google.com/?cid=4655164056963224271",
      profilePhotoUrl:
        "https://lh3.googleusercontent.com/a-/ALV-UjV0HH_bNAIN4XCHQjm4eXRlIzoi8no3o3rWJOUn9lWtd9k8X8w=s128-c0x00000000-cc-rp-mo",
      rating: 5,
      relativeTime: "4 minggu lalu",
      text: "Setelah di pakek 2hr, Alhamdulillah aman, sbelumnya sempat di bawa ulang karna mati2 habis di benerin. Namun tempat ini bertanggung jawab atas masalah2 hp customer. Sangat terbilang handal dan profesional menangani kerusakan mesin dan baterai.",
      time: 1785423011,
    },
    {
      id: "rev-2",
      authorName: "B_6_Nurcholis Akbar Faj'rin",
      authorUrl: "https://maps.google.com/?cid=4655164056963224271",
      profilePhotoUrl:
        "https://lh3.googleusercontent.com/a-/ALV-UjWlD_QpDgutZfvGVAOIwjKsBPMITG8GcBzwxwBhaDrPD8wVyL-u=s128-c0x00000000-cc-rp-mo",
      rating: 5,
      relativeTime: "4 bulan lalu",
      text: "Selalu langganan kalau service gadget bermasalah disini. Pelayanan ramah, cepat, segala pengecekan dan perbaikan selalu mendapatkan informasi yang jelas dan selalu dikonfirmasi terlebih dahulu. Terima kasih team Fixmi.",
      time: 1777000045,
    },
    {
      id: "rev-3",
      authorName: "Malik Shishtawi",
      authorUrl: "https://maps.google.com/?cid=4655164056963224271",
      profilePhotoUrl:
        "https://lh3.googleusercontent.com/a-/ALV-UjVTZ_2paLnTlT9qU2nsKAQooFKJ7IPeeHQkM86CHwNPVukQhv0=s128-c0x00000000-cc-rp-mo-ba4",
      rating: 5,
      relativeTime: "in the last week",
      text: "What an amazing team! Fixmi Service Center! You could tell it the moment you step in. From reception lady to all technicians, they are very welcoming, patient and professional. My son iPhone stopped working because of sea water and they fixed it in front of me.",
      time: 1787418223,
    },
    {
      id: "rev-4",
      authorName: "Nathan Goode",
      authorUrl: "https://maps.google.com/?cid=4655164056963224271",
      profilePhotoUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocLb_-VGufKUc5K15wKwdxPEULsoMXHD6UB01pqSRGcrF67cQA=s128-c0x00000000-cc-rp-mo-ba2",
      rating: 5,
      relativeTime: "a month ago",
      text: "Amazing service here at Fixmi Kuta Bali. I needed to have my phone's CPU reballed. I got to watch the process on 4k camera on the big screen, which was awesome. Great value for repair. Highly recommended.",
      time: 1785151285,
    },
    {
      id: "rev-5",
      authorName: "Adnan Maulana",
      authorUrl: "https://maps.google.com/?cid=4655164056963224271",
      profilePhotoUrl:
        "https://lh3.googleusercontent.com/a-/ALV-UjX8kX6lK1IVF-2etzx6HeG3LCKxmT-8J6rC9nniNBE_ri83obM=s128-c0x00000000-cc-rp-mo",
      rating: 5,
      relativeTime: "3 bulan lalu",
      text: "Tempatnya terpercaya, memiliki teknisi yang ahli dalam menyelesaikan berbagai masalah handphone. Alat-alatnya lengkap sehingga dapat menganalisis masalah dengan tepat.",
      time: 1779526671,
    },
  ],
};

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
    const originalMap = new Map<string, any>();

    for (const rev of allRawReviews) {
      const key = `${rev.author_name}-${rev.time}`;
      const isOriginal =
        rev.translated === false || rev.language === rev.original_language;

      if (!originalMap.has(key)) {
        originalMap.set(key, rev);
      } else {
        const existing = originalMap.get(key);
        // Prioritaskan teks asli yang bukan terjemahan
        if (isOriginal && existing.translated) {
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
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching Google Place reviews:", err);
    return NextResponse.json(FALLBACK_REVIEWS, { status: 200 });
  }
}
