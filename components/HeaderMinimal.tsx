"use client";

import { useLayoutEffect, useRef } from "react";
import { HeaderProjectNav } from "./HeaderProjectNav";
import { HeaderNav } from "./HeaderNav";
import styles from "./HeaderMinimal.module.css";

const HEADER_HEIGHT_VAR = "--folio-header-height";

export function HeaderMinimal() {
  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const sync = () => {
      document.documentElement.style.setProperty(
        HEADER_HEIGHT_VAR,
        `${el.offsetHeight}px`,
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty(HEADER_HEIGHT_VAR);
    };
  }, []);

  return (
    <header ref={headerRef} className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <HeaderProjectNav />
        </div>
        <HeaderNav />
      </div>
      <div className={styles.bottomRule} aria-hidden />
    </header>
  );
}
