import type { Project } from "@/data/projects";
import enterStyles from "./ProjectPageEnter.module.css";
import railStyles from "./projectContentRail.module.css";
import styles from "./ProjectHero.module.css";

/** Project title row — title + subtitle stack. */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <section className={styles.section}>
      <div className={`${styles.row} ${railStyles.contentRail}`}>
        <div className={styles.headCol}>
          <div className={styles.headingsEm}>
            <h1 className={`${styles.title} ${enterStyles.enterTitle}`}>
              {project.title}
            </h1>
            <p className={`${styles.subtitle} ${enterStyles.enterRow2}`}>
              {project.industry}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
