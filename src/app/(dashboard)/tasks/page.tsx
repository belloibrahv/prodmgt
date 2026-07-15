import { Metadata } from "next";
import { getAllTasks } from "@/lib/actions/tasks";
import { getProjects } from "@/lib/actions/projects";
import { getWorkspaceMembers } from "@/lib/actions/team";
import TasksClient from "@/components/tasks/TasksClient";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  try {
    const [tasks, projects, workspaceMembers] = await Promise.all([
      getAllTasks(),
      getProjects(),
      getWorkspaceMembers(),
    ]);
    return (
      <TasksClient
        tasks={tasks}
        projects={projects}
        workspaceMembers={workspaceMembers}
      />
    );
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
