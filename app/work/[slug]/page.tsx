import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectHero } from "@/components/ProjectHero";
import { ProjectImageContainer } from "@/components/ProjectImageContainer";
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

  return (
    <main className={`${mainStyles.main} ${mainStyles.mainProject}`}>
      <div className={mainStyles.mainProjectInner}>
        <ScrollToTopOnMount />
        <ProjectHero project={project} />
        <ProjectImageContainer project={project} />
      </div>
    </main>
  );
}
