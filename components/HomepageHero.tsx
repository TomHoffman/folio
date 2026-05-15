"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent as ReactAnimationEvent,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { Cluster4PanelMedia } from "@/components/Cluster4PanelMedia";
import { AvailabilityContact } from "@/components/AvailabilityContact";
import {
  HomeHeroPanelNavLinks,
  HomeHeroPanelThemeBar,
} from "@/components/HomeHeroPanelNav";
import enterStyles from "@/components/ProjectPageEnter.module.css";
import projectGridStyles from "@/components/ProjectGrid.module.css";
import {
  getDesktopBentoCardIdForSlot,
  getHomeHeroGridAccentDotColor,
  getHomeHeroGridCardById,
  HOME_HERO_GRID_CARD_IDS,
} from "@/data/homeHeroGridCards";
import type { HomeHeroGridCard } from "@/data/homeHeroGridCards";
import styles from "./HomepageHero.module.css";

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getMinuteProgressPercent() {
  return (new Date().getSeconds() / 60) * 100;
}

const MOBILE_GRID_COLS = 6;
const MOBILE_GRID_ROWS = 6;
const MOBILE_GRID_CELLS = MOBILE_GRID_COLS * MOBILE_GRID_ROWS;

/**
 * Figma `5189:215821` — one band = 11 col-units × 7 tiles (more desktop-wide than prior 10-col band).
 * Horizontally doubled → 22 tracks; block duplicated vertically → 12 rows (see DESKTOP_BENTO_ROW_SPANS).
 */
const DESKTOP_BENTO_BASE_ROW_SPANS = [
  [1, 2, 2, 1, 2, 2, 1],
  [1, 1, 2, 2, 1, 2, 2],
  [1, 2, 2, 2, 1, 2, 1],
  [1, 1, 2, 2, 1, 2, 2],
  [1, 2, 2, 1, 2, 2, 1],
  [1, 1, 2, 2, 1, 2, 2],
] as const;

/** 2× each row horizontally + 2× the block vertically: 12 rows × 22 col track. */
const DESKTOP_BENTO_ROW_SPANS: ReadonlyArray<ReadonlyArray<1 | 2>> = [
  ...DESKTOP_BENTO_BASE_ROW_SPANS.map((r) => [...r, ...r] as (1 | 2)[]),
  ...DESKTOP_BENTO_BASE_ROW_SPANS.map((r) => [...r, ...r] as (1 | 2)[]),
];

const DESKTOP_BENTO_INITIAL_ACTIVE = { row: 3, card: 2 } as const;

/** Extra pan at full desktop only (≥1440px) — stacks offset + nudge; negative = further left. */
const DESKTOP_BENTO_PAN_OFFSET_X = -40;
const DESKTOP_BENTO_PAN_NUDGE_X = -100;
/** Wide 2-column tiles start here (matches layout breakpoint intent). */
const DESKTOP_WIDE_LAYOUT_MQ = "(min-width: 1280px)";
/** Extra left pan only here — above typical tablet landscape (e.g. iPad Pro ~1366 CSS px). */
const DESKTOP_BENTO_PAN_NUDGE_MQ = "(min-width: 1440px)";

/** Desktop active-panel prev/next arrows — disabled for now. */
const DESKTOP_PANEL_NAV_ENABLED = false;

function shouldEnableDesktopGridCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  return window.matchMedia("(pointer: fine)").matches;
}

const DESKTOP_GRID_CURSOR_OFFSET_X = 6;
const DESKTOP_GRID_CURSOR_OFFSET_Y = 6;
const CLUSTER2_DESKTOP_CURSOR_OFFSET_X = 3;
const CLUSTER2_DESKTOP_CURSOR_OFFSET_Y = 3;
/** Desktop bento cursor — white fill alpha (Project grid uses 0.9). */
const DESKTOP_GRID_CURSOR_BG_ALPHA = 0.7;

/**
 * Row1 `.enterMedia` full window (`ProjectPageEnter.module.css`: --enter-delay + --enter-duration).
 * Pulse / hints wait until this moment.
 */
const HOME_HERO_ROW1_ENTER_END_MS = 400 + 950;

/**
 * First hero-grid pan starts after this delay (row1 enter is still in progress at 200ms).
 */
const HOME_HERO_CLUSTER4_PAN_UNLOCK_MS = 200;

/** First pan transform duration — keep in sync with `--hero-cluster4-pan-boot-ms` on the hero. */
const HOME_HERO_CLUSTER4_PAN_BOOT_MS = 800;

/** Clear PanBoot class after the boot transition can finish. */
const HOME_HERO_CLUSTER4_PAN_BOOT_CLEAR_MS = HOME_HERO_CLUSTER4_PAN_BOOT_MS + 150;

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type DesktopBentoSlot = { row: number; card: number };

function allDesktopBentoSlots(
  rowSpansGrid: ReadonlyArray<ReadonlyArray<1 | 2>>,
): DesktopBentoSlot[] {
  return rowSpansGrid.flatMap((spans, row) =>
    spans.map((_, card) => ({ row, card })),
  );
}

function desktopBentoSlotsEqual(a: DesktopBentoSlot, b: DesktopBentoSlot): boolean {
  return a.row === b.row && a.card === b.card;
}

function pickRandomDesktopBentoSlot(
  current: DesktopBentoSlot,
  rowSpansGrid: ReadonlyArray<ReadonlyArray<1 | 2>>,
): DesktopBentoSlot {
  const slots = allDesktopBentoSlots(rowSpansGrid);
  const otherSlots = slots.filter((slot) => !desktopBentoSlotsEqual(slot, current));
  const pool = otherSlots.length > 0 ? otherSlots : slots;
  return pool[Math.floor(Math.random() * pool.length)] ?? current;
}

/**
 * Pick an initial active card away from outer edges so first-load panning can center it.
 * Falls back to wide slots anywhere, then any slot, if the center window is empty.
 */
function pickInitialDesktopBentoSlot(
  rowSpansGrid: ReadonlyArray<ReadonlyArray<1 | 2>>,
): DesktopBentoSlot | null {
  if (rowSpansGrid.length === 0) return null;
  const totalRows = rowSpansGrid.length;
  const totalCards = rowSpansGrid[0]?.length ?? 0;
  if (totalCards === 0) return null;

  const rowInset = Math.max(1, Math.floor(totalRows * 0.2));
  const cardInset = Math.max(1, Math.floor(totalCards * 0.2));

  const wideSlots: DesktopBentoSlot[] = [];
  const centerWideSlots: DesktopBentoSlot[] = [];
  const allSlots: DesktopBentoSlot[] = [];

  rowSpansGrid.forEach((rowSpans, row) => {
    rowSpans.forEach((span, card) => {
      const slot = { row, card };
      allSlots.push(slot);
      if (span !== 2) return;
      wideSlots.push(slot);
      const isInCenterBand =
        row >= rowInset &&
        row < totalRows - rowInset &&
        card >= cardInset &&
        card < totalCards - cardInset;
      if (isInCenterBand) centerWideSlots.push(slot);
    });
  });

  const from = centerWideSlots.length
    ? centerWideSlots
    : wideSlots.length
      ? wideSlots
      : allSlots;
  if (from.length === 0) return null;
  return from[Math.floor(Math.random() * from.length)] ?? null;
}

/** Pan so inner top-left is (tx,ty); keep grid flush with viewport (no background gutters). */
function clampDesktopBentoPan(
  idealTx: number,
  idealTy: number,
  innerW: number,
  innerH: number,
  vw: number,
  vh: number,
): { x: number; y: number } {
  const clampAxis = (ideal: number, W: number, V: number) => {
    const minT = Math.min(0, V - W);
    const maxT = Math.max(0, V - W);
    if (minT <= maxT) {
      return Math.min(maxT, Math.max(minT, ideal));
    }
    return (V - W) / 2;
  };
  return {
    x: clampAxis(idealTx, innerW, vw),
    y: clampAxis(idealTy, innerH, vh),
  };
}

function activePanelCenterInInner(panel: HTMLElement, inner: HTMLElement) {
  let x = 0;
  let y = 0;
  let el: HTMLElement | null = panel;
  while (el && el !== inner) {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  if (el !== inner) {
    return { x: inner.clientWidth / 2, y: inner.clientHeight / 2 };
  }
  return {
    x: x + panel.offsetWidth / 2,
    y: y + panel.offsetHeight / 2,
  };
}

function mobileNeighborDirectionRotation(
  from: { row: number; col: number },
  to: { row: number; col: number },
): number | null {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (dr === 0 && dc === 0) return null;
  const angle = (Math.atan2(dr, dc) * 180) / Math.PI;
  return angle;
}

function mobileNeighborHintPlacement(
  from: { row: number; col: number },
  to: { row: number; col: number },
): { left: string; top: string; rotation: number } | null {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  const rotation = mobileNeighborDirectionRotation(from, to);
  if (rotation == null) return null;

  // Place hint on the edge/corner closest to the active card.
  const left = dc === 1 ? "8%" : dc === -1 ? "92%" : "50%";
  const top = dr === 1 ? "8%" : dr === -1 ? "92%" : "50%";
  return { left, top, rotation };
}

function mobileNeighborHintDelayIndex(
  from: { row: number; col: number },
  to: { row: number; col: number },
): number | null {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (dr === 0 && dc === 1) return 0; // right
  if (dr === 1 && dc === 1) return 1; // bottom-right
  if (dr === 1 && dc === 0) return 2; // below
  return null;
}

function clockwiseAdjacentPulseDelayIndex(
  from: { row: number; col: number },
  to: { row: number; col: number },
): number | null {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (dr === 0 && dc === 1) return 0; // right
  if (dr === 1 && dc === 1) return 1; // bottom-right
  if (dr === 1 && dc === 0) return 2; // bottom
  if (dr === 1 && dc === -1) return 3; // bottom-left
  if (dr === 0 && dc === -1) return 4; // left
  if (dr === -1 && dc === -1) return 5; // top-left
  if (dr === -1 && dc === 0) return 6; // top
  if (dr === -1 && dc === 1) return 7; // top-right
  return null;
}

function Cluster4DesktopActivePanel({
  card,
  isWide,
  isBlueTheme,
  onPrev,
  onNext,
}: {
  card: HomeHeroGridCard;
  isWide: boolean;
  isBlueTheme: boolean;
  onPrev: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onNext: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const imageWrapClassName = `${styles.cluster4PanelImage}${isBlueTheme ? ` ${styles.cluster4PanelImageThemeBlue}` : ""}`;
  const bodyStyle =
    card.body != null && card.body !== ""
      ? card.textMaxChars != null
        ? ({ maxWidth: `${card.textMaxChars}ch` } as CSSProperties)
        : isWide
          ? undefined
          : ({ maxWidth: "250px" } as CSSProperties)
      : undefined;

  const nav = DESKTOP_PANEL_NAV_ENABLED ? (
    <div className={styles.cluster4PanelNav}>
      <button
        type="button"
        className={styles.cluster4PanelNavBtn}
        onClick={onPrev}
        aria-label="Previous panel"
      >
        <span
          className={`${styles.cluster4PanelNavBtnIcon} ${styles.cluster4PanelNavBtnIconLeft}`}
          aria-hidden
        />
      </button>
      <button
        type="button"
        className={styles.cluster4PanelNavBtn}
        onClick={onNext}
        aria-label="Next panel"
      >
        <span
          className={`${styles.cluster4PanelNavBtnIcon} ${styles.cluster4PanelNavBtnIconRight}`}
          aria-hidden
        />
      </button>
    </div>
  ) : null;

  const titleRow = (
    <div className={styles.cluster4PanelTitleRow}>
      <span
        className={styles.cluster4PanelTitleDot}
        style={{ backgroundColor: getHomeHeroGridAccentDotColor(card.accentDot) }}
        aria-hidden
      />
      <p className={styles.cluster4PanelTitle}>{card.label}</p>
    </div>
  );

  const textBlock = (
    <div className={styles.cluster4PanelTextBlock}>
      {isWide || !DESKTOP_PANEL_NAV_ENABLED ? (
        titleRow
      ) : (
        <div className={styles.cluster4PanelTextHeader}>
          {titleRow}
          {nav}
        </div>
      )}
      {card.body ? (
        <p className={styles.cluster4PanelBody} style={bodyStyle}>
          {card.body}
        </p>
      ) : null}
    </div>
  );

  if (isWide) {
    return (
      <>
        <Cluster4PanelMedia
          cardId={card.id}
          media={card.media}
          wrapClassName={imageWrapClassName}
          assetClassName={styles.cluster4PanelImageAsset}
        />
        <div className={styles.cluster4PanelSidebar}>
          {nav}
          {textBlock}
        </div>
      </>
    );
  }

  return (
    <>
      <Cluster4PanelMedia
        cardId={card.id}
        media={card.media}
        wrapClassName={imageWrapClassName}
        assetClassName={styles.cluster4PanelImageAsset}
      />
      <div className={styles.cluster4PanelFooter}>{textBlock}</div>
    </>
  );
}

export type HomepageHeroVariant = "full" | "cluster4Only";

type HomepageHeroProps = {
  variant?: HomepageHeroVariant;
};

export function HomepageHero({ variant = "full" }: HomepageHeroProps) {
  const cluster4Only = variant === "cluster4Only";
  const [timeLabel, setTimeLabel] = useState("00:00");
  const [minuteProgress, setMinuteProgress] = useState(0);
  const [mobileCluster4Index, setMobileCluster4Index] = useState(0);
  const [mobileCluster4TrackIndex, setMobileCluster4TrackIndex] = useState(1);
  const [mobileCluster4Animate, setMobileCluster4Animate] = useState(true);
  const [mobileCluster4IsTransitioning, setMobileCluster4IsTransitioning] =
    useState(false);
  const [mobileGridActive, setMobileGridActive] = useState({ row: 0, col: 0 });
  const [mobileGridPan, setMobileGridPan] = useState({ x: 0, y: 0 });
  const mobileGridViewportRef = useRef<HTMLDivElement | null>(null);
  const mobileGridRef = useRef<HTMLDivElement | null>(null);
  const desktopBentoViewportRef = useRef<HTMLDivElement | null>(null);
  const desktopBentoInnerRef = useRef<HTMLDivElement | null>(null);
  const desktopBentoActivePanelRef = useRef<HTMLDivElement | null>(null);
  const desktopBentoHistoryRef = useRef<DesktopBentoSlot[]>([]);
  const cluster2Ref = useRef<HTMLDivElement | null>(null);
  const [desktopBentoPan, setDesktopBentoPan] = useState({ x: 0, y: 0 });
  const [desktopBentoActive, setDesktopBentoActive] = useState<{
    row: number;
    card: number;
  }>(() => ({ ...DESKTOP_BENTO_INITIAL_ACTIVE }));

  const desktopGridCursorWrapRef = useRef<HTMLDivElement | null>(null);
  const desktopPanelNavCursorWrapRef = useRef<HTMLDivElement | null>(null);
  const desktopGridPointerInsideRef = useRef(false);
  const lastDesktopGridPointerRef = useRef({ x: 0, y: 0 });
  const themeBarCursorViewportRef = useRef<HTMLDivElement | null>(null);
  const themeBarCursorWrapRef = useRef<HTMLDivElement | null>(null);
  const themeBarPointerInsideRef = useRef(false);
  const lastThemeBarPointerRef = useRef({ x: 0, y: 0 });
  const panelHeroNavCursorViewportRef = useRef<HTMLDivElement | null>(null);
  const panelHeroNavCursorWrapRef = useRef<HTMLDivElement | null>(null);
  const panelHeroNavPointerInsideRef = useRef(false);
  const lastPanelHeroNavPointerRef = useRef({ x: 0, y: 0 });
  const desktopHoveredBentoKeyRef = useRef<string | null>(null);
  const [desktopGridCustomCursorEnabled, setDesktopGridCustomCursorEnabled] =
    useState(false);
  const [desktopGridCursorVisible, setDesktopGridCursorVisible] = useState(false);
  const [desktopGridHoveringActiveCard, setDesktopGridHoveringActiveCard] =
    useState(false);
  const [desktopPanelNavCursorVisible, setDesktopPanelNavCursorVisible] =
    useState(false);
  const [themeBarCursorVisible, setThemeBarCursorVisible] = useState(false);
  const [panelHeroNavCursorVisible, setPanelHeroNavCursorVisible] = useState(false);
  const [desktopCursorCrossGeneration, setDesktopCursorCrossGeneration] = useState(0);
  const [desktopWideEnabled, setDesktopWideEnabled] = useState(false);
  const [desktopBentoPanNudge, setDesktopBentoPanNudge] = useState(false);
  /** Neighbor panel pulse — one-time on page load. */
  const [showOneTimePanelPulse, setShowOneTimePanelPulse] = useState(false);
  /** Longer transform transition only for the first pan after load (see CSS `*PanBoot`). */
  const [cluster4MobilePanBoot, setCluster4MobilePanBoot] = useState(true);
  const [cluster4DesktopPanBoot, setCluster4DesktopPanBoot] = useState(true);
  const [showMobileHintsOnLoad, setShowMobileHintsOnLoad] = useState(true);
  /** After row1 enter (or immediately when `prefers-reduced-motion`). Pulse / hints. */
  const [cluster4IntroUnlocked, setCluster4IntroUnlocked] = useState(false);
  /** Earlier unlock so the first grid pan can overlap row1’s enter animation. */
  const [cluster4PanUnlocked, setCluster4PanUnlocked] = useState(false);

  const [mobileCarouselCards, setMobileCarouselCards] = useState(HOME_HERO_GRID_CARD_IDS);

  const mobileCarouselTrackCards = useMemo(() => {
    const first = mobileCarouselCards[0];
    const last = mobileCarouselCards[mobileCarouselCards.length - 1];
    return [last, ...mobileCarouselCards, first];
  }, [mobileCarouselCards]);
  const mobileGridCards = useMemo(
    () =>
      Array.from(
        { length: MOBILE_GRID_CELLS },
        (_, idx) => mobileCarouselCards[idx % mobileCarouselCards.length] ?? "",
      ),
    [mobileCarouselCards],
  );

  useEffect(() => {
    let rafId = 0;
    let lastMinute = -1;

    setTimeLabel(getCurrentTimeLabel());
    setMinuteProgress(getMinuteProgressPercent());

    const tick = () => {
      const now = new Date();
      const progress = ((now.getSeconds() + now.getMilliseconds() / 1000) / 60) * 100;
      setMinuteProgress(progress);

      const minute = now.getMinutes();
      if (minute !== lastMinute) {
        lastMinute = minute;
        setTimeLabel(getCurrentTimeLabel());
      }

      rafId = window.requestAnimationFrame(tick);
    };

    tick();
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    setMobileCarouselCards(shuffleArray(HOME_HERO_GRID_CARD_IDS));

    setMobileGridActive({ row: 0, col: 0 });

    const slot = pickInitialDesktopBentoSlot(DESKTOP_BENTO_ROW_SPANS);
    if (slot) {
      setDesktopBentoActive(slot);
      return;
    }
    const randomDesktopRow = Math.floor(Math.random() * DESKTOP_BENTO_ROW_SPANS.length);
    const randomDesktopCol = Math.floor(
      Math.random() * DESKTOP_BENTO_ROW_SPANS[randomDesktopRow].length,
    );
    setDesktopBentoActive({ row: randomDesktopRow, card: randomDesktopCol });
  }, []);

  useEffect(() => {
    const sync = () => setDesktopGridCustomCursorEnabled(shouldEnableDesktopGridCursor());
    sync();
    const queries = ["(pointer: coarse)", "(hover: none)", "(pointer: fine)"];
    const mqs = queries.map((q) => window.matchMedia(q));
    const onChange = () => sync();
    mqs.forEach((mq) => mq.addEventListener("change", onChange));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", onChange));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_WIDE_LAYOUT_MQ);
    const sync = () => setDesktopWideEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_BENTO_PAN_NUDGE_MQ);
    const sync = () => setDesktopBentoPanNudge(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!cluster4IntroUnlocked) return;
    setShowOneTimePanelPulse(true);
  }, [cluster4IntroUnlocked]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setCluster4PanUnlocked(true),
      HOME_HERO_CLUSTER4_PAN_UNLOCK_MS,
    );
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setCluster4IntroUnlocked(true),
      HOME_HERO_ROW1_ENTER_END_MS,
    );
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showOneTimePanelPulse) return;
    /* cluster4-inactive-pulse-onload 1.6s + stagger (--cluster4-pulse-delay up to ~0.64s). */
    const id = window.setTimeout(() => setShowOneTimePanelPulse(false), 2300);
    return () => window.clearTimeout(id);
  }, [showOneTimePanelPulse]);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCluster4IntroUnlocked(true);
      setCluster4PanUnlocked(true);
      setCluster4MobilePanBoot(false);
      setCluster4DesktopPanBoot(false);
    }
  }, []);

  useEffect(() => {
    if (!cluster4MobilePanBoot) return;
    if (!cluster4PanUnlocked) return;
    const id = window.setTimeout(
      () => setCluster4MobilePanBoot(false),
      HOME_HERO_CLUSTER4_PAN_BOOT_CLEAR_MS,
    );
    return () => window.clearTimeout(id);
  }, [cluster4PanUnlocked, cluster4MobilePanBoot]);

  useEffect(() => {
    if (!cluster4IntroUnlocked) return;
    const id = window.setTimeout(() => setShowMobileHintsOnLoad(false), 2300);
    return () => window.clearTimeout(id);
  }, [cluster4IntroUnlocked]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    let timeoutId: number | undefined;
    const PERIOD_MS = 7000;

    const replay = () => {
      setShowOneTimePanelPulse(false);
      window.requestAnimationFrame(() => setShowOneTimePanelPulse(true));
    };

    const clearTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const scheduleNext = () => {
      if (!mq.matches) return;
      timeoutId = window.setTimeout(() => {
        replay();
        scheduleNext();
      }, PERIOD_MS);
    };

    const sync = () => {
      clearTimer();
      scheduleNext();
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      clearTimer();
    };
  }, [mobileGridActive.row, mobileGridActive.col]);

  useEffect(() => {
    if (!cluster4DesktopPanBoot) return;
    if (!cluster4PanUnlocked) return;
    const id = window.setTimeout(
      () => setCluster4DesktopPanBoot(false),
      HOME_HERO_CLUSTER4_PAN_BOOT_CLEAR_MS,
    );
    return () => window.clearTimeout(id);
  }, [cluster4PanUnlocked, cluster4DesktopPanBoot]);

  const onMobileGridPanTransitionEnd = (e: ReactTransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "transform" || e.target !== e.currentTarget) return;
    setCluster4MobilePanBoot(false);
    setShowOneTimePanelPulse(false);
    window.requestAnimationFrame(() => setShowOneTimePanelPulse(true));
  };

  const onDesktopGridPanTransitionEnd = (e: ReactTransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "transform" || e.target !== e.currentTarget) return;
    setCluster4DesktopPanBoot(false);
  };

  const navigateDesktopBentoTo = useCallback((next: DesktopBentoSlot) => {
    setDesktopBentoActive((current) => {
      if (desktopBentoSlotsEqual(current, next)) return current;
      desktopBentoHistoryRef.current = [...desktopBentoHistoryRef.current, current];
      return next;
    });
  }, []);

  const onDesktopPanelPrev = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const history = desktopBentoHistoryRef.current;
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    desktopBentoHistoryRef.current = history.slice(0, -1);
    setDesktopBentoActive(previous);
  }, []);

  const onDesktopPanelNext = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDesktopBentoActive((current) => {
      const next = pickRandomDesktopBentoSlot(current, DESKTOP_BENTO_ROW_SPANS);
      if (desktopBentoSlotsEqual(current, next)) return current;
      desktopBentoHistoryRef.current = [...desktopBentoHistoryRef.current, current];
      return next;
    });
  }, []);

  const syncMobileGridPan = useCallback(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) {
      setMobileGridPan({ x: 0, y: 0 });
      return;
    }

    const allowPan =
      cluster4PanUnlocked ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!allowPan) return;

    const viewport = mobileGridViewportRef.current;
    const grid = mobileGridRef.current;
    if (!viewport || !grid) return;

    const firstCard = grid.firstElementChild as HTMLElement | null;
    if (!firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(grid).columnGap || "8") || 8;
    const stepX = firstCard.offsetWidth + gap;
    const stepY = firstCard.offsetHeight + gap;

    const desiredX = -mobileGridActive.col * stepX;
    const desiredY = -mobileGridActive.row * stepY;

    const minX = Math.min(0, viewport.clientWidth - grid.scrollWidth);
    const minY = Math.min(0, viewport.clientHeight - grid.scrollHeight);

    const clampedX = Math.min(0, Math.max(minX, desiredX));
    const clampedY = Math.min(0, Math.max(minY, desiredY));

    setMobileGridPan({ x: clampedX, y: clampedY });
  }, [mobileGridActive.row, mobileGridActive.col, cluster4PanUnlocked]);

  const syncDesktopBentoPan = useCallback(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) {
      setDesktopBentoPan({ x: 0, y: 0 });
      return;
    }

    const allowPan =
      cluster4PanUnlocked ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!allowPan) {
      setDesktopBentoPan({ x: 0, y: 0 });
      return;
    }

    const vp = desktopBentoViewportRef.current;
    const inner = desktopBentoInnerRef.current;
    const activeEl = desktopBentoActivePanelRef.current;
    if (!vp || !inner || !activeEl) return;

    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const innerW = inner.offsetWidth;
    const innerH = inner.offsetHeight;
    if (!vw || !vh || !innerW || !innerH) return;

    const { x: acx, y: acy } = activePanelCenterInInner(activeEl, inner);
    const idealTx =
      vw / 2 -
      acx +
      (desktopBentoPanNudge
        ? DESKTOP_BENTO_PAN_OFFSET_X + DESKTOP_BENTO_PAN_NUDGE_X
        : 0);

    const cluster2El = cluster2Ref.current;
    const vpRect = vp.getBoundingClientRect();
    const activeHalfH = activeEl.offsetHeight / 2;
    const activeBottomInner = acy + activeHalfH;

    let idealTy: number;
    if (
      !cluster4Only &&
      desktopBentoPanNudge &&
      desktopWideEnabled &&
      cluster2El
    ) {
      /* Full desktop: align active panel bottom with cluster2 (avoids top clip at wide widths). */
      const c2Bottom = cluster2El.getBoundingClientRect().bottom;
      idealTy = c2Bottom - vpRect.top - activeBottomInner;
    } else {
      /* Tablet / cluster4-only: keep active panel vertically centred in the cluster4 viewport. */
      idealTy = vh / 2 - acy;
    }

    setDesktopBentoPan(clampDesktopBentoPan(idealTx, idealTy, innerW, innerH, vw, vh));
  }, [
    cluster4Only,
    cluster4PanUnlocked,
    desktopBentoActive.row,
    desktopBentoActive.card,
    desktopWideEnabled,
    desktopBentoPanNudge,
  ]);

  useLayoutEffect(() => {
    syncMobileGridPan();

    const mq = window.matchMedia("(max-width: 1023px)");
    const ro = new ResizeObserver(() => syncMobileGridPan());
    if (mobileGridViewportRef.current) ro.observe(mobileGridViewportRef.current);
    if (mobileGridRef.current) ro.observe(mobileGridRef.current);
    mq.addEventListener("change", syncMobileGridPan);
    window.addEventListener("resize", syncMobileGridPan);
    return () => {
      mq.removeEventListener("change", syncMobileGridPan);
      window.removeEventListener("resize", syncMobileGridPan);
      ro.disconnect();
    };
  }, [syncMobileGridPan]);

  const commitDesktopGridCursorPosition = useCallback((clientX: number, clientY: number) => {
    lastDesktopGridPointerRef.current = { x: clientX, y: clientY };
    const wrap = desktopGridCursorWrapRef.current;
    const vp = desktopBentoViewportRef.current;
    if (!wrap || !vp) return;
    const rect = vp.getBoundingClientRect();
    wrap.style.left = `${clientX - rect.left + DESKTOP_GRID_CURSOR_OFFSET_X}px`;
    wrap.style.top = `${clientY - rect.top + DESKTOP_GRID_CURSOR_OFFSET_Y}px`;
  }, []);

  const commitDesktopPanelNavCursorPosition = useCallback(
    (clientX: number, clientY: number) => {
      const wrap = desktopPanelNavCursorWrapRef.current;
      const vp = desktopBentoViewportRef.current;
      if (!wrap || !vp) return;
      const rect = vp.getBoundingClientRect();
      wrap.style.left = `${clientX - rect.left + CLUSTER2_DESKTOP_CURSOR_OFFSET_X}px`;
      wrap.style.top = `${clientY - rect.top + CLUSTER2_DESKTOP_CURSOR_OFFSET_Y}px`;
    },
    [],
  );

  const commitThemeBarCursorPosition = useCallback((clientX: number, clientY: number) => {
    lastThemeBarPointerRef.current = { x: clientX, y: clientY };
    const wrap = themeBarCursorWrapRef.current;
    const vp = themeBarCursorViewportRef.current;
    if (!wrap || !vp) return;
    const rect = vp.getBoundingClientRect();
    wrap.style.left = `${clientX - rect.left + CLUSTER2_DESKTOP_CURSOR_OFFSET_X}px`;
    wrap.style.top = `${clientY - rect.top + CLUSTER2_DESKTOP_CURSOR_OFFSET_Y}px`;
  }, []);

  const commitPanelHeroNavCursorPosition = useCallback((clientX: number, clientY: number) => {
    lastPanelHeroNavPointerRef.current = { x: clientX, y: clientY };
    const wrap = panelHeroNavCursorWrapRef.current;
    const vp = panelHeroNavCursorViewportRef.current;
    if (!wrap || !vp) return;
    const rect = vp.getBoundingClientRect();
    wrap.style.left = `${clientX - rect.left + CLUSTER2_DESKTOP_CURSOR_OFFSET_X}px`;
    wrap.style.top = `${clientY - rect.top + CLUSTER2_DESKTOP_CURSOR_OFFSET_Y}px`;
  }, []);

  useEffect(() => {
    if (!desktopGridCustomCursorEnabled) return;
    const onScroll = () => {
      if (desktopGridPointerInsideRef.current) {
        const { x, y } = lastDesktopGridPointerRef.current;
        commitDesktopGridCursorPosition(x, y);
      }
      if (themeBarPointerInsideRef.current) {
        const { x, y } = lastThemeBarPointerRef.current;
        commitThemeBarCursorPosition(x, y);
      }
      if (panelHeroNavPointerInsideRef.current) {
        const { x, y } = lastPanelHeroNavPointerRef.current;
        commitPanelHeroNavCursorPosition(x, y);
      }
      if (desktopPanelNavCursorVisible) {
        const { x, y } = lastDesktopGridPointerRef.current;
        commitDesktopPanelNavCursorPosition(x, y);
      }
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [
    desktopGridCustomCursorEnabled,
    commitDesktopGridCursorPosition,
    commitDesktopPanelNavCursorPosition,
    commitThemeBarCursorPosition,
    commitPanelHeroNavCursorPosition,
    desktopPanelNavCursorVisible,
  ]);

  useLayoutEffect(() => {
    if (!desktopGridCustomCursorEnabled) return;
    if (desktopGridPointerInsideRef.current) {
      const { x, y } = lastDesktopGridPointerRef.current;
      commitDesktopGridCursorPosition(x, y);
    }
    if (themeBarPointerInsideRef.current) {
      const { x, y } = lastThemeBarPointerRef.current;
      commitThemeBarCursorPosition(x, y);
    }
    if (panelHeroNavPointerInsideRef.current) {
      const { x, y } = lastPanelHeroNavPointerRef.current;
      commitPanelHeroNavCursorPosition(x, y);
    }
    if (desktopPanelNavCursorVisible) {
      const { x, y } = lastDesktopGridPointerRef.current;
      commitDesktopPanelNavCursorPosition(x, y);
    }
  }, [
    desktopBentoPan.x,
    desktopBentoPan.y,
    cluster4IntroUnlocked,
    cluster4PanUnlocked,
    desktopGridCustomCursorEnabled,
    commitDesktopGridCursorPosition,
    commitDesktopPanelNavCursorPosition,
    commitThemeBarCursorPosition,
    commitPanelHeroNavCursorPosition,
    desktopPanelNavCursorVisible,
  ]);

  const onDesktopGridMouseEnter = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    desktopGridPointerInsideRef.current = true;
    setDesktopGridCursorVisible(true);
    commitDesktopGridCursorPosition(e.clientX, e.clientY);
  };

  const onDesktopGridMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    commitDesktopGridCursorPosition(e.clientX, e.clientY);
    const hoveredCard =
      e.target instanceof Element
        ? (e.target.closest("[data-bento-key]") as HTMLElement | null)
        : null;
    const nextKey = hoveredCard?.dataset.bentoKey ?? null;
    const isOverActiveCard = hoveredCard?.dataset.active === "true";
    const isOverPanelNav =
      isOverActiveCard &&
      e.target instanceof Element &&
      e.target.closest(`.${styles.cluster4PanelNavBtn}`) != null;
    setDesktopGridHoveringActiveCard(isOverActiveCard);
    setDesktopPanelNavCursorVisible(isOverPanelNav);
    if (isOverPanelNav) {
      commitDesktopPanelNavCursorPosition(e.clientX, e.clientY);
    }
    const prevKey = desktopHoveredBentoKeyRef.current;
    if (prevKey !== null && nextKey !== null && prevKey !== nextKey) {
      setDesktopCursorCrossGeneration((v) => v + 1);
    }
    desktopHoveredBentoKeyRef.current = nextKey;
  };

  const onDesktopGridMouseLeave = () => {
    desktopGridPointerInsideRef.current = false;
    desktopHoveredBentoKeyRef.current = null;
    setDesktopGridHoveringActiveCard(false);
    setDesktopPanelNavCursorVisible(false);
    setDesktopGridCursorVisible(false);
  };

  const onThemeBarCursorMouseEnter = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    themeBarPointerInsideRef.current = true;
    setThemeBarCursorVisible(true);
    commitThemeBarCursorPosition(e.clientX, e.clientY);
  };

  const onThemeBarCursorMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    commitThemeBarCursorPosition(e.clientX, e.clientY);
  };

  const onThemeBarCursorMouseLeave = () => {
    themeBarPointerInsideRef.current = false;
    setThemeBarCursorVisible(false);
  };

  const onPanelHeroNavCursorMouseEnter = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    panelHeroNavPointerInsideRef.current = true;
    setPanelHeroNavCursorVisible(true);
    commitPanelHeroNavCursorPosition(e.clientX, e.clientY);
  };

  const onPanelHeroNavCursorMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    commitPanelHeroNavCursorPosition(e.clientX, e.clientY);
  };

  const onPanelHeroNavCursorMouseLeave = () => {
    panelHeroNavPointerInsideRef.current = false;
    setPanelHeroNavCursorVisible(false);
  };

  useLayoutEffect(() => {
    syncDesktopBentoPan();

    const mq = window.matchMedia("(min-width: 1024px)");
    const ro = new ResizeObserver(() => syncDesktopBentoPan());
    const vp = desktopBentoViewportRef.current;
    const inner = desktopBentoInnerRef.current;
    const c2 = cluster2Ref.current;
    if (vp) ro.observe(vp);
    if (inner) ro.observe(inner);
    if (c2 && !cluster4Only) ro.observe(c2);

    mq.addEventListener("change", syncDesktopBentoPan);
    window.addEventListener("resize", syncDesktopBentoPan);
    const onScroll = () => syncDesktopBentoPan();
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      mq.removeEventListener("change", syncDesktopBentoPan);
      window.removeEventListener("resize", syncDesktopBentoPan);
      window.removeEventListener("scroll", onScroll, { capture: true });
      ro.disconnect();
    };
  }, [cluster4Only, syncDesktopBentoPan]);

  useEffect(() => {
    if (!cluster4PanUnlocked) return;
    let frame = 0;
    const maxFrames = 48;
    let rafId = 0;
    const tick = () => {
      syncDesktopBentoPan();
      syncMobileGridPan();
      frame += 1;
      if (frame < maxFrames) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [cluster4PanUnlocked, syncDesktopBentoPan, syncMobileGridPan]);

  const onHeroRow1EnterAnimationEnd = useCallback(
    (e: ReactAnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (!e.animationName.includes("fadeInUp")) return;
      syncDesktopBentoPan();
      syncMobileGridPan();
    },
    [syncDesktopBentoPan, syncMobileGridPan],
  );

  const stepForwardRef = useRef(() => {});

  const stepMobileCarousel = (direction: -1 | 1) => {
    if (mobileCluster4IsTransitioning) return;
    const count = mobileCarouselCards.length;
    setMobileCluster4Animate(true);
    setMobileCluster4IsTransitioning(true);

    if (direction === 1) {
      if (mobileCluster4Index === count - 1) {
        setMobileCluster4TrackIndex(count + 1);
        return;
      }
      setMobileCluster4Index((prev) => prev + 1);
      setMobileCluster4TrackIndex((prev) => prev + 1);
      return;
    }

    if (mobileCluster4Index === 0) {
      setMobileCluster4TrackIndex(0);
      return;
    }
    setMobileCluster4Index((prev) => prev - 1);
    setMobileCluster4TrackIndex((prev) => prev - 1);
  };

  stepForwardRef.current = () => {
    stepMobileCarousel(1);
  };

  const onMobileGridPanelClick = (row: number, col: number) => {
    setMobileGridActive((prev) => {
      if (row === prev.row && col === prev.col) return prev;
      return { row, col };
    });
  };

  useEffect(() => {
    const CAROUSEL_AUTOPLAY_MS = 3500;
    const mq = window.matchMedia("(max-width: 1023px)");
    let intervalId: number | undefined;

    const tick = () => {
      stepForwardRef.current();
    };

    const sync = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
      if (!mq.matches) return;
      intervalId = window.setInterval(tick, CAROUSEL_AUTOPLAY_MS);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const onMobileCarouselTrackTransitionEnd = () => {
    const count = mobileCarouselCards.length;
    if (mobileCluster4TrackIndex === count + 1) {
      setMobileCluster4Index(0);
      setMobileCluster4Animate(false);
      setMobileCluster4TrackIndex(1);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setMobileCluster4Animate(true);
          setMobileCluster4IsTransitioning(false);
        });
      });
      return;
    }
    if (mobileCluster4TrackIndex === 0) {
      setMobileCluster4Index(count - 1);
      setMobileCluster4Animate(false);
      setMobileCluster4TrackIndex(count);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setMobileCluster4Animate(true);
          setMobileCluster4IsTransitioning(false);
        });
      });
      return;
    }
    setMobileCluster4IsTransitioning(false);
  };

  return (
    <section
      className={[
        projectGridStyles.pageInset,
        styles.hero,
        cluster4Only ? styles.heroCluster4Only : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={cluster4Only ? "Project panels" : "Homepage hero"}
      style={
        {
          ["--hero-cluster4-pan-boot-ms" as string]: `${HOME_HERO_CLUSTER4_PAN_BOOT_MS}ms`,
        } as CSSProperties
      }
    >
      <div
        className={[
          styles.row1,
          enterStyles.enterMedia,
          cluster4Only ? styles.row1Cluster4Only : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={onHeroRow1EnterAnimationEnd}
      >
        {!cluster4Only ? (
        <div className={styles.cluster1}>
          <div ref={cluster2Ref} className={styles.cluster2}>
            <div className={styles.panelHero}>
              <div
                ref={themeBarCursorViewportRef}
                className={[
                  styles.panelHeroThemeBarCursorViewport,
                  desktopGridCustomCursorEnabled && themeBarCursorVisible
                    ? styles.panelHeroThemeBarCursorHide
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={
                  desktopGridCustomCursorEnabled ? onThemeBarCursorMouseEnter : undefined
                }
                onMouseMove={
                  desktopGridCustomCursorEnabled ? onThemeBarCursorMouseMove : undefined
                }
                onMouseLeave={
                  desktopGridCustomCursorEnabled ? onThemeBarCursorMouseLeave : undefined
                }
              >
                <HomeHeroPanelThemeBar />
                {desktopGridCustomCursorEnabled ? (
                  <div
                    ref={themeBarCursorWrapRef}
                    className={styles.cluster2DesktopCursorWrap}
                    style={
                      {
                        left: 0,
                        top: 0,
                        transform: "translate(-50%, -50%)",
                        opacity: themeBarCursorVisible ? 1 : 0,
                      } as CSSProperties
                    }
                    aria-hidden
                  >
                    <div
                      className={styles.cluster2DesktopCursorBubble}
                      style={
                        {
                          backgroundColor: `rgba(255, 255, 255, ${DESKTOP_GRID_CURSOR_BG_ALPHA})`,
                        } as CSSProperties
                      }
                    />
                  </div>
                ) : null}
              </div>
              <div className={styles.panelHeroBody}>
                <div
                  ref={panelHeroNavCursorViewportRef}
                  className={[
                    styles.panelHeroNavCursorViewport,
                    desktopGridCustomCursorEnabled && panelHeroNavCursorVisible
                      ? styles.panelHeroNavCursorHide
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={
                    desktopGridCustomCursorEnabled
                      ? onPanelHeroNavCursorMouseEnter
                      : undefined
                  }
                  onMouseMove={
                    desktopGridCustomCursorEnabled
                      ? onPanelHeroNavCursorMouseMove
                      : undefined
                  }
                  onMouseLeave={
                    desktopGridCustomCursorEnabled
                      ? onPanelHeroNavCursorMouseLeave
                      : undefined
                  }
                >
                  <HomeHeroPanelNavLinks />
                  {desktopGridCustomCursorEnabled ? (
                    <div
                      ref={panelHeroNavCursorWrapRef}
                      className={styles.cluster2DesktopCursorWrap}
                      style={
                        {
                          left: 0,
                          top: 0,
                          transform: "translate(-50%, -50%)",
                          opacity: panelHeroNavCursorVisible ? 1 : 0,
                        } as CSSProperties
                      }
                      aria-hidden
                    >
                      <div
                        className={styles.cluster2DesktopCursorBubble}
                        style={
                          {
                            backgroundColor: `rgba(255, 255, 255, ${DESKTOP_GRID_CURSOR_BG_ALPHA})`,
                          } as CSSProperties
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className={styles.availabilityContact}>
              <div className={styles.availability}>
                <span className={styles.dot} aria-hidden />
                <span>Available for new projects</span>
              </div>
              <div className={styles.contactPills}>
                <div className={styles.contactPill}>
                  <img
                    src="/svg/icons/email.svg"
                    alt=""
                    className={styles.contactIcon}
                  />
                </div>
                <div className={styles.contactPill}>
                  <img
                    src="/svg/icons/LinkedIn.svg"
                    alt=""
                    className={styles.contactIcon}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cluster3}>
            <div className={styles.contactMobile}>
              <div className={styles.contactMobileItem}>
                <img
                  src="/svg/icons/email.svg"
                  alt=""
                  className={styles.contactIcon}
                />
              </div>
              <div className={styles.contactMobileItem}>
                <img
                  src="/svg/icons/LinkedIn.svg"
                  alt=""
                  className={styles.contactIcon}
                />
              </div>
            </div>
            <div className={styles.profile}>
              <div className={styles.profileImageContainer}>
                <img
                  src="/images/profile.jpg"
                  alt=""
                  className={styles.profileImage}
                />
              </div>
            </div>
            <div className={styles.location}>
              <div className={styles.locationCard}>
                <p className={styles.locationSecondary}>Based in</p>
                <p className={styles.locationPrimary}>London, UK</p>
                <img
                  src="/svg/icons/map-pin.svg"
                  alt=""
                  aria-hidden
                  className={styles.locationPinIcon}
                />
              </div>
              <div className={styles.timePill}>
                <div className={styles.timeReadout}>
                  <div className={styles.timePillTopRow}>
                    <img
                      src="/svg/icons/weather/rain.svg"
                      alt=""
                      className={styles.timeWeatherIcon}
                    />
                    <span>{timeLabel}</span>
                  </div>
                  <div className={styles.timeProgressTrack} aria-hidden>
                    <span
                      className={styles.timeProgressFill}
                      style={{ width: `${minuteProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : null}

        <div className={styles.cluster4}>
          <div className={styles.cluster4MobileCarousel}>
            <div ref={mobileGridViewportRef} className={styles.cluster4MobileViewport}>
              <div
                ref={mobileGridRef}
                className={[
                  styles.cluster4MobileGrid,
                  cluster4MobilePanBoot ? styles.cluster4MobileGridPanBoot : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    transform: `translate(${mobileGridPan.x}px, ${mobileGridPan.y}px)`,
                  } as CSSProperties
                }
                onTransitionEnd={onMobileGridPanTransitionEnd}
              >
                {mobileGridCards.map((cardId, idx) => {
                  const card = getHomeHeroGridCardById(cardId);
                  const row = Math.floor(idx / MOBILE_GRID_COLS);
                  const col = idx % MOBILE_GRID_COLS;
                  const isActive = row === mobileGridActive.row && col === mobileGridActive.col;
                  const dRow = Math.abs(row - mobileGridActive.row);
                  const dCol = Math.abs(col - mobileGridActive.col);
                  const isBlueTheme = isActive && card.theme === "blue";
                  const isNeighbor = Math.max(dRow, dCol) === 1;
                  const neighborHint = mobileNeighborHintPlacement(
                    mobileGridActive,
                    { row, col },
                  );
                  const neighborHintDelayIndex = mobileNeighborHintDelayIndex(
                    mobileGridActive,
                    { row, col },
                  );
                  const neighborHintDelay =
                    neighborHintDelayIndex != null
                      ? `${neighborHintDelayIndex * 0.22}s`
                      : undefined;
                  const pulseDelayIndex = clockwiseAdjacentPulseDelayIndex(
                    mobileGridActive,
                    { row, col },
                  );
                  const pulseDelay =
                    pulseDelayIndex != null ? `${pulseDelayIndex * 0.08}s` : undefined;
                  return (
                    <button
                      key={`mobile-grid-card-${idx}`}
                      type="button"
                      className={`${styles.cluster4MobileCard}${isActive ? ` ${styles.cluster4MobileCardActive}` : ""}${isBlueTheme ? ` ${styles.cluster4CardThemeBlue}` : ""}${showOneTimePanelPulse && pulseDelay != null ? ` ${styles.cluster4MobileCardInactive}` : ""}`}
                      style={
                        pulseDelay != null
                          ? ({
                              "--cluster4-pulse-delay": pulseDelay,
                            } as CSSProperties)
                          : undefined
                      }
                      onClick={() => onMobileGridPanelClick(row, col)}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={card.label}
                    >
                      {isActive ? (
                        <>
                          <Cluster4PanelMedia
                            cardId={card.id}
                            media={card.media}
                            wrapClassName={`${styles.cluster4PanelImage}${isBlueTheme ? ` ${styles.cluster4PanelImageThemeBlue}` : ""}`}
                            assetClassName={styles.cluster4PanelImageAsset}
                          />
                          {card.body ? (
                            <div className={styles.cluster4PanelText}>
                              <p
                                className={styles.cluster4PanelBody}
                                style={
                                  card.textMaxChars
                                    ? ({
                                        maxWidth: `${card.textMaxChars}ch`,
                                      } as CSSProperties)
                                    : undefined
                                }
                              >
                                {card.body}
                              </p>
                            </div>
                          ) : null}
                        </>
                      ) : showMobileHintsOnLoad &&
                        cluster4IntroUnlocked &&
                        isNeighbor &&
                        neighborHint != null ? (
                        <span
                          className={styles.cluster4MobileCardHint}
                          style={
                            {
                              left: neighborHint.left,
                              top: neighborHint.top,
                              transform: `translate(-50%, -50%) rotate(${neighborHint.rotation}deg)`,
                              ...(neighborHintDelay
                                ? { ["--cluster4-hint-delay" as string]: neighborHintDelay }
                                : {}),
                            } as CSSProperties
                          }
                          aria-hidden
                        >
                          <img src="/svg/icons/arrow-right.svg" alt="" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            ref={desktopBentoViewportRef}
            className={[
              styles.cluster4DesktopGrid,
              desktopGridCustomCursorEnabled && desktopGridCursorVisible
                ? styles.cluster4DesktopGridCursorHide
                : "",
              desktopGridCustomCursorEnabled && desktopPanelNavCursorVisible
                ? styles.cluster4PanelNavCursorHide
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onMouseEnter={
              desktopGridCustomCursorEnabled ? onDesktopGridMouseEnter : undefined
            }
            onMouseMove={
              desktopGridCustomCursorEnabled ? onDesktopGridMouseMove : undefined
            }
            onMouseLeave={
              desktopGridCustomCursorEnabled ? onDesktopGridMouseLeave : undefined
            }
          >
            <div
              ref={desktopBentoInnerRef}
              className={[
                styles.cluster4DesktopGridInner,
                cluster4DesktopPanBoot ? styles.cluster4DesktopGridInnerPanBoot : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  transform: `translate(${desktopBentoPan.x}px, ${desktopBentoPan.y}px)`,
                } as CSSProperties
              }
              onTransitionEnd={onDesktopGridPanTransitionEnd}
            >
              {DESKTOP_BENTO_ROW_SPANS.flatMap((spans, rowIdx) =>
                spans.map((colSpan, cardIdx) => {
                  const flatIdx = rowIdx * spans.length + cardIdx;
                  const cardId = getDesktopBentoCardIdForSlot(
                    flatIdx,
                    colSpan,
                    mobileCarouselCards,
                  );
                  const card = getHomeHeroGridCardById(cardId);
                  const isActive =
                    rowIdx === desktopBentoActive.row &&
                    cardIdx === desktopBentoActive.card;
                  const pulseDelayIndex = clockwiseAdjacentPulseDelayIndex(
                    { row: desktopBentoActive.row, col: desktopBentoActive.card },
                    { row: rowIdx, col: cardIdx },
                  );
                  const isWide = desktopWideEnabled && colSpan === 2;
                  const isBlueTheme = isActive && card.theme === "blue";
                  const cardClassName = [
                    styles.cluster4DesktopCard,
                    isWide ? styles.cluster4DesktopCardWide : "",
                    isActive ? styles.cluster4DesktopCardAccent : "",
                    isBlueTheme ? styles.cluster4CardThemeBlue : "",
                    showOneTimePanelPulse && pulseDelayIndex != null
                      ? styles.cluster4DesktopCardInactive
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const cardStyle = {
                    gridColumn: `span ${isWide ? 2 : 1}`,
                    ...(pulseDelayIndex != null
                      ? { "--cluster4-pulse-delay": `${pulseDelayIndex * 0.08}s` }
                      : {}),
                  } as CSSProperties;

                  if (isActive) {
                    return (
                      <div
                        key={`desktop-bento-${rowIdx}-${cardIdx}`}
                        ref={desktopBentoActivePanelRef}
                        data-bento-key={`${rowIdx}-${cardIdx}`}
                        className={cardClassName}
                        style={cardStyle}
                        data-active="true"
                        aria-label={card.label}
                      >
                        <Cluster4DesktopActivePanel
                          card={card}
                          isWide={isWide}
                          isBlueTheme={isBlueTheme}
                          onPrev={onDesktopPanelPrev}
                          onNext={onDesktopPanelNext}
                        />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`desktop-bento-${rowIdx}-${cardIdx}`}
                      type="button"
                      data-bento-key={`${rowIdx}-${cardIdx}`}
                      className={cardClassName}
                      style={cardStyle}
                      aria-label={card.label}
                      onClick={() => navigateDesktopBentoTo({ row: rowIdx, card: cardIdx })}
                    />
                  );
                }),
              )}
            </div>
            {desktopGridCustomCursorEnabled ? (
              <>
                <div
                  ref={desktopGridCursorWrapRef}
                  className={styles.cluster4DesktopCursorWrap}
                  style={
                    {
                      left: 0,
                      top: 0,
                      transform: "translate(-50%, -50%)",
                      opacity:
                        desktopGridCursorVisible && !desktopGridHoveringActiveCard
                          ? 1
                          : 0,
                    } as CSSProperties
                  }
                  aria-hidden
                >
                  <div
                    key={desktopCursorCrossGeneration}
                    className={styles.cluster4DesktopCursorBubble}
                    style={
                      {
                        backgroundColor: `rgba(255, 255, 255, ${DESKTOP_GRID_CURSOR_BG_ALPHA})`,
                        animation:
                          desktopCursorCrossGeneration > 0
                            ? "project-cursor-cross 0.5s ease-in-out"
                            : "none",
                      } as CSSProperties
                    }
                  />
                </div>
                <div
                  ref={desktopPanelNavCursorWrapRef}
                  className={styles.cluster2DesktopCursorWrap}
                  style={
                    {
                      left: 0,
                      top: 0,
                      transform: "translate(-50%, -50%)",
                      opacity: desktopPanelNavCursorVisible ? 1 : 0,
                    } as CSSProperties
                  }
                  aria-hidden
                >
                  <div
                    className={styles.cluster2DesktopCursorBubble}
                    style={
                      {
                        backgroundColor: `rgba(255, 255, 255, ${DESKTOP_GRID_CURSOR_BG_ALPHA})`,
                      } as CSSProperties
                    }
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {!cluster4Only ? (
      <div className={styles.row2}>
        <div className={styles.row2Inner}>
          <h2 className={styles.row2Title}>Hello.</h2>
          <div className={styles.row2Bottom}>
            <p className={styles.row2Text}>
              Quam minus voluptas sint ea nulla a magni quia qui non maxime
              rem facere odit explicabo. Magni quaerat inventore hic maxime
              veniam. Culpa mollitia rerum rerum modi repellat. Id dolores eos
              excepturi. Perspiciatis vero nobis autem. Quam minus voluptas sint
              ea nulla a magni quia qui non maxime rem facere odit explicabo.
              Magni quaerat.
            </p>
            <AvailabilityContact className={styles.row2AvailabilityContact} />
          </div>
        </div>
      </div>
      ) : null}
    </section>
  );
}
