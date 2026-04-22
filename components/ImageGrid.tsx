import Image from "next/image";
import type { CSSProperties } from "react";
import { sectionHeadingIndicatorStyle } from "@/lib/sectionHeadingIndicator";
import railStyles from "./projectContentRail.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./ImageGrid.module.css";
import type { ImageGridColumn, ImageGridItem, ImageGridProps } from "./imageGridTypes";

function itemFitClass(fit?: ImageGridItem["fit"]): string {
  if (fit === "contain") return styles.imageContain;
  return styles.imageCover;
}

export function ImageGrid({
  title,
  description,
  headingId,
  indicatorColor = "powderBlue",
  gapPx = 8,
  contained,
  mobileContained = true,
  mobileLayout = "carousel",
  columns,
  className,
  descriptionClassName,
}: ImageGridProps) {
  const safeColumns = columns.slice(0, 4).filter((column) => column.items.length > 0);
  if (safeColumns.length === 0) return null;

  const headingText = title?.trim() ?? "";
  const descriptionText = description?.trim() ?? "";
  const hasHeading = headingText.length > 0;
  const hasDescription = descriptionText.length > 0;
  const hasDescriptionBlock = hasHeading || hasDescription;

  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  const gridOuterClass = [
    styles.gridOuter,
    mobileLayout === "carousel" ? styles.layoutMobileCarousel : "",
  ]
    .filter(Boolean)
    .join(" ");
  const shellClass = contained ? styles.gridShell : styles.gridBleed;
  const shellMobileClass =
    contained && !mobileContained ? styles.shellUncontainedOnMobile : "";

  const layoutVars = {
    ["--image-grid-columns" as string]: String(safeColumns.length),
    ["--image-grid-gap" as string]: `${gapPx}px`,
  } as CSSProperties;
  const mobileSlides: { item: ImageGridItem; key: string }[] = [];
  safeColumns.forEach((column, columnIndex) => {
    column.items.forEach((item, itemIndex) => {
      mobileSlides.push({
        item,
        key: `slide-col-${columnIndex}-item-${itemIndex}-${item.src ?? "empty"}`,
      });
    });
  });

  return (
    <section
      className={sectionClass}
      aria-labelledby={hasHeading && headingId ? headingId : undefined}
    >
      <div className={styles.sectionInner}>
        {hasDescriptionBlock ? (
          <div
            className={[
              railStyles.contentRail,
              styles.description,
              descriptionClassName ?? "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {hasHeading ? (
              <h2
                id={headingId}
                className={`${sectionHeadingStyles.heading} ${sectionHeadingStyles.headingOnRail} ${styles.descriptionHeading}`}
                style={sectionHeadingIndicatorStyle(indicatorColor)}
              >
                {headingText}
              </h2>
            ) : null}
            {hasDescription ? (
              <p className={styles.descriptionBody}>{descriptionText}</p>
            ) : null}
          </div>
        ) : null}

        <div className={gridOuterClass}>
          <div
            className={[shellClass, shellMobileClass].filter(Boolean).join(" ")}
            style={layoutVars}
          >
            <div className={styles.desktopGrid}>
              {safeColumns.map((column: ImageGridColumn, columnIndex) => (
                <div
                  key={`grid-column-${columnIndex}`}
                  className={`${styles.gridColumn} ${
                    column.items.length === 1 ? styles.gridColumnSingle : ""
                  }`}
                >
                  {column.items.map((item, itemIndex) => (
                    <div
                      key={`grid-item-col-${columnIndex}-${itemIndex}-${item.src ?? "empty"}`}
                      className={[
                        styles.gridItem,
                        column.items.length === 1
                          ? styles.gridItemFill
                          : styles.gridItemRatio,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        {
                          ["--grid-cell-bg" as string]: item.bgColor,
                          ["--grid-cell-bg-mobile" as string]:
                            item.mobileBgColor ?? item.bgColor,
                        } as CSSProperties
                      }
                    >
                      {item.src ? (
                        <Image
                          src={item.src}
                          alt={item.alt ?? ""}
                          fill
                          className={`${styles.image} ${itemFitClass(item.fit)}`}
                          sizes="(max-width: 767px) 85vw, (max-width: 1023px) 44vw, (max-width: 1279px) 32vw, 30vw"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className={styles.carouselTrack}>
              {mobileSlides.map(({ item, key }) => (
                <div key={key} className={styles.carouselSlide}>
                  <div
                    className={styles.carouselSlideInner}
                    style={
                      {
                        ["--carousel-bg" as string]: item.bgColor,
                        ["--carousel-bg-mobile" as string]:
                          item.mobileBgColor ?? item.bgColor,
                        ...(item.mobileAspectRatio
                          ? {
                              ["--image-grid-mobile-ar" as string]:
                                item.mobileAspectRatio,
                            }
                          : {}),
                      } as CSSProperties
                    }
                  >
                    {item.src ? (
                      <Image
                        src={item.src}
                        alt={item.alt ?? ""}
                        fill
                        className={`${styles.image} ${itemFitClass(item.fit)}`}
                        sizes="85vw"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
