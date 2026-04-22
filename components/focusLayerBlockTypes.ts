import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type FocusLayerItem = {
  title: string;
  body: string;
};

export type FocusLayerVisualVariant = "illustration" | "demo-square";

export type FocusLayerBlockProps = {
  title?: string;
  description?: string;
  headingId?: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  items: FocusLayerItem[];
  /**
   * `illustration` (default): layered SVG in the standard image frame.
   * `demo-square`: same frame size as illustration; 150×150 centred square (red / green / blue by active item).
   */
  visualVariant?: FocusLayerVisualVariant;
  className?: string;
};

export type FocusLayerBlockData = Omit<FocusLayerBlockProps, "className">;
