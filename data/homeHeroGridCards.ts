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

export type HomeHeroGridCardEmptyMedia = {
  kind: "none";
};

export type HomeHeroGridCardMedia =
  | HomeHeroGridCardImageMedia
  | HomeHeroGridCardVideoMedia
  | HomeHeroGridCardRiveMedia
  | HomeHeroGridCardEmptyMedia;

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

const HERO_GRID_PLACEHOLDER_IMAGES = [
  "/images/home/hero-grid/bhf-phone.jpg",
  "/images/home/hero-grid/bhf-laptop.jpg",
  "/images/home/hero-grid/licel-authenticator.jpg",
  "/images/home/hero-grid/licel-menu.jpg",
] as const;

const HERO_GRID_ACCENT_CYCLE: HomeHeroGridAccentDot[] = [
  "apricot",
  "sky",
  "mint",
  "lavender",
  "coral",
  "rose",
];

/** `/home-alt` always opens on this card (see `buildHomeAltCardOrder`). */
export const HOME_ALT_START_CARD_ID = "card-1";

/** Shared desktop bento corner tile — all four outer corners use this card. */
export const HOME_HERO_GRID_CORNER_CARD_ID = "grid-corner";

export const HOME_HERO_GRID_CORNER_CARD: HomeHeroGridCard = {
  id: HOME_HERO_GRID_CORNER_CARD_ID,
  label: "You've reached the end",
  desktopSpan: "standard",
  theme: "default",
  media: { kind: "none" },
};

export const homeHeroGridCards: HomeHeroGridCard[] = Array.from(
  { length: 20 },
  (_, index) => {
    const n = index + 1;
    return {
      id: `card-${n}`,
      label: n === 1 ? "Hello," : `Card ${n}`,
      desktopSpan: "both",
      accentDot: HERO_GRID_ACCENT_CYCLE[index % HERO_GRID_ACCENT_CYCLE.length],
      theme: "default",
      media: {
        kind: "image",
        sources: HERO_GRID_PLACEHOLDER_IMAGES[index % HERO_GRID_PLACEHOLDER_IMAGES.length],
      },
    } satisfies HomeHeroGridCard;
  },
);

export const HOME_HERO_GRID_CARD_IDS = homeHeroGridCards.map((card) => card.id);

const homeHeroGridCardMap = new Map<string, HomeHeroGridCard>([
  ...homeHeroGridCards.map((card) => [card.id, card] as const),
  [HOME_HERO_GRID_CORNER_CARD.id, HOME_HERO_GRID_CORNER_CARD],
]);

export function isDesktopBentoCornerSlot(
  row: number,
  card: number,
  rowSpans: ReadonlyArray<ReadonlyArray<1 | 2>>,
): boolean {
  const lastRow = rowSpans.length - 1;
  if (row !== 0 && row !== lastRow) return false;
  const lastCard = (rowSpans[row]?.length ?? 0) - 1;
  if (lastCard < 0) return false;
  return card === 0 || card === lastCard;
}

export function getDesktopBentoSlotCard(
  row: number,
  card: number,
  flatIdx: number,
  colSpan: 1 | 2,
  orderedCardIds: readonly string[],
  rowSpans: ReadonlyArray<ReadonlyArray<1 | 2>>,
): HomeHeroGridCard {
  if (isDesktopBentoCornerSlot(row, card, rowSpans)) {
    return HOME_HERO_GRID_CORNER_CARD;
  }
  const id = getDesktopBentoCardIdForSlot(flatIdx, colSpan, orderedCardIds);
  return getHomeHeroGridCardById(id);
}

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

/** Fixed card order so `mobileCenterFlatIdx` shows `HOME_ALT_START_CARD_ID`. */
export function buildHomeAltCardOrder(mobileCenterFlatIdx: number): string[] {
  const ids = [...HOME_HERO_GRID_CARD_IDS];
  const targetIdx = mobileCenterFlatIdx % ids.length;
  const startIdx = ids.indexOf(HOME_ALT_START_CARD_ID);
  if (startIdx < 0) return ids;
  const rotateBy = (startIdx - targetIdx + ids.length) % ids.length;
  return [...ids.slice(rotateBy), ...ids.slice(0, rotateBy)];
}

export function pickHomeAltDesktopStartSlot(
  orderedCardIds: readonly string[],
  rowSpans: ReadonlyArray<ReadonlyArray<1 | 2>>,
  prefer: { row: number; card: number },
): { row: number; card: number } {
  let best = prefer;
  let bestDist = Number.POSITIVE_INFINITY;

  rowSpans.forEach((spans, row) => {
    spans.forEach((colSpan, card) => {
      const flatIdx = row * spans.length + card;
      const id = getDesktopBentoCardIdForSlot(flatIdx, colSpan, orderedCardIds);
      if (id !== HOME_ALT_START_CARD_ID) return;
      const dist = Math.abs(row - prefer.row) + Math.abs(card - prefer.card);
      if (dist < bestDist) {
        bestDist = dist;
        best = { row, card };
      }
    });
  });

  return best;
}

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
