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
  imageSrc: string;
  imageAlt: string;
};

export type CardGroupItem = IconCardData | ImageCardData;

export type CardGroupMobileLayout = "stack" | "carousel";

/** Serializable block for `Project.cardGroup` in `data/projects.ts`. */
export type CardGroupData = {
  title: string;
  showTitle?: boolean;
  indicatorColor?: SectionHeadingIndicatorColor;
  columnCount?: 2 | 3 | 4;
  mobileLayout?: CardGroupMobileLayout;
  /** Unique `id` for the section heading when multiple card groups exist on one page. */
  headingId?: string;
  items: CardGroupItem[];
};

export type CardGroupProps = CardGroupData & {
  className?: string;
};
