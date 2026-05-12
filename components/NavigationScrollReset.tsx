"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Dispatched after scroll reset; optional hook for route-aware UI. */
export const FOLIO_NAVIGATE_EVENT = "folio:navigate";

export type FolioNavigateDetail = {
  pathname: string;
  /** Pathname before this navigation; `null` on first paint. */
  previous: string | null;
};

function scrollToTopInstant() {
  const html = document.documentElement;
  const body = document.body;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  html.scrollTop = 0;
  body.scrollTop = 0;
  window.scrollTo(0, 0);
  html.style.scrollBehavior = prev;
}

/**
 * Reset the window scroll position on client navigations (classic multi-page behavior).
 *
 * Must wrap `{children}` in the root layout: Next’s ScrollAndFocusHandler runs a layout
 * effect on the route segment and can scroll deep content (e.g. “More projects”) into
 * view. Parent layout effects run after that handler, so this wrapper restores top-of-page.
 *
 * `folio:navigate` is dispatched in a microtask after layout for listeners that need the
 * previous and current pathname after scroll has been reset.
 */
export function NavigationScrollReset({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  const didSetManualRestoration = useRef(false);

  useLayoutEffect(() => {
    if (!didSetManualRestoration.current && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      didSetManualRestoration.current = true;
    }
    scrollToTopInstant();

    const previous = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent<FolioNavigateDetail>(FOLIO_NAVIGATE_EVENT, {
          detail: { pathname, previous },
        }),
      );
    });
  }, [pathname]);

  return <>{children}</>;
}
