import { Metadata } from "next";
import { getAllTasks } from "@/lib/actions/tasks";
import { getProjects } from "@/lib/actions/projects";
import TasksClient from "@/components/tasks/TasksClient";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([getAllTasks(), getProjects()]);
  return <TasksClient tasks={tasks} projects={projects} />;
}
