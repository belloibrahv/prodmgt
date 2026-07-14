import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/projects";
import ProjectDetailClient from "@/components/projects/ProjectDetailClient";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();
  return <ProjectDetailClient project={project} />;
}
