"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import railStyles from "./projectContentRail.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./FocusLayerBlock.module.css";
import type { FocusLayerBlockProps } from "./focusLayerBlockTypes";

const FINANCE_ILLUSTRATION_SRC = "/images/licel/finance-illustration.svg";
const FINANCE_ILLUSTRATION_END_SRC = "/images/licel/finance-illustration-end.svg";
const ACCORDION_CONTROLLER_SRC = "/svg/icons/accordion-controller.svg";

const DEMO_SQUARE_COLORS = ["#e11d48", "#22c55e", "#3b82f6"] as const;

type ChartSvgMode = "wireframe" | "ui";

function layerOpacity(activeIndex: number, layer: 0 | 1 | 2): number {
  if (activeIndex <= 0) return layer === 0 ? 1 : 0;
  if (activeIndex === 1) return layer === 1 ? 1 : 0;
  return layer === 2 ? 1 : 0;
}

export function FocusLayerBlock({
  title,
  description,
  headingId,
  indicatorColor = "powderBlue",
  items,
  visualVariant = "illustration",
  inlineSvgSrc,
  inlineSvgUiSrc,
  className,
}: FocusLayerBlockProps) {
  const safeItems = useMemo(() => items.slice(0, 4), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [illustrationSvg, setIllustrationSvg] = useState<string | null>(null);
  const [illustrationEndSvg, setIllustrationEndSvg] = useState<string | null>(
    null,
  );
  const [inlineWireMarkup, setInlineWireMarkup] = useState<string | null>(null);
  const [inlineUiMarkup, setInlineUiMarkup] = useState<string | null>(null);
  const [chartSvgMode, setChartSvgMode] = useState<ChartSvgMode>("wireframe");
  const isDemoSquare = visualVariant === "demo-square";
  const isEmptyVisual = visualVariant === "empty";
  const wireSrc = inlineSvgSrc?.trim() ?? "";
  const uiSrc = inlineSvgUiSrc?.trim() ?? "";
  const hasChartViewToggle = Boolean(wireSrc && uiSrc);

  useEffect(() => {
    if (!uiSrc) {
      setChartSvgMode("wireframe");
    }
  }, [uiSrc]);

  useEffect(() => {
    if (isDemoSquare) return;
    let cancelled = false;

    const load = (url: string, setMarkup: (s: string | null) => void) => {
      void fetch(url)
        .then((res) => res.text())
        .then((text) => {
          if (cancelled) return;
          setMarkup(text || null);
        })
        .catch(() => {
          if (cancelled) return;
          setMarkup(null);
        });
    };

    if (wireSrc) load(wireSrc, setInlineWireMarkup);
    else setInlineWireMarkup(null);

    if (uiSrc) load(uiSrc, setInlineUiMarkup);
    else setInlineUiMarkup(null);

    if (wireSrc || uiSrc) {
      return () => {
        cancelled = true;
      };
    }

    setInlineWireMarkup(null);
    setInlineUiMarkup(null);
    if (isEmptyVisual) return;

    void Promise.all([
      fetch(FINANCE_ILLUSTRATION_SRC)
        .then((res) => res.text())
        .catch(() => ""),
      fetch(FINANCE_ILLUSTRATION_END_SRC)
        .then((res) => res.text())
        .catch(() => ""),
    ]).then(([baseText, endText]) => {
      if (cancelled) return;
      setIllustrationSvg(baseText || null);
      setIllustrationEndSvg(endText || null);
    });
    return () => {
      cancelled = true;
    };
  }, [isDemoSquare, isEmptyVisual, wireSrc, uiSrc]);

  useEffect(() => {
    if (activeIndex > safeItems.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, safeItems.length]);

  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  const headingText = title?.trim() ?? "";
  const descriptionText = description?.trim() ?? "";
  const hasHeading = headingText.length > 0;
  const hasDescription = descriptionText.length > 0;
  const hasDescriptionBlock = hasHeading || hasDescription;
  const onAccordionTriggerClick = (index: number) => {
    if (safeItems.length <= 1) return;
    if (index === activeIndex) {
      setActiveIndex((index + 1) % safeItems.length);
      return;
    }
    setActiveIndex(index);
  };
  const illustrationVars = {
    ["--focus-layer-0-opacity" as string]: String(layerOpacity(activeIndex, 0)),
    ["--focus-layer-1-opacity" as string]: String(layerOpacity(activeIndex, 1)),
    ["--focus-layer-2-opacity" as string]: String(layerOpacity(activeIndex, 2)),
  } as CSSProperties;

  const chartToggleGroupId = headingId
    ? `${headingId}-chart-view`
    : "focus-layer-chart-view";

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

        <div className={styles.shell}>
          <div className={styles.content}>
            <div
              className={[
                styles.imageContainer,
                hasChartViewToggle ? styles.imageContainerWithChartToggle : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={isEmptyVisual && !wireSrc ? true : undefined}
            >
              {isDemoSquare ? (
                <div className={styles.demoSquareMount}>
                  <div
                    className={styles.demoSquare}
                    style={{
                      backgroundColor:
                        DEMO_SQUARE_COLORS[
                          activeIndex % DEMO_SQUARE_COLORS.length
                        ],
                    }}
                    role="img"
                    aria-label={safeItems[activeIndex]?.title ?? "Demo"}
                  />
                </div>
              ) : wireSrc ? (
                <>
                  <div className={styles.imageContainerGraphic}>
                    <div
                      className={`${styles.svgFrame} ${styles.svgFrameChart}`}
                    >
                      {hasChartViewToggle &&
                      inlineWireMarkup &&
                      inlineUiMarkup ? (
                        <div
                          className={styles.wipeStack}
                          data-mode={chartSvgMode}
                          role="img"
                          aria-label={
                            safeItems[activeIndex]?.title ?? "Chart diagram"
                          }
                        >
                          <div
                            className={`${styles.inlineWireRoot} ${styles.wipeLayerBase}`}
                            aria-hidden={chartSvgMode === "ui"}
                            data-focus-active-index={activeIndex}
                            dangerouslySetInnerHTML={{
                              __html: inlineWireMarkup,
                            }}
                          />
                          <div
                            className={`${styles.inlineWireRoot} ${styles.wipeLayerUi} ${chartSvgMode === "ui" ? styles.wipeLayerUiVisible : ""}`}
                            aria-hidden={chartSvgMode === "wireframe"}
                            data-focus-active-index={activeIndex}
                            dangerouslySetInnerHTML={{
                              __html: inlineUiMarkup,
                            }}
                          />
                        </div>
                      ) : inlineWireMarkup ? (
                        <div
                          className={styles.inlineWireRoot}
                          role="img"
                          aria-label={
                            safeItems[activeIndex]?.title ?? "Diagram"
                          }
                          data-focus-active-index={activeIndex}
                          dangerouslySetInnerHTML={{
                            __html: inlineWireMarkup,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                  {hasChartViewToggle ? (
                    <div className={styles.viewToggleWrap}>
                      <div
                        className={styles.viewToggleTrack}
                        data-mode={chartSvgMode}
                        id={chartToggleGroupId}
                        role="group"
                        aria-label="Chart display"
                      >
                        <span className={styles.viewTogglePill} aria-hidden />
                        <button
                          type="button"
                          className={styles.viewToggleBtn}
                          aria-pressed={chartSvgMode === "wireframe"}
                          onClick={() => setChartSvgMode("wireframe")}
                        >
                          Wireframe
                        </button>
                        <button
                          type="button"
                          className={styles.viewToggleBtn}
                          aria-pressed={chartSvgMode === "ui"}
                          onClick={() => setChartSvgMode("ui")}
                        >
                          UI Design
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : isEmptyVisual ? null : (
                <div className={styles.svgFrame}>
                  {illustrationSvg ? (
                    <div
                      className={styles.illustrationRoot}
                      style={illustrationVars}
                      role="img"
                      aria-label={
                        safeItems[activeIndex]?.title ?? "Layered illustration"
                      }
                    >
                      <div
                        className={`${styles.illustrationLayer} ${styles.illustrationLayer0}`}
                        dangerouslySetInnerHTML={{ __html: illustrationSvg }}
                      />
                      <div
                        className={`${styles.illustrationLayer} ${styles.illustrationLayer1}`}
                        dangerouslySetInnerHTML={{ __html: illustrationSvg }}
                      />
                      <div
                        className={`${styles.illustrationLayer} ${styles.illustrationLayer2}`}
                        dangerouslySetInnerHTML={{
                          __html: illustrationEndSvg ?? illustrationSvg,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className={styles.textList}>
              {safeItems.map((item, i) => {
                const isActive = i === activeIndex;
                const panelId = `${headingId ?? "focus-layer"}-panel-${i}`;
                return (
                  <div
                    key={`${item.title}-${i}`}
                    className={`${styles.textButton} ${isActive ? styles.textButtonActive : ""}`}
                  >
                    <button
                      type="button"
                      className={styles.accordionTrigger}
                      onClick={() => onAccordionTriggerClick(i)}
                      aria-expanded={isActive}
                      aria-controls={panelId}
                    >
                      <div className={styles.textMain}>
                        <p className={styles.textTitle}>{item.title}</p>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG icon */}
                      <img
                        className={`${styles.accordionIcon} ${isActive ? styles.accordionIconOpen : ""}`}
                        src={ACCORDION_CONTROLLER_SRC}
                        alt=""
                        aria-hidden
                      />
                    </button>
                    <div
                      id={panelId}
                      className={`${styles.textPanel} ${isActive ? styles.textPanelOpen : ""}`}
                    >
                      <p className={styles.textBody}>{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
