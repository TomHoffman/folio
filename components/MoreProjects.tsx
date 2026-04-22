import type { Project } from "@/data/projects";
import { getMoreProjectsForProject } from "@/data/projects";
import { ProjectGrid } from "./ProjectGrid";
import styles from "./MoreProjects.module.css";

type MoreProjectsProps = {
  currentProject: Project;
};

export function MoreProjects({ currentProject }: MoreProjectsProps) {
  const projects = getMoreProjectsForProject(currentProject, 2);
  if (projects.length === 0) return null;

  return (
    <section className={styles.section} aria-label="More projects">
      <ProjectGrid
        title="More projects"
        showTitle
        indicatorColor="powderBlue"
        projects={projects}
        usePageInset={false}
        enableScrollAnchor={false}
      />
    </section>
  );
}
