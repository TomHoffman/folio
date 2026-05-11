import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonWorkShell } from "@/components/ComingSoonWorkShell";
import { ProjectHero } from "@/components/ProjectHero";
import { ProjectImageContainer } from "@/components/ProjectImageContainer";
import { CardGroup } from "@/components/CardGroup";
import { FocusLayerBlock } from "@/components/FocusLayerBlock";
import { ImageBlock } from "@/components/ImageBlock";
import { ImageGrid } from "@/components/ImageGrid";
import { MoreProjects } from "@/components/MoreProjects";
import { Testimonial } from "@/components/Testimonial";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ProtectedWorkShell } from "@/components/ProtectedWorkShell";
import { getProjectBySlug } from "@/data/projects";
import mainStyles from "../../main.module.css";

type WorkProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: WorkProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Not found" };
  }
  return { title: project.title };
}

export default async function WorkProjectPage({ params }: WorkProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  if (project.status === "coming-soon") {
    return <ComingSoonWorkShell />;
  }

  const main = (
    <main className={`${mainStyles.main} ${mainStyles.mainProject}`} key={`route-work-${slug}`}>
      <div className={mainStyles.mainProjectInner}>
        <ProjectHero project={project} />
        <ProjectImageContainer project={project} />
        {project.overview ? (
          <ProjectOverview overview={project.overview} category={project.industry} />
        ) : null}
        {project.cardGroup && !project.cardGroup.hidden ? (
          <CardGroup
            {...project.cardGroup}
            className={
              project.overview ? mainStyles.cardGroupAfterOverview : undefined
            }
          />
        ) : null}
        {(project.imageBlocks ?? []).map((block, index) => (
          <ImageBlock
            key={block.headingId ?? `image-block-${index}`}
            {...block}
          />
        ))}
        {(project.imageGrids ?? []).map((grid, index) => (
          <ImageGrid key={grid.headingId ?? `image-grid-${index}`} {...grid} />
        ))}
        {(project.focusLayerBlocks ?? []).map((block, index) => (
          <FocusLayerBlock
            key={block.headingId ?? `focus-layer-block-${index}`}
            {...block}
          />
        ))}
        {(project.imageBlocksAfterFocus ?? []).map((block, index) => (
          <ImageBlock
            key={block.headingId ?? `image-block-after-focus-${index}`}
            {...block}
          />
        ))}
        {(project.cardGroupsAfterFocus ?? [])
          .filter((group) => !group.hidden)
          .map((group, index) => (
            <CardGroup
              key={group.headingId ?? `card-group-after-focus-${index}`}
              {...group}
            />
          ))}
        {(project.focusLayerBlocksAfterFocus ?? []).map((block, index) => (
          <FocusLayerBlock
            key={block.headingId ?? `focus-layer-block-after-focus-${index}`}
            {...block}
          />
        ))}
        {project.testimonial ? <Testimonial {...project.testimonial} /> : null}
        <MoreProjects currentProject={project} />
      </div>
    </main>
  );

  if (project.status === "protected") {
    return <ProtectedWorkShell slug={project.slug}>{main}</ProtectedWorkShell>;
  }

  return main;
}
