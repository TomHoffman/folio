"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HeaderMasthead } from "./HeaderMasthead";
import { HeaderProjectNav } from "./HeaderProjectNav";
import { HeaderNav } from "./HeaderNav";
import { isHomeHeroPath } from "@/lib/routes";
import styles from "./HeaderMinimal.module.css";

/** `/work/:slug` and nested routes (e.g. access gate), not `/work` index. */
function isWorkProjectTemplatePath(pathname: string) {
  return /^\/work\/[^/]+/.test(pathname);
}

/** Scroll-based hide/show for work project header — mobile only (tablet+ stays fixed + visible). */
const PROJECT_HEADER_SCROLL_MQ = "(max-width: 767px)";

export function HeaderMinimal() {
  const pathname = usePathname();
  const workProjectTemplate = isWorkProjectTemplatePath(pathname);
  const headerRef = useRef<HTMLElement | null>(null);
  const lastScrollYRef = useRef(0);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");

  const homeOrProjectsHeaderBand =
    isHomeHeroPath(pathname) || pathname === "/projects";
  const showHeaderPrimaryNav = !isHomeHeroPath(pathname);

  useLayoutEffect(() => {
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
    setScrollDir("up");
  }, [pathname, workProjectTemplate]);

  useEffect(() => {
    if (!workProjectTemplate) return;

    const mq = window.matchMedia(PROJECT_HEADER_SCROLL_MQ);

    const applyScrollDirFromWindow = () => {
      if (!mq.matches) return;
      const header = headerRef.current;
      if (!header) return;
      const current = window.scrollY || 0;
      if (current <= 0) {
        setScrollDir("up");
        lastScrollYRef.current = 0;
        return;
      }
      if (current === lastScrollYRef.current) return;
      const rawDir: "up" | "down" = current < lastScrollYRef.current ? "up" : "down";
      let visDir: "up" | "down" = rawDir;
      if (visDir === "down" && current < Math.max(1, header.offsetHeight)) {
        visDir = "up";
      }
      setScrollDir(visDir);
      lastScrollYRef.current = current;
    };

    const onMqChange = () => {
      if (!mq.matches) {
        setScrollDir("up");
      }
      applyScrollDirFromWindow();
    };

    mq.addEventListener("change", onMqChange);
    window.addEventListener("scroll", applyScrollDirFromWindow, { passive: true });
    applyScrollDirFromWindow();

    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("scroll", applyScrollDirFromWindow);
    };
  }, [workProjectTemplate]);

  const headerContent = (
    <div
      className={[
        styles.inner,
        workProjectTemplate ? styles.innerWorkProject : "",
        !workProjectTemplate && homeOrProjectsHeaderBand
          ? styles.innerHomeProjectsNav
          : "",
        !workProjectTemplate && isHomeHeroPath(pathname) ? styles.innerHomeNoNav : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-header-nav-row
    >
      <div className={styles.lead}>
        <HeaderProjectNav />
      </div>
      {showHeaderPrimaryNav ? <HeaderNav /> : null}
    </div>
  );

  return (
    <header
      ref={headerRef}
      id="main-header"
      className={styles.root}
      data-dir={workProjectTemplate ? scrollDir : "up"}
      data-work-template={workProjectTemplate ? "project" : undefined}
    >
      <HeaderMasthead />
      {headerContent}
    </header>
  );
}
