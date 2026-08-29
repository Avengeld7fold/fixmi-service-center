"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, ArrowRight, RotateCcw } from "lucide-react";
import { whatsappUrl } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";

/**
 * Form Request Service FIXMI — Compact, Highly-Responsive & Bulletproof Design
 * Perfect visual balance & typography scaling across Mobile, Tablet, and Desktop.
 */

const DEVICES = [
  {
    key: "iphone",
    label: "iPhone",
    image: "/images/iphone.webp",
    placeholderId: "Misal: iPhone 15 Pro Max / 13 Mini",
    placeholderEn: "E.g., iPhone 15 Pro Max / 13 Mini",
  },
  {
    key: "ipad",
    label: "iPad",
    image: "/images/ipad.webp",
    placeholderId: "Misal: iPad Pro 11\" M2 / iPad Air 5",
    placeholderEn: "E.g., iPad Pro 11\" M2 / iPad Air 5",
  },
  {
    key: "macbook",
    label: "MacBook",
    image: "/images/macbook.webp",
    placeholderId: "Misal: MacBook Air M2 / Pro 14\"",
    placeholderEn: "E.g., MacBook Air M2 / Pro 14\"",
  },
  {
    key: "iwatch",
    label: "Apple Watch",
    image: "/images/iwatch.webp",
    placeholderId: "Misal: Apple Watch Series 8 / Ultra",
    placeholderEn: "E.g., Apple Watch Series 8 / Ultra",
  },
  {
    key: "android",
    label: "Android",
    image: "/images/android.webp",
    placeholderId: "Misal: Samsung S23 Ultra / Pixel 8",
    placeholderEn: "E.g., Samsung S23 Ultra / Pixel 8",
  },
];

const COMMON_SYMPTOMS_ID = [
  "Layar Pecah / Retak",
  "Baterai Drop",
  "Mati Total",
  "Kena Air (Water Damage)",
  "Kamera Bermasalah",
  "Tidak Bisa Dicas",
  "Sinyal / Wi-Fi Eror",
  "Ganti Kaca Belakang",
];

const COMMON_SYMPTOMS_EN = [
  "Cracked Screen / Display",
  "Battery Drain / Replacement",
  "Dead Unit / No Power",
  "Water / Liquid Damage",
  "Camera Malfunction",
  "Charging Port Fault",
  "Signal / Wi-Fi Glitch",
  "Back Glass Replacement",
];

type Errors = Partial<Record<"name" | "phone" | "issue", string>>;

const getInputClass = (hasError?: boolean) =>
  `w-full rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-[0.84rem] sm:text-sm text-[#f5f5f5] placeholder:text-neutral-400 outline-none transition-all duration-200 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
    hasError
      ? "border-red-500/60 bg-red-500/[0.03] focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] focus:border-primary/80 focus:bg-white/[0.05] focus:ring-2 focus:ring-primary/10"
  }`;

export default function ServiceRequestForm() {
  const { dict, getLocalizedPath } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [device, setDevice] = useState("iphone");
  const [model, setModel] = useState("");
  const [issue, setIssue] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const isEn = dict.locale === "en";
  const commonSymptoms = isEn ? COMMON_SYMPTOMS_EN : COMMON_SYMPTOMS_ID;
  const selectedDeviceObj = DEVICES.find((d) => d.key === device) ?? DEVICES[0];

  const toggleSymptom = (symptom: string) => {
    const current = issue.trim();
    if (!current) {
      setIssue(symptom);
      return;
    }

    const escaped = symptom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|,\\s*)${escaped}(,\\s*|$)`, "i");

    if (regex.test(current)) {
      const cleaned = current
        .replace(regex, "$1")
        .replace(/^,\s*|,\s*$/g, "")
        .replace(/,\s*,/g, ", ")
        .trim();
      setIssue(cleaned);
    } else {
      setIssue(`${current}, ${symptom}`);
    }
  };

  const isSymptomActive = (symptom: string) => {
    return issue.toLowerCase().includes(symptom.toLowerCase());
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setDevice("iphone");
    setModel("");
    setIssue("");
    setErrors({});
    setSent(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim())
      next.name = isEn ? "Please enter your full name." : "Isi nama lengkap Anda.";
    if (!phone.trim())
      next.phone = isEn ? "Please enter your WhatsApp number." : "Isi nomor WhatsApp Anda.";
    else if (phone.replace(/\D/g, "").length < 8)
      next.phone = isEn
        ? "WhatsApp number too short (minimum 8 digits)."
        : "Nomor WhatsApp terlalu pendek (minimal 8 digit).";
    if (!issue.trim())
      next.issue = isEn
        ? "Please describe the issue with your device."
        : "Tuliskan kendala perangkat Anda.";
    setErrors(next);

    if (next.name) {
      document.getElementById("req-name")?.focus();
      return;
    }
    if (next.phone) {
      document.getElementById("req-phone")?.focus();
      return;
    }
    if (next.issue) {
      document.getElementById("req-issue")?.focus();
      return;
    }

    const deviceLabel = selectedDeviceObj.label;
    const fullDevice = model.trim() ? `${deviceLabel} (${model.trim()})` : deviceLabel;

    const message = isEn
      ? [
          "Hello FIXMI Service Center, I would like a consultation for my device repair:",
          "",
          `• Full Name: ${name.trim()}`,
          `• WhatsApp No.: ${phone.trim()}`,
          `• Device: ${fullDevice}`,
          `• Issue / Symptoms: ${issue.trim()}`,
        ].join("\n")
      : [
          "Halo FIXMI Service Center, saya mau konsultasi perbaikan gadget:",
          "",
          `• Nama: ${name.trim()}`,
          `• No. WhatsApp: ${phone.trim()}`,
          `• Perangkat: ${fullDevice}`,
          `• Kendala / Keluhan: ${issue.trim()}`,
        ].join("\n");

    const waUrl = whatsappUrl(message);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="relative w-full">
      {/* Ambient backdrop aura */}
      <div className="pointer-events-none absolute -inset-4 sm:-inset-6 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/[0.04] via-primary/[0.015] to-transparent blur-3xl" />

      <form
        onSubmit={submit}
        noValidate
        className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#141416]/95 p-4 sm:p-6 md:p-8 lg:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
      >
        {/* Success / Sent Confirmation Banner */}
        {sent && (
          <div className="mb-6 sm:mb-7 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 sm:p-4 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
              </span>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-emerald-200">
                  {isEn ? "WhatsApp Opened in New Tab" : "WhatsApp Terbuka di Tab Baru"}
                </p>
                <p className="text-[0.75rem] sm:text-xs text-emerald-300/80 leading-relaxed">
                  {isEn
                    ? "Please tap the Send button in WhatsApp to complete your consultation with FIXMI technicians."
                    : "Silakan tekan tombol Kirim di aplikasi WhatsApp untuk menyelesaikan konsultasi dengan teknisi FIXMI."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 space-y-6 sm:space-y-7 md:space-y-8">
          {/* Seksi 1 — Informasi Kontak */}
          <Step
            title={isEn ? "Contact Information" : "Informasi Kontak"}
            description={
              isEn
                ? "To confirm your device diagnostic and repair cost estimate."
                : "Untuk memudahkan konfirmasi estimasi biaya perbaikan."
            }
          >
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
              <Field
                id="req-name"
                label={dict.contact.form.nameLabel}
                error={errors.name}
              >
                <input
                  id="req-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={dict.contact.form.namePlaceholder}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  className={getInputClass(!!errors.name)}
                />
              </Field>
              <Field
                id="req-phone"
                label={dict.contact.form.phoneLabel}
                error={errors.phone}
              >
                <input
                  id="req-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={dict.contact.form.phonePlaceholder}
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  className={getInputClass(!!errors.phone)}
                />
              </Field>
            </div>
          </Step>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Seksi 2 — Perangkat & Model */}
          <Step
            title={isEn ? "Device & Model Series" : "Perangkat & Seri Model"}
            description={
              isEn
                ? "Select gadget category and enter the specific model if known."
                : "Pilih kategori gadget dan tuliskan tipe spesifik jika diketahui."
            }
          >
            <div className="space-y-4 sm:space-y-4.5">
              <fieldset>
                <legend className="sr-only">
                  {isEn ? "Select device category" : "Pilih jenis perangkat"}
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3">
                  {DEVICES.map((d, index) => {
                    const on = d.key === device;
                    const isLastOdd = index === 4; // 5th item on mobile grid
                    return (
                      <label
                        key={d.key}
                        className={`group relative flex cursor-pointer select-none flex-col items-center justify-between rounded-xl border p-2.5 sm:p-3 text-center transition-all duration-200 ease-out active:scale-[0.97] min-h-[90px] sm:min-h-[105px] md:min-h-[115px] ${
                          isLastOdd ? "col-span-2 sm:col-span-1 md:col-span-1" : ""
                        } ${
                          on
                            ? "border-white/30 bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_20px_-5px_rgba(0,0,0,0.6)]"
                            : "border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-neutral-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="device"
                          value={d.key}
                          checked={on}
                          onChange={() => setDevice(d.key)}
                          className="sr-only"
                        />

                        {/* Device Real Image */}
                        <div className="relative w-full h-10 sm:h-12 md:h-14 flex items-center justify-center my-0.5">
                          <Image
                            src={d.image}
                            alt={d.label}
                            fill
                            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 110px"
                            className={`object-contain transition-all duration-200 ease-out group-hover:scale-105 ${
                              on ? "scale-105 opacity-100 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]" : "opacity-80 group-hover:opacity-100"
                            }`}
                          />
                        </div>

                        <span className={`text-[0.72rem] sm:text-xs tracking-tight mt-0.5 transition-colors ${on ? "font-semibold text-white" : "font-medium text-neutral-400 group-hover:text-neutral-200"}`}>
                          {d.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <Field
                id="req-model"
                label={isEn ? "Model / Series Type" : "Tipe / Seri Model"}
                hint={isEn ? "optional" : "opsional"}
              >
                <input
                  id="req-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={isEn ? selectedDeviceObj.placeholderEn : selectedDeviceObj.placeholderId}
                  className={getInputClass()}
                />
              </Field>
            </div>
          </Step>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Seksi 3 — Detail Kerusakan */}
          <Step
            title={isEn ? "Issue & Fault Details" : "Detail Kerusakan"}
            description={
              isEn
                ? "Select common faults below or describe your specific problem."
                : "Pilih kendala umum di bawah atau tuliskan keluhan Anda."
            }
          >
            <div className="space-y-4 sm:space-y-4.5">
              {/* Quick Symptom Chips */}
              <div>
                <span className="block text-[0.72rem] sm:text-xs font-medium text-neutral-400 mb-2">
                  {isEn ? "Select common device symptoms:" : "Pilih kendala yang sering terjadi:"}
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {commonSymptoms.map((symptom) => {
                    const isSelected = isSymptomActive(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.72rem] sm:text-xs font-medium transition-all duration-150 active:scale-[0.96] ${
                          isSelected
                            ? "border-white/30 bg-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                            : "border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-neutral-200"
                        }`}
                      >
                        <span>{symptom}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5] text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field
                id="req-issue"
                label={dict.contact.form.issueLabel}
                error={errors.issue}
              >
                <textarea
                  id="req-issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  rows={3}
                  placeholder={dict.contact.form.issuePlaceholder}
                  aria-invalid={!!errors.issue}
                  className={`${getInputClass(!!errors.issue)} min-h-[75px] sm:min-h-[85px] resize-y leading-relaxed`}
                />
              </Field>
            </div>
          </Step>

          {/* Bottom Conversion & CTA Footer */}
          <div className="border-t border-white/[0.08] pt-5 sm:pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                <span className="text-[0.75rem] sm:text-xs font-medium text-neutral-300">
                  {dict.footer.hoursMonSat} · {dict.footer.hoursSun}
                </span>
              </div>
              <p className="text-[0.75rem] sm:text-[0.8rem] text-neutral-400">
                {isEn ? "Prefer direct messaging? " : "Ingin respon langsung? "}
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-200 font-medium underline underline-offset-4 decoration-white/20 transition-colors hover:text-primary hover:decoration-primary"
                >
                  {isEn ? "Chat WhatsApp" : "Chat WhatsApp"}
                </a>{" "}
                {isEn ? "or " : "atau "}
                <Link
                  href={getLocalizedPath("/pricelist")}
                  className="text-neutral-200 font-medium underline underline-offset-4 decoration-white/20 transition-colors hover:text-primary hover:decoration-primary"
                >
                  {isEn ? "Check Price List" : "Cek Daftar Harga"}
                </Link>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {sent && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 sm:py-3.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                  title="Reset form"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isEn ? "Reset Form" : "Reset Form"}</span>
                </button>
              )}

              <button
                type="submit"
                className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white tracking-[-0.01em] transition-all duration-200 ease-out hover:bg-primary-light hover:brightness-105 active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_20px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {sent ? (
                  <Check className="h-4 w-4 text-white stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-white stroke-[2]" aria-hidden="true" />
                )}
                <span>
                  {sent
                    ? isEn
                      ? "Resend to WhatsApp"
                      : "Kirim Ulang ke WhatsApp"
                    : dict.contact.form.submitBtn}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-white/80 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-white"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Step({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5 sm:space-y-3">
      <div>
        <h2 className="text-xs sm:text-[0.88rem] md:text-[0.92rem] font-semibold uppercase tracking-wider text-[#f5f5f5]">
          {title}
        </h2>
        {description && (
          <p className="text-[0.72rem] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="pt-0.5">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[0.72rem] sm:text-xs font-medium text-neutral-300 tracking-tight">
          {label}
        </label>
        {hint && (
          <span className="font-mono text-[0.62rem] sm:text-[0.68rem] text-neutral-500 uppercase tracking-wider">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[0.72rem] sm:text-xs font-medium text-red-400 mt-1 flex items-center gap-1.5" role="alert">
          <span className="h-1 w-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}
