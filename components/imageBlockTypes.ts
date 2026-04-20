import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type ImageBlockCell = {
  /** Omit (or leave empty) to show an empty tile — no `<Image>`. */
  src?: string;
  /** Use `""` when the tile is decorative / empty. */
  alt?: string;
  /** Optional per-tile background color (e.g. `#3454E1`). */
  bgColor?: string;
  /** Image fit mode for this tile (`cover` by default). */
  fit?: "cover" | "contain" | "containWide";
};

export type ImageBlockCellMode = "rowAspect" | "square";
export type ImageBlockRowHeight = "tall" | "medium" | "short";

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
  /** Tablet+ row band height preset: `tall` 16:7, `medium` 16:5, `short` 16:3. */
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

export type ImageBlockProps = {
  title?: string;
  description?: string;
  headingId?: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  /** When true, images sit in the rounded panel (`#172e37`, 8px pad) from Figma. */
  contained: boolean;
  /** See `ImageBlockMobileLayout`. */
  mobileLayout?: ImageBlockMobileLayout;
  /** Optional mobile stack pattern for row content. */
  mobileStack?: ImageBlockMobileStack;
  rows: ImageBlockRow[];
  className?: string;
};

/** Serializable shape for `Project.imageBlocks[]` in `data/projects.ts`. */
export type ImageBlockData = Omit<ImageBlockProps, "className">;
