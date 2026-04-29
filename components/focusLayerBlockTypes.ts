import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type FocusLayerItem = {
  title: string;
  body: string;
};

export type FocusLayerVisualVariant = "illustration" | "demo-square" | "empty";

export type FocusLayerBlockProps = {
  title?: string;
  description?: string;
  headingId?: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  items: FocusLayerItem[];
  /** Optional background image shown in the image container (e.g. chart JPG). */
  imageBackgroundSrc?: string;
  /** Accessible alt for `imageBackgroundSrc` (defaults to empty for decorative usage). */
  imageBackgroundAlt?: string;
  /** Optional opacity for `imageBackgroundSrc` from 0 to 1. */
  imageBackgroundOpacity?: number;
  /**
   * `illustration` (default): layered SVG in the standard image frame.
   * `demo-square`: same frame size as illustration; 150×150 centred square (red / green / blue by active item).
   * `empty`: same frame dimensions and background; no media (placeholder for future art).
   */
  visualVariant?: FocusLayerVisualVariant;
  /**
   * Fetch and inline a single SVG in the image frame (DOM targets for per-state animation later).
   * Takes precedence over `illustration` and `empty`; ignored when `visualVariant` is `demo-square`.
   */
  inlineSvgSrc?: string;
  /** Optional per-accordion-index SVG override map (e.g. `{ 0: "/images/foo.svg" }`). */
  inlineSvgSrcByIndex?: Record<number, string>;
  /**
   * Optional paired SVG (e.g. full UI). When set with `inlineSvgSrc`, shows a Wireframe / UI Design toggle below the graphic.
   */
  inlineSvgUiSrc?: string;
  /** Disable built-in chart motion transforms for inline SVG layers. */
  disableInlineSvgMotion?: boolean;
  /** Optional max-width in px for the inline SVG frame (default 800). */
  inlineSvgMaxWidth?: number;
  /** Optional vertical offset (%) for `#Boat-marker` in inline SVGs. */
  boatMarkerOffsetYPercent?: number;
  /** Optional bottom gap (em) from ring baseline for `#Boat-marker`. */
  boatMarkerBottomGapEm?: number;
  /** Optional multiplier for measured marker/ring bottom gap (e.g. `0.5` = half current gap). */
  boatMarkerBottomGapRatio?: number;
  /** Optional accordion item index that runs looping `#now-ring` growth animation. */
  animateNowRingOnIndex?: number;
  className?: string;
};

export type FocusLayerBlockData = Omit<FocusLayerBlockProps, "className">;
