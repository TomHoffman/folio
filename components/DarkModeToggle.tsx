"use client";

import {
  FOLIO_THEME_CHANGE_EVENT,
  readIsDarkFromDom,
  toggleDarkMode,
} from "@/lib/colorScheme";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./DarkModeToggle.module.css";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const syncFromDom = useCallback(() => {
    setDark(readIsDarkFromDom());
  }, []);

  useLayoutEffect(() => {
    syncFromDom();
  }, [syncFromDom]);

  useEffect(() => {
    const onTheme = () => syncFromDom();
    window.addEventListener(FOLIO_THEME_CHANGE_EVENT, onTheme);
    return () => window.removeEventListener(FOLIO_THEME_CHANGE_EVENT, onTheme);
  }, [syncFromDom]);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    let blockNextClick = false;

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      blockNextClick = true;
      toggleDarkMode();
      window.setTimeout(() => {
        blockNextClick = false;
      }, 500);
    };

    const onClick = (e: MouseEvent) => {
      if (blockNextClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      toggleDarkMode();
    };

    btn.addEventListener("touchend", onTouchEnd, { passive: false });
    btn.addEventListener("click", onClick);
    return () => {
      btn.removeEventListener("touchend", onTouchEnd);
      btn.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.themeToggle}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className={styles.themeToggleMark} aria-hidden>
        <span className={styles.themeToggleMarkFill} />
      </span>
    </button>
  );
}
