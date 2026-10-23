"use client";

import FIXMIWordmark from "@/components/FIXMIWordmark";

interface AdminBrandLogoProps {
  className?: string;
}

export default function AdminBrandLogo({ className = "" }: AdminBrandLogoProps) {
  return <FIXMIWordmark className={`admin-brand-wordmark-svg ${className}`.trim()} />;
}
