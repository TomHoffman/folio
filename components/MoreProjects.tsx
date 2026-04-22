import type { Project } from "@/data/projects";
import { getMoreProjectsForProject } from "@/data/projects";
import { ProjectGrid } from "./ProjectGrid";

type MoreProjectsProps = {
  currentProject: Project;
};

export function MoreProjects({ currentProject }: MoreProjectsProps) {
  const projects = getMoreProjectsForProject(currentProject, 2);
  if (projects.length === 0) return null;

  return (
    <ProjectGrid
      title="More projects"
      showTitle
      projects={projects}
      usePageInset={false}
      enableScrollAnchor={false}
    />
  );
}
