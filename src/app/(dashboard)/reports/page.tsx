import { Metadata } from "next";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getProjects } from "@/lib/actions/projects";
import { getAllTasks } from "@/lib/actions/tasks";
import ReportsClient from "@/components/reports/ReportsClient";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const [stats, projects, tasks] = await Promise.all([
    getDashboardStats(),
    getProjects(),
    getAllTasks(),
  ]);

  return <ReportsClient stats={stats} projects={projects} tasks={tasks} />;
}
