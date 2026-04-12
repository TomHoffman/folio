"use client";

import { syncThemeFromStorage } from "@/lib/colorScheme";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * React only puts the font variable on `<html className>`. `dark` must stay off that prop
 * or reconciliation replaces the whole `class` and clears manual `classList` updates.
 * Re-sync from storage after mount and on every navigation in case the server re-patches html.
 */
export function ThemeDocumentSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    syncThemeFromStorage();
  }, [pathname]);

  return null;
}
