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
  /**
   * Optional paired SVG (e.g. full UI). When set with `inlineSvgSrc`, shows a Wireframe / UI Design toggle below the graphic.
   */
  inlineSvgUiSrc?: string;
  className?: string;
};

export type FocusLayerBlockData = Omit<FocusLayerBlockProps, "className">;
