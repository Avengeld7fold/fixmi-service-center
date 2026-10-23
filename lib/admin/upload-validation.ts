export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function readAdminImageUpload(value: FormDataEntryValue | null): Promise<{
  buffer: Buffer;
  extension: "jpg" | "png" | "webp";
}> {
  if (!(value instanceof File) || value.size === 0) throw new Error("Pilih file gambar terlebih dahulu.");
  if (value.size > MAX_IMAGE_UPLOAD_BYTES) throw new Error("Ukuran gambar maksimum 8 MB.");

  const buffer = Buffer.from(await value.arrayBuffer());
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

  if (isJpeg) return { buffer, extension: "jpg" };
  if (isPng) return { buffer, extension: "png" };
  if (isWebp) return { buffer, extension: "webp" };
  throw new Error("File harus berupa gambar JPG, PNG, atau WebP yang valid.");
}
