"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { recordFolioNavLayoutSnapshot } from "@/components/folioNavLayoutSnapshot";

/** Dispatched after scroll reset so descendants can repair layout (e.g. featured project grid). */
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
 * view. Parent layout effects run after child layout effects, so this wrapper runs after
 * that handler and restores top-of-page.
 *
 * Also syncs sticky header show/hide (`data-dir`) on scroll.
 *
 * On each pathname change, `useLayoutEffect` (after scroll) records the previous pathname,
 * current pathname, and a monotonic epoch via `recordFolioNavLayoutSnapshot`, which notifies
 * `subscribeFolioNavLayout` subscribers synchronously (e.g. featured grid remount in the same
 * layout phase).
 *
 * `folio:navigate` is still dispatched in a microtask after layout for any future listeners.
 */
export function NavigationScrollReset({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const navLayoutEpochRef = useRef(0);

  const didSetManualRestoration = useRef(false);
  const lastScrollY = useRef(0);

  const applyHeaderScrollFromWindow = () => {
    const header = document.getElementById("main-header");
    if (!header) return;
    const current = window.scrollY || 0;
    if (current <= 0) {
      header.setAttribute("data-dir", "up");
      lastScrollY.current = 0;
      return;
    }
    if (current === lastScrollY.current) return;
    const rawDir: "up" | "down" = current < lastScrollY.current ? "up" : "down";
    let visDir: "up" | "down" = rawDir;
    if (rawDir === "down" && current < Math.max(1, header.offsetHeight | 0)) {
      visDir = "up";
    }
    header.setAttribute("data-dir", visDir);
    lastScrollY.current = current;
  };

  useLayoutEffect(() => {
    if (!didSetManualRestoration.current && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      didSetManualRestoration.current = true;
    }
    scrollToTopInstant();
    lastScrollY.current = 0;

    const header = document.getElementById("main-header");
    if (header) {
      header.setAttribute("data-dir", "up");
    }

    applyHeaderScrollFromWindow();

    const previous = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    const epoch = (navLayoutEpochRef.current += 1);
    recordFolioNavLayoutSnapshot(epoch, previous, pathname);

    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent<FolioNavigateDetail>(FOLIO_NAVIGATE_EVENT, {
          detail: { pathname, previous },
        }),
      );
    });
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("scroll", applyHeaderScrollFromWindow, { passive: true });
    return () => window.removeEventListener("scroll", applyHeaderScrollFromWindow);
  }, []);

  return <>{children}</>;
}
