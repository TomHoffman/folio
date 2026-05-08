"use client";

import { useEffect, useRef, useState } from "react";
import RiveCanvas, { Alignment, Fit, Layout } from "@rive-app/react-canvas";
import {
  HOME_HERO_GRID_IMAGE_ROTATION_MS_DEFAULT,
  type HomeHeroGridCardMedia,
} from "@/data/homeHeroGridCards";
import styles from "./HomepageHero.module.css";

function normalizeImageSources(sources: string | string[]): string[] {
  if (Array.isArray(sources)) {
    return sources.filter((s) => typeof s === "string" && s.length > 0);
  }
  return sources ? [sources] : [];
}

function Cluster4RotatingPanelImage({
  cardId,
  sources,
  rotationMs,
  wrapClassName,
  imgClassName,
}: {
  cardId: string;
  sources: string[];
  rotationMs?: number;
  wrapClassName: string;
  imgClassName: string;
}) {
  const list = sources.length > 0 ? sources : [""];
  const [index, setIndex] = useState(0);
  const intervalMs = rotationMs ?? HOME_HERO_GRID_IMAGE_ROTATION_MS_DEFAULT;

  useEffect(() => {
    setIndex(0);
  }, [cardId]);

  useEffect(() => {
    if (list.length <= 1) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [cardId, list.length, intervalMs]);

  const src = list[index] ?? "";

  return (
    <div className={wrapClassName}>
      <img
        key={`${index}-${src}`}
        src={src}
        alt=""
        className={imgClassName}
      />
    </div>
  );
}

function Cluster4PanelVideo({
  cardId,
  src,
  poster,
  wrapClassName,
  videoClassName,
}: {
  cardId: string;
  src: string;
  poster?: string;
  wrapClassName: string;
  videoClassName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});
  }, [cardId, src]);

  return (
    <div className={wrapClassName}>
      <video
        ref={videoRef}
        key={`${cardId}-${src}`}
        className={videoClassName}
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
        aria-hidden
      />
    </div>
  );
}

function Cluster4PanelRive({
  media,
  wrapClassName,
}: {
  media: Extract<HomeHeroGridCardMedia, { kind: "rive" }>;
  wrapClassName: string;
}) {
  const layout = new Layout({
    fit: Fit.Cover,
    alignment: Alignment.Center,
  });

  return (
    <div className={wrapClassName}>
      <div className={styles.cluster4PanelRiveInner}>
        <RiveCanvas
          src={media.src}
          artboard={media.artboard}
          animations={media.animations}
          stateMachines={media.stateMachines}
          layout={layout}
          shouldResizeCanvasToContainer
        />
      </div>
    </div>
  );
}

export function Cluster4PanelMedia({
  cardId,
  media,
  wrapClassName,
  assetClassName,
}: {
  cardId: string;
  media: HomeHeroGridCardMedia;
  wrapClassName: string;
  assetClassName: string;
}) {
  switch (media.kind) {
    case "image":
      return (
        <Cluster4RotatingPanelImage
          cardId={cardId}
          sources={normalizeImageSources(media.sources)}
          rotationMs={media.rotationMs}
          wrapClassName={wrapClassName}
          imgClassName={assetClassName}
        />
      );
    case "video":
      return (
        <Cluster4PanelVideo
          cardId={cardId}
          src={media.src}
          poster={media.poster}
          wrapClassName={wrapClassName}
          videoClassName={assetClassName}
        />
      );
    case "rive":
      return <Cluster4PanelRive media={media} wrapClassName={wrapClassName} />;
    default:
      return null;
  }
}
