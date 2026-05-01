import type { SectionHeadingIndicatorColor } from "@/lib/sectionHeadingIndicator";

export type IconCardData = {
  type: "icon";
  title: string;
  body: string;
  /** Public path e.g. `/svg/clients/licel.svg` */
  iconSrc: string;
  iconAlt?: string;
};

export type ImageCardData = {
  type: "image";
  title: string;
  body?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Text alignment for image-card copy block. Defaults to `left`. */
  alignment?: "left" | "center";
  /** Image placement variant for image cards. */
  imageLayout?: "default" | "bottomContain448";
  /** Optional background color for the image frame (e.g. `#414F57`). */
  imageBgColor?: string;
};

export type CardGroupItem = IconCardData | ImageCardData;

export type CardGroupMobileLayout = "stack" | "carousel";

/** Serializable block for `Project.cardGroup` in `data/projects.ts`. */
export type CardGroupData = {
  title: string;
  description?: string;
  showTitle?: boolean;
  indicatorColor?: SectionHeadingIndicatorColor;
  columnCount?: 2 | 3 | 4;
  mobileLayout?: CardGroupMobileLayout;
  /** Unique `id` for the section heading when multiple card groups exist on one page. */
  headingId?: string;
  /** When true, the group is omitted from the page (keep in data to restore later). */
  hidden?: boolean;
  items: CardGroupItem[];
};

export type CardGroupProps = CardGroupData & {
  className?: string;
};
