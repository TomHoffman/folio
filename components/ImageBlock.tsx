import Image from "next/image";
import {
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import railStyles from "./projectContentRail.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./ImageBlock.module.css";
import type {
  ImageBlockCellMode,
  ImageBlockMobileLayout,
  ImageBlockProps,
  ImageBlockRow,
} from "./imageBlockTypes";

const DEFAULT_ROW_AR = "16 / 10";

function rowCols(row: ImageBlockRow): number {
  return Math.min(4, Math.max(1, row.cells.length));
}

function RowView({
  row,
  sizesHint,
}: {
  row: ImageBlockRow;
  sizesHint: string;
}) {
  const mode: ImageBlockCellMode = row.cellMode ?? "rowAspect";
  const ar = row.rowAspectRatio?.trim() || DEFAULT_ROW_AR;
  const n = rowCols(row);

  if (mode === "square") {
    return (
      <div
        className={`${styles.row} ${styles.rowSquare}`}
        data-cols={n}
        style={{ ["--image-block-cols" as string]: String(n) }}
      >
        {row.cells.map((cell, i) => (
          <div key={`${cell.src}-${i}`} className={styles.cell}>
            <div className={styles.cellFrame}>
              <Image
                src={cell.src}
                alt={cell.alt}
                fill
                className={styles.image}
                sizes={sizesHint}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.row} ${styles.rowAspect}`}
      data-cols={n}
      style={{ ["--row-ar" as string]: ar }}
    >
      {row.cells.map((cell, i) => (
        <div key={`${cell.src}-${i}`} className={styles.cell}>
          <div className={styles.cellFrame}>
            <Image
              src={cell.src}
              alt={cell.alt}
              fill
              className={styles.image}
              sizes={sizesHint}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function flattenCells(rows: ImageBlockRow[]) {
  const out: { cell: ImageBlockRow["cells"][0]; row: ImageBlockRow }[] = [];
  for (const row of rows) {
    for (const cell of row.cells) {
      out.push({ cell, row });
    }
  }
  return out;
}

export function ImageBlock({
  title,
  description,
  headingId,
  indicatorColor = "blue",
  contained,
  mobileLayout = "stacked",
  rows,
  className,
}: ImageBlockProps) {
  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  const sizesRow =
    "(max-width: 767px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 40vw, 32vw";
  const sizesSlide =
    "(max-width: 767px) 85vw, (max-width: 1023px) 45vw, (max-width: 1279px) 40vw, 32vw";

  /** Horizontal swipe strip only when not contained. */
  const useCarouselTrack =
    !contained && mobileLayout === "mobile-carousel";
  const useColumnMobile = mobileLayout === "column";

  const imageGroupClasses = [
    styles.imageGroupOuter,
    useCarouselTrack ? styles.layoutMobileCarousel : "",
    useColumnMobile ? styles.layoutColumnMobile : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass} aria-labelledby={headingId}>
      <div className={styles.sectionInner}>
        <div className={`${railStyles.contentRail} ${styles.description}`}>
          <h2
            id={headingId}
            className={`${sectionHeadingStyles.heading} ${sectionHeadingStyles.headingOnRail} ${styles.descriptionHeading}`}
            style={sectionHeadingIndicatorStyle(indicatorColor)}
          >
            {title.trim()}
          </h2>
          <p className={styles.descriptionBody}>{description}</p>
        </div>

        <div className={imageGroupClasses}>
          <div
            className={
              contained ? styles.imageGroupShell : styles.imageGroupBleed
            }
          >
            <div className={styles.rows}>
              {rows.map((row, ri) => (
                <RowView key={`row-${ri}`} row={row} sizesHint={sizesRow} />
              ))}
            </div>
            {useCarouselTrack ? (
              <div className={styles.carouselTrack}>
                {flattenCells(rows).map(({ cell }, i) => (
                  <div
                    key={`slide-${cell.src}-${i}`}
                    className={styles.carouselSlide}
                  >
                    <div className={styles.carouselSlideInner}>
                      <Image
                        src={cell.src}
                        alt={cell.alt}
                        fill
                        className={styles.image}
                        sizes={sizesSlide}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
