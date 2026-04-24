"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import enterStyles from "./ProjectPageEnter.module.css";
import railStyles from "./projectContentRail.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./ImageBlock.module.css";
import { useScrollRevealElement } from "./useScrollReveal";
import type {
  ImageBlockCellMode,
  ImageBlockMobileLayout,
  ImageBlockProps,
  ImageBlockRevealOffset,
  ImageBlockRowHeight,
  ImageBlockScrollReveal,
  ImageBlockScrollRevealTarget,
  ImageBlockRow,
} from "./imageBlockTypes";

const DEFAULT_ROW_AR = "16 / 10";
type ImageBlockCell = ImageBlockRow["cells"][0];

function rowCols(row: ImageBlockRow): number {
  return Math.min(4, Math.max(1, row.cells.length));
}

function rowHeightPreset(height?: ImageBlockRowHeight): string | undefined {
  switch (height) {
    case "full-width":
      return "var(--image-block-row-ar-full-width)";
    case "med-tall":
      return "var(--image-block-row-ar-med-tall)";
    case "medium":
      return "var(--image-block-row-ar-medium)";
    case "short":
      return "var(--image-block-row-ar-short)";
    case "tall":
      return "var(--image-block-row-ar-tall)";
    case "content":
      return undefined;
    default:
      return undefined;
  }
}

function imageFitClass(fit?: ImageBlockRow["cells"][0]["fit"]): string {
  if (fit === "contain") return styles.imageContain;
  if (fit === "containWide") return styles.imageContainWide;
  if (fit === "containLogo") return styles.imageContainLogo;
  if (fit === "containLogoSpaced") return styles.imageContainLogo;
  if (fit === "containLarge") return styles.imageContainLarge;
  return "";
}

function frameFitClass(fit?: ImageBlockRow["cells"][0]["fit"]): string {
  if (fit === "containLogoSpaced") {
    return `${styles.cellFrameContain} ${styles.cellFrameContainLogoSpaced}`;
  }
  if (fit === "contain" || fit === "containWide" || fit === "containLogo") {
    return styles.cellFrameContain;
  }
  return "";
}

function imageFlowFitClass(fit?: ImageBlockRow["cells"][0]["fit"]): string {
  if (fit === "contain") return styles.imageFlowContain;
  if (fit === "containWide") return styles.imageFlowContainWide;
  if (fit === "containLogo") return styles.imageFlowContainLogo;
  if (fit === "containLogoSpaced") return styles.imageFlowContainLogo;
  if (fit === "containLarge") return styles.imageFlowContainLarge;
  return styles.imageFlowCover;
}

function revealOffsetClass(offset: ImageBlockRevealOffset): string {
  if (offset === 0) return enterStyles.offset0;
  if (offset === 1) return enterStyles.offset1;
  if (offset === 2) return enterStyles.offset2;
  if (offset === 3) return enterStyles.offset3;
  return enterStyles.offset4;
}

function isSvgCell(cell: ImageBlockCell): boolean {
  if (cell.inlineSvgSrc) return true;
  const src = cell.src?.trim();
  if (!src) return false;
  return /\.svg(?:$|\?)/i.test(src);
}

function CellMedia({
  cell,
  sizesHint,
  inlineSvgMap,
  useFill = true,
  revealClassName,
}: {
  cell: ImageBlockCell;
  sizesHint: string;
  inlineSvgMap: Record<string, string>;
  useFill?: boolean;
  revealClassName?: string;
}) {
  if (cell.inlineSvgSrc) {
    const svgMarkup = inlineSvgMap[cell.inlineSvgSrc];
    if (!svgMarkup) return null;
    const label = (cell.alt ?? "").trim();
    return (
      <div
        className={[
          styles.inlineSvgRoot,
          useFill ? "" : styles.inlineSvgFlow,
          revealClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-inline-svg-src={cell.inlineSvgSrc}
        role={label.length > 0 ? "img" : undefined}
        aria-label={label.length > 0 ? label : undefined}
        aria-hidden={label.length === 0 ? true : undefined}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    );
  }

  if (cell.placeholderMode === "left-inset-no-right") {
    return (
      <div
        className={styles.cellPlaceholderLeftInsetNoRight}
        style={
          {
            ["--cell-placeholder-bg" as string]: cell.placeholderColor ?? "#ff0000",
          } as CSSProperties
        }
        aria-hidden
      />
    );
  }

  if (!cell.src) return null;

  if (!useFill) {
    return (
      <img
        src={cell.src}
        alt={cell.alt ?? ""}
        className={`${styles.imageFlow} ${imageFlowFitClass(cell.fit)} ${revealClassName ?? ""}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={cell.src}
      alt={cell.alt ?? ""}
      fill
      className={`${styles.image} ${imageFitClass(cell.fit)} ${revealClassName ?? ""}`}
      sizes={sizesHint}
    />
  );
}

function RowView({
  row,
  sizesHint,
  inlineSvgMap,
  scrollReveal,
  scrollRevealTarget,
  isRevealVisible,
  revealOffset,
}: {
  row: ImageBlockRow;
  sizesHint: string;
  inlineSvgMap: Record<string, string>;
  scrollReveal: ImageBlockScrollReveal;
  scrollRevealTarget: ImageBlockScrollRevealTarget;
  isRevealVisible: boolean;
  revealOffset: ImageBlockRevealOffset;
}) {
  const mode: ImageBlockCellMode = row.cellMode ?? "rowAspect";
  const ar = row.rowAspectRatio?.trim() || DEFAULT_ROW_AR;
  const n = rowCols(row);
  const rowBandAr = rowHeightPreset(row.rowHeight);
  const isContentHeight = row.rowHeight === "content";
  const isTallHeight = row.rowHeight === "tall";

  if (mode === "square") {
    return (
      <div
        className={`${styles.row} ${styles.rowSquare} ${isContentHeight ? styles.rowContent : ""} ${isTallHeight ? styles.rowTall : ""}`}
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
            style={{
              ["--cell-bg" as string]: cell.bgColor,
              ["--cell-bg-mobile" as string]: cell.mobileBgColor ?? cell.bgColor,
            }}
          >
            <div
              className={[
                styles.cellFrame,
                frameFitClass(cell.fit),
                isContentHeight ? styles.cellFrameContent : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {(() => {
                const shouldAnimateMedia =
                  scrollReveal !== "none" &&
                  scrollRevealTarget === "svg-only" &&
                  isSvgCell(cell);
                const mediaRevealClass = shouldAnimateMedia
                  ? isRevealVisible
                    ? `${enterStyles.fadeInUp} ${revealOffsetClass(revealOffset)}`
                    : enterStyles.revealPending
                  : "";
                return (
                  <CellMedia
                    cell={cell}
                    sizesHint={sizesHint}
                    inlineSvgMap={inlineSvgMap}
                    useFill={!isContentHeight}
                    revealClassName={mediaRevealClass}
                  />
                );
              })()}
              {cell.label?.trim() ? (
                <span className={styles.cellLabel}>{cell.label.trim()}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.row} ${styles.rowAspect} ${isContentHeight ? styles.rowContent : ""} ${isTallHeight ? styles.rowTall : ""}`}
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
          style={{
            ["--cell-bg" as string]: cell.bgColor,
            ["--cell-bg-mobile" as string]: cell.mobileBgColor ?? cell.bgColor,
          }}
        >
          <div
            className={[
              styles.cellFrame,
              frameFitClass(cell.fit),
              isContentHeight ? styles.cellFrameContent : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {(() => {
              const shouldAnimateMedia =
                scrollReveal !== "none" &&
                scrollRevealTarget === "svg-only" &&
                isSvgCell(cell);
              const mediaRevealClass = shouldAnimateMedia
                ? isRevealVisible
                  ? `${enterStyles.fadeInUp} ${revealOffsetClass(revealOffset)}`
                  : enterStyles.revealPending
                : "";
              return (
                <CellMedia
                  cell={cell}
                  sizesHint={sizesHint}
                  inlineSvgMap={inlineSvgMap}
                  useFill={!isContentHeight}
                  revealClassName={mediaRevealClass}
                />
              );
            })()}
            {cell.label?.trim() ? (
              <span className={styles.cellLabel}>{cell.label.trim()}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function flattenCells(rows: ImageBlockRow[]) {
  const out: {
    cell: ImageBlockRow["cells"][0];
    row: ImageBlockRow;
    rowBandAr?: string;
  }[] = [];
  for (const row of rows) {
    const rowBandAr = rowHeightPreset(row.rowHeight);
    for (const cell of row.cells) {
      out.push({ cell, row, rowBandAr });
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
  mobileContained = true,
  mobileLayout = "stacked",
  mobileStack = "default",
  scrollReveal = "none",
  scrollRevealTarget = "section",
  revealOffset = 2,
  descriptionRevealOffset,
  rows,
  className,
  descriptionClassName,
}: ImageBlockProps) {
  const {
    ref: selfRevealRef,
    isVisible: isSelfRevealVisible,
  } = useScrollRevealElement<HTMLElement>({
    enabled: scrollReveal === "self",
  });
  const [isSectionVisible, setIsSectionVisible] = useState(scrollReveal === "none");
  const [inlineSvgMap, setInlineSvgMap] = useState<Record<string, string>>({});
  const useOneThenTwoMobile = mobileStack === "one-then-two";
  const isRevealVisible = scrollReveal === "self" ? isSelfRevealVisible : isSectionVisible;
  const sectionClass = [
    styles.section,
    useOneThenTwoMobile ? styles.mobileStackOneThenTwo : "",
    scrollReveal !== "none" && scrollRevealTarget === "section" && !isRevealVisible
      ? enterStyles.revealPending
      : "",
    scrollReveal !== "none" && scrollRevealTarget === "section" && isRevealVisible
      ? enterStyles.fadeInUp
      : "",
    scrollReveal !== "none" && scrollRevealTarget === "section" && isRevealVisible
      ? revealOffsetClass(revealOffset)
      : "",
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
  const inlineSvgSources = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .flatMap((row) => row.cells)
            .map((cell) => cell.inlineSvgSrc)
            .filter((src): src is string => Boolean(src))
        )
      ),
    [rows]
  );

  useEffect(() => {
    if (scrollReveal !== "on-outcomes") {
      setIsSectionVisible(true);
      return;
    }
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsSectionVisible(true);
      return;
    }
    if (document.documentElement.dataset.outcomesRevealed === "true") {
      setIsSectionVisible(true);
      return;
    }

    const onReveal = () => setIsSectionVisible(true);
    window.addEventListener("folio:outcomes-reveal", onReveal);
    return () => window.removeEventListener("folio:outcomes-reveal", onReveal);
  }, [scrollReveal]);

  useEffect(() => {
    if (inlineSvgSources.length === 0) return;
    let cancelled = false;

    void Promise.all(
      inlineSvgSources.map(async (src) => {
        try {
          const response = await fetch(src);
          if (!response.ok) return [src, ""] as const;
          const text = await response.text();
          return [src, text] as const;
        } catch {
          return [src, ""] as const;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setInlineSvgMap((prev) => {
        const next = { ...prev };
        for (const [src, text] of entries) {
          if (text) next[src] = text;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [inlineSvgSources]);

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
  const shellClass = contained ? styles.imageGroupShell : styles.imageGroupBleed;
  const shellMobileClass = contained && !mobileContained ? styles.shellUncontainedOnMobile : "";

  return (
    <section
      ref={selfRevealRef}
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
              scrollReveal !== "none" &&
              typeof descriptionRevealOffset === "number" &&
              !isRevealVisible
                ? enterStyles.revealPending
                : "",
              scrollReveal !== "none" &&
              typeof descriptionRevealOffset === "number" &&
              isRevealVisible
                ? enterStyles.fadeInUp
                : "",
              scrollReveal !== "none" &&
              typeof descriptionRevealOffset === "number" &&
              isRevealVisible
                ? revealOffsetClass(descriptionRevealOffset)
                : "",
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

        <div className={imageGroupClasses}>
          <div className={[shellClass, shellMobileClass].filter(Boolean).join(" ")}>
            <div className={styles.rows}>
              {rows.map((row, ri) => (
                <RowView
                  key={`row-${ri}`}
                  row={row}
                  sizesHint={sizesRow}
                  inlineSvgMap={inlineSvgMap}
                  scrollReveal={scrollReveal}
                  scrollRevealTarget={scrollRevealTarget}
                  isRevealVisible={isRevealVisible}
                  revealOffset={revealOffset}
                />
              ))}
            </div>
            {useCarouselTrack ? (
              <div className={styles.carouselTrack}>
                {flattenCells(rows).map(({ cell, rowBandAr }, i) => (
                  <div
                    key={`slide-${cell.src ?? i}-${i}`}
                    className={styles.carouselSlide}
                  >
                    <div
                      className={styles.carouselSlideInner}
                      style={{
                        ["--carousel-bg" as string]: cell.bgColor,
                        ["--carousel-bg-mobile" as string]:
                          cell.mobileBgColor ?? cell.bgColor,
                        ...(rowBandAr ? { ["--carousel-ar" as string]: rowBandAr } : {}),
                      }}
                    >
                      <CellMedia
                        cell={cell}
                        sizesHint={sizesSlide}
                        inlineSvgMap={inlineSvgMap}
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
