"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, 60000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}

// Only minute changes render; SSR and the first hydration pass share null.
const getSnapshot = () => Math.floor(Date.now() / 60000) * 60000;
const getServerSnapshot = () => null;

export function useStoreTime() {
  const timestamp = useSyncExternalStore<number | null>(subscribe, getSnapshot, getServerSnapshot);
  return timestamp === null ? null : new Date(timestamp);
}
