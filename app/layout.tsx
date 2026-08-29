import type { Metadata, Viewport } from "next";
import { Geist_Mono, Bayon } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScrolling from "@/components/SmoothScrolling";
import LoadingGate from "@/components/loader/LoadingGate";
import "lenis/dist/lenis.css";
import "./globals.css";

const bayon = Bayon({
  variable: "--font-bayon",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const neueMontreal = localFont({
  src: [
    {
      path: "../public/fonts/neue-montreal/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-montreal/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-montreal/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-montreal/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-neue-montreal",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmibali.com";

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FIXMI — Pusat Service iPhone, iPad, MacBook & Android di Bali",
    template: "%s | FIXMI Service Center Bali",
  },
  description:
    "Pusat perbaikan perangkat pintar terpercaya di Bali sejak Agustus 2014. Spesialis ganti LCD, baterai, kamera, dan mikrosolder motherboard iPhone, iPad, MacBook & Android. Pengerjaan presisi, transparan, bergaransi resmi. 3 Gerai di Kedonganan, Jimbaran, dan Denpasar.",
  keywords: [
    "service iphone bali",
    "service iphone denpasar",
    "service iphone kuta",
    "service iphone jimbaran",
    "service macbook bali",
    "service ipad bali",
    "service hp bali",
    "ganti lcd iphone bali",
    "ganti baterai iphone bali",
    "mikrosolder motherboard bali",
    "fixmi service center",
    "fixmi bali digital",
    "tempat service hp terdekat bali",
    "apple repair bali",
    "iphone repair bali kuta",
    "android repair denpasar",
  ],
  authors: [{ name: "PT Fixmi Bali Digital", url: SITE_URL }],
  creator: "PT Fixmi Bali Digital",
  publisher: "PT Fixmi Bali Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "FIXMI Service Center Bali",
    title: "FIXMI — Pusat Service iPhone, iPad, MacBook & Android di Bali",
    description:
      "Pusat perbaikan gadget & lab mikrosolder terpercaya di Bali sejak 2014. Spesialis ganti LCD, baterai, kamera, dan perbaikan motherboard bergaransi resmi. 3 Gerai di Kedonganan, Jimbaran, dan Denpasar.",
    images: [
      {
        url: "/images/faq-portrait.jpg",
        width: 1200,
        height: 630,
        alt: "FIXMI Service Center Bali — Precision Repair Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FIXMI — Pusat Service iPhone, iPad, MacBook & Android di Bali",
    description:
      "Pusat perbaikan gadget terpercaya di Bali sejak 2014. Spesialis mikrosolder logic board, ganti LCD, baterai & sparepart pilihan bergaransi resmi.",
    images: ["/images/faq-portrait.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/fixmi-logo.png",
  },
};

const JSON_LD_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ElectronicsRepair",
      "@id": `${SITE_URL}/#organization`,
      name: "PT Fixmi Bali Digital",
      alternateName: "FIXMI Service Center Bali",
      url: SITE_URL,
      logo: `${SITE_URL}/fixmi-logo.png`,
      image: `${SITE_URL}/images/faq-portrait.jpg`,
      telephone: "+6281999336722",
      priceRange: "$$",
      description:
        "Pusat perbaikan perangkat pintar terpercaya di Bali sejak 2014. Spesialis ganti LCD, baterai, kamera, dan mikrosolder motherboard iPhone, iPad, MacBook & Android.",
      foundingDate: "2014-08",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Link. Kubu Alit Kedonganan, Jl. Raya Uluwatu",
        addressLocality: "Kuta, Badung",
        addressRegion: "Bali",
        postalCode: "80361",
        addressCountry: "ID",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -8.759229543631317,
        longitude: 115.17628628769123,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "21:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Sunday",
          opens: "09:00",
          closes: "18:00",
        },
      ],
      sameAs: [
        "https://www.instagram.com/fixmi.id",
        "https://www.tiktok.com/@fixmi.id",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "FIXMI Service Center Bali",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "id-ID",
    },
  ],
};

import { I18nProvider } from "@/lib/i18n/context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistMono.variable} ${neueMontreal.variable} ${bayon.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_STRUCTURED_DATA) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <LoadingGate>
          <I18nProvider>
            <SmoothScrolling>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </SmoothScrolling>
          </I18nProvider>
        </LoadingGate>
      </body>
    </html>
  );
}
