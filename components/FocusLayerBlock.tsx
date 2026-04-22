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
  className,
}: FocusLayerBlockProps) {
  const safeItems = useMemo(() => items.slice(0, 4), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [illustrationSvg, setIllustrationSvg] = useState<string | null>(null);
  const [illustrationEndSvg, setIllustrationEndSvg] = useState<string | null>(
    null,
  );
  const isDemoSquare = visualVariant === "demo-square";

  useEffect(() => {
    if (isDemoSquare) return;
    let cancelled = false;
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
  }, [isDemoSquare]);

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
            <div className={styles.imageContainer}>
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
              ) : (
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
                      {/* Layer 0: base only */}
                      <div
                        className={`${styles.illustrationLayer} ${styles.illustrationLayer0}`}
                        dangerouslySetInnerHTML={{ __html: illustrationSvg }}
                      />
                      {/* Layer 1: base + phone/location overlay */}
                      <div
                        className={`${styles.illustrationLayer} ${styles.illustrationLayer1}`}
                        dangerouslySetInnerHTML={{ __html: illustrationSvg }}
                      />
                      {/* Layer 2: full UI */}
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
                        <p className={styles.textTitle}>
                          {i + 1}. {item.title}
                        </p>
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
