import Image from "next/image";
import { projectAssetSrc, type Project } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import styles from "./ProjectImageContainer.module.css";

export function ProjectImageContainer({ project }: { project: Project }) {
  const isSplitLayout = project.heroImageCount === 2;
  const isAibProject = project.slug === "allied-irish-bank";
  const heroImageClass = [
    styles.heroImage,
    isSplitLayout ? styles.heroImageSplit : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[
        styles.stage,
        isSplitLayout ? styles.stageSplit : "",
        isAibProject ? styles.stageAib : "",
        enterStyles.enterMedia,
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
    >
      {isSplitLayout ? (
        <>
          <div className={`${styles.splitPane} ${styles.splitPaneSecondary}`}>
            {project.heroImageSecondary ? (
              <Image
                src={projectAssetSrc(project.heroImageSecondary, project.assetVersion)}
                alt=""
                fill
                className={heroImageClass}
                sizes="(max-width: 767px) 40vw, 36vw"
                priority
              />
            ) : null}
          </div>
          <div className={`${styles.splitPane} ${styles.splitPanePrimary}`}>
            {project.heroImage ? (
              <Image
                src={projectAssetSrc(project.heroImage, project.assetVersion)}
                alt=""
                fill
                className={heroImageClass}
                sizes="(max-width: 767px) 60vw, 60vw"
                priority
              />
            ) : null}
          </div>
        </>
      ) : project.heroImage ? (
        <Image
          src={projectAssetSrc(project.heroImage, project.assetVersion)}
          alt=""
          fill
          className={heroImageClass}
          sizes="(max-width: 767px) 100vw, 96vw"
          priority
        />
      ) : null}
    </div>
  );
}
