"use client";

import { useEffect, useRef } from "react";
import { MAP_CENTER, STORES, mapEmbedUrl, type Store } from "@/lib/stores";

/**
 * Satu peta dengan 3 pin gerai (Google Maps JS API).
 * Menggunakan client-side DARK_STYLE styling (#121212 base, jalan abu gelap, air hitam)
 * dengan custom vector SVG pins.
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Style gelap selaras palet situs (#121212 base, jalan abu, air lebih gelap).
const DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1b1b1b" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#121212" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#303030" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2b2b2b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a3a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#7a7a7a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1114" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a5560" }] },
];

const PIN_PATH =
  "M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9zm0 12.5A3.5 3.5 0 1 1 12 5.5a3.5 3.5 0 0 1 0 7z";

interface MapsBundle {
  Map: typeof google.maps.Map;
  Marker: typeof google.maps.Marker;
  LatLngBounds: typeof google.maps.LatLngBounds;
  Point: typeof google.maps.Point;
}

// Loader singleton — script Maps hanya dimuat sekali per halaman.
let mapsPromise: Promise<MapsBundle> | null = null;

function loadMaps(): Promise<MapsBundle> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (mapsPromise) return mapsPromise;

  mapsPromise = (async () => {
    if (!document.querySelector("script[data-fixmi-maps]")) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&loading=async`;
      script.async = true;
      script.dataset.fixmiMaps = "";
      document.head.appendChild(script);
    }

    const deadline = Date.now() + 15000;
    while (!window.google?.maps?.importLibrary) {
      if (Date.now() > deadline) throw new Error("Google Maps gagal dimuat (cek API key & koneksi)");
      await new Promise((r) => setTimeout(r, 60));
    }

    const [mapsLib, markerLib, coreLib] = await Promise.all([
      google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
      google.maps.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
      google.maps.importLibrary("core") as Promise<google.maps.CoreLibrary>,
    ]);

    return {
      Map: mapsLib.Map,
      Marker: markerLib.Marker,
      LatLngBounds: coreLib.LatLngBounds,
      Point: coreLib.Point,
    };
  })();

  return mapsPromise;
}

interface StoreMapProps {
  active: string;
  onSelect: (key: string) => void;
  className?: string;
}

export default function StoreMap({ active, onSelect, className }: StoreMapProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const libRef = useRef<MapsBundle | null>(null);

  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  // Inisialisasi peta dengan DARK_STYLE murni (tanpa mapId agar style custom aktif 100%)
  useEffect(() => {
    if (!API_KEY || !holderRef.current) return;
    let cancelled = false;

    loadMaps()
      .then((maps) => {
        if (cancelled || !holderRef.current) return;
        libRef.current = maps;
        const map = new maps.Map(holderRef.current, {
          center: MAP_CENTER,
          zoom: 11,
          styles: DARK_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          backgroundColor: "#121212",
        });
        mapRef.current = map;

        STORES.forEach((store: Store) => {
          const marker = new maps.Marker({
            map,
            position: { lat: store.lat, lng: store.lng },
            title: store.name,
            icon: pinIcon(maps, store.key === active),
            zIndex: store.key === active ? 10 : 1,
          });
          marker.addListener("click", () => selectRef.current(store.key));
          markersRef.current[store.key] = marker;
        });

        // Muat semua pin ke dalam viewport peta
        const bounds = new maps.LatLngBounds();
        STORES.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
        map.fitBounds(bounds, 64);
      })
      .catch((err) => {
        console.error("[StoreMap] gagal memuat peta:", err);
      });

    return () => {
      cancelled = true;
      Object.values(markersRef.current).forEach((m) => m.setMap(null));
      markersRef.current = {};
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan gerai aktif: pin menyala + peta bergeser ke sana
  useEffect(() => {
    const maps = libRef.current;
    const map = mapRef.current;
    if (!maps || !map) return;
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      const on = key === active;
      marker.setIcon(pinIcon(maps, on));
      marker.setZIndex(on ? 10 : 1);
    });
    const store = STORES.find((s) => s.key === active);
    if (store) map.panTo({ lat: store.lat, lng: store.lng });
  }, [active]);

  // Tanpa API key: embed satu-gerai fallback
  if (!API_KEY) {
    const store = STORES.find((s) => s.key === active) ?? STORES[0];
    return (
      <iframe
        key={store.key}
        src={mapEmbedUrl(store.map)}
        title={`Peta lokasi ${store.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={className}
      />
    );
  }

  return <div ref={holderRef} className={className} role="application" aria-label="Peta lokasi gerai FIXMI" />;
}

function pinIcon(maps: MapsBundle, activeState: boolean): google.maps.Symbol {
  return {
    path: PIN_PATH,
    fillColor: activeState ? "#FF6B00" : "#555555",
    fillOpacity: 1,
    strokeColor: "#121212",
    strokeWeight: 1.5,
    scale: activeState ? 1.9 : 1.4,
    anchor: new maps.Point(12, 24),
  };
}
