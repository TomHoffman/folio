"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
const SAFETY_DIM_GROUP_IDS = [
  "Widget Right (120mm)",
  "Boat-marker",
  "chart controls",
  "Settings",
  "Time",
] as const;
const SPLIT_SCREEN_GROUP_ID = "split screen";
const WARNINGS_ACTIVE_GROUP_ID = "warnings active";
const NORTH_UP_VIEW_GROUP_IDS = ["north-up-view", "north-up-view "] as const;
const SAFETY_HIDE_GROUP_ID = "Widget Left 120mm";
const SAFETY_SHOW_GROUP_IDS = [
  "Warning widget",
  WARNINGS_ACTIVE_GROUP_ID,
] as const;
const WARNINGS_ACTIVE_PARKED_OFFSET_Y = 120;
const WARNINGS_ACTIVE_PARKED_SCALE = 0.5;
const WARNINGS_ACTIVE_DURATION_RATIO = 0.65;
const NORTH_UP_POINTER_ROTATION_DEG = -64;

function layerOpacity(activeIndex: number, layer: 0 | 1 | 2): number {
  if (activeIndex <= 0) return layer === 0 ? 1 : 0;
  if (activeIndex === 1) return layer === 1 ? 1 : 0;
  return layer === 2 ? 1 : 0;
}

function parseTranslateFromSvgAttribute(
  raw: string | null,
): { x: number; y: number } | null {
  if (!raw) return null;
  const match = raw.match(
    /translate\(\s*(-?\d*\.?\d+)(?:[\s,]+(-?\d*\.?\d+))?\s*\)/i,
  );
  if (!match) return null;
  const x = Number(match[1]);
  const y = match[2] !== undefined ? Number(match[2]) : 0;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function parseOpacityFromSvgAttribute(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
}

function parseTranslateScaleFromSvgAttribute(raw: string | null): {
  x: number;
  y: number;
  scale: number;
} | null {
  if (!raw) return null;
  const translateMatch = raw.match(
    /translate\(\s*(-?\d*\.?\d+)(?:[\s,]+(-?\d*\.?\d+))?\s*\)/i,
  );
  const scaleMatch = raw.match(/scale\(\s*(-?\d*\.?\d+)\s*\)/i);
  if (!translateMatch && !scaleMatch) return null;
  const x = translateMatch ? Number(translateMatch[1]) : 0;
  const y = translateMatch && translateMatch[2] !== undefined ? Number(translateMatch[2]) : 0;
  const scale = scaleMatch ? Number(scaleMatch[1]) : 1;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(scale)) {
    return null;
  }
  return { x, y, scale };
}

function parseRotateDegFromCssTransform(raw: string | null): number | null {
  if (!raw) return null;
  const match = raw.match(/rotate\(\s*(-?\d*\.?\d+)deg\s*\)/i);
  if (!match) return null;
  const deg = Number(match[1]);
  if (!Number.isFinite(deg)) return null;
  return deg;
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
  const chartGraphicRef = useRef<HTMLDivElement | null>(null);
  const chartMotionRafRef = useRef<number | null>(null);
  const chartMotionDelayTimeoutRef = useRef<number | null>(null);
  const chartModeSwitchRafRef = useRef<number | null>(null);
  const previousActiveIndexRef = useRef(0);
  const splitLayoutByModeRef = useRef<Record<ChartSvgMode, boolean>>({
    wireframe: false,
    ui: false,
  });
  const groupOpacityByModeRef = useRef<Record<ChartSvgMode, Record<string, number>>>({
    wireframe: {},
    ui: {},
  });
  const warningActiveTransformByModeRef = useRef<
    Record<ChartSvgMode, { x: number; y: number; scale: number }>
  >({
    wireframe: { x: 0, y: WARNINGS_ACTIVE_PARKED_OFFSET_Y, scale: WARNINGS_ACTIVE_PARKED_SCALE },
    ui: { x: 0, y: WARNINGS_ACTIVE_PARKED_OFFSET_Y, scale: WARNINGS_ACTIVE_PARKED_SCALE },
  });
  const pointerRotationByModeRef = useRef<Record<ChartSvgMode, number>>({
    wireframe: 0,
    ui: 0,
  });
  const boatMarkerPositionRef = useRef<Record<ChartSvgMode, { x: number; y: number }>>({
    wireframe: { x: 0, y: 0 },
    ui: { x: 0, y: 0 },
  });
  const splitScreenPositionRef = useRef<Record<ChartSvgMode, number>>({
    wireframe: -470,
    ui: -470,
  });
  const settingsPositionRef = useRef<Record<ChartSvgMode, number>>({
    wireframe: 0,
    ui: 0,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [illustrationSvg, setIllustrationSvg] = useState<string | null>(null);
  const [illustrationEndSvg, setIllustrationEndSvg] = useState<string | null>(
    null,
  );
  const [inlineWireMarkup, setInlineWireMarkup] = useState<string | null>(null);
  const [inlineUiMarkup, setInlineUiMarkup] = useState<string | null>(null);
  const [chartSvgMode, setChartSvgMode] = useState<ChartSvgMode>("wireframe");
  const [isChartWiping, setIsChartWiping] = useState(false);
  const isDemoSquare = visualVariant === "demo-square";
  const isEmptyVisual = visualVariant === "empty";
  const wireSrc = inlineSvgSrc?.trim() ?? "";
  const uiSrc = inlineSvgUiSrc?.trim() ?? "";
  const hasChartViewToggle = Boolean(wireSrc && uiSrc);
  const wireHasMotionTargets = useMemo(
    () => /id="(?:Boat-marker|split screen|Settings)"/.test(inlineWireMarkup ?? ""),
    [inlineWireMarkup],
  );
  const uiHasMotionTargets = useMemo(
    () => /id="(?:Boat-marker|split screen|Settings)"/.test(inlineUiMarkup ?? ""),
    [inlineUiMarkup],
  );

  useEffect(() => {
    if (!uiSrc) {
      setChartSvgMode("wireframe");
      setIsChartWiping(false);
    }
  }, [uiSrc]);

  useEffect(() => {
    if (!hasChartViewToggle || !isChartWiping) return;
    const timeout = window.setTimeout(() => {
      setIsChartWiping(false);
    }, 950);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [hasChartViewToggle, isChartWiping, chartSvgMode]);

  useEffect(() => {
    return () => {
      if (chartModeSwitchRafRef.current !== null) {
        cancelAnimationFrame(chartModeSwitchRafRef.current);
        chartModeSwitchRafRef.current = null;
      }
    };
  }, []);

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

  useEffect(() => {
    if (!wireSrc) return;
    const mode: ChartSvgMode = chartSvgMode;
    const previousActiveIndex = previousActiveIndexRef.current;
    previousActiveIndexRef.current = activeIndex;
    if ((mode === "wireframe" && !wireHasMotionTargets) || (mode === "ui" && !uiHasMotionTargets)) {
      return;
    }
    const root = chartGraphicRef.current;
    if (!root) return;

    if (chartMotionRafRef.current !== null) {
      cancelAnimationFrame(chartMotionRafRef.current);
      chartMotionRafRef.current = null;
    }

    const layerSelector = hasChartViewToggle
      ? chartSvgMode === "ui"
        ? `.${styles.wipeLayerUi}`
        : `.${styles.wipeLayerBase}`
      : "";
    const layerRoot = layerSelector
      ? (root.querySelector(layerSelector) ?? root)
      : root;

    const markers = layerRoot.querySelectorAll<SVGGElement>('[id="Boat-marker"]');
    const splitScreens = layerRoot.querySelectorAll<SVGGElement>('[id="split screen"]');
    const settings = layerRoot.querySelectorAll<SVGGElement>('[id="Settings"]');
    const queryGroupsById = (id: string) =>
      layerRoot.querySelectorAll<SVGGElement>(`[id="${id}"]`);
    const safetyDimGroups = SAFETY_DIM_GROUP_IDS.map((id) => ({
      id,
      elements: queryGroupsById(id),
    }));
    const safetyHideGroups = {
      id: SAFETY_HIDE_GROUP_ID,
      elements: queryGroupsById(SAFETY_HIDE_GROUP_ID),
    };
    const safetyShowGroups = SAFETY_SHOW_GROUP_IDS.map((id) => ({
      id,
      elements: queryGroupsById(id),
    }));
    const northUpShowGroups = NORTH_UP_VIEW_GROUP_IDS.map((id) => ({
      id,
      elements: queryGroupsById(id),
    }));
    const splitScreenOpacityGroup = {
      id: SPLIT_SCREEN_GROUP_ID,
      elements: splitScreens,
    };
    const warningsActiveGroups = queryGroupsById(WARNINGS_ACTIVE_GROUP_ID);
    const pointerGroups = queryGroupsById("pointer");

    if (
      !markers.length &&
      !splitScreens.length &&
      !settings.length &&
      !safetyDimGroups.some((g) => g.elements.length) &&
      !safetyHideGroups.elements.length &&
      !safetyShowGroups.some((g) => g.elements.length) &&
      !northUpShowGroups.some((g) => g.elements.length) &&
      !warningsActiveGroups.length &&
      !pointerGroups.length
    ) {
      return;
    }

    // Calibrated from re-exported wires:
    // Split: full (464.5, 386) -> split (685.5, 414) => +221, +28
    // North up full: (464.5, 386) -> (464.5, 266) => +0, -120
    // North up split: (464.5, 386) -> (685.5, 279) => +221, -107
    const previousSplitLayout = splitLayoutByModeRef.current[mode];
    if (activeIndex === 0) splitLayoutByModeRef.current[mode] = false;
    if (activeIndex === 1) splitLayoutByModeRef.current[mode] = true;
    const splitLayoutContext = splitLayoutByModeRef.current[mode];
    const useSplitLayoutForSafety = activeIndex === 2 && splitLayoutContext;
    const useSplitLayoutForPanel = activeIndex === 1 || useSplitLayoutForSafety;
    const isSafetyState = activeIndex === 2;
    const isNorthUpState = activeIndex === 3;
    const isSafetyFromNorthUp =
      previousActiveIndex === 3 && activeIndex === 2;
    const to = isNorthUpState
      ? splitLayoutContext
        ? { x: 221, y: -107 }
        : { x: 0, y: -120 }
      : isSafetyFromNorthUp
        ? { ...boatMarkerPositionRef.current[mode] }
      : useSplitLayoutForPanel
        ? { x: 221, y: 28 }
        : { x: 0, y: 0 };
    const splitTo = isNorthUpState
      ? splitScreenPositionRef.current[mode]
      : useSplitLayoutForPanel
        ? 0
        : -470;
    // `Settings` x: 29 (full) -> 479 (split) from split-screen_wires.svg.
    const settingsTo = isNorthUpState
      ? settingsPositionRef.current[mode]
      : useSplitLayoutForPanel
        ? 450
        : 0;
    const opacityTargets = new Map<string, number>();
    SAFETY_DIM_GROUP_IDS.forEach((id) => {
      opacityTargets.set(id, isSafetyState ? 0.3 : 1);
    });
    // Keep split screen position fixed in Safety; only dim it when already in split layout.
    opacityTargets.set(
      SPLIT_SCREEN_GROUP_ID,
      isSafetyState && useSplitLayoutForPanel ? 0.3 : 1,
    );
    opacityTargets.set(
      SAFETY_HIDE_GROUP_ID,
      isSafetyState ? 0 : 1,
    );
    SAFETY_SHOW_GROUP_IDS.forEach((id) => {
      opacityTargets.set(id, isSafetyState ? 1 : 0);
    });
    NORTH_UP_VIEW_GROUP_IDS.forEach((id) => {
      opacityTargets.set(id, isNorthUpState ? 1 : 0);
    });
    const warningTransformTo = isSafetyState
      ? { x: 0, y: 0, scale: 1 }
      : {
          x: 0,
          y: WARNINGS_ACTIVE_PARKED_OFFSET_Y,
          scale: WARNINGS_ACTIVE_PARKED_SCALE,
        };
    const pointerRotationTo = isNorthUpState
      ? NORTH_UP_POINTER_ROTATION_DEG
      : isSafetyFromNorthUp
        ? pointerRotationByModeRef.current[mode]
        : 0;

    const opacityTracks = [
      ...safetyDimGroups,
      splitScreenOpacityGroup,
      safetyHideGroups,
      ...safetyShowGroups,
      ...northUpShowGroups,
    ]
      .filter((entry) => entry.elements.length)
      .map((entry) => {
        const first = entry.elements[0];
        const opacityFromDom = parseOpacityFromSvgAttribute(
          first?.getAttribute("opacity") ?? null,
        );
        const from = opacityFromDom ?? groupOpacityByModeRef.current[mode][entry.id] ?? 1;
        const toOpacity = opacityTargets.get(entry.id) ?? 1;
        return { id: entry.id, elements: entry.elements, from, to: toOpacity };
      });

    if (
      boatMarkerPositionRef.current[mode].x === to.x &&
      boatMarkerPositionRef.current[mode].y === to.y &&
      splitScreenPositionRef.current[mode] === splitTo &&
      settingsPositionRef.current[mode] === settingsTo &&
      Math.abs(
        warningActiveTransformByModeRef.current[mode].x - warningTransformTo.x,
      ) < 0.001 &&
      Math.abs(
        warningActiveTransformByModeRef.current[mode].y - warningTransformTo.y,
      ) < 0.001 &&
      Math.abs(
        warningActiveTransformByModeRef.current[mode].scale -
          warningTransformTo.scale,
      ) < 0.001 &&
      Math.abs(pointerRotationByModeRef.current[mode] - pointerRotationTo) < 0.001 &&
      opacityTracks.every(
        (track) =>
          Math.abs((groupOpacityByModeRef.current[mode][track.id] ?? track.from) - track.to) <
          0.001,
      )
    ) {
      markers.forEach((marker) => {
        marker.setAttribute("transform", `translate(${to.x} ${to.y})`);
      });
      splitScreens.forEach((group) => {
        group.setAttribute("transform", `translate(${splitTo} 0)`);
      });
      settings.forEach((group) => {
        group.setAttribute("transform", `translate(${settingsTo} 0)`);
      });
      opacityTracks.forEach((track) => {
        groupOpacityByModeRef.current[mode][track.id] = track.to;
        track.elements.forEach((el) => {
          el.setAttribute("opacity", String(track.to));
        });
      });
      warningsActiveGroups.forEach((group) => {
        group.style.transformBox = "fill-box";
        group.style.transformOrigin = "center";
        group.style.transform = `translateY(${warningTransformTo.y}px) scale(${warningTransformTo.scale})`;
      });
      pointerRotationByModeRef.current[mode] = pointerRotationTo;
      pointerGroups.forEach((group) => {
        group.style.transformBox = "fill-box";
        group.style.transformOrigin = "center";
        group.style.transform = `rotate(${pointerRotationTo}deg)`;
      });
      return;
    }

    const duration = mode === "ui" ? 820 : 900;
    const isReturningToFull = activeIndex !== 1;
    const startAnimation = () => {
      const markerFromDom = parseTranslateFromSvgAttribute(
        markers[0]?.getAttribute("transform") ?? null,
      );
      const splitFromDom = parseTranslateFromSvgAttribute(
        splitScreens[0]?.getAttribute("transform") ?? null,
      );
      const settingsFromDom = parseTranslateFromSvgAttribute(
        settings[0]?.getAttribute("transform") ?? null,
      );
      let from = markerFromDom ?? boatMarkerPositionRef.current[mode];
      let splitFrom = splitFromDom?.x ?? splitScreenPositionRef.current[mode];
      let settingsFrom = settingsFromDom?.x ?? settingsPositionRef.current[mode];
      const warningTransformFrom = warningActiveTransformByModeRef.current[mode];
      const pointerRotationFrom =
        parseRotateDegFromCssTransform(pointerGroups[0]?.style.transform ?? null) ??
        pointerRotationByModeRef.current[mode];
      const shouldLockAllPositionForSafety = isSafetyState;
      const shouldLockPanelPositionForSafetyToSplit =
        previousActiveIndex === 2 && activeIndex === 1 && previousSplitLayout;
      if (shouldLockAllPositionForSafety) {
        // Safety preserves full/split layout context without position tween.
        from = { x: to.x, y: to.y };
        splitFrom = splitTo;
        settingsFrom = settingsTo;
        markers.forEach((marker) => {
          marker.setAttribute("transform", `translate(${to.x} ${to.y})`);
        });
        splitScreens.forEach((group) => {
          group.setAttribute("transform", `translate(${splitTo} 0)`);
        });
        settings.forEach((group) => {
          group.setAttribute("transform", `translate(${settingsTo} 0)`);
        });
      } else if (shouldLockPanelPositionForSafetyToSplit) {
        // Safety -> split keeps panel layers fixed, but allows Boat-marker
        // to animate from North Up position back to split position.
        splitFrom = splitTo;
        settingsFrom = settingsTo;
        splitScreens.forEach((group) => {
          group.setAttribute("transform", `translate(${splitTo} 0)`);
        });
        settings.forEach((group) => {
          group.setAttribute("transform", `translate(${settingsTo} 0)`);
        });
      }
      const startedAt = performance.now();
      const step = (now: number) => {
        const elapsed = Math.max(0, now - startedAt);
        const t = Math.min(1, elapsed / duration);
        const warningT = Math.min(
          1,
          elapsed / Math.max(1, duration * WARNINGS_ACTIVE_DURATION_RATIO),
        );
        const eased =
          mode === "ui" || isReturningToFull
            ? 1 - Math.pow(1 - t, 3) // smooth ease-out for UI + split->full
            : 1 + 1.3 * Math.pow(t - 1, 3) + 0.3 * Math.pow(t - 1, 2); // subtle bounce only into split
        const warningEased = 1 - Math.pow(1 - warningT, 3);
        const x = from.x + (to.x - from.x) * eased;
        const y = from.y + (to.y - from.y) * eased;
        const splitX = splitFrom + (splitTo - splitFrom) * eased;
        const settingsX = settingsFrom + (settingsTo - settingsFrom) * eased;
        boatMarkerPositionRef.current[mode] = { x, y };
        splitScreenPositionRef.current[mode] = splitX;
        settingsPositionRef.current[mode] = settingsX;
        markers.forEach((marker) => {
          marker.setAttribute("transform", `translate(${x} ${y})`);
        });
        splitScreens.forEach((group) => {
          group.setAttribute("transform", `translate(${splitX} 0)`);
        });
        settings.forEach((group) => {
          group.setAttribute("transform", `translate(${settingsX} 0)`);
        });
        const warningX =
          warningTransformFrom.x +
          (warningTransformTo.x - warningTransformFrom.x) * warningEased;
        const warningY =
          warningTransformFrom.y +
          (warningTransformTo.y - warningTransformFrom.y) * warningEased;
        const warningScale =
          warningTransformFrom.scale +
          (warningTransformTo.scale - warningTransformFrom.scale) * warningEased;
        warningActiveTransformByModeRef.current[mode] = {
          x: warningX,
          y: warningY,
          scale: warningScale,
        };
        warningsActiveGroups.forEach((group) => {
          group.style.transformBox = "fill-box";
          group.style.transformOrigin = "center";
          group.style.transform = `translateY(${warningY}px) scale(${warningScale})`;
        });
        const pointerRotation =
          pointerRotationFrom +
          (pointerRotationTo - pointerRotationFrom) * eased;
        pointerRotationByModeRef.current[mode] = pointerRotation;
        pointerGroups.forEach((group) => {
          group.style.transformBox = "fill-box";
          group.style.transformOrigin = "center";
          group.style.transform = `rotate(${pointerRotation}deg)`;
        });
        opacityTracks.forEach((track) => {
          const trackEased =
            track.id === WARNINGS_ACTIVE_GROUP_ID ? warningEased : eased;
          const value = track.from + (track.to - track.from) * trackEased;
          groupOpacityByModeRef.current[mode][track.id] = value;
          track.elements.forEach((el) => {
            el.setAttribute("opacity", String(value));
          });
        });
        if (t < 1) {
          chartMotionRafRef.current = requestAnimationFrame(step);
        } else {
          boatMarkerPositionRef.current[mode] = { x: to.x, y: to.y };
          splitScreenPositionRef.current[mode] = splitTo;
          settingsPositionRef.current[mode] = settingsTo;
          markers.forEach((marker) => {
            marker.setAttribute("transform", `translate(${to.x} ${to.y})`);
          });
          splitScreens.forEach((group) => {
            group.setAttribute("transform", `translate(${splitTo} 0)`);
          });
          settings.forEach((group) => {
            group.setAttribute("transform", `translate(${settingsTo} 0)`);
          });
          warningActiveTransformByModeRef.current[mode] = warningTransformTo;
          warningsActiveGroups.forEach((group) => {
            group.style.transformBox = "fill-box";
            group.style.transformOrigin = "center";
            group.style.transform = `translateY(${warningTransformTo.y}px) scale(${warningTransformTo.scale})`;
          });
          pointerRotationByModeRef.current[mode] = pointerRotationTo;
          pointerGroups.forEach((group) => {
            group.style.transformBox = "fill-box";
            group.style.transformOrigin = "center";
            group.style.transform = `rotate(${pointerRotationTo}deg)`;
          });
          opacityTracks.forEach((track) => {
            groupOpacityByModeRef.current[mode][track.id] = track.to;
            track.elements.forEach((el) => {
              el.setAttribute("opacity", String(track.to));
            });
          });
          chartMotionRafRef.current = null;
        }
      };
      chartMotionRafRef.current = requestAnimationFrame(step);
    };

    if (chartMotionDelayTimeoutRef.current !== null) {
      window.clearTimeout(chartMotionDelayTimeoutRef.current);
      chartMotionDelayTimeoutRef.current = null;
    }
    startAnimation();

    return () => {
      if (chartMotionDelayTimeoutRef.current !== null) {
        window.clearTimeout(chartMotionDelayTimeoutRef.current);
        chartMotionDelayTimeoutRef.current = null;
      }
      if (chartMotionRafRef.current !== null) {
        cancelAnimationFrame(chartMotionRafRef.current);
        chartMotionRafRef.current = null;
      }
    };
  }, [
    activeIndex,
    wireSrc,
    inlineWireMarkup,
    inlineUiMarkup,
    wireHasMotionTargets,
    uiHasMotionTargets,
    hasChartViewToggle,
    chartSvgMode,
    styles.wipeLayerBase,
    styles.wipeLayerUi,
  ]);

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
  const handleChartModeChange = (nextMode: ChartSvgMode) => {
    if (nextMode === chartSvgMode) return;
    setIsChartWiping(true);
    if (chartModeSwitchRafRef.current !== null) {
      cancelAnimationFrame(chartModeSwitchRafRef.current);
    }
    // Wait one frame so the hidden layer is mounted before mode flip,
    // allowing clip-path transition to interpolate wireframe -> UI.
    chartModeSwitchRafRef.current = requestAnimationFrame(() => {
      setChartSvgMode(nextMode);
      chartModeSwitchRafRef.current = null;
    });
  };

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
                  <div className={styles.imageContainerGraphic} ref={chartGraphicRef}>
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
                            className={`${styles.inlineWireRoot} ${styles.wipeLayerBase} ${!isChartWiping && chartSvgMode === "ui" ? styles.wipeLayerHidden : ""}`}
                            aria-hidden={chartSvgMode === "ui"}
                            data-focus-active-index={activeIndex}
                            dangerouslySetInnerHTML={{
                              __html: inlineWireMarkup,
                            }}
                          />
                          <div
                            className={`${styles.inlineWireRoot} ${styles.wipeLayerUi} ${chartSvgMode === "ui" ? styles.wipeLayerUiVisible : ""} ${!isChartWiping && chartSvgMode === "wireframe" ? styles.wipeLayerHidden : ""}`}
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
                          onClick={() => handleChartModeChange("wireframe")}
                        >
                          Wireframe
                        </button>
                        <button
                          type="button"
                          className={styles.viewToggleBtn}
                          aria-pressed={chartSvgMode === "ui"}
                          onClick={() => handleChartModeChange("ui")}
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
