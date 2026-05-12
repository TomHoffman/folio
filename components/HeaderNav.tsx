"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HeaderNav.module.css";

/** Same as `HeaderMinimal` work-project template — drives nav padding without `header[data-work-template]` timing. */
function isWorkProjectTemplatePath(pathname: string) {
  return /^\/work\/[^/]+/.test(pathname);
}

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
  const workProjectTemplate = isWorkProjectTemplatePath(pathname);

  return (
    <nav
      className={[styles.nav, workProjectTemplate ? styles.navWorkProject : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label="Primary"
    >
      <ul className={styles.list}>
        {workProjectTemplate ? (
          <li className={styles.item}>
            <Link href="/" className={styles.link}>
              <span className={styles.label}>Back</span>
            </Link>
          </li>
        ) : (
          <>
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
          </>
        )}
      </ul>
    </nav>
  );
}
