"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HOME_FEATURED_PROJECTS_ANCHOR_ID } from "@/components/HomeFeaturedGrids";
import {
  FOLIO_THEME_CHANGE_EVENT,
  readIsDarkFromDom,
  toggleDarkMode,
} from "@/lib/colorScheme";
import styles from "./HomeHeroPanelNav.module.css";

const CONTACT_MAILTO = "mailto:t.hoffman@me.com";

export function HomeHeroPanelThemeBar() {
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

  const iconSrc = dark ? "/svg/icons/dark-mode.svg" : "/svg/icons/light-mode.svg";
  const label = dark ? "Dark mode" : "Light mode";

  return (
    <div className={styles.themeBarWrap}>
      <button
        ref={buttonRef}
        type="button"
        data-hero-theme-toggle
        className={styles.themeBar}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from public */}
        <img src={iconSrc} alt="" width={24} height={24} className={styles.themeIcon} />
        <span className={styles.themeLabel}>{label}</span>
      </button>
    </div>
  );
}

export function HomeHeroPanelNavLinks() {
  const pathname = usePathname();
  const homeActive = pathname === "/";

  return (
    <nav className={styles.nav} data-hero-panel-nav aria-label="Primary">
      <Link
        href="/"
        className={[styles.navRow, homeActive ? styles.navRowActive : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.navLabel}>About</span>
        {homeActive ? <span className={styles.navDot} aria-hidden /> : null}
      </Link>
      <a href={`#${HOME_FEATURED_PROJECTS_ANCHOR_ID}`} className={styles.navRow}>
        <span className={styles.navLabel}>Projects</span>
      </a>
      <a href={CONTACT_MAILTO} className={styles.navRow}>
        <span className={styles.navLabel}>Contact</span>
      </a>
    </nav>
  );
}
