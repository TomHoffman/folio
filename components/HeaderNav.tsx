"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HeaderNav.module.css";

function isProjectsRoute(pathname: string) {
  return (
    pathname === "/projects" ||
    pathname === "/work" ||
    pathname.startsWith("/work/")
  );
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
          <Link
            href="/projects"
            className={`${styles.link} ${projectsActive ? styles.linkActive : ""}`}
          >
            {projectsActive ? <span className={styles.dot} aria-hidden /> : null}
            <span className={styles.label}>Projects</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
