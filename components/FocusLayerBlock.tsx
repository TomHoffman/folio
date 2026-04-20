"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import railStyles from "./projectContentRail.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./FocusLayerBlock.module.css";
import type { FocusLayerBlockProps } from "./focusLayerBlockTypes";

function indicatorFillWidth(index: number, active: number, progress: number): string {
  if (index < active) return "100%";
  if (index > active) return "0%";
  return `${Math.max(0, Math.min(progress, 1)) * 100}%`;
}

const layerColors = ["#ff6363", "#7eb5ff", "#5fd6c2"];

export function FocusLayerBlock({
  title,
  description,
  headingId,
  indicatorColor = "powderBlue",
  items,
  autoRotateMs = 5000,
  className,
}: FocusLayerBlockProps) {
  const safeItems = useMemo(() => items.slice(0, 3), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const textListRef = useRef<HTMLDivElement>(null);
  const textButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (safeItems.length <= 1) return;
    let start = performance.now();
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const ratio = Math.min(elapsed / autoRotateMs, 1);
      setProgress(ratio);
      if (ratio >= 1) {
        start = performance.now();
        setProgress(0);
        onSelect((activeIndex + 1) % safeItems.length, true);
      }
    }, 50);
    return () => {
      window.clearInterval(interval);
    };
  }, [activeIndex, autoRotateMs, safeItems.length]);

  useEffect(() => {
    return () => {
      if (programmaticScrollTimerRef.current !== null) {
        window.clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex > safeItems.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, safeItems.length]);

  const onSelect = (index: number, shouldScroll = true) => {
    setActiveIndex(index);
    setProgress(0);
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    if (!shouldScroll) return;
    const container = textListRef.current;
    const target = textButtonRefs.current[index];
    if (!container || !target) return;
    isProgrammaticScrollRef.current = true;
    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    if (programmaticScrollTimerRef.current !== null) {
      window.clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      programmaticScrollTimerRef.current = null;
    }, 450);
  };

  const onTextListScroll = () => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    if (isProgrammaticScrollRef.current) return;
    const container = textListRef.current;
    if (!container) return;
    const centerX = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < textButtonRefs.current.length; i++) {
      const button = textButtonRefs.current[i];
      if (!button) continue;
      const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
      const distance = Math.abs(buttonCenter - centerX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
      setProgress(0);
    }
  };

  const sectionClass = [styles.section, className].filter(Boolean).join(" ");
  const headingText = title?.trim() ?? "";
  const descriptionText = description?.trim() ?? "";
  const hasHeading = headingText.length > 0;
  const hasDescription = descriptionText.length > 0;
  const hasDescriptionBlock = hasHeading || hasDescription;

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
              <div className={styles.svgFrame}>
                <svg
                  className={styles.layerSvg}
                  viewBox="0 0 1178 804"
                  role="img"
                  aria-label={safeItems[activeIndex]?.title ?? "Focus layer preview"}
                >
                  <rect
                    x="506"
                    y="319"
                    width="166"
                    height="166"
                    fill={layerColors[activeIndex % layerColors.length]}
                  />
                </svg>
              </div>
              <div className={styles.indicator} aria-hidden>
                {safeItems.map((_, i) => (
                  <div key={`indicator-${i}`} className={styles.indicatorTrack}>
                    <div
                      className={styles.indicatorFill}
                      style={{ width: indicatorFillWidth(i, activeIndex, progress) }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={textListRef}
              className={styles.textList}
              onScroll={onTextListScroll}
            >
              {safeItems.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={`${item.title}-${i}`}
                    type="button"
                    ref={(el) => {
                      textButtonRefs.current[i] = el;
                    }}
                    className={`${styles.textButton} ${isActive ? styles.textButtonActive : ""}`}
                    onClick={() => onSelect(i)}
                    aria-pressed={isActive}
                  >
                    <div className={styles.textMain}>
                      <p className={styles.textTitle}>
                        {i + 1}. {item.title}
                      </p>
                      <p className={styles.textBody}>{item.body}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
