"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HeaderNav.module.css";

const PROJECT_GRID_ID = "project-grid";

function isProjectsRoute(pathname: string) {
  return pathname === "/work" || pathname.startsWith("/work/");
}

export function HeaderNav() {
  const pathname = usePathname();
  const homeActive = pathname === "/";
  const projectsActive = isProjectsRoute(pathname);

  return (
    <nav className={styles.nav} aria-label="Primary">
      <ul className={styles.list}>
        <li className={styles.item}>
          <Link
            href="/"
            className={`${styles.link} ${homeActive ? styles.linkActive : ""}`}
          >
            {homeActive ? <span className={styles.dot} aria-hidden /> : null}
            <span className={styles.label}>About</span>
          </Link>
        </li>
        <li className={styles.item}>
          {homeActive ? (
            <a
              href={`#${PROJECT_GRID_ID}`}
              className={`${styles.staticItem} ${styles.projectsJump}`}
            >
              <span className={styles.label}>Projects</span>
            </a>
          ) : (
            <span
              className={`${styles.staticItem} ${projectsActive ? styles.linkActive : ""}`}
            >
              {projectsActive ? <span className={styles.dot} aria-hidden /> : null}
              <span className={styles.label}>Projects</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
