"use client";

import RiveCanvas, { Alignment, Fit, Layout } from "@rive-app/react-canvas";
import type { HomeHeroGridCardRiveMedia } from "@/data/homeHeroGridCards";
import styles from "./HomepageHero.module.css";

const riveLayout = new Layout({
  fit: Fit.Cover,
  alignment: Alignment.Center,
});

export default function Cluster4PanelRiveLazy({
  media,
  wrapClassName,
}: {
  media: HomeHeroGridCardRiveMedia;
  wrapClassName: string;
}) {
  return (
    <div className={wrapClassName}>
      <div className={styles.cluster4PanelRiveInner}>
        <RiveCanvas
          src={media.src}
          artboard={media.artboard}
          animations={media.animations}
          stateMachines={media.stateMachines}
          layout={riveLayout}
          shouldResizeCanvasToContainer
        />
      </div>
    </div>
  );
}
