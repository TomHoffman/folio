export const THEME_STORAGE_KEY = "folio-theme";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark";

export function getThemeFromDocument(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function setThemeCookie(theme: Theme): void {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const parts = [
    `${THEME_STORAGE_KEY}=${theme}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE_SEC}`,
    "SameSite=Lax",
    ...(secure ? (["Secure"] as const) : []),
  ];
  try {
    document.cookie = parts.join("; ");
  } catch {
    /* private mode */
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode / quota */
  }
  setThemeCookie(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getThemeFromDocument() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
