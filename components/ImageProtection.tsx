"use client";

import { useEffect } from "react";

function targetsImage(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("img, picture"));
}

export default function ImageProtection() {
  useEffect(() => {
    const preventImageAction = (event: Event) => {
      if (targetsImage(event.target)) event.preventDefault();
    };

    document.addEventListener("contextmenu", preventImageAction);
    document.addEventListener("dragstart", preventImageAction);

    return () => {
      document.removeEventListener("contextmenu", preventImageAction);
      document.removeEventListener("dragstart", preventImageAction);
    };
  }, []);

  return null;
}
