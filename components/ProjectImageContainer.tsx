import Image from "next/image";
import type { Project } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import styles from "./ProjectImageContainer.module.css";

export function ProjectImageContainer({ project }: { project: Project }) {
  return (
    <div
      className={`${styles.stage} ${enterStyles.enterMedia}`}
      role="presentation"
    >
      {project.heroImage ? (
        <Image
          src={project.heroImage}
          alt=""
          fill
          className={styles.heroImage}
          sizes="(max-width: 767px) 100vw, 96vw"
          priority
        />
      ) : null}
    </div>
  );
}
