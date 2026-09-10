import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FIXMI Service Center",
    short_name: "FIXMI",
    description:
      "Pusat service iPhone, iPad, MacBook & Android terpercaya di Bali sejak 2014. Transparan, rapi, bergaransi.",
    start_url: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#FF6B00",
    icons: [
      {
        src: "/favinco.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/fixmi-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/fixmi-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
