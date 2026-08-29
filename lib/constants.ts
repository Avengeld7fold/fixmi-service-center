// Kontak terpusat — ganti di sini sekali, berlaku di seluruh situs.
// Format internasional tanpa "+" atau spasi. 0819-9933-6722 → 6281999336722.
export const WHATSAPP_NUMBER = "6281999336722";

export const DEFAULT_WA_MESSAGE = `Halo FIXMI Service Center, saya mau konsultasi perbaikan gadget:

• Tipe Gadget: 
• Kendala / Kerusakan: `;

export function whatsappUrl(message?: string): string {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/";
  const msg = message !== undefined ? message : DEFAULT_WA_MESSAGE;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}
