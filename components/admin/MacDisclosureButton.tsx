import React from "react";

export interface MacDisclosureButtonProps {
  expanded: boolean;
  size?: "small" | "regular" | "large";
  asSpan?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  ariaLabel?: string;
  ariaControls?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * macOS 26 Tahoe Disclosure Button
 * Referensi Resmi Apple Design Resources:
 * - Ref 27: 27-apple-disclosure-button-states.png
 * - Ref 28: 28-apple-disclosure-button-sizes-and-states-matrix.png
 *
 * Lingkaran penuh (rounded-full), tanpa border, disc abu-abu transparan ultra-halus,
 * chevron stroke ~2.25px di tengah dengan transisi rotasi 180° halus saat terbuka.
 */
export default function MacDisclosureButton({
  expanded,
  size = "regular",
  asSpan = false,
  onClick,
  onPointerDown,
  ariaLabel,
  ariaControls,
  disabled = false,
  className = "",
}: MacDisclosureButtonProps) {
  const sizeClass =
    size === "small"
      ? "mac-disclosure-btn-sm"
      : size === "large"
      ? "mac-disclosure-btn-lg"
      : "mac-disclosure-btn-regular";

  const content = (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={size === "small" ? 2 : size === "large" ? 2.5 : 2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mac-disclosure-icon ${expanded ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M3.75 6.75L8 10.5L12.25 6.75" />
    </svg>
  );

  const baseClasses = `mac-disclosure-btn ${sizeClass} ${expanded ? "is-expanded" : ""} ${className}`;

  if (asSpan) {
    return (
      <span className={baseClasses} aria-hidden="true">
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      aria-expanded={expanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      disabled={disabled}
      className={baseClasses}
    >
      {content}
    </button>
  );
}
