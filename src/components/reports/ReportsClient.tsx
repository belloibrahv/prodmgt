"use client";

import { MdBarChart, MdTrendingUp, MdTrackChanges, MdGroup, MdCheckCircle, MdWarning } from "react-icons/md";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProgressPercent } from "@/lib/utils";
import type { DashboardStats, ProjectWithRelations, TaskWithRelations } from "@/types";

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-tva-ink">Reports</h1>
        <p className="text-sm text-tva-ink-m mt-1">Workspace health, velocity and performance insights</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: MdTrackChanges, label: "Completion Rate",   value: `${stats.totalTasks ? Math.round(((stats.totalTasks - stats.openTasks) / stats.totalTasks) * 100) : 0}%`, color: "bg-tva-success-lt text-tva-success" },
          { icon: MdTrendingUp,   label: "Active Projects",   value: stats.activeProjects,  color: "bg-tva-info-lt text-tva-info" },
          { icon: MdGroup,        label: "Team Members",      value: stats.teamSize,         color: "bg-purple-100 text-purple-600" },
          { icon: MdWarning,      label: "Overdue Tasks",     value: stats.overdueTasks,     color: "bg-tva-error-lt text-tva-error" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`rounded-20 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all ${color.split(" ")[0]}`}>
            <div className={`w-12 h-12 rounded-12 bg-white/60 flex items-center justify-center ${color.split(" ")[1]}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-tva-ink leading-none">{value}</p>
              <p className="text-xs text-tva-ink-m mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tasks by status */}
        <Card className="rounded-20 border-tva-border/60">
          <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Tasks by Status</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {statusBreakdown.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-20 text-xs font-medium text-tva-ink-m text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-8 bg-tva-surface rounded-12 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-12 flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(count / maxStatus) * 100}%`, backgroundColor: color, minWidth: count > 0 ? "2rem" : 0 }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-6 text-xs font-bold text-tva-ink-m flex-shrink-0">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Tasks by priority */}
        <Card className="rounded-20 border-tva-border/60">
          <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Tasks by Priority</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {priorityBreakdown.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-16 text-xs font-medium text-tva-ink-m text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-8 bg-tva-surface rounded-12 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-12 flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(count / maxPriority) * 100}%`, backgroundColor: color, minWidth: count > 0 ? "2rem" : 0 }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-6 text-xs font-bold text-tva-ink-m flex-shrink-0">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Project health */}
        <Card className="rounded-20 border-tva-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Project Health</CardTitle>
            <span className="text-xs text-tva-ink-m">{projects.length} projects</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-3 p-0">
            {projectHealth.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-tva-border/40 last:border-0 hover:bg-tva-red-xlt/30 transition-colors">
                <div className="flex-shrink-0">
                  <span className="text-xl">{p.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-tva-ink truncate">{p.name}</span>
                    <span className="text-xs font-bold text-tva-ink-m ml-2 flex-shrink-0">{p.pct}%</span>
                  </div>
                  <ProgressBar value={p.pct} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={p.status} />
                  {p.overdue > 0 && (
                    <span className="text-xs font-semibold text-tva-error">{p.overdue} overdue</span>
                  )}
                </div>
              </div>
            ))}
            {projectHealth.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-tva-ink-m font-medium">No projects yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Team performance */}
        <Card className="rounded-20 border-tva-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Team Performance</CardTitle>
            <span className="text-xs text-tva-ink-m">Tasks completed</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {teamPerfSorted.length === 0 ? (
              <p className="text-center text-sm text-tva-ink-m py-6 font-medium">No assigned tasks yet.</p>
            ) : (
              teamPerfSorted.map(({ name, done, total }) => {
                const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-12 bg-tva-red-lt text-tva-red text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-tva-ink truncate">{name.split(" ")[0]}</span>
                        <span className="text-xs text-tva-ink-m flex-shrink-0 ml-1">{done}/{total}</span>
                      </div>
                      <ProgressBar value={rate} color={rate >= 70 ? "green" : rate >= 40 ? "yellow" : "red"} />
                    </div>
                    <span className="text-sm font-bold text-tva-ink-m w-9 text-right flex-shrink-0">{rate}%</span>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Summary table */}
      <Card className="rounded-20 border-tva-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            <span className="flex items-center gap-2"><MdBarChart size={18} /> Workspace Summary</span>
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full">
            <thead className="bg-tva-surface/50 border-b border-tva-border/40">
              <tr>
                {["Metric", "Value", "Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-tva-ink-m">{h}</th>
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
                <tr key={metric} className="border-b border-tva-border/30 hover:bg-tva-red-xlt/30 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-tva-ink">{metric}</td>
                  <td className="px-6 py-3 text-sm font-bold text-tva-ink">{value}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      status === "error" ? "bg-tva-error-lt text-tva-error" :
                      status === "warn"  ? "bg-tva-warn-lt text-tva-warn" :
                      status === "active"? "bg-tva-success-lt text-tva-success" :
                      status === "done"  ? "bg-gray-100 text-gray-500" :
                      status === "ok"    ? "bg-tva-success-lt text-tva-success" :
                      "bg-tva-info-lt text-tva-info"
                    }`}>
                      {status === "error" ? "⚠ Attention" : status === "warn" ? "Monitor" : status === "ok" || status === "active" ? "✓ Good" : status === "done" ? "Complete" : "—"}
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
