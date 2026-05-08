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
import projectGridStyles from "@/components/ProjectGrid.module.css";
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

const MOBILE_CARD_LABELS = Array.from(
  { length: 10 },
  (_, idx) => `card ${idx + 1}`,
);

/** Figma home-grid 5022:212081 — 5 rows × 8 tiles on a 10-column track (283px ≈ 1fr, 552px ≈ 2fr). */
const DESKTOP_BENTO_ROW_SPANS = [
  [1, 2, 1, 1, 2, 1, 1, 1],
  [1, 1, 2, 1, 2, 1, 1, 1],
  [1, 1, 1, 2, 1, 2, 1, 1],
  [1, 1, 2, 1, 2, 1, 1, 1],
  [1, 2, 1, 1, 1, 2, 1, 1],
] as const;

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

  const [mobileCarouselCards, setMobileCarouselCards] =
    useState(MOBILE_CARD_LABELS);

  const mobileCarouselTrackCards = useMemo(() => {
    const first = mobileCarouselCards[0];
    const last = mobileCarouselCards[mobileCarouselCards.length - 1];
    return [last, ...mobileCarouselCards, first];
  }, [mobileCarouselCards]);

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
    setMobileCarouselCards(shuffleArray(MOBILE_CARD_LABELS));
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
      const idealTx = vw / 2 - acx;

      const cluster2El = cluster2Ref.current;
      const vpRect = vp.getBoundingClientRect();
      const activeHalfH = activeEl.offsetHeight / 2;
      const activeBottomInner = acy + activeHalfH;

      let idealTy: number;
      if (cluster2El) {
        const c2Bottom = cluster2El.getBoundingClientRect().bottom;
        idealTy = c2Bottom - vpRect.top - activeBottomInner;
      } else {
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
  }, [mobileCarouselCards, desktopBentoActive.row, desktopBentoActive.card]);

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

  useEffect(() => {
    const CAROUSEL_AUTOPLAY_MS = 3500;
    const mq = window.matchMedia("(max-width: 1023px)");
    let intervalId: ReturnType<typeof setInterval> | undefined;

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
                <p className={styles.locationPrimary}>Based in London</p>
                <p className={styles.locationSecondary}>Working globally</p>
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
            <div className={styles.cluster4MobileViewport}>
              <div
                className={styles.cluster4MobileTrack}
                style={
                  {
                    "--carousel-count": mobileCarouselTrackCards.length,
                    "--carousel-index": mobileCluster4TrackIndex,
                  } as CSSProperties
                }
                data-animate={mobileCluster4Animate ? "true" : "false"}
                onTransitionEnd={onMobileCarouselTrackTransitionEnd}
              >
                {mobileCarouselTrackCards.map((label, idx) => (
                  <div key={`track-card-${idx}`} className={styles.cluster4MobileCard}>
                    {label}
                  </div>
                ))}
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
                  const label =
                    mobileCarouselCards[flatIdx % mobileCarouselCards.length] ?? "";
                  const isActive =
                    rowIdx === desktopBentoActive.row &&
                    cardIdx === desktopBentoActive.card;
                  return (
                    <button
                      key={`desktop-bento-${rowIdx}-${cardIdx}`}
                      type="button"
                      ref={isActive ? desktopBentoActivePanelRef : undefined}
                      className={`${styles.cluster4DesktopCard}${isActive ? ` ${styles.cluster4DesktopCardAccent}` : ""}`}
                      style={{ gridColumn: `span ${colSpan}` }}
                      data-active={isActive ? "true" : undefined}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={label}
                      onClick={() => setDesktopBentoActive({ row: rowIdx, card: cardIdx })}
                    >
                      {isActive ? (
                        <span className={styles.cluster4DesktopCardLabel} aria-hidden>
                          {label}
                        </span>
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
