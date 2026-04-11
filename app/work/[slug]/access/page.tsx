import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProtectedAccessClient } from "@/components/ProtectedAccessClient";
import { getProjectBySlug } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || project.status !== "protected") {
    return { title: "Not found" };
  }
  return { title: `${project.title} — access` };
}

export default async function ProtectedProjectAccessPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || project.status !== "protected") {
    notFound();
  }

  return <ProtectedAccessClient projectSlug={project.slug} />;
}
