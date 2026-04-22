import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type ImageGridItemFit = "cover" | "contain";

export type ImageGridItem = {
  /** Omit to show an empty tile container. */
  src?: string;
  /** Use empty string for decorative tiles. */
  alt?: string;
  /** Optional per-tile background color. */
  bgColor?: string;
  /** Optional mobile-only background color override (`<768px`). */
  mobileBgColor?: string;
  /** How the image fits in the tile. */
  fit?: ImageGridItemFit;
  /** Optional mobile-only slide aspect ratio (e.g. `4 / 3`). */
  mobileAspectRatio?: string;
};

export type ImageGridColumn = {
  items: ImageGridItem[];
};

export type ImageGridMobileLayout = "carousel" | "grid";

export type ImageGridProps = {
  title?: string;
  description?: string;
  headingId?: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  /** Gap between tiles in px. */
  gapPx?: number;
  /** Contained shell style (panel background + padding). */
  contained: boolean;
  /** When false, remove shell styling on mobile (`<768px`). */
  mobileContained?: boolean;
  /** Mobile rendering mode. */
  mobileLayout?: ImageGridMobileLayout;
  /** Desktop columns. Use 2-4 columns for best results. */
  columns: ImageGridColumn[];
  className?: string;
  descriptionClassName?: string;
};

export type ImageGridData = Omit<ImageGridProps, "className" | "descriptionClassName">;
