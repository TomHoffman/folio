"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  defaultLogoGridItems,
  type LogoGridItem,
} from "@/data/logoGridItems";
import styles from "./LogoGrid.module.css";

const DESKTOP_MQ = "(min-width: 1024px)";
const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

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

function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_MQ).matches;
}

function getDesktopServerSnapshot() {
  return false;
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_MQ).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
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
};

export function LogoGrid({
  items = defaultLogoGridItems,
  className,
}: LogoGridProps) {
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const desktopItems = useMemo(
    () => items.slice(0, DESKTOP_LOGO_MAX),
    [items],
  );

  const sectionClass = [styles.logoSection, className].filter(Boolean).join(" ");

  useEffect(() => {
    if (items.length < DESKTOP_LOGO_MAX) {
      console.warn(
        `[LogoGrid] Desktop grid expects at least ${DESKTOP_LOGO_MAX} logos; got ${items.length}.`,
      );
    }
  }, [items.length]);

  return (
    <section className={sectionClass} aria-labelledby="logo-grid-title">
      <h2 id="logo-grid-title" className="sr-only">
        Selected client logos
      </h2>
      {isDesktop ? (
        <DesktopGrid items={desktopItems} />
      ) : (
        <MobileTicker items={items} reducedMotion={reducedMotion} />
      )}
    </section>
  );
}
