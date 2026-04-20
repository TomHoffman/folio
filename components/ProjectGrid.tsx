"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Project } from "@/data/projects";
import { projectAssetSrc, visibleProjects } from "@/data/projects";
import {
  type SectionHeadingIndicatorColor,
  sectionHeadingIndicatorStyle,
} from "@/lib/sectionHeadingIndicator";
import sectionHeadingStyles from "./SectionHeading.module.css";
import styles from "./ProjectGrid.module.css";

/** Custom “view” bubble — only real mouse/trackpad UIs; never on touch-first devices. */
function shouldEnableCustomCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** Half of the 8px grid gap — expands hit areas so the cursor doesn’t drop in gutters. */
const GUTTER_HIT_PAD = 4;

const CURSOR_BG_ALPHA = 0.9;

/** Nudge the bubble slightly from the hotspot; hit-testing still uses the real pointer. */
const CURSOR_VISUAL_OFFSET_X = 6;
const CURSOR_VISUAL_OFFSET_Y = 6;

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function findProjectUnderPointer(
  grid: HTMLElement,
  clientX: number,
  clientY: number,
): Project | null {
  let best: { project: Project; dist: number } | null = null;

  for (const li of grid.querySelectorAll(":scope > li")) {
    const hit = li.querySelector("[data-project-slug]");
    if (!(hit instanceof HTMLElement)) continue;
    const slug = hit.dataset.projectSlug;
    const project = visibleProjects.find((p) => p.slug === slug);
    if (!project) continue;

    const r = hit.getBoundingClientRect();
    const left = r.left - GUTTER_HIT_PAD;
    const right = r.right + GUTTER_HIT_PAD;
    const top = r.top - GUTTER_HIT_PAD;
    const bottom = r.bottom + GUTTER_HIT_PAD;

    if (
      clientX >= left &&
      clientX <= right &&
      clientY >= top &&
      clientY <= bottom
    ) {
      const cx = (r.left + r.right) / 2;
      const cy = (r.top + r.bottom) / 2;
      const dist = (clientX - cx) ** 2 + (clientY - cy) ** 2;
      if (!best || dist < best.dist) {
        best = { project, dist };
      }
    }
  }

  return best?.project ?? null;
}

function ProjectStatusPill({
  label,
  iconSrc = "/svg/icons/lock.svg",
}: {
  label: string;
  iconSrc?: string;
}) {
  return (
    <div className={styles.statusPill}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset from public */}
      <img
        src={iconSrc}
        alt=""
        width={24}
        height={24}
        className={styles.statusIcon}
        aria-hidden
      />
      <span className="sr-only sr-only-md-inline">{label}</span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cardInner = (
    <>
      {project.image ? (
        <Image
          src={projectAssetSrc(project.image, project.assetVersion)}
          alt=""
          fill
          className={
            project.cardImageMobileOffsetY != null ||
            project.cardImageMobileScale != null ||
            project.cardImageDesktopScale != null
              ? `${styles.cardImage} ${styles.cardImageMobileOffset}`
              : styles.cardImage
          }
          style={
            project.cardImageMobileOffsetY != null ||
            project.cardImageMobileScale != null ||
            project.cardImageDesktopScale != null
              ? ({
                  ...(project.cardImageMobileOffsetY != null
                    ? {
                        ["--card-img-offset-y" as string]: `${project.cardImageMobileOffsetY}px`,
                      }
                    : {}),
                  ...(project.cardImageMobileScale != null
                    ? {
                        ["--card-img-scale-mobile" as string]: String(
                          project.cardImageMobileScale,
                        ),
                      }
                    : {}),
                  ...(project.cardImageDesktopScale != null
                    ? {
                        ["--card-img-scale-desktop" as string]: String(
                          project.cardImageDesktopScale,
                        ),
                      }
                    : {}),
                } as CSSProperties)
              : undefined
          }
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      ) : null}

      <div
        className={styles.cardGradient}
        style={
          project.cardBottomGradient
            ? { background: project.cardBottomGradient }
            : undefined
        }
        aria-hidden
      />

      <div className={styles.cardOverlay}>
        <h2 className={styles.cardTitle}>{project.title}</h2>
        <p className={styles.cardIndustry}>{project.industry}</p>
      </div>

      {project.status === "protected" ? (
        <ProjectStatusPill label="Password protected" />
      ) : null}

      {project.status === "coming-soon" ? (
        <ProjectStatusPill label="Coming soon" iconSrc="/svg/icons/calendar.svg" />
      ) : null}
    </>
  );

  const href =
    project.status === "protected"
      ? `/work/${project.slug}/access`
      : `/work/${project.slug}`;
  const ariaLabel =
    project.status === "protected"
      ? `${project.title} — password protected`
      : project.status === "coming-soon"
        ? `${project.title} — coming soon`
        : undefined;

  return (
    <Link
      href={href}
      className={styles.card}
      data-project-slug={project.slug}
      aria-label={ariaLabel}
    >
      {cardInner}
    </Link>
  );
}

export type ProjectGridProps = {
  /** Shown above the project cards when `showTitle` is true and this is non-empty. */
  title?: string;
  /** Set `false` to hide the visible title. Default `true`. */
  showTitle?: boolean;
  /** Dot before the title; token from `globals.css`. Default `orange`. */
  indicatorColor?: SectionHeadingIndicatorColor;
};

export function ProjectGrid({
  title,
  showTitle = true,
  indicatorColor = "orange",
}: ProjectGridProps = {}) {
  const visibleTitle = showTitle && Boolean(title?.trim());

  const gridRef = useRef<HTMLUListElement>(null);
  const cursorWrapRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const pointerInGridRef = useRef(false);

  const [pointerProject, setPointerProject] = useState<Project | null>(null);
  const pointerSlugRef = useRef<string | null>(null);
  const [cursorCrossGeneration, setCursorCrossGeneration] = useState(0);
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setCustomCursorEnabled(shouldEnableCustomCursor());
    sync();
    const queries = [
      "(pointer: coarse)",
      "(hover: none)",
      "(pointer: fine)",
    ];
    const mqs = queries.map((q) => window.matchMedia(q));
    const onChange = () => sync();
    mqs.forEach((mq) => mq.addEventListener("change", onChange));
    return () =>
      mqs.forEach((mq) => mq.removeEventListener("change", onChange));
  }, []);

  const commitPointerUpdate = useCallback((clientX: number, clientY: number) => {
    lastPointerRef.current = { x: clientX, y: clientY };
    const wrap = cursorWrapRef.current;
    if (wrap) {
      wrap.style.left = `${clientX + CURSOR_VISUAL_OFFSET_X}px`;
      wrap.style.top = `${clientY + CURSOR_VISUAL_OFFSET_Y}px`;
    }
    const grid = gridRef.current;
    if (!grid) return;
    const project = findProjectUnderPointer(grid, clientX, clientY);
    const nextSlug = project?.slug ?? null;
    const prevTracked = pointerSlugRef.current;
    if (
      prevTracked !== null &&
      nextSlug !== null &&
      prevTracked !== nextSlug
    ) {
      setCursorCrossGeneration((g) => g + 1);
    }
    pointerSlugRef.current = nextSlug;
    setPointerProject((prev) => {
      const prevSlug = prev?.slug ?? null;
      if (prevSlug === nextSlug) return prev;
      return project;
    });
  }, []);

  useEffect(() => {
    if (!customCursorEnabled) return;
    const onScroll = () => {
      if (!pointerInGridRef.current) return;
      const { x, y } = lastPointerRef.current;
      commitPointerUpdate(x, y);
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [commitPointerUpdate, customCursorEnabled]);

  const onGridMouseEnter = () => {
    pointerInGridRef.current = true;
  };

  const onGridMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
    commitPointerUpdate(e.clientX, e.clientY);
  };

  const onGridMouseLeave = () => {
    pointerInGridRef.current = false;
    pointerSlugRef.current = null;
    setPointerProject(null);
  };

  const gridClass = [
    styles.grid,
    customCursorEnabled && pointerProject ? styles.gridCursorHide : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id="project-grid"
      className={`${styles.pageInset} ${styles.scrollAnchor}`}
    >
      {visibleTitle ? (
        <h2
          id="project-grid-title"
          className={sectionHeadingStyles.heading}
          style={sectionHeadingIndicatorStyle(indicatorColor)}
        >
          {title?.trim()}
        </h2>
      ) : (
        <h2 id="project-grid-title" className="sr-only">
          Projects
        </h2>
      )}
      <ul
        ref={gridRef}
        className={gridClass}
        aria-labelledby="project-grid-title"
        onMouseEnter={customCursorEnabled ? onGridMouseEnter : undefined}
        onMouseMove={customCursorEnabled ? onGridMouseMove : undefined}
        onMouseLeave={customCursorEnabled ? onGridMouseLeave : undefined}
      >
        {visibleProjects.map((project) => (
          <li key={project.slug} className={styles.gridItem}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      {customCursorEnabled ? (
        <div
          ref={cursorWrapRef}
          className={styles.cursorWrap}
          style={{
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            opacity: pointerProject ? 1 : 0,
            display: pointerProject ? "block" : "none",
          }}
          aria-hidden
        >
          {pointerProject ? (
            <div
              key={cursorCrossGeneration}
              className={`${styles.cursorBubble} ${
                pointerProject.cursorTextColor ? "" : styles.cursorBubbleTextLight
              }`}
              style={{
                backgroundColor: hexToRgba(
                  pointerProject.cursorColor,
                  CURSOR_BG_ALPHA,
                ),
                color: pointerProject.cursorTextColor ?? undefined,
                animation:
                  cursorCrossGeneration > 0
                    ? "project-cursor-cross 0.5s ease-in-out"
                    : "none",
              }}
            >
              <span
                className={
                  pointerProject.cursorTextColor ? "" : styles.cursorLabel
                }
              >
                view
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
