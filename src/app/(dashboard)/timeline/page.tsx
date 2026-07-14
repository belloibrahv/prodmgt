import { Metadata } from "next";
import { getProjects } from "@/lib/actions/projects";
import TimelineClient from "@/components/timeline/TimelineClient";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const projects = await getProjects();
  return <TimelineClient projects={projects} />;
}
