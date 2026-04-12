"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import styles from "./HeaderMasthead.module.css";

function MastheadSvg({
  className,
  pathFill,
  svgStyle,
}: {
  className?: string;
  pathFill: string;
  /** e.g. opacity on the whole graphic (inner pages) */
  svgStyle?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={svgStyle}
      viewBox="2 0 1790 182"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden={true}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M1654.1 179.966V2.0332H1679.75L1769.4 143.617V2.0332H1792V179.966H1766.35L1676.7 38.8908V179.966H1654.1Z"
        fill={pathFill}
      />
      <path
        d="M1552.69 32.536L1520.94 114.131H1584.18L1552.69 32.536ZM1471.67 179.966L1542.02 2.0332H1563.1L1633.7 179.966H1609.58L1592.05 134.72H1513.07L1495.54 179.966H1471.67Z"
        fill={pathFill}
      />
      <path
        d="M1275.37 179.966V2.0332H1303.31L1363.24 146.413L1423.18 2.0332H1451.12V179.966H1428.26V45.7539L1372.89 179.966H1353.59L1297.97 45.7539V179.966H1275.37Z"
        fill={pathFill}
      />
      <path
        d="M1133.03 179.966V2.0332H1246.8V22.6226H1156.14V77.0192H1230.3V97.8628H1156.14V179.966H1133.03Z"
        fill={pathFill}
      />
      <path
        d="M990.664 179.966V2.0332H1104.44V22.6226H1013.77V77.0192H1087.93V97.8628H1013.77V179.966H990.664Z"
        fill={pathFill}
      />
      <path
        d="M874.216 182C823.423 182 786.598 143.872 786.598 91C786.598 38.1285 823.423 0 874.216 0C924.755 0 961.58 38.1285 961.58 91C961.58 143.872 924.755 182 874.216 182ZM810.216 91C810.216 131.67 837.137 161.156 873.962 161.156C911.295 161.156 937.962 131.67 937.962 91C937.962 50.3296 911.295 20.5894 873.962 20.5894C837.137 20.5894 810.216 50.3296 810.216 91Z"
        fill={pathFill}
      />
      <path
        d="M734.43 2.0332H757.54V179.966H734.43V96.5919H642.24V179.966H619.129V2.0332H642.24V75.7483H734.43V2.0332Z"
        fill={pathFill}
      />
      <path
        d="M345.328 179.966V2.0332H373.264L433.2 146.413L493.136 2.0332H521.073V179.966H498.216V45.7539L442.851 179.966H423.55L367.931 45.7539V179.966H345.328Z"
        fill={pathFill}
      />
      <path
        d="M228.892 182C178.099 182 141.273 143.872 141.273 91C141.273 38.1285 178.099 0 228.892 0C279.431 0 316.256 38.1285 316.256 91C316.256 143.872 279.431 182 228.892 182ZM164.892 91C164.892 131.67 191.813 161.156 228.638 161.156C265.971 161.156 292.637 131.67 292.637 91C292.637 50.3296 265.971 20.5894 228.638 20.5894C191.813 20.5894 164.892 50.3296 164.892 91Z"
        fill={pathFill}
      />
      <path
        d="M58.6345 179.966V22.6226H2V2.0332H138.126V22.6226H81.7454V179.966H58.6345Z"
        fill={pathFill}
      />
    </svg>
  );
}

/** Same easing as project page enter (ProjectPageEnter.module.css). */
const MASTHEAD_EASE = "cubic-bezier(0.22, 1, 0.32, 1)";
const MASTHEAD_MS = 880;

const narrowMastheadQuery = "(max-width: 1023px)";

function subscribeNarrowMasthead(onChange: () => void) {
  const mq = window.matchMedia(narrowMastheadQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getNarrowMastheadSnapshot() {
  return window.matchMedia(narrowMastheadQuery).matches;
}

function getNarrowMastheadServerSnapshot() {
  return false;
}

export function HeaderMasthead() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const prevPathRef = useRef(pathname);

  const enteringHomeFromInner =
    // eslint-disable-next-line react-hooks/refs -- intentional previous-pathname read for transition gating
    prevPathRef.current !== "/" && pathname === "/";

  useEffect(() => {
    prevPathRef.current = pathname;
  }, [pathname]);

  const isNarrowMasthead = useSyncExternalStore(
    subscribeNarrowMasthead,
    getNarrowMastheadSnapshot,
    getNarrowMastheadServerSnapshot,
  );

  /*
   * Home vs inner use different DOM (full mastheadRatio vs clipped in-flow wordmark), so
   * padding-bottom never interpolates on the same node. margin-top delta is also small below desktop
   * (0→26px) vs desktop (0→76px). Below 1024px width: skip tween.
   */
  const transitionMs =
    enteringHomeFromInner && !isNarrowMasthead ? MASTHEAD_MS : 0;
  const transitionEase = enteringHomeFromInner ? MASTHEAD_EASE : "linear";

  /* Home: padding-bottom % + absolute layer (unchanged). Inner: in-flow only — .wordmarkClipInner aspect-ratio sets height; avoids a tall empty band above the project title. */
  const mastheadBoxStyle = {
    paddingBottom: `${(182 / 1790) * 100}%`,
    transition: `padding-bottom ${transitionMs}ms ${transitionEase}`,
  };

  const wordmarkHome = (
    <MastheadSvg
      className={styles.wordmarkSvg}
      pathFill="var(--color-masthead)"
    />
  );

  const wordmarkInner = (
    <MastheadSvg
      className={styles.wordmarkSvg}
      pathFill="var(--color-masthead-dim)"
      svgStyle={{ opacity: 0.1 }}
    />
  );

  const mastheadMarkup = isHome ? (
    <div className={`${styles.masthead} ${styles.mastheadHomeDesktopOnly}`}>
      <div className={styles.mastheadRatio} style={mastheadBoxStyle}>
        <div className={`${styles.mastheadLayer} ${styles.mastheadLayerHome}`}>
          <div className={styles.mastheadInner}>
            <div className={styles.mastheadRowOuter}>
              <div className={styles.mastheadRow}>
                <div className={styles.wordmarkWrap}>{wordmarkHome}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.masthead}>
      <div className={styles.mastheadInnerRoute}>
        <div className={styles.mastheadRowOuter}>
          <div className={styles.mastheadRow}>
            <Link
              href="/"
              aria-label="Tom Hoffman, home"
              className={`${styles.wordmarkLink} ${styles.wordmarkLinkInner}`}
            >
              <span className={styles.wordmarkClipInner}>{wordmarkInner}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <header
      className={[styles.header, isHome ? styles.headerHome : ""]
        .filter(Boolean)
        .join(" ")}
      style={{
        transitionProperty: "margin-top",
        transitionDuration: `${transitionMs}ms`,
        transitionTimingFunction: transitionEase,
      }}
    >
      <div className={styles.inner}>
        {isHome ? <span className="sr-only">Tom Hoffman</span> : null}
        {mastheadMarkup}
      </div>
    </header>
  );
}
