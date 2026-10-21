"use client";

import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { ChartColumnIcon, CircleCheckIcon, TargetIcon, TrendingUpIcon, TriangleAlertIcon, UsersIcon, EyeIcon, CheckIcon } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, getProgressPercent } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import type { DashboardStats, ProjectWithRelations, TaskWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

interface Props {
  stats: DashboardStats;
  projects: ProjectWithRelations[];
  tasks: TaskWithRelations[];
}

export default function ReportsClient({ stats, projects, tasks }: Props) {
  // Task status breakdown
  const statusBreakdown = [
    { label: "Done",        count: tasks.filter(t => t.status === "DONE").length,        color: "#1da851" },
    { label: "In Progress", count: tasks.filter(t => t.status === "IN_PROGRESS").length, color: "#2563eb" },
    { label: "In Review",   count: tasks.filter(t => t.status === "IN_REVIEW").length,   color: "#f59e0b" },
    { label: "To Do",       count: tasks.filter(t => t.status === "TODO").length,         color: "#9ca3af" },
    { label: "Blocked",     count: tasks.filter(t => t.status === "BLOCKED").length,      color: "#e53935" },
    { label: "Backlog",     count: tasks.filter(t => t.status === "BACKLOG").length,      color: "#d1d5db" },
  ];
  const maxStatus = Math.max(...statusBreakdown.map(s => s.count), 1);

  // Priority breakdown
  const priorityBreakdown = [
    { label: "Critical", count: tasks.filter(t => t.priority === "CRITICAL").length, color: "#e53935" },
    { label: "High",     count: tasks.filter(t => t.priority === "HIGH").length,     color: "#f59e0b" },
    { label: "Medium",   count: tasks.filter(t => t.priority === "MEDIUM").length,   color: "#2563eb" },
    { label: "Low",      count: tasks.filter(t => t.priority === "LOW").length,      color: "#1da851" },
  ];
  const maxPriority = Math.max(...priorityBreakdown.map(p => p.count), 1);

  // Project health
  const projectHealth = projects.map((p) => ({
    ...p,
    pct: getProgressPercent(p.tasks),
    overdue: p.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length,
  })).sort((a, b) => b.pct - a.pct);

  // Team performance: tasks completed per assignee
  const teamPerf: Record<string, { name: string; done: number; total: number }> = {};
  tasks.forEach((t) => {
    if (!t.assignee) return;
    if (!teamPerf[t.assignee.id]) teamPerf[t.assignee.id] = { name: t.assignee.name ?? "", done: 0, total: 0 };
    teamPerf[t.assignee.id].total++;
    if (t.status === "DONE") teamPerf[t.assignee.id].done++;
  });
  const teamPerfSorted = Object.values(teamPerf).sort((a, b) => b.done - a.done).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Workspace health, velocity and performance insights" />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          // Blocked tasks aren't "open", so completion is measured from DONE tasks only.
          { icon: TargetIcon, label: "Completion rate", value: `${tasks.length ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100) : 0}%` },
          { icon: TrendingUpIcon, label: "Active projects", value: stats.activeProjects },
          { icon: UsersIcon, label: "Team members", value: stats.teamSize },
          { icon: TriangleAlertIcon, label: "Overdue tasks", value: stats.overdueTasks, alert: stats.overdueTasks > 0 },
        ].map(({ icon: Icon, label, value, alert }) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-xs">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            </div>
            <span className={cn("flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground", alert && "bg-destructive/10 text-destructive")}>
              <Icon className="size-5" aria-hidden />
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tasks by status */}
        <Card className="shadow-xs">
          <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Tasks by Status</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {statusBreakdown.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-muted-foreground text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-lg flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(count / maxStatus) * 100}%`, backgroundColor: color, minWidth: count > 0 ? "2rem" : 0 }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-6 text-xs font-bold text-muted-foreground flex-shrink-0">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Tasks by priority */}
        <Card className="shadow-xs">
          <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Tasks by Priority</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {priorityBreakdown.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-muted-foreground text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-lg flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(count / maxPriority) * 100}%`, backgroundColor: color, minWidth: count > 0 ? "2rem" : 0 }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-6 text-xs font-bold text-muted-foreground flex-shrink-0">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Project health */}
        <Card className="shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Project Health</CardTitle>
            <span className="text-xs text-muted-foreground">{projects.length} projects</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-3 p-0">
            {projectHealth.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <ProjectIcon icon={p.emoji} color={p.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                    <span className="text-xs font-bold text-muted-foreground ml-2 flex-shrink-0">{p.pct}%</span>
                  </div>
                  <ProgressBar value={p.pct} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={p.status} />
                  {p.overdue > 0 && (
                    <span className="text-xs font-semibold text-destructive">{p.overdue} overdue</span>
                  )}
                </div>
              </div>
            ))}
            {projectHealth.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground font-medium">No projects yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Team performance */}
        <Card className="shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Team Performance</CardTitle>
            <span className="text-xs text-muted-foreground">Tasks completed</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {teamPerfSorted.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6 font-medium">No assigned tasks yet.</p>
            ) : (
              teamPerfSorted.map(({ name, done, total }) => {
                const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{name.split(" ")[0]}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">{done}/{total}</span>
                      </div>
                      <ProgressBar value={rate} color={rate >= 70 ? "green" : rate >= 40 ? "yellow" : "red"} />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground w-9 text-right flex-shrink-0">{rate}%</span>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Summary table */}
      <Card className="shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            <span className="flex items-center gap-2"><ChartColumnIcon size={18} /> Workspace Summary</span>
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {["Metric", "Value", "Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { metric: "Total Projects",   value: stats.totalProjects,   status: "info" },
                { metric: "Active Projects",  value: stats.activeProjects,  status: "active" },
                { metric: "Completed Projects", value: stats.completedProjects, status: "done" },
                { metric: "Total Tasks",      value: stats.totalTasks,      status: "info" },
                { metric: "Open Tasks",       value: stats.openTasks,       status: stats.openTasks > 10 ? "warn" : "ok" },
                { metric: "Overdue Tasks",    value: stats.overdueTasks,    status: stats.overdueTasks > 0 ? "error" : "ok" },
                { metric: "Team Members",     value: stats.teamSize,        status: "info" },
              ].map(({ metric, value, status }) => (
                <tr key={metric} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{metric}</td>
                  <td className="px-6 py-3 text-sm font-bold text-foreground">{value}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      status === "error" ? "bg-destructive/10 text-destructive" :
                      status === "warn"  ? "bg-warning/10 text-warning" :
                      status === "active"? "bg-success/10 text-success" :
                      status === "done"  ? "bg-gray-100 text-gray-500" :
                      status === "ok"    ? "bg-success/10 text-success" :
                      "bg-info/10 text-info"
                    }`}>
                      {status === "error" ? <><TriangleAlertIcon className="size-3" aria-hidden /> Attention</> : status === "warn" ? <><EyeIcon className="size-3" aria-hidden /> Monitor</> : status === "ok" || status === "active" ? <><CircleCheckIcon className="size-3" aria-hidden /> Good</> : status === "done" ? <><CheckIcon className="size-3" aria-hidden /> Complete</> : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
