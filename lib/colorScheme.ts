/** Synced with app/layout.tsx inline script key. */
export const COLOR_SCHEME_STORAGE_KEY = "folio-color-scheme";

export const FOLIO_THEME_CHANGE_EVENT = "folio-theme-change";

export function readIsDarkFromDom(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

export function applyDarkMode(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
  try {
    localStorage.setItem(
      COLOR_SCHEME_STORAGE_KEY,
      isDark ? "dark" : "light",
    );
  } catch {
    /* private mode / quota */
  }
  window.dispatchEvent(new CustomEvent(FOLIO_THEME_CHANGE_EVENT));
}

/**
 * Re-apply theme from storage. Call after hydration if the html `className` prop
 * omits `dark` (otherwise React reconciliation overwrites classList toggles).
 */
export function syncThemeFromStorage(): void {
  if (typeof document === "undefined") return;
  try {
    const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    const isDark = stored !== "light";
    applyDarkMode(isDark);
  } catch {
    applyDarkMode(true);
  }
}

/** Toggles document dark mode; returns whether dark is now on. */
export function toggleDarkMode(): boolean {
  const next = !document.documentElement.classList.contains("dark");
  applyDarkMode(next);
  return next;
}
