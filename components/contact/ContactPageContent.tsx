"use client";

import ServiceRequestForm from "@/components/contact/ServiceRequestForm";
import StoreLocator from "@/components/contact/StoreLocator";
import { useI18n } from "@/lib/i18n/context";
import { SOCIAL_LINKS } from "@/lib/constants";

const SECTION = "mx-auto w-full max-w-[80rem] px-4 sm:px-6 md:px-10 lg:px-14";
const DISPLAY = "var(--font-bayon), sans-serif";

export default function ContactPageContent() {
  const { dict } = useI18n();

  return (
    <>
      {/* Request service */}
      <section className={`${SECTION} pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20 flex flex-col items-center`}>
        <div className="w-full max-w-3xl mx-auto mb-6 sm:mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.7rem] sm:text-xs font-mono tracking-wider text-neutral-300 uppercase mb-3 sm:mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{dict.contact.requestBadge}</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] uppercase leading-[1.05] text-[#f5f5f5] tracking-[-0.01em]"
            style={{ fontFamily: DISPLAY }}
          >
            {dict.contact.requestHeading1} <span className="text-primary">{dict.contact.requestHeading2}</span>
          </h1>
          <p className="mt-2.5 sm:mt-3.5 max-w-[54ch] text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary mx-auto">
            {dict.contact.requestDescription}
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <ServiceRequestForm />
        </div>
      </section>

      {/* Store locator */}
      <section className="border-t border-white/[0.08] bg-[#121212]">
        <div className={`${SECTION} pt-12 sm:pt-16 md:pt-20 pb-12`}>
          <div className="max-w-3xl mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.7rem] sm:text-xs font-mono tracking-wider text-neutral-300 uppercase mb-3 sm:mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{dict.contact.outletsBadge}</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] uppercase leading-[1.05] text-[#f5f5f5] tracking-[-0.01em]"
              style={{ fontFamily: DISPLAY }}
            >
              {dict.contact.outletsHeading1} <span className="text-primary">{dict.contact.outletsHeading2}</span>
            </h2>
            <p className="mt-2.5 sm:mt-3.5 max-w-[50ch] text-xs sm:text-sm md:text-base leading-relaxed text-text-secondary">
              {dict.contact.outletsDescription}
            </p>
          </div>

          <StoreLocator />

          {/* Minimal Copyright Bar */}
          <div className="mt-12 sm:mt-16 border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} FIXMI Service Center. {dict.common.allRightsReserved}</p>
            <div className="flex items-center gap-4 text-neutral-400">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">TikTok</a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
