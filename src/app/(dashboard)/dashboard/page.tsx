import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ListChecks } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardStats, getRecentActivity, getProjectStatusDistribution, getTaskCompletionTrend, getTeamWorkloadData } from "@/lib/actions/dashboard";
import { getProjects } from "@/lib/actions/projects";
import { getAllTasks } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/Button";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ActiveProjects from "@/components/dashboard/ActiveProjects";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import TasksDue from "@/components/dashboard/TasksDue";
import TeamWorkload from "@/components/dashboard/TeamWorkload";
import ProjectStatusChart from "@/components/dashboard/ProjectStatusChart";
import TaskCompletionChart from "@/components/dashboard/TaskCompletionChart";

export const metadata: Metadata = { title: "Dashboard" };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const [session, stats, projects, tasks, activity, projectStatus, taskTrend, teamWorkload] = await Promise.all([
    auth(),
    getDashboardStats(),
    getProjects(),
    getAllTasks(),
    getRecentActivity(12),
    getProjectStatusDistribution(),
    getTaskCompletionTrend(),
    getTeamWorkloadData(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const now = Date.now();
  const dueThisWeek = tasks.filter((t) => {
    if (t.status === "DONE" || !t.dueDate) return false;
    const due = new Date(t.dueDate).getTime();
    return due >= now && due - now <= WEEK_MS;
  }).length;

  const summary = [
    `${dueThisWeek} ${dueThisWeek === 1 ? "task is" : "tasks are"} due this week`,
    stats.overdueTasks > 0 && `${stats.overdueTasks} overdue`,
  ].filter(Boolean).join(" and ");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground">Across your projects, {summary}.</p>
        </div>
        <Button variant="outline" render={<Link href="/tasks" />} nativeButton={false}>
          <ListChecks /> Open task board
        </Button>
      </header>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><TaskCompletionChart data={taskTrend} /></div>
        <ProjectStatusChart data={projectStatus} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><TasksDue tasks={tasks} /></div>
        <TeamWorkload members={teamWorkload} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActiveProjects projects={projects.filter((p) => p.status === "ACTIVE").slice(0, 5)} />
        </div>
        <ActivityFeed activity={activity} />
      </div>
    </div>
  );
}
