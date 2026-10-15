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
export const FALLBACK_REVIEWS: GooglePlaceData = {
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


