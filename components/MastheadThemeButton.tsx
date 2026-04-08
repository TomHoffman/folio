"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { MastheadDarkModeToggleIcon } from "@/components/MastheadDarkModeToggleIcon";
import type { Theme } from "@/lib/theme";
import { getThemeFromDocument, toggleTheme } from "@/lib/theme";
import styles from "./MastheadThemeButton.module.css";

function subscribeTheme(cb: () => void) {
  const root = document.documentElement;
  const mo = new MutationObserver(cb);
  mo.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

function getThemeSnapshot(): Theme {
  return getThemeFromDocument();
}

function getThemeServerSnapshot(): Theme {
  return "dark";
}

export function MastheadThemeButton() {
  const router = useRouter();
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  return (
    <button
      type="button"
      className={styles.themeButton}
      style={{
        position: "fixed",
        top: 4,
        right: 4,
        left: "auto",
        zIndex: 200,
      }}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      aria-pressed={theme === "dark"}
      onClick={() => {
        toggleTheme();
        router.refresh();
      }}
    >
      <MastheadDarkModeToggleIcon />
    </button>
  );
}
