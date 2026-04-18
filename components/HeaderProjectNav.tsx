"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { visibleProjects } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import styles from "./HeaderMinimal.module.css";

/** Project detail or nested routes under `/work/:slug` (not `/work` index). */
const WORK_SLUG = /^\/work\/([^/]+)/;

function workSlugFromPath(pathname: string): string | null {
  const m = pathname.match(WORK_SLUG);
  return m?.[1] ?? null;
}

function ArrowPrev() {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M27 16H5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7L5 16L14 25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowNext() {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 16H27"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 7L27 16L18 25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeaderProjectNav() {
  const pathname = usePathname();
  const slug = workSlugFromPath(pathname);
  if (!slug) return null;

  const idx = visibleProjects.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;

  const prev = idx > 0 ? visibleProjects[idx - 1] : null;
  const next = idx < visibleProjects.length - 1 ? visibleProjects[idx + 1] : null;

  return (
    <nav className={styles.projectNav} aria-label="Adjacent projects">
      {prev ? (
        <Link
          href={`/work/${prev.slug}`}
          className={`${styles.headerBack} ${enterStyles.enterBack}`}
          aria-label={`Previous project: ${prev.title}`}
        >
          <ArrowPrev />
        </Link>
      ) : (
        <span
          className={`${styles.headerBack} ${styles.headerBackDisabled}`}
          aria-disabled="true"
          aria-label="Previous project (none)"
        >
          <ArrowPrev />
        </span>
      )}
      {next ? (
        <Link
          href={`/work/${next.slug}`}
          className={`${styles.headerBack} ${enterStyles.enterBack}`}
          aria-label={`Next project: ${next.title}`}
        >
          <ArrowNext />
        </Link>
      ) : (
        <span
          className={`${styles.headerBack} ${styles.headerBackDisabled}`}
          aria-disabled="true"
          aria-label="Next project (none)"
        >
          <ArrowNext />
        </span>
      )}
    </nav>
  );
}
