import { promises as fs } from "fs";
import path from "path";

export interface GalleryImage {
  id: number | string;
  Title?: string;
  Image: string;
  altText?: string;
  category?: string;
  createdAt?: string;
}

const GALLERY_FILE = path.join(process.cwd(), "data", "gallery.json");

/**
 * Membaca data galeri dari file data/gallery.json di server.
 * Mengembalikan array kosong jika belum ada foto yang diupload dari backend.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const raw = await fs.readFile(GALLERY_FILE, "utf-8");
    const parsed: GalleryImage[] = JSON.parse(raw);

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter hanya data yang memiliki path image yang valid
      return parsed.filter(
        (item) => typeof item.Image === "string" && item.Image.trim().length > 0
      );
    }
  } catch {
    // File belum ada atau kosong
  }

  return [];
}

/**
 * Menyimpan data galeri ke file data/gallery.json (digunakan saat upload dari backend).
 */
export async function saveGalleryImages(images: GalleryImage[]): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(GALLERY_FILE, JSON.stringify(images, null, 2), "utf-8");
}

/**
 * Menambahkan foto galeri baru ke data/gallery.json.
 */
export async function addGalleryImage(item: Omit<GalleryImage, "id" | "createdAt">): Promise<GalleryImage> {
  const images = await getGalleryImages();
  const newImage: GalleryImage = {
    id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...item,
    createdAt: new Date().toISOString(),
  };
  images.unshift(newImage); // foto terbaru di depan
  await saveGalleryImages(images);
  return newImage;
}

/**
 * Menghapus foto dari data/gallery.json berdasarkan id.
 */
export async function deleteGalleryImage(id: number | string): Promise<boolean> {
  const images = await getGalleryImages();
  const filtered = images.filter((img) => String(img.id) !== String(id));
  if (filtered.length !== images.length) {
    await saveGalleryImages(filtered);
    return true;
  }
  return false;
}
