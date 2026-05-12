"use client";

import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
import { ProjectGrid } from "@/components/ProjectGrid";
import projectGridStyles from "@/components/ProjectGrid.module.css";
import type { Project } from "@/data/projects";
import {
  scrollRevealTriggerEarlier,
  useScrollRevealElement,
} from "@/components/useScrollReveal";
import styles from "./HomeFeaturedGrids.module.css";

const ROW1_CARD_HEIGHT_VAR = "--home-featured-row1-card-height";

/** In-page anchor for home hero nav “Projects” scroll target. */
export const HOME_FEATURED_PROJECTS_ANCHOR_ID = "featured-projects";

export function HomeFeaturedGrids({
  projects,
}: {
  projects: readonly Project[];
}) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [heightsSynced, setHeightsSynced] = useState(false);

  const { ref: featuredSectionRevealRef, isVisible: featuredSectionVisible } =
    useScrollRevealElement<HTMLDivElement>({
      enabled: true,
      ...scrollRevealTriggerEarlier,
      layoutResetKey: pathname,
    });

  const assignFeaturedWrapRef = useCallback(
    (el: HTMLDivElement | null) => {
      wrapRef.current = el;
      (featuredSectionRevealRef as MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [featuredSectionRevealRef],
  );

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const cards = wrap.querySelectorAll<HTMLElement>("ul > li:nth-child(-n+2) [data-project-slug]");
    let maxH = 0;
    cards.forEach((el) => {
      const h = el.getBoundingClientRect().height;
      if (h > maxH) maxH = h;
    });

    if (maxH <= 0 || !Number.isFinite(maxH)) {
      wrap.style.removeProperty(ROW1_CARD_HEIGHT_VAR);
      setHeightsSynced(false);
      return;
    }

    wrap.style.setProperty(ROW1_CARD_HEIGHT_VAR, `${maxH}px`);
    setHeightsSynced(true);
  }, []);

  useLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, projects]);

  useLayoutEffect(() => {
    if (pathname !== "/") return;
    const id = requestAnimationFrame(() => {
      measure();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, measure]);

  return (
    <div
      id={HOME_FEATURED_PROJECTS_ANCHOR_ID}
      ref={assignFeaturedWrapRef}
      className={styles.wrap}
    >
      <ProjectGrid
        title="Featured projects"
        showTitle={true}
        indicatorColor="secondary"
        animateOnScroll
        scrollRevealControlled
        scrollRevealVisible={featuredSectionVisible}
        scrollRevealEnterMediaMaxIndex={1}
        tabletLayout="homeFeaturedCombined"
        projects={[...projects]}
        projectCardClassName={
          heightsSynced ? projectGridStyles.cardRowMatchAbove : undefined
        }
        projectCardClassNameFromIndex={2}
      />
    </div>
  );
}
