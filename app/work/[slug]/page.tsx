import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonWorkShell } from "@/components/ComingSoonWorkShell";
import { ProjectHero } from "@/components/ProjectHero";
import { ProjectImageContainer } from "@/components/ProjectImageContainer";
import { CardGroup } from "@/components/CardGroup";
import { FocusLayerBlock } from "@/components/FocusLayerBlock";
import { ImageBlock } from "@/components/ImageBlock";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ProtectedWorkShell } from "@/components/ProtectedWorkShell";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount";
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
    <main className={`${mainStyles.main} ${mainStyles.mainProject}`}>
      <div className={mainStyles.mainProjectInner}>
        <ScrollToTopOnMount />
        <ProjectHero project={project} />
        <ProjectImageContainer project={project} />
        {project.overview ? (
          <ProjectOverview overview={project.overview} />
        ) : null}
        {project.cardGroup ? (
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
            className={
              project.slug === "licel" &&
              block.headingId === "licel-image-block-brand-heading"
                ? mainStyles.licelScaleUpBlock
                : undefined
            }
          />
        ))}
        {(project.focusLayerBlocks ?? []).map((block, index) => (
          <FocusLayerBlock
            key={block.headingId ?? `focus-layer-block-${index}`}
            {...block}
          />
        ))}
      </div>
    </main>
  );

  if (project.status === "protected") {
    return <ProtectedWorkShell slug={project.slug}>{main}</ProtectedWorkShell>;
  }

  return main;
}
