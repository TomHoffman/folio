"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { projects } from "@/data/projects";

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

function ProjectStatusPill({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute right-6 bottom-6 z-[1] inline-flex h-[48px] w-fit items-center gap-0 rounded-full bg-[rgba(255,255,255,0.2)] px-3 text-[13px] font-normal text-white md:right-[32px] md:bottom-[32px] md:gap-2 md:px-0 md:pl-[16px] md:pr-[19px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset from public */}
      <img
        src="/svg/lock.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
        aria-hidden
      />
      <span className="sr-only md:not-sr-only">{label}</span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group/card relative block aspect-square w-full overflow-hidden rounded-[24px] bg-[#16343F] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-masthead-dim)]"
    >
      {project.image ? (
        <Image
          src={project.image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] p-6 md:p-[32px]">
        <h2 className="text-2xl font-normal leading-tight text-white">
          {project.title}
        </h2>
        <p className="mt-0.5 text-base font-normal text-[#CDE0E8]">
          {project.industry}
        </p>
      </div>

      {project.status === "protected" ? (
        <ProjectStatusPill label="Password protected" />
      ) : null}

      {project.status === "coming-soon" ? (
        <ProjectStatusPill label="Coming soon" />
      ) : null}
    </Link>
  );
}

export function ProjectGrid() {
  const gridRef = useRef<HTMLUListElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [pointerProject, setPointerProject] = useState<Project | null>(null);
  const prevProjectSlugRef = useRef<string | null>(null);
  const [cursorCrossGeneration, setCursorCrossGeneration] = useState(0);

  useEffect(() => {
    const slug = pointerProject?.slug ?? null;
    const prev = prevProjectSlugRef.current;
    if (prev !== null && slug !== null && prev !== slug) {
      setCursorCrossGeneration((g) => g + 1);
    }
    prevProjectSlugRef.current = slug;
  }, [pointerProject?.slug]);

  const onGridMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
    setPointer({ x: e.clientX, y: e.clientY });
    const grid = gridRef.current;
    if (!grid) return;
    setPointerProject(findProjectUnderPointer(grid, e.clientX, e.clientY));
  };

  const onGridMouseLeave = () => {
    setPointerProject(null);
  };

  return (
    <>
      <ul
        ref={gridRef}
        className={`grid list-none grid-cols-1 gap-2 md:grid-cols-2 ${
          pointerProject
            ? "cursor-none [&_a]:cursor-none [&_img]:cursor-none"
            : ""
        }`}
        onMouseMove={onGridMouseMove}
        onMouseLeave={onGridMouseLeave}
      >
        {projects.map((project) => (
          <li key={project.slug} className="min-w-0">
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      <div
        className="pointer-events-none fixed z-[100] transition-opacity duration-300 ease-out"
        style={{
          left: pointer.x,
          top: pointer.y,
          transform: "translate(-50%, -50%)",
          opacity: pointerProject ? 1 : 0,
        }}
        aria-hidden
      >
        {pointerProject ? (
          <div
            key={cursorCrossGeneration}
            className="flex h-[120px] w-[120px] origin-center items-center justify-center rounded-full text-sm font-medium lowercase tracking-wide text-white shadow-lg"
            style={{
              backgroundColor: hexToRgba(
                pointerProject.cursorColor,
                CURSOR_BG_ALPHA,
              ),
              animation:
                cursorCrossGeneration > 0
                  ? "project-cursor-cross 0.5s ease-in-out"
                  : "none",
            }}
          >
            <span className="drop-shadow-sm">view</span>
          </div>
        ) : null}
      </div>
    </>
  );
}
