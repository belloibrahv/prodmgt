import { Metadata } from "next";
import { getObjectives } from "@/lib/actions/goals";
import { getProjectOptions } from "@/lib/actions/projects";
import GoalsClient from "@/components/goals/GoalsClient";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage() {
  const [objectives, projects] = await Promise.all([getObjectives(), getProjectOptions()]);
  return <GoalsClient objectives={objectives} projects={projects} />;
}
