"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultLogoGridItems,
  type LogoGridItem,
} from "@/data/logoGridItems";
import {
  type SectionHeadingIndicatorColor,
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import enterStyles from "./ProjectPageEnter.module.css";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./LogoGrid.module.css";
import {
  scrollRevealTriggerEarlier,
  useScrollRevealElement,
} from "./useScrollReveal";

const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

/** WebKit: `addListener` when `addEventListener` missing on MediaQueryList. */
function mqSubscribe(mq: MediaQueryList, cb: () => void): () => void {
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }
  mq.addListener(cb);
  return () => mq.removeListener(cb);
}

/** Desktop shows at most this many logos (6×3). */
const DESKTOP_LOGO_MAX = 18;

/** Mobile tickertape: first four 2×2 groups only (16 logos). */
const MOBILE_TICKER_LOGO_MAX = 16;

function chunkIntoGroupsOfFour(items: LogoGridItem[]): LogoGridItem[][] {
  const groups: LogoGridItem[][] = [];
  for (let i = 0; i < items.length; i += 4) {
    const slice = items.slice(i, i + 4);
    if (slice.length === 4) {
      groups.push(slice);
    }
  }
  return groups;
}

function LogoMark({
  item,
  className,
}: {
  item: LogoGridItem;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- client SVG marks
    <img
      className={className ?? styles.logoImg}
      src={item.src}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

/** One tickertape unit: desktop-style panel wrapping a 2×2 grid. */
function TickerCluster({ group }: { group: LogoGridItem[] }) {
  return (
    <div className={styles.tickerGroupPanel}>
      <div className={styles.tickerClusterGrid}>
        {group.map((item) => (
          <div key={item.id} className={styles.tickerGroupCell}>
            <div className={styles.tickerGroupCellInner} aria-label={item.name}>
              <LogoMark item={item} className={styles.logoImgTicker} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopGrid({ items }: { items: LogoGridItem[] }) {
  return (
    <div className={styles.gridDesktop}>
      {items.map((item) => (
        <div key={item.id} className={`${styles.cell} ${styles.cellDesktop}`}>
          <div className={styles.cellInner} aria-label={item.name}>
            <LogoMark item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileTicker({
  items,
  reducedMotion,
}: {
  items: LogoGridItem[];
  reducedMotion: boolean;
}) {
  const groups = useMemo(
    () => chunkIntoGroupsOfFour(items.slice(0, MOBILE_TICKER_LOGO_MAX)),
    [items],
  );

  const loop = useMemo(
    () => (groups.length > 0 ? [...groups, ...groups] : []),
    [groups],
  );

  if (groups.length === 0) {
    return null;
  }

  if (reducedMotion) {
    return (
      <div className={styles.tickerStatic}>
        {groups.map((group, gi) => (
          <TickerCluster key={`static-${gi}`} group={group} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.tickerViewport} aria-hidden={true}>
      <div className={styles.tickerTrack}>
        {loop.map((group, i) => (
          <TickerCluster
            key={`${group.map((g) => g.id).join("-")}-${i}`}
            group={group}
          />
        ))}
      </div>
    </div>
  );
}

export type LogoGridProps = {
  items?: LogoGridItem[];
  className?: string;
  /** Shown above the grid; not part of the mobile tickertape. Hidden when empty or `showTitle` is `false`. */
  title?: string;
  /** Set `false` to hide the visible title while keeping `title` for future use. Default `true`. */
  showTitle?: boolean;
  /** Dot before the title; token from `globals.css` (`orange`, `yellow`, …). Default `orange`. */
  indicatorColor?: SectionHeadingIndicatorColor;
};

export function LogoGrid({
  items: itemsProp,
  className,
  title,
  showTitle = true,
  indicatorColor = "orange",
}: LogoGridProps) {
  const items = itemsProp ?? defaultLogoGridItems;

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_MQ);
    setReducedMotion(mq.matches);
    return mqSubscribe(mq, () => setReducedMotion(mq.matches));
  }, []);

  const desktopItems = useMemo(
    () => items.slice(0, DESKTOP_LOGO_MAX),
    [items],
  );

  const sectionClass = [styles.logoSection, className].filter(Boolean).join(" ");
  const visibleTitle =
    showTitle && Boolean(title?.trim());

  const { ref: revealRef, isVisible: isLogoGridRevealed } =
    useScrollRevealElement<HTMLElement>({
      enabled: true,
      ...scrollRevealTriggerEarlier,
    });

  useEffect(() => {
    if (items.length < DESKTOP_LOGO_MAX) {
      console.warn(
        `[LogoGrid] Desktop grid expects at least ${DESKTOP_LOGO_MAX} logos; got ${items.length}.`,
      );
    }
  }, [items.length]);

  const titleEnterClass = [
    styles.revealSegment,
    !isLogoGridRevealed ? enterStyles.revealPending : "",
    isLogoGridRevealed ? enterStyles.fadeInUp : "",
    isLogoGridRevealed ? enterStyles.offset0 : "",
  ]
    .filter(Boolean)
    .join(" ");

  const gridEnterClass = [
    styles.revealSegment,
    !isLogoGridRevealed ? enterStyles.revealPending : "",
    isLogoGridRevealed ? enterStyles.fadeInUp : "",
    isLogoGridRevealed ? enterStyles.offset2 : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={revealRef}
      className={sectionClass}
      aria-labelledby="logo-grid-title"
    >
      <div className={titleEnterClass}>
        {visibleTitle ? (
          <div className={sectionHeadingStyles.headingGutter}>
            <h2
              id="logo-grid-title"
              className={sectionHeadingStyles.heading}
              style={sectionHeadingIndicatorStyle(indicatorColor)}
            >
              {title?.trim()}
            </h2>
          </div>
        ) : (
          <h2 id="logo-grid-title" className="sr-only">
            Client logos
          </h2>
        )}
      </div>
      {/*
       * Tickertape vs static grid is CSS-only (`.staticGridRoot` / `.tickerRoot`).
       * Breakpoint 1024px: iPad portrait & phones get ticker; iPad landscape+ get static grid.
       */}
      <div className={gridEnterClass}>
        <div className={styles.staticGridRoot}>
          <div className={styles.gridWrap}>
            <DesktopGrid items={desktopItems} />
          </div>
        </div>
        <div className={styles.tickerRoot}>
          <MobileTicker items={items} reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
}
