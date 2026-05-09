"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Reset the window scroll position on client navigations (classic multi-page behavior).
 *
 * Must wrap `{children}` in the root layout: Next’s ScrollAndFocusHandler runs a layout
 * effect on the route segment and can scroll deep content (e.g. “More projects”) into
 * view. Parent layout effects run after child layout effects, so this wrapper runs after
 * that handler and restores top-of-page.
 */
export function NavigationScrollReset({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const didSetManualRestoration = useRef(false);

  useLayoutEffect(() => {
    if (!didSetManualRestoration.current && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      didSetManualRestoration.current = true;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return <>{children}</>;
}
