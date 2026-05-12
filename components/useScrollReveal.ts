"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type UseScrollRevealOptions = {
  enabled?: boolean;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
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

export function useScrollReveal({
  enabled = true,
  once = true,
  threshold = 0.18,
  rootMargin = "0px 0px -10% 0px",
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIsVisible(true);
          if (once) observer.disconnect();
          return;
        }
        if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    /** IO often skips the first callback when the node is already visible (e.g. back navigation). */
    const flushPending = () => {
      const pending = observer.takeRecords();
      if (pending.length === 0) return;
      for (const entry of pending) {
        if (!entry.isIntersecting) continue;
        setIsVisible(true);
        if (once) observer.disconnect();
        return;
      }
      if (!once) {
        setIsVisible(false);
      }
    };

    flushPending();
    let cancelled = false;
    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      flushPending();
      requestAnimationFrame(() => {
        if (cancelled) return;
        flushPending();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [enabled, once, threshold, rootMargin]);

  return { ref, isVisible };
}

export function useScrollRevealElement<T extends HTMLElement>(
  options: UseScrollRevealOptions = {},
) {
  const { ref, isVisible } = useScrollReveal(options);
  return { ref: ref as RefObject<T>, isVisible };
}

