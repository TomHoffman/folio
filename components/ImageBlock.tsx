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
  ImageBlockRowHeight,
  ImageBlockRow,
} from "./imageBlockTypes";

const DEFAULT_ROW_AR = "16 / 10";

function rowCols(row: ImageBlockRow): number {
  return Math.min(4, Math.max(1, row.cells.length));
}

function rowHeightPreset(height?: ImageBlockRowHeight): string | undefined {
  switch (height) {
    case "medium":
      return "var(--image-block-row-ar-medium)";
    case "short":
      return "var(--image-block-row-ar-short)";
    case "tall":
      return "var(--image-block-row-ar-tall)";
    default:
      return undefined;
  }
}

function imageFitClass(fit?: ImageBlockRow["cells"][0]["fit"]): string {
  if (fit === "contain") return styles.imageContain;
  if (fit === "containWide") return styles.imageContainWide;
  return "";
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
  const rowBandAr = rowHeightPreset(row.rowHeight);

  if (mode === "square") {
    return (
      <div
        className={`${styles.row} ${styles.rowSquare}`}
        data-cols={n}
        style={{
          ["--image-block-cols" as string]: String(n),
          ...(rowBandAr ? { ["--row-band-ar" as string]: rowBandAr } : {}),
        }}
      >
        {row.cells.map((cell, i) => (
          <div
            key={`${cell.src ?? "tile"}-${i}`}
            className={styles.cell}
            style={{ backgroundColor: cell.bgColor }}
          >
            <div className={styles.cellFrame}>
              {cell.src ? (
                <Image
                  src={cell.src}
                  alt={cell.alt ?? ""}
                  fill
                  className={`${styles.image} ${imageFitClass(cell.fit)}`}
                  sizes={sizesHint}
                />
              ) : null}
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
      style={{
        ["--row-ar" as string]: ar,
        ...(rowBandAr ? { ["--row-band-ar" as string]: rowBandAr } : {}),
      }}
    >
      {row.cells.map((cell, i) => (
        <div
          key={`${cell.src ?? "tile"}-${i}`}
          className={styles.cell}
          style={{ backgroundColor: cell.bgColor }}
        >
          <div className={styles.cellFrame}>
            {cell.src ? (
              <Image
                src={cell.src}
                alt={cell.alt ?? ""}
                fill
                className={`${styles.image} ${imageFitClass(cell.fit)}`}
                sizes={sizesHint}
              />
            ) : null}
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
  mobileStack = "default",
  rows,
  className,
}: ImageBlockProps) {
  const useOneThenTwoMobile = mobileStack === "one-then-two";
  const sectionClass = [
    styles.section,
    useOneThenTwoMobile ? styles.mobileStackOneThenTwo : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const headingText = title?.trim() ?? "";
  const descriptionText = description?.trim() ?? "";
  const hasHeading = headingText.length > 0;
  const hasDescription = descriptionText.length > 0;
  const hasDescriptionBlock = hasHeading || hasDescription;
  const sizesRow =
    "(max-width: 767px) 90vw, (max-width: 1023px) 45vw, (max-width: 1279px) 40vw, 32vw";
  const sizesSlide =
    "(max-width: 767px) 85vw, (max-width: 1023px) 45vw, (max-width: 1279px) 40vw, 32vw";

  /** Horizontal swipe strip on mobile when `mobileLayout` requests it. */
  const useCarouselTrack = mobileLayout === "mobile-carousel";
  const useColumnMobile = mobileLayout === "column";

  const imageGroupClasses = [
    styles.imageGroupOuter,
    useCarouselTrack ? styles.layoutMobileCarousel : "",
    useColumnMobile ? styles.layoutColumnMobile : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={sectionClass}
      aria-labelledby={hasHeading && headingId ? headingId : undefined}
    >
      <div className={styles.sectionInner}>
        {hasDescriptionBlock ? (
          <div className={`${railStyles.contentRail} ${styles.description}`}>
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
                    key={`slide-${cell.src ?? i}-${i}`}
                    className={styles.carouselSlide}
                  >
                    <div
                      className={styles.carouselSlideInner}
                      style={{ backgroundColor: cell.bgColor }}
                    >
                      {cell.src ? (
                        <Image
                          src={cell.src}
                          alt={cell.alt ?? ""}
                          fill
                          className={`${styles.image} ${imageFitClass(cell.fit)}`}
                          sizes={sizesSlide}
                        />
                      ) : null}
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
