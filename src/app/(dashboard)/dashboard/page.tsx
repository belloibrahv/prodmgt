import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getDashboardStats, getRecentActivity } from "@/lib/actions/dashboard";
import { getProjects } from "@/lib/actions/projects";
import { getAllTasks } from "@/lib/actions/tasks";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ActiveProjects from "@/components/dashboard/ActiveProjects";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import TasksDue from "@/components/dashboard/TasksDue";
import TeamWorkload from "@/components/dashboard/TeamWorkload";
import { format } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, stats, projects, tasks, activity] = await Promise.all([
    auth(),
    getDashboardStats(),
    getProjects(),
    getAllTasks(),
    getRecentActivity(12),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tva-ink">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-tva-ink-m mt-0.5">
            Here&apos;s what&apos;s happening across your projects — {today}
          </p>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Active Projects + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActiveProjects projects={projects.filter(p => p.status === "ACTIVE").slice(0, 5)} />
        <ActivityFeed activity={activity} />
      </div>

      {/* Tasks + Team workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TasksDue tasks={tasks} />
        </div>
        <TeamWorkload tasks={tasks} />
      </div>
    </div>
  );
}
