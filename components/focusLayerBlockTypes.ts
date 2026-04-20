import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type FocusLayerItem = {
  title: string;
  body: string;
};

export type FocusLayerBlockProps = {
  title?: string;
  description?: string;
  headingId?: string;
  indicatorColor?: SectionHeadingIndicatorColor;
  items: FocusLayerItem[];
  /** Time in ms before advancing to the next item. */
  autoRotateMs?: number;
  className?: string;
};

export type FocusLayerBlockData = Omit<FocusLayerBlockProps, "className">;
