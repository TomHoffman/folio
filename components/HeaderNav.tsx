"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HeaderNav.module.css";

export function HeaderNav() {
  const pathname = usePathname();
  const homeActive = pathname === "/";

  return (
    <nav className={styles.nav} aria-label="Primary">
      <ul className={styles.list}>
        <li className={styles.item}>
          <Link
            href="/"
            className={`${styles.link} ${homeActive ? styles.linkActive : ""}`}
          >
            {homeActive ? <span className={styles.dot} aria-hidden /> : null}
            <span className={styles.label}>Home</span>
          </Link>
        </li>
        <li className={styles.item}>
          <span className={styles.staticItem}>About me</span>
        </li>
        <li className={styles.item}>
          <span className={styles.staticItem}>Contact</span>
        </li>
      </ul>
    </nav>
  );
}
