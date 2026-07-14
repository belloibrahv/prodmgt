"use client";

import { BarChart3, TrendingUp, Target, Users, CheckCircle2, AlertTriangle } from "lucide-react";
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
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-tva-ink">Reports</h1>
        <p className="text-sm text-tva-ink-m mt-0.5">Workspace health, velocity and performance insights</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target,       label: "Completion Rate",   value: `${stats.totalTasks ? Math.round(((stats.totalTasks - stats.openTasks) / stats.totalTasks) * 100) : 0}%`, color: "bg-tva-success-lt text-tva-success" },
          { icon: TrendingUp,   label: "Active Projects",   value: stats.activeProjects,  color: "bg-tva-info-lt text-tva-info" },
          { icon: Users,        label: "Team Members",      value: stats.teamSize,         color: "bg-purple-100 text-purple-600" },
          { icon: AlertTriangle,label: "Overdue Tasks",     value: stats.overdueTasks,     color: "bg-tva-error-lt text-tva-error" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`rounded-16 p-5 flex items-center gap-4 ${color.split(" ")[0]}`}>
            <div className={`w-11 h-11 rounded-12 bg-white/60 flex items-center justify-center ${color.split(" ")[1]}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-[28px] font-bold text-tva-ink leading-none">{value}</p>
              <p className="text-[12px] text-tva-ink-m mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tasks by status */}
        <Card>
          <CardHeader><CardTitle>Tasks by Status</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {statusBreakdown.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-20 text-[12px] font-medium text-tva-ink-m text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-7 bg-tva-surface rounded-8 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-8 flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(count / maxStatus) * 100}%`, backgroundColor: color, minWidth: count > 0 ? "2rem" : 0 }}
                  >
                    {count > 0 && <span className="text-[11px] font-bold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-6 text-[12px] font-bold text-tva-ink-m flex-shrink-0">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Tasks by priority */}
        <Card>
          <CardHeader><CardTitle>Tasks by Priority</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            {priorityBreakdown.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-16 text-[12px] font-medium text-tva-ink-m text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-7 bg-tva-surface rounded-8 overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-8 flex items-center px-2 transition-all duration-700"
                    style={{ width: `${(count / maxPriority) * 100}%`, backgroundColor: color, minWidth: count > 0 ? "2rem" : 0 }}
                  >
                    {count > 0 && <span className="text-[11px] font-bold text-white">{count}</span>}
                  </div>
                </div>
                <span className="w-6 text-[12px] font-bold text-tva-ink-m flex-shrink-0">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Project health */}
        <Card>
          <CardHeader>
            <CardTitle>Project Health</CardTitle>
            <span className="text-[12px] text-tva-ink-m">{projects.length} projects</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-3 p-0">
            {projectHealth.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 border-b border-tva-border/60 last:border-0">
                <span className="text-xl flex-shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-tva-ink truncate">{p.name}</span>
                    <span className="text-[11px] font-bold text-tva-ink-m ml-2 flex-shrink-0">{p.pct}%</span>
                  </div>
                  <ProgressBar value={p.pct} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={p.status} />
                  {p.overdue > 0 && (
                    <span className="text-[11px] font-semibold text-tva-error">{p.overdue} overdue</span>
                  )}
                </div>
              </div>
            ))}
            {projectHealth.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-tva-ink-m">No projects yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Team performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <span className="text-[12px] text-tva-ink-m">Tasks completed</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {teamPerfSorted.length === 0 ? (
              <p className="text-center text-sm text-tva-ink-m py-4">No assigned tasks yet.</p>
            ) : (
              teamPerfSorted.map(({ name, done, total }) => {
                const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-8 bg-tva-red-lt text-tva-red text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-tva-ink truncate">{name.split(" ")[0]}</span>
                        <span className="text-[11px] text-tva-ink-m flex-shrink-0 ml-1">{done}/{total}</span>
                      </div>
                      <ProgressBar value={rate} color={rate >= 70 ? "green" : rate >= 40 ? "yellow" : "red"} />
                    </div>
                    <span className="text-[12px] font-bold text-tva-ink-m w-9 text-right flex-shrink-0">{rate}%</span>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Summary table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2"><BarChart3 size={16} /> Workspace Summary</span>
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full">
            <thead className="bg-tva-surface border-b border-tva-border">
              <tr>
                {["Metric", "Value", "Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-semibold text-tva-ink-m">{h}</th>
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
                <tr key={metric} className="border-b border-tva-border/50 hover:bg-tva-red-xlt transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-tva-ink">{metric}</td>
                  <td className="px-5 py-3 text-[13px] font-bold text-tva-ink">{value}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
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
