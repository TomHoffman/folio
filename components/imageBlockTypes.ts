import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type ImageBlockCell = {
  src: string;
  alt: string;
};

export type ImageBlockCellMode = "rowAspect" | "square";

export type ImageBlockRow = {
  cells: ImageBlockCell[];
  /**
   * `rowAspect` (default): one aspect ratio for the full row so cells share height.
   * `square`: each cell is `1 / 1` (width tracks the column; heights match when columns are equal).
   */
  cellMode?: ImageBlockCellMode;
  /**
   * Used when `cellMode` is `rowAspect` or omitted.
   * From tablet up: **one** cell → **16:8** row; **two** cells → **16:7** row (`rowAspect` only).
   * Ignored for those layouts. Three+ cells still use this on the row box where applicable.
   */
  rowAspectRatio?: string;
};

/**
 * - `stacked`: `<768px` same row geometry as tablet (e.g. two-up rows stay two-up).
 * - `column`: `<768px` single full-width column (squashed-square tiles); `768px+` same as stacked.
 * - `mobile-carousel`: horizontal strip `<768px` only; **must** be used with `contained={false}`.
 */
export type ImageBlockMobileLayout =
  | "stacked"
  | "column"
  | "mobile-carousel";

export type ImageBlockProps = {
  title: string;
  description: string;
  headingId: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  /** When true, images sit in the rounded panel (`#172e37`, 8px pad) from Figma. */
  contained: boolean;
  /** See `ImageBlockMobileLayout`. `mobile-carousel` is ignored when `contained` is true. */
  mobileLayout?: ImageBlockMobileLayout;
  rows: ImageBlockRow[];
  className?: string;
};
