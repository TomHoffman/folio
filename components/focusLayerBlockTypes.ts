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
  className?: string;
};

export type FocusLayerBlockData = Omit<FocusLayerBlockProps, "className">;
