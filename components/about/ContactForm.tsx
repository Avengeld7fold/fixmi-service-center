"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappUrl } from "@/lib/constants";

/**
 * Form "Kirim Pesan" — merangkai isian jadi pesan WhatsApp lalu membukanya
 * (FIXMI tak punya backend email; WhatsApp adalah kanal utama). Fungsional,
 * bukan sekadar hiasan.
 */
export default function ContactForm() {
  const [nama, setNama] = useState("");
  const [perangkat, setPerangkat] = useState("");
  const [pesan, setPesan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text =
      `Halo FIXMI, saya ${nama || "(nama)"}.` +
      `\nPerangkat: ${perangkat || "-"}` +
      `\nKeluhan: ${pesan || "-"}`;
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
  };

  const fieldClass =
    "w-full rounded-[0.625rem] border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-text-muted outline-none transition-colors focus:border-primary";
  const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="cf-nama" className={labelClass}>
          Nama Lengkap
        </label>
        <input
          id="cf-nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Masukkan nama lengkap Anda"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="cf-perangkat" className={labelClass}>
          Perangkat & Tipe
        </label>
        <input
          id="cf-perangkat"
          value={perangkat}
          onChange={(e) => setPerangkat(e.target.value)}
          placeholder="Misal: iPhone 14 Pro Max / MacBook Air"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="cf-pesan" className={labelClass}>
          Keluhan / Kerusakan
        </label>
        <textarea
          id="cf-pesan"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          rows={4}
          placeholder="Jelaskan kendala perangkat Anda..."
          className={`${fieldClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-[0.625rem] bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-light"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Kirim via WhatsApp
      </button>
    </form>
  );
}
