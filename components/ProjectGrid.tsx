"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { projects } from "@/data/projects";
import styles from "./ProjectGrid.module.css";

/** Half of the 8px grid gap — expands hit areas so the cursor doesn’t drop in gutters. */
const GUTTER_HIT_PAD = 4;

const CURSOR_BG_ALPHA = 0.9;

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
    const link = li.querySelector("a[href^='/work/']");
    if (!(link instanceof HTMLAnchorElement)) continue;
    const slug = link.getAttribute("href")?.replace("/work/", "");
    const project = projects.find((p) => p.slug === slug);
    if (!project) continue;

    const r = link.getBoundingClientRect();
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
  iconSrc = "/svg/lock.svg",
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
  return (
    <Link
      href={`/work/${project.slug}`}
      className={styles.card}
    >
      {project.image ? (
        <Image
          src={project.image}
          alt=""
          fill
          className={styles.cardImage}
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      ) : null}

      <div className={styles.cardOverlay}>
        <h2 className={styles.cardTitle}>{project.title}</h2>
        <p className={styles.cardIndustry}>{project.industry}</p>
      </div>

      {project.status === "protected" ? (
        <ProjectStatusPill label="Password protected" />
      ) : null}

      {project.status === "coming-soon" ? (
        <ProjectStatusPill label="Coming soon" iconSrc="/svg/calendar.svg" />
      ) : null}
    </Link>
  );
}

export function ProjectGrid() {
  const gridRef = useRef<HTMLUListElement>(null);
  const cursorWrapRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [pointerProject, setPointerProject] = useState<Project | null>(null);
  const pointerSlugRef = useRef<string | null>(null);
  const [cursorCrossGeneration, setCursorCrossGeneration] = useState(0);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const flushPointerFrame = () => {
    rafRef.current = null;
    const { x, y } = lastPointerRef.current;
    const wrap = cursorWrapRef.current;
    if (wrap) {
      wrap.style.left = `${x}px`;
      wrap.style.top = `${y}px`;
    }
    const grid = gridRef.current;
    if (!grid) return;
    const project = findProjectUnderPointer(grid, x, y);
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
  };

  const onGridMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(flushPointerFrame);
    }
  };

  const onGridMouseLeave = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pointerSlugRef.current = null;
    setPointerProject(null);
  };

  const gridClass = [
    styles.grid,
    pointerProject ? styles.gridCursorHide : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <ul
        ref={gridRef}
        className={gridClass}
        onMouseMove={onGridMouseMove}
        onMouseLeave={onGridMouseLeave}
      >
        {projects.map((project) => (
          <li key={project.slug} className={styles.gridItem}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      <div
        ref={cursorWrapRef}
        className={styles.cursorWrap}
        style={{
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%)",
          opacity: pointerProject ? 1 : 0,
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
    </>
  );
}
