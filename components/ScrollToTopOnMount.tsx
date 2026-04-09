"use client";

import { useLayoutEffect } from "react";

/** Ensures project pages open at the top (layout/focus can otherwise land mid-viewport). */
export function ScrollToTopOnMount() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
