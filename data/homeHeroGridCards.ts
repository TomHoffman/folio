export type HomeHeroGridCardTheme = "default" | "blue";

export type HomeHeroGridCardImageMedia = {
  kind: "image";
  /** One URL, or several to cycle through while the panel is active. */
  sources: string | string[];
  /** Milliseconds between images when multiple `sources`. Defaults to 2000. */
  rotationMs?: number;
};

export type HomeHeroGridCardVideoMedia = {
  kind: "video";
  src: string;
  poster?: string;
};

export type HomeHeroGridCardRiveMedia = {
  kind: "rive";
  /** Path under `public/` or absolute URL to a `.riv` file. */
  src: string;
  artboard?: string;
  animations?: string | string[];
  stateMachines?: string | string[];
};

export type HomeHeroGridCardMedia =
  | HomeHeroGridCardImageMedia
  | HomeHeroGridCardVideoMedia
  | HomeHeroGridCardRiveMedia;

export type HomeHeroGridDesktopSpan = "standard" | "wide" | "both";

/**
 * Title-row accent dot palette. Names reflect the hue of each hex (not generic colour labels).
 *
 * | Token      | Hex       | Was described as |
 * |------------|-----------|------------------|
 * | `mint`     | `#93E385` | green            |
 * | `apricot`  | `#FFD38D` | orange           |
 * | `lavender` | `#C6A9E1` | purple           |
 * | `coral`    | `#FD9E86` | red              |
 * | `sky`      | `#6FC6F1` | blue             |
 * | `rose`     | `#FF92B1` | pink             |
 */
export type HomeHeroGridAccentDot =
  | "mint"
  | "apricot"
  | "lavender"
  | "coral"
  | "sky"
  | "rose";

export const HOME_HERO_GRID_ACCENT_DOT_COLORS: Record<HomeHeroGridAccentDot, string> = {
  mint: "#93E385",
  apricot: "#FFD38D",
  lavender: "#C6A9E1",
  coral: "#FD9E86",
  sky: "#6FC6F1",
  rose: "#FF92B1",
};

export const HOME_HERO_GRID_ACCENT_DOT_DEFAULT: HomeHeroGridAccentDot = "apricot";

export type HomeHeroGridCard = {
  id: string;
  label: string;
  body?: string;
  textMaxChars?: number;
  /**
   * Desktop bento placement on large screens (≥1280px wide tiles use `colSpan === 2`).
   * Defaults to `both` when omitted.
   */
  desktopSpan?: HomeHeroGridDesktopSpan;
  /** Title-row dot colour. Defaults to `apricot`. */
  accentDot?: HomeHeroGridAccentDot;
  theme: HomeHeroGridCardTheme;
  media: HomeHeroGridCardMedia;
};

export const HOME_HERO_GRID_IMAGE_ROTATION_MS_DEFAULT = 2000;

export const homeHeroGridCards: HomeHeroGridCard[] = [
  {
    id: "non-profit",
    label: "Non-profit",
    body:
      "I’ve worked with some of the world’s biggest non-profits on projects ranging from design systems, websites and donation flows.",
    textMaxChars: 23,
    desktopSpan: "wide",
    accentDot: "apricot",
    theme: "default",
    media: {
      kind: "image",
      sources: [
        "/images/home/hero-grid/bhf-phone.jpg",
        "/images/home/hero-grid/bhf-laptop.jpg",
      ],
    },
  },
  {
    id: "hero-example-rive",
    label: "Rive (example)",
    desktopSpan: "standard",
    accentDot: "sky",
    theme: "default",
    media: {
      kind: "rive",
      src: "/rive/home-hero-example.riv",
    },
  },
];

export const HOME_HERO_GRID_CARD_IDS = homeHeroGridCards.map((card) => card.id);

const homeHeroGridCardMap = new Map(homeHeroGridCards.map((card) => [card.id, card]));

export function getHomeHeroGridCardById(id: string): HomeHeroGridCard {
  return homeHeroGridCardMap.get(id) ?? homeHeroGridCards[0];
}

export function getHomeHeroGridAccentDotColor(
  dot?: HomeHeroGridAccentDot,
): string {
  return HOME_HERO_GRID_ACCENT_DOT_COLORS[dot ?? HOME_HERO_GRID_ACCENT_DOT_DEFAULT];
}

export function getHomeHeroGridDesktopSpan(
  card: HomeHeroGridCard,
): HomeHeroGridDesktopSpan {
  return card.desktopSpan ?? "both";
}

export function isHomeHeroGridCardEligibleForDesktopBentoSlot(
  card: HomeHeroGridCard,
  colSpan: 1 | 2,
): boolean {
  const span = getHomeHeroGridDesktopSpan(card);
  if (colSpan === 2) return span === "wide" || span === "both";
  return span === "standard" || span === "both";
}

/** Card ids eligible for a desktop bento slot given its column span. */
export function getDesktopBentoCardIdForSlot(
  flatIdx: number,
  colSpan: 1 | 2,
  orderedCardIds: readonly string[],
): string {
  const pool = orderedCardIds.filter((id) =>
    isHomeHeroGridCardEligibleForDesktopBentoSlot(
      getHomeHeroGridCardById(id),
      colSpan,
    ),
  );
  const fallback = orderedCardIds[flatIdx % orderedCardIds.length] ?? orderedCardIds[0] ?? "";
  if (pool.length === 0) return fallback;
  return pool[flatIdx % pool.length] ?? pool[0] ?? fallback;
}
