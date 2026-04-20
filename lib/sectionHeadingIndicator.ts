import type { CSSProperties } from "react";

/** Named indicator dots for `SectionHeading` — maps to `--color-section-indicator-*` in `globals.css`. */
export const sectionHeadingIndicatorColors = [
  "orange",
  "yellow",
  "green",
  "lime",
  "blue",
  "powderBlue",
  "purple",
  "pink",
  "red",
  "secondary",
] as const;

export type SectionHeadingIndicatorColor =
  (typeof sectionHeadingIndicatorColors)[number];

export function sectionHeadingIndicatorStyle(
  color: SectionHeadingIndicatorColor = "powderBlue",
): CSSProperties {
  const value =
    color === "secondary"
      ? "var(--color-text-secondary)"
      : `var(--color-section-indicator-${color})`;
  return {
    ["--section-heading-indicator" as string]: value,
  } as CSSProperties;
}
