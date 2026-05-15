"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  HOME_HERO_GRID_IMAGE_ROTATION_MS_DEFAULT,
  type HomeHeroGridCardMedia,
} from "@/data/homeHeroGridCards";
import styles from "./HomepageHero.module.css";

const Cluster4PanelRiveLazy = dynamic(
  () => import("@/components/Cluster4PanelRiveLazy"),
  { ssr: false },
);

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

  return (
    <div className={wrapClassName}>
      <div className={styles.cluster4RotatingStack}>
        {list.map((url, i) => (
          <img
            key={`${i}-${url || "slot"}`}
            src={url}
            alt=""
            className={`${imgClassName} ${
              i === index ? styles.cluster4RotatingImageActive : ""
            }`}
          />
        ))}
      </div>
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
      return <Cluster4PanelRiveLazy media={media} wrapClassName={wrapClassName} />;
    case "none":
      return <div className={wrapClassName} aria-hidden />;
    default:
      return null;
  }
}
