"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Cluster4PanelMedia } from "@/components/Cluster4PanelMedia";
import projectGridStyles from "@/components/ProjectGrid.module.css";
import { getHomeHeroGridCardById, HOME_HERO_GRID_CARD_IDS } from "@/data/homeHeroGridCards";
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

/** Match `ProjectGrid` custom cursor — fine pointer + hover only. */
function shouldEnableDesktopGridCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** Desktop bento cursor — white fill alpha (Project grid uses 0.9). */
const DESKTOP_GRID_CURSOR_BG_ALPHA = 0.7;
const DESKTOP_GRID_CURSOR_OFFSET_X = 6;
const DESKTOP_GRID_CURSOR_OFFSET_Y = 6;

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

export function HomepageHero() {
  const [timeLabel, setTimeLabel] = useState("00:00");
  const [minuteProgress, setMinuteProgress] = useState(0);
  const [mobileCluster4Index, setMobileCluster4Index] = useState(0);
  const [mobileCluster4TrackIndex, setMobileCluster4TrackIndex] = useState(1);
  const [mobileCluster4Animate, setMobileCluster4Animate] = useState(true);
  const [mobileCluster4IsTransitioning, setMobileCluster4IsTransitioning] =
    useState(false);
  const [carouselAutoplayPaused, setCarouselAutoplayPaused] = useState(false);
  const [mobileGridActive, setMobileGridActive] = useState({ row: 0, col: 0 });
  const [mobileGridPan, setMobileGridPan] = useState({ x: 0, y: 0 });
  const mobileGridViewportRef = useRef<HTMLDivElement | null>(null);
  const mobileGridRef = useRef<HTMLDivElement | null>(null);
  const mobileTouchStartXRef = useRef<number | null>(null);
  const desktopBentoViewportRef = useRef<HTMLDivElement | null>(null);
  const desktopBentoInnerRef = useRef<HTMLDivElement | null>(null);
  const desktopBentoActivePanelRef = useRef<HTMLButtonElement | null>(null);
  const cluster2Ref = useRef<HTMLDivElement | null>(null);
  const [desktopBentoPan, setDesktopBentoPan] = useState({ x: 0, y: 0 });
  const [desktopBentoActive, setDesktopBentoActive] = useState<{
    row: number;
    card: number;
  }>(() => ({ ...DESKTOP_BENTO_INITIAL_ACTIVE }));

  const desktopGridCursorWrapRef = useRef<HTMLDivElement | null>(null);
  const desktopGridPointerInsideRef = useRef(false);
  const lastDesktopGridPointerRef = useRef({ x: 0, y: 0 });
  const [desktopGridCustomCursorEnabled, setDesktopGridCustomCursorEnabled] =
    useState(false);
  const [desktopGridCursorVisible, setDesktopGridCursorVisible] = useState(false);
  const [desktopWideEnabled, setDesktopWideEnabled] = useState(false);
  const [showOneTimePanelPulse, setShowOneTimePanelPulse] = useState(true);

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

    setMobileGridActive({
      row: Math.floor(Math.random() * MOBILE_GRID_ROWS),
      col: Math.floor(Math.random() * MOBILE_GRID_COLS),
    });

    const wideSlots: Array<{ row: number; card: number }> = [];
    DESKTOP_BENTO_ROW_SPANS.forEach((rowSpans, row) => {
      rowSpans.forEach((span, card) => {
        if (span === 2) wideSlots.push({ row, card });
      });
    });
    if (wideSlots.length > 0) {
      const slot = wideSlots[Math.floor(Math.random() * wideSlots.length)];
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
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setDesktopWideEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowOneTimePanelPulse(false);
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");

    const syncMobileGridPan = () => {
      if (!mq.matches) {
        setMobileGridPan({ x: 0, y: 0 });
        return;
      }

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
    };

    syncMobileGridPan();

    const ro = new ResizeObserver(() => syncMobileGridPan());
    if (mobileGridViewportRef.current) ro.observe(mobileGridViewportRef.current);
    if (mobileGridRef.current) ro.observe(mobileGridRef.current);
    window.addEventListener("resize", syncMobileGridPan);
    return () => {
      window.removeEventListener("resize", syncMobileGridPan);
      ro.disconnect();
    };
  }, [mobileGridActive.row, mobileGridActive.col]);

  const commitDesktopGridCursorPosition = useCallback((clientX: number, clientY: number) => {
    lastDesktopGridPointerRef.current = { x: clientX, y: clientY };
    const wrap = desktopGridCursorWrapRef.current;
    if (wrap) {
      wrap.style.left = `${clientX + DESKTOP_GRID_CURSOR_OFFSET_X}px`;
      wrap.style.top = `${clientY + DESKTOP_GRID_CURSOR_OFFSET_Y}px`;
    }
  }, []);

  useEffect(() => {
    if (!desktopGridCustomCursorEnabled) return;
    const onScroll = () => {
      if (!desktopGridPointerInsideRef.current) return;
      const { x, y } = lastDesktopGridPointerRef.current;
      commitDesktopGridCursorPosition(x, y);
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [desktopGridCustomCursorEnabled, commitDesktopGridCursorPosition]);

  const onDesktopGridMouseEnter = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    desktopGridPointerInsideRef.current = true;
    setDesktopGridCursorVisible(true);
    commitDesktopGridCursorPosition(e.clientX, e.clientY);
  };

  const onDesktopGridMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!desktopGridCustomCursorEnabled) return;
    commitDesktopGridCursorPosition(e.clientX, e.clientY);
  };

  const onDesktopGridMouseLeave = () => {
    desktopGridPointerInsideRef.current = false;
    setDesktopGridCursorVisible(false);
  };

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const syncDesktopBentoPan = () => {
      if (!mq.matches) {
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
      const idealTx = vw / 2 - acx + (desktopWideEnabled ? -100 : 0);

      const cluster2El = cluster2Ref.current;
      const vpRect = vp.getBoundingClientRect();
      const activeHalfH = activeEl.offsetHeight / 2;
      const activeBottomInner = acy + activeHalfH;

      let idealTy: number;
      if (desktopWideEnabled && cluster2El) {
        const c2Bottom = cluster2El.getBoundingClientRect().bottom;
        idealTy = c2Bottom - vpRect.top - activeBottomInner;
      } else {
        /* Tablet/desktop: center active panel within cluster4 viewport. */
        idealTy = vh / 2 - acy;
      }

      setDesktopBentoPan(clampDesktopBentoPan(idealTx, idealTy, innerW, innerH, vw, vh));
    };

    syncDesktopBentoPan();

    const ro = new ResizeObserver(() => syncDesktopBentoPan());
    const vp = desktopBentoViewportRef.current;
    const inner = desktopBentoInnerRef.current;
    const c2 = cluster2Ref.current;
    if (vp) ro.observe(vp);
    if (inner) ro.observe(inner);
    if (c2) ro.observe(c2);

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
  }, [
    mobileCarouselCards,
    desktopBentoActive.row,
    desktopBentoActive.card,
    desktopWideEnabled,
  ]);

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

  const onMobileCarouselTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    mobileTouchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onMobileCarouselTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const startX = mobileTouchStartXRef.current;
    mobileTouchStartXRef.current = null;
    if (startX == null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    const threshold = 30;
    if (deltaX <= -threshold) stepMobileCarousel(1);
    if (deltaX >= threshold) stepMobileCarousel(-1);
  };

  const onMobileGridPanelClick = (row: number, col: number) => {
    if (row === mobileGridActive.row && col === mobileGridActive.col) return;
    setMobileGridActive({ row, col });
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
      if (!mq.matches || carouselAutoplayPaused) return;
      intervalId = window.setInterval(tick, CAROUSEL_AUTOPLAY_MS);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [carouselAutoplayPaused]);

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
      className={`${projectGridStyles.pageInset} ${styles.hero}`}
      aria-label="Homepage hero"
    >
      <div className={styles.row1}>
        <div className={styles.cluster1}>
          <div ref={cluster2Ref} className={styles.cluster2}>
            <div className={styles.panelHero} />
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

        <div className={styles.cluster4}>
          <div
            className={styles.cluster4MobileCarousel}
            onTouchStart={onMobileCarouselTouchStart}
            onTouchEnd={onMobileCarouselTouchEnd}
          >
            <div ref={mobileGridViewportRef} className={styles.cluster4MobileViewport}>
              <div
                ref={mobileGridRef}
                className={styles.cluster4MobileGrid}
                style={
                  {
                    transform: `translate(${mobileGridPan.x}px, ${mobileGridPan.y}px)`,
                  } as CSSProperties
                }
              >
                {mobileGridCards.map((cardId, idx) => {
                  const card = getHomeHeroGridCardById(cardId);
                  const row = Math.floor(idx / MOBILE_GRID_COLS);
                  const col = idx % MOBILE_GRID_COLS;
                  const isActive = row === mobileGridActive.row && col === mobileGridActive.col;
                  const dRow = Math.abs(row - mobileGridActive.row);
                  const dCol = Math.abs(col - mobileGridActive.col);
                  const isPulseCandidate = !isActive && dRow <= 1 && dCol <= 1;
                  const pulseIndex = (row - mobileGridActive.row + 1) * 3 + (col - mobileGridActive.col + 1);
                  const isBlueTheme = isActive && card.theme === "blue";
                  return (
                    <button
                      key={`mobile-grid-card-${idx}`}
                      type="button"
                      className={`${styles.cluster4MobileCard}${isActive ? ` ${styles.cluster4MobileCardActive}` : ""}${isBlueTheme ? ` ${styles.cluster4CardThemeBlue}` : ""}${showOneTimePanelPulse && isPulseCandidate ? ` ${styles.cluster4MobileCardInactive}` : ""}`}
                      style={
                        isPulseCandidate
                          ? ({
                              "--cluster4-pulse-delay": `${pulseIndex * 0.08}s`,
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
                          <div className={styles.cluster4PanelText}>
                            <p
                              className={styles.cluster4PanelBody}
                              style={
                                card.textMaxChars
                                  ? ({ maxWidth: `${card.textMaxChars}ch` } as CSSProperties)
                                  : undefined
                              }
                            >
                              {card.body}
                            </p>
                          </div>
                        </>
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
              className={styles.cluster4DesktopGridInner}
              style={
                {
                  transform: `translate(${desktopBentoPan.x}px, ${desktopBentoPan.y}px)`,
                } as CSSProperties
              }
            >
              {DESKTOP_BENTO_ROW_SPANS.flatMap((spans, rowIdx) =>
                spans.map((colSpan, cardIdx) => {
                  const flatIdx = rowIdx * spans.length + cardIdx;
                  const cardId =
                    mobileCarouselCards[flatIdx % mobileCarouselCards.length] ?? "";
                  const card = getHomeHeroGridCardById(cardId);
                  const isActive =
                    rowIdx === desktopBentoActive.row &&
                    cardIdx === desktopBentoActive.card;
                  const dRow = Math.abs(rowIdx - desktopBentoActive.row);
                  const dCol = Math.abs(cardIdx - desktopBentoActive.card);
                  const isPulseCandidate = !isActive && dRow <= 1 && dCol <= 1;
                  const pulseIndex =
                    (rowIdx - desktopBentoActive.row + 1) * 3 +
                    (cardIdx - desktopBentoActive.card + 1);
                  const isWide = desktopWideEnabled && colSpan === 2;
                  const isBlueTheme = isActive && card.theme === "blue";
                  return (
                    <button
                      key={`desktop-bento-${rowIdx}-${cardIdx}`}
                      type="button"
                      ref={isActive ? desktopBentoActivePanelRef : undefined}
                      className={`${styles.cluster4DesktopCard}${isWide ? ` ${styles.cluster4DesktopCardWide}` : ""}${isActive ? ` ${styles.cluster4DesktopCardAccent}` : ""}${isBlueTheme ? ` ${styles.cluster4CardThemeBlue}` : ""}${showOneTimePanelPulse && isPulseCandidate ? ` ${styles.cluster4DesktopCardInactive}` : ""}`}
                      style={
                        {
                          gridColumn: `span ${isWide ? 2 : 1}`,
                          ...(isPulseCandidate
                            ? { "--cluster4-pulse-delay": `${pulseIndex * 0.08}s` }
                            : {}),
                        } as CSSProperties
                      }
                      data-active={isActive ? "true" : undefined}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={card.label}
                      onClick={() => setDesktopBentoActive({ row: rowIdx, card: cardIdx })}
                    >
                      {isActive ? (
                        isWide ? (
                          <>
                            <Cluster4PanelMedia
                              cardId={card.id}
                              media={card.media}
                              wrapClassName={`${styles.cluster4PanelImage}${isBlueTheme ? ` ${styles.cluster4PanelImageThemeBlue}` : ""}`}
                              assetClassName={styles.cluster4PanelImageAsset}
                            />
                            <div className={styles.cluster4PanelTextWide}>
                              <p
                                className={styles.cluster4PanelBody}
                                style={
                                  card.textMaxChars
                                    ? ({ maxWidth: `${card.textMaxChars}ch` } as CSSProperties)
                                    : undefined
                                }
                              >
                                {card.body}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Cluster4PanelMedia
                              cardId={card.id}
                              media={card.media}
                              wrapClassName={`${styles.cluster4PanelImage}${isBlueTheme ? ` ${styles.cluster4PanelImageThemeBlue}` : ""}`}
                              assetClassName={styles.cluster4PanelImageAsset}
                            />
                            <div className={styles.cluster4PanelText}>
                              <p
                                className={styles.cluster4PanelBody}
                                style={
                                  card.textMaxChars
                                    ? ({ maxWidth: `${card.textMaxChars}ch` } as CSSProperties)
                                    : undefined
                                }
                              >
                                {card.body}
                              </p>
                            </div>
                          </>
                        )
                      ) : null}
                    </button>
                  );
                }),
              )}
            </div>
            {desktopGridCustomCursorEnabled ? (
              <div
                ref={desktopGridCursorWrapRef}
                className={styles.cluster4DesktopCursorWrap}
                style={
                  {
                    left: 0,
                    top: 0,
                    transform: "translate(-50%, -50%)",
                    opacity: desktopGridCursorVisible ? 1 : 0,
                  } as CSSProperties
                }
                aria-hidden
              >
                <div
                  className={styles.cluster4DesktopCursorBubble}
                  style={
                    {
                      backgroundColor: `rgba(255, 255, 255, ${DESKTOP_GRID_CURSOR_BG_ALPHA})`,
                    } as CSSProperties
                  }
                />
              </div>
            ) : null}
          </div>
          <div className={styles.cluster4MobileControls}>
            <button
              type="button"
              className={styles.cluster4AutoplayToggle}
              onClick={() => setCarouselAutoplayPaused((p) => !p)}
              aria-pressed={carouselAutoplayPaused}
              aria-label={
                carouselAutoplayPaused ? "Play carousel autoplay" : "Pause carousel autoplay"
              }
            >
              {carouselAutoplayPaused ? "play" : "pause"}
            </button>
            <div className={styles.cluster4MobileNav}>
              <button
                type="button"
                className={styles.cluster4MobileNavButton}
                onClick={() => stepMobileCarousel(-1)}
                aria-label="Previous card"
              >
                <img src="/svg/icons/arrow-left.svg" alt="" />
              </button>
              <button
                type="button"
                className={styles.cluster4MobileNavButton}
                onClick={() => stepMobileCarousel(1)}
                aria-label="Next card"
              >
                <img src="/svg/icons/arrow-right.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.row2Inner}>
          <p className={styles.row2Text}>
            Hello. Quam minus voluptas sint ea nulla a magni quia qui non maxime
            rem facere odit explicabo. Magni quaerat inventore hic maxime
            veniam. Culpa mollitia rerum rerum modi repellat. Id dolores eos
            excepturi. Perspiciatis vero nobis autem. Quam minus voluptas sint
            ea nulla a magni quia qui non maxime rem facere odit explicabo.
            Magni quaerat.
          </p>
        </div>
      </div>
    </section>
  );
}
