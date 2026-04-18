import Image from "next/image";
import {
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./CardGroup.module.css";
import type {
  CardGroupItem,
  CardGroupProps,
  IconCardData,
  ImageCardData,
} from "./cardGroupTypes";

function IconCard({ data }: { data: IconCardData }) {
  return (
    <article className={`${styles.card} ${styles.cardIcon}`}>
      <div className={styles.cardContent}>
        <div className={styles.iconWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG icons */}
          <img
            className={styles.iconImg}
            src={data.iconSrc}
            alt={data.iconAlt ?? ""}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className={styles.cardTextBlock}>
          <h3 className={styles.cardTitle}>{data.title}</h3>
          <p className={styles.cardBody}>{data.body}</p>
        </div>
      </div>
    </article>
  );
}

function ImageCard({ data }: { data: ImageCardData }) {
  return (
    <article className={`${styles.card} ${styles.cardImage}`}>
      <div className={styles.cardContent}>
        <div className={styles.imageFrame}>
          <Image
            src={data.imageSrc}
            alt={data.imageAlt}
            fill
            className={styles.image}
            sizes="(max-width: 767px) 78vw, (max-width: 1023px) 45vw, 25vw"
          />
        </div>
        <div className={styles.cardTextBlock}>
          <h3 className={styles.cardTitle}>{data.title}</h3>
          {data.body ? <p className={styles.cardBody}>{data.body}</p> : null}
        </div>
      </div>
    </article>
  );
}

function CardItem({ item }: { item: CardGroupItem }) {
  if (item.type === "icon") {
    return <IconCard data={item} />;
  }
  return <ImageCard data={item} />;
}

function desktopColClass(
  columnCount: NonNullable<CardGroupProps["columnCount"]>,
): string {
  if (columnCount === 2) return styles.cols2;
  if (columnCount === 3) return styles.cols3;
  return styles.cols4;
}

export function CardGroup({
  title,
  showTitle = true,
  indicatorColor = "orange",
  columnCount = 4,
  mobileLayout = "stack",
  items,
  className,
  headingId = "card-group-heading",
}: CardGroupProps) {
  const visibleTitle = showTitle && Boolean(title?.trim());
  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  const listClass = [
    styles.list,
    mobileLayout === "carousel"
      ? styles.listMobileCarousel
      : styles.listMobileStack,
    desktopColClass(columnCount),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={sectionClass}
      aria-labelledby={visibleTitle ? headingId : undefined}
    >
      <div className={styles.pageInset}>
        {visibleTitle ? (
          <h2
            id={headingId}
            className={`${sectionHeadingStyles.heading} ${styles.cardGroupHeading}`}
            style={sectionHeadingIndicatorStyle(indicatorColor)}
          >
            {title?.trim()}
          </h2>
        ) : (
          <h2 id={headingId} className="sr-only">
            {title?.trim() || "Cards"}
          </h2>
        )}
        <ul className={listClass}>
          {items.map((item, i) => (
            <li key={`${item.type}-${i}`} className={styles.cardSlot}>
              <CardItem item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
