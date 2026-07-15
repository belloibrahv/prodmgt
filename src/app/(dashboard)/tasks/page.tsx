import { Metadata } from "next";
import { getAllTasks } from "@/lib/actions/tasks";
import { getProjects } from "@/lib/actions/projects";
import TasksClient from "@/components/tasks/TasksClient";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  try {
    const [tasks, projects] = await Promise.all([getAllTasks(), getProjects()]);
    return <TasksClient tasks={tasks} projects={projects} />;
  } catch (error) {
    console.error("Error loading tasks page:", error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-tva-ink mb-4">Tasks</h1>
        <p className="text-tva-ink-m">Error loading tasks. Please try again later.</p>
      </div>
    );
  }
}
