import { Metadata } from "next";
import { getProjects } from "@/lib/actions/projects";
import ProjectsClient from "@/components/projects/ProjectsClient";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}
