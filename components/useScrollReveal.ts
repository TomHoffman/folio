"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type UseScrollRevealOptions = {
  enabled?: boolean;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  /**
   * When this value changes, the observer is torn down and re-run (e.g. `usePathname()` on
   * client navigations back to `/` so already-in-view sections still mark visible).
   */
  layoutResetKey?: string;
};

/**
 * Fires a little earlier than the default hook settings, but not as early as
 * before. This keeps home section reveals from triggering too soon.
 * (Defaults use threshold 0.18 and a negative bottom margin, which waits longer.)
 */
export const scrollRevealTriggerEarlier: Pick<
  UseScrollRevealOptions,
  "threshold" | "rootMargin"
> = {
  threshold: 0.08,
  rootMargin: "0px 0px 5% 0px",
};

/**
 * Fallback when `IntersectionObserver` does not emit an initial callback (common after
 * soft navigations / scroll restoration) even though the node already occupies the viewport.
 */
function rectLikelyIntersectsViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const vv = window.visualViewport;
  const vh = vv?.height ?? window.innerHeight;
  const vw = vv?.width ?? window.innerWidth;
  const margin = Math.min(160, vh * 0.15);
  return r.bottom > -margin && r.top < vh + margin && r.right > 0 && r.left < vw;
}

export function useScrollReveal({
  enabled = true,
  once = true,
  threshold = 0.18,
  rootMargin = "0px 0px -10% 0px",
  layoutResetKey,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    let finished = false;

    const markVisible = () => {
      if (finished) return;
      finished = true;
      setIsVisible(true);
      if (once) observer.disconnect();
    };

    const markHidden = () => {
      if (!once) {
        setIsVisible(false);
      }
    };

    const pumpTakeRecords = () => {
      if (finished) return;
      const pending = observer.takeRecords();
      for (const entry of pending) {
        if (!entry.isIntersecting) continue;
        markVisible();
        return;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markVisible();
          return;
        }
        markHidden();
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    /** IO often skips the first callback when the node is already visible (e.g. back navigation). */
    const pumpAll = () => {
      if (finished) return;
      pumpTakeRecords();
      if (finished) return;
      if (rectLikelyIntersectsViewport(node)) {
        markVisible();
      }
    };

    pumpAll();
    let cancelled = false;
    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      pumpAll();
      requestAnimationFrame(() => {
        if (cancelled) return;
        pumpAll();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [enabled, once, threshold, rootMargin, layoutResetKey]);

  return { ref, isVisible };
}

export function useScrollRevealElement<T extends HTMLElement>(
  options: UseScrollRevealOptions = {},
) {
  const { ref, isVisible } = useScrollReveal(options);
  return { ref: ref as RefObject<T>, isVisible };
}

