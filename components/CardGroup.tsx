"use client";

import Image from "next/image";
import { useEffect } from "react";
import enterStyles from "./ProjectPageEnter.module.css";
import {
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import railStyles from "./projectContentRail.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./CardGroup.module.css";
import { useScrollRevealElement } from "./useScrollReveal";
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
  const isOutcomesGroup = (title?.trim().toLowerCase() ?? "") === "outcomes";
  const { ref: titleRevealRef, isVisible: isTitleVisible } = useScrollRevealElement<HTMLHeadingElement>({
    enabled: isOutcomesGroup,
  });
  const { ref: cardsRevealRef, isVisible: areCardsVisible } = useScrollRevealElement<HTMLUListElement>({
    enabled: isOutcomesGroup,
  });

  useEffect(() => {
    if (!isOutcomesGroup) return;
    if (!isTitleVisible && !areCardsVisible) return;
    document.documentElement.dataset.outcomesRevealed = "true";
    window.dispatchEvent(new CustomEvent("folio:outcomes-reveal"));
  }, [isOutcomesGroup, isTitleVisible, areCardsVisible]);
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
      <div className={styles.sectionInner}>
        {visibleTitle ? (
          <div
            className={[
              styles.headingRail,
              isOutcomesGroup ? styles.headingRailOutcomes : "",
              railStyles.contentRail,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <h2
              ref={titleRevealRef}
              id={headingId}
              className={[
                sectionHeadingStyles.heading,
                sectionHeadingStyles.headingOnRail,
                styles.cardGroupHeading,
                isOutcomesGroup && !isTitleVisible ? enterStyles.revealPending : "",
                isOutcomesGroup && isTitleVisible ? enterStyles.fadeInUp : "",
                isOutcomesGroup && isTitleVisible ? enterStyles.offset0 : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={sectionHeadingIndicatorStyle(indicatorColor)}
            >
              {title?.trim()}
            </h2>
          </div>
        ) : (
          <h2 id={headingId} className="sr-only">
            {title?.trim() || "Cards"}
          </h2>
        )}
        <ul className={listClass} ref={cardsRevealRef}>
          {items.map((item, i) => (
            <li
              key={`${item.type}-${i}`}
              className={[
                styles.cardSlot,
                isOutcomesGroup && item.type === "icon" && !areCardsVisible
                  ? enterStyles.revealPending
                  : "",
                isOutcomesGroup && item.type === "icon" && areCardsVisible
                  ? enterStyles.fadeInUp
                  : "",
                isOutcomesGroup && item.type === "icon" && areCardsVisible
                  ? enterStyles.offset1
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <CardItem item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
