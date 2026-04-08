"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function parseThemeCookie(): Theme | null {
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)${THEME_STORAGE_KEY}=(light|dark)(?:\\s*;|$)`,
    ),
  );
  const v = match?.[1];
  return v === "light" || v === "dark" ? v : null;
}

/** Copies an existing localStorage preference into the cookie so SSR matches on the next request. */
export function ThemePreferenceSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let stored: string | null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return;
    }
    if (stored !== "light" && stored !== "dark") return;
    if (parseThemeCookie() === stored) return;
    try {
      const secure =
        typeof window !== "undefined" && window.location.protocol === "https:";
      document.cookie = [
        `${THEME_STORAGE_KEY}=${stored}`,
        "path=/",
        "max-age=31536000",
        "SameSite=Lax",
        ...(secure ? (["Secure"] as const) : []),
      ].join("; ");
    } catch {
      return;
    }
    router.refresh();
  }, [router]);

  return null;
}
