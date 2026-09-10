"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Star, ArrowUpRight, CheckCircle2, MessageSquarePlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { GooglePlaceData } from "@/app/api/reviews/route";

type SortOption = "relevant" | "newest";

const BAYON_STYLE = { fontFamily: "var(--font-bayon), sans-serif" } as const;
const CARD_SHADOW = {
  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
} as const;

// ponytail: extracted 4-color Google G SVG icon (previously duplicated 2x verbatim)
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5c1.56 0 2.97.57 4.08 1.5l3.05-3.05C17.27 1.7 14.81 1 12 1 7.5 1 3.66 3.56 1.77 7.28l3.66 2.84C6.3 7.42 8.91 5 12 5z" />
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.86c2.14-1.98 3.74-4.89 3.74-8.68z" />
      <path fill="#FBBC05" d="M5.43 14.88c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.77 7.28C.64 9.53 0 12.06 0 14.76s.64 5.23 1.77 7.48l3.66-2.84v-.52z" />
      <path fill="#34A853" d="M12 23.5c3.24 0 5.95-1.08 7.93-2.91l-3.68-2.86c-1.07.72-2.45 1.15-4.25 1.15-3.09 0-5.7-2.42-6.57-5.68L1.77 16.04C3.66 19.76 7.5 22.32 12 22.32z" />
    </svg>
  );
}

function ReviewAvatar({ url, name }: { url?: string; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "F";

  if (!url || hasError) {
    return (
      <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0 select-none transition-transform duration-200 group-hover:scale-105">
        {initial}
      </div>
    );
  }

  return (
    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0 bg-[#222226] select-none transition-transform duration-200 group-hover:scale-105">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function CustomerReviewsSection() {
  const { dict } = useI18n();
  const [data, setData] = useState<GooglePlaceData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevant");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);

  const dragStartXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Responsive visible count tracking
  useEffect(() => {
    const updateVisible = () => {
      setVisibleCount(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const json: GooglePlaceData = await res.json();
        if (isMounted) setData(json);
      } catch (err) {
        console.error("Error loading reviews client:", err);
      }
    }
    fetchReviews();
    return () => { isMounted = false; };
  }, []);

  const rawReviews = data?.reviews || [];
  const totalReviews = data?.totalRatings || 404;
  const ratingScore = data?.rating || 4.8;
  const mapsUrl = data?.mapsUrl || "https://maps.google.com/?cid=4655164056963224271";

  const filteredReviews = useMemo(() => {
    if (sortBy === "newest") {
      return [...rawReviews].sort((a, b) => b.time - a.time);
    }
    return rawReviews;
  }, [rawReviews, sortBy]);

  const allCardsCount = filteredReviews.length + 1;
  const maxIndex = Math.max(0, allCardsCount - visibleCount);

  useEffect(() => { setCurrentIndex(0); }, [sortBy]);

  const handlePrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  const handleNext = () => setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));

  useEffect(() => {
    if (isPaused || isDragging || allCardsCount <= visibleCount) return;
    const timer = setInterval(handleNext, 5500);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, allCardsCount, visibleCount, currentIndex, maxIndex]);

  const buildTransform = (offset: number) => {
    const divisor = visibleCount === 3 ? 3 : visibleCount === 2 ? 2 : 1;
    const gap = visibleCount === 3 ? "8px" : visibleCount === 2 ? "12px" : "24px";
    return `translateX(calc(-${currentIndex} * (100% / ${divisor} + ${gap}) + ${offset}px))`;
  };

  const writeDragOffset = (delta: number) => {
    const withResistance =
      (currentIndex === 0 && delta > 0) || (currentIndex === maxIndex && delta < 0)
        ? delta * 0.4
        : delta;
    dragOffsetRef.current = withResistance;
    if (trackRef.current) {
      trackRef.current.style.transform = buildTransform(withResistance);
    }
  };

  const endDrag = () => {
    const offset = dragOffsetRef.current;
    if (offset < -50) handleNext();
    else if (offset > 50) handlePrev();
    dragOffsetRef.current = 0;
    if (trackRef.current) trackRef.current.style.transform = buildTransform(0);
    setIsDragging(false);
  };

  // ponytail: consolidated mouse and touch drag handlers
  const startDrag = (clientX: number) => {
    setIsDragging(true);
    dragStartXRef.current = clientX;
    dragOffsetRef.current = 0;
    setIsPaused(true);
  };

  const moveDrag = (clientX: number) => {
    if (isDragging) writeDragOffset(clientX - dragStartXRef.current);
  };

  const finishDrag = () => {
    if (isDragging) endDrag();
    setIsPaused(false);
  };

  return (
    <section className="relative w-full bg-[#121212] text-white py-12 sm:py-16 lg:py-20 overflow-hidden select-none border-t border-white/[0.06]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none transition-opacity duration-700" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header & Google Rating Scorecard */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-neutral-300 tracking-wide mb-4 transition-colors duration-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{dict.reviews.badge}</span>
            </div>

            <h2 className="font-bayon text-3xl sm:text-4xl lg:text-5xl uppercase text-[#f5f5f5] leading-[0.95] tracking-[-0.01em]" style={BAYON_STYLE}>
              {dict.reviews.heading}
            </h2>
            <p className="font-sans text-sm sm:text-base text-neutral-400 mt-3 max-w-xl leading-relaxed">
              {dict.reviews.subheading}
            </p>
          </div>

          {/* Google Maps Scorecard Bento */}
          <div
            className="group flex items-center gap-5 p-5 sm:p-6 rounded-2xl bg-[#161619]/90 hover:bg-[#19191d] border border-white/[0.1] hover:border-primary/30 shrink-0 self-start lg:self-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(255,107,0,0.12)]"
            style={CARD_SHADOW}
          >
            <div className="flex flex-col items-center justify-center pr-5 border-r border-white/[0.1]">
              <span className="font-bayon text-4xl sm:text-5xl text-white leading-none tracking-tight group-hover:text-primary transition-colors duration-300" style={BAYON_STYLE}>
                {ratingScore.toFixed(1)}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[#FFB800]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FFB800] transition-transform duration-200 group-hover:scale-110" style={{ transitionDelay: `${i * 30}ms` }} />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center font-sans">
              <span className="text-sm sm:text-base font-semibold text-white">
                {totalReviews}+ {dict.reviews.reviewsCountLabel}
              </span>
              <span className="text-xs text-neutral-400 mt-0.5">
                {dict.locale === "en" ? "Verified Google Maps Rating" : "Rating Google Maps Terverifikasi"}
              </span>
              <Link
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light font-medium mt-1.5 transition-all duration-150 group-hover:translate-x-0.5"
              >
                <span>Google Maps Profile</span>
                <ArrowUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Controls Bar: Sort + Arrows */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-1 bg-[#161619] p-1 rounded-full border border-white/[0.08] text-xs font-sans">
            {(["relevant", "newest"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSortBy(opt)}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 cursor-pointer font-medium ${
                  sortBy === opt
                    ? "bg-primary text-[#121212] font-semibold shadow-[0_2px_10px_rgba(255,107,0,0.3)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {opt === "relevant" ? dict.reviews.filterRelevant : dict.reviews.filterNewest}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-sans">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={dict.locale === "en" ? "Previous Reviews" : "Ulasan Sebelumnya"}
              className="group w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#161619] border border-white/[0.1] hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer hover:bg-white/[0.06] hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={dict.locale === "en" ? "Next Reviews" : "Ulasan Selanjutnya"}
              className="group w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#161619] border border-white/[0.1] hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer hover:bg-white/[0.06] hover:scale-105"
            >
              <ChevronRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing select-none py-4 -my-4 px-1 -mx-1"
          onMouseDown={(e) => { if (e.button === 0) startDrag(e.clientX); }}
          onMouseMove={(e) => moveDrag(e.clientX)}
          onMouseUp={finishDrag}
          onMouseLeave={finishDrag}
          onTouchStart={(e) => startDrag(e.targetTouches[0].clientX)}
          onTouchMove={(e) => moveDrag(e.targetTouches[0].clientX)}
          onTouchEnd={finishDrag}
        >
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 text-sm font-sans bg-[#161619] rounded-2xl border border-white/[0.08]">
              {dict.locale === "en" ? "No reviews available." : "Tidak ada ulasan yang tersedia."}
            </div>
          ) : (
            <div
              ref={trackRef}
              className={`flex gap-6 font-sans items-stretch ${isDragging ? "scale-[0.995]" : "scale-100"}`}
              style={{
                transform: buildTransform(0),
                transition: isDragging ? "none" : "transform 550ms cubic-bezier(0.16, 1, 0.3, 1), scale 200ms ease",
              }}
            >
              {filteredReviews.map((rev) => {
                const isExpanded = !!expandedIds[rev.id];
                const isLongText = rev.text.length > 160;

                return (
                  <div
                    key={rev.id}
                    className="group w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#161619] border border-white/[0.08] hover:border-primary/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(255,107,0,0.12)] min-h-[300px]"
                    style={CARD_SHADOW}
                  >
                    <div>
                      {/* Avatar & Author Info */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <ReviewAvatar url={rev.profilePhotoUrl} name={rev.authorName} />
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-1">
                              {rev.authorName}
                            </h3>
                            <span className="text-xs text-neutral-400">{rev.relativeTime}</span>
                          </div>
                        </div>

                        <span className="shrink-0 p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-white/20 transition-colors" title={dict.reviews.verifiedCustomer}>
                          <GoogleIcon className="w-4 h-4 pointer-events-none transition-transform duration-200 group-hover:scale-110" />
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-3 text-[#FFB800]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFB800]" />
                        ))}
                      </div>

                      {/* Text */}
                      <p className={`text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed transition-all duration-200 ${isExpanded ? "" : "line-clamp-4"}`}>
                        {rev.text}
                      </p>

                      {isLongText && (
                        <button
                          type="button"
                          onClick={() => setExpandedIds((prev) => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                          className="text-xs text-primary hover:text-primary-light hover:underline mt-1.5 font-medium cursor-pointer transition-colors"
                        >
                          {isExpanded ? dict.reviews.readLess : dict.reviews.readMore}
                        </button>
                      )}
                    </div>

                    {/* Footer Verification Badge */}
                    <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[0.75rem] text-neutral-400">
                      <span className="flex items-center gap-1.5 text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>{dict.locale === "en" ? "Verified on Google" : "Terverifikasi Google"}</span>
                      </span>
                      <span className="text-neutral-500 font-mono text-[0.7rem]">FIXMI Service Center</span>
                    </div>
                  </div>
                );
              })}

              {/* 6th Interactive "Write a Review" Card */}
              <div
                className="group w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#161619] via-[#1c1c22] to-primary/[0.08] border border-primary/25 hover:border-primary/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(255,107,0,0.18)] min-h-[300px]"
                style={CARD_SHADOW}
              >
                <div>
                  <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <MessageSquarePlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 leading-snug">
                    {dict.locale === "en" ? "Repaired at FIXMI Before?" : "Pernah Servis di FIXMI?"}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {dict.locale === "en"
                      ? "Your feedback matters to us. Share your repair experience on Google Maps."
                      : "Pengalaman Anda sangat berharga bagi kami. Bagikan kepuasan perbaikan perangkat Anda di Google Maps."}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-white/[0.08]">
                  <Link
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-[#FF7A1A] text-[#121212] font-semibold text-xs transition-all duration-150 ease-out active:scale-[0.98] text-center shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]"
                  >
                    <span>{dict.locale === "en" ? "Write Your Review" : "Tulis Ulasan Anda"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-primary hover:bg-[#FF7A1A] text-[#121212] font-semibold text-xs sm:text-sm tracking-wide transition-all duration-150 ease-out active:scale-[0.98] active:translate-y-0.5 w-full sm:w-auto text-center shadow-[0_2px_10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-105"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#121212] transition-transform duration-150 group-hover:scale-105" />
            <span>{dict.reviews.writeReviewBtn}</span>
          </Link>

          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#222226] text-neutral-300 hover:text-white border border-white/[0.08] hover:border-white/[0.2] font-medium text-xs sm:text-sm tracking-wide transition-all duration-150 ease-out active:scale-[0.98] active:translate-y-0.5 w-full sm:w-auto text-center shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <span>{dict.reviews.viewAllReviewsBtn}</span>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
