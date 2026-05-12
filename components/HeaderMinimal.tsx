"use client";

import { usePathname } from "next/navigation";
import { HeaderMasthead } from "./HeaderMasthead";
import { HeaderProjectNav } from "./HeaderProjectNav";
import { HeaderNav } from "./HeaderNav";
import styles from "./HeaderMinimal.module.css";

/** `/work/:slug` and nested routes (e.g. access gate), not `/work` index. */
function isWorkProjectTemplatePath(pathname: string) {
  return /^\/work\/[^/]+/.test(pathname);
}

export function HeaderMinimal() {
  const pathname = usePathname();
  const workProjectTemplate = isWorkProjectTemplatePath(pathname);
  const homeOrProjectsHeaderBand =
    pathname === "/" || pathname === "/projects";

  const headerContent = (
    <div
      className={[
        styles.inner,
        workProjectTemplate ? styles.innerWorkProject : "",
        !workProjectTemplate && homeOrProjectsHeaderBand
          ? styles.innerHomeProjectsNav
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-header-nav-row
    >
      <div className={styles.lead}>
        <HeaderProjectNav />
      </div>
      <HeaderNav />
    </div>
  );

  return (
    <header
      id="main-header"
      className={styles.root}
      data-dir="up"
      data-work-template={workProjectTemplate ? "project" : undefined}
    >
      <HeaderMasthead />
      {headerContent}
    </header>
  );
}
