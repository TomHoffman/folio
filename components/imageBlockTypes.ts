import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type ImageBlockCell = {
  /** Omit (or leave empty) to show an empty tile — no `<Image>`. */
  src?: string;
  /** Optional inline SVG path from `/public` (e.g. `/images/foo.svg`) for CSS-targetable inner layers. */
  inlineSvgSrc?: string;
  /** Use `""` when the tile is decorative / empty. */
  alt?: string;
  /** Optional short caption shown inside the tile. */
  label?: string;
  /** Optional placeholder container mode for layout exploration before final media is ready. */
  placeholderMode?: "left-inset-no-right";
  /** Optional placeholder background color (defaults to red). */
  placeholderColor?: string;
  /** Optional per-tile background color (e.g. `#3454E1`). */
  bgColor?: string;
  /** Optional mobile-only background color override (`<768px`). */
  mobileBgColor?: string;
  /** Image fit mode for this tile (`cover` by default). */
  fit?:
    | "cover"
    | "contain"
    | "containWide"
    | "containWide365"
    | "containWide900"
    | "containLogo"
    | "containLogoSpaced"
    | "containLarge";
};

export type ImageBlockCellMode = "rowAspect" | "square";
export type ImageBlockRowHeight =
  | "full-width"
  | "tall"
  | "med-tall"
  | "medium"
  | "short"
  | "content";

export type ImageBlockRow = {
  cells: ImageBlockCell[];
  /**
   * `rowAspect` (default): one aspect ratio for the full row so cells share height.
   * `square`: each cell is `1 / 1` (width tracks the column; heights match when columns are equal).
   */
  cellMode?: ImageBlockCellMode;
  /**
   * Used when `cellMode` is `rowAspect` or omitted.
   * From tablet up, all `rowAspect` rows use **16:7** on the row box (this value is ignored there).
   */
  rowAspectRatio?: string;
  /**
   * Tablet+ row height preset:
 * - `full-width`: matches project hero media ratio.
   * - `short`: shallow landscape band.
   * - `medium`: squashed-square band.
   * - `med-tall`: midway between `medium` and `tall`.
   * - `tall`: portrait-leaning band.
   * - `content`: no forced ratio; row height follows its content.
   */
  rowHeight?: ImageBlockRowHeight;
};

/**
 * - `stacked`: `<768px` same row geometry as tablet (e.g. two-up rows stay two-up).
 * - `column`: `<768px` single full-width column (squashed-square tiles); `768px+` same as stacked.
 * - `mobile-carousel`: horizontal strip `<768px` only.
 */
export type ImageBlockMobileLayout =
  | "stacked"
  | "column"
  | "mobile-carousel";

export type ImageBlockMobileStack = "default" | "one-then-two";
export type ImageBlockRevealOffset = 0 | 1 | 2 | 3 | 4;
export type ImageBlockScrollReveal = "none" | "self" | "on-outcomes";
export type ImageBlockScrollRevealTarget = "section" | "svg-only";

export type ImageBlockProps = {
  title?: string;
  description?: string;
  headingId?: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  /** When true, images sit in the rounded panel (`#122a35`, 8px pad) from Figma. */
  contained: boolean;
  /** When false, remove container shell on mobile (`<768px`) even if `contained` is true. */
  mobileContained?: boolean;
  /** See `ImageBlockMobileLayout`. */
  mobileLayout?: ImageBlockMobileLayout;
  /** Optional mobile stack pattern for row content. */
  mobileStack?: ImageBlockMobileStack;
  /** Optional selective scroll reveal trigger. */
  scrollReveal?: ImageBlockScrollReveal;
  /** Reveal scope when `scrollReveal` is enabled. */
  scrollRevealTarget?: ImageBlockScrollRevealTarget;
  /** Delay offset preset used when `scrollReveal` is enabled. */
  revealOffset?: ImageBlockRevealOffset;
  /** Optional reveal delay preset for the description rail block. */
  descriptionRevealOffset?: ImageBlockRevealOffset;
  rows: ImageBlockRow[];
  className?: string;
  descriptionClassName?: string;
};

/** Serializable shape for `Project.imageBlocks[]` in `data/projects.ts`. */
export type ImageBlockData = Omit<
  ImageBlockProps,
  "className" | "descriptionClassName"
>;
