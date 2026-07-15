"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getDueLabel, formatDate, cn } from "@/lib/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskWithRelations } from "@/types";

type SortKey = "title" | "status" | "priority" | "dueDate" | "assignee";

interface TaskTableProps {
  tasks: TaskWithRelations[];
  /** When rendering inside a project detail, pass the project to avoid requiring task.project relation */
  project?: { emoji: string; name: string };
}

export default function TaskTable({ tasks, project: projectProp }: TaskTableProps) {
  const [selected, setSelected] = useState<TaskWithRelations | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "dueDate", dir: "asc" });

  function toggleSort(key: SortKey) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  }

  const sorted = [...tasks].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "title") return a.title.localeCompare(b.title) * dir;
    if (sort.key === "dueDate") {
      if (!a.dueDate) return 1; if (!b.dueDate) return -1;
      return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
    }
    if (sort.key === "assignee") return ((a.assignee?.name ?? "").localeCompare(b.assignee?.name ?? "")) * dir;
    return (a[sort.key] as string).localeCompare(b[sort.key] as string) * dir;
  });

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronUp size={12} className="opacity-30" />;
    return sort.dir === "asc" ? <ChevronUp size={12} className="text-tva-red" /> : <ChevronDown size={12} className="text-tva-red" />;
  }

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-left text-[12px] font-semibold text-tva-ink-m cursor-pointer hover:text-tva-red transition-colors select-none"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">{label} <SortIcon k={k} /></span>
    </th>
  );

  return (
    <>
      <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tva-surface border-b border-tva-border">
              <tr>
                <Th k="title" label="Task" />
                <Th k="status" label="Status" />
                <Th k="priority" label="Priority" />
                <Th k="assignee" label="Assignee" />
                <Th k="dueDate" label="Due Date" />
                <th className="px-4 py-3 text-left text-[12px] font-semibold text-tva-ink-m">Project</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((task) => {
                const due = getDueLabel(task.dueDate);
                const dueClass: Record<string, string> = {
                  overdue: "text-tva-error font-semibold",
                  today: "text-tva-warn font-semibold",
                  tomorrow: "text-tva-info",
                  upcoming: "text-tva-ink-m",
                  none: "text-tva-ink-m",
                };
                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelected(task)}
                    className="border-b border-tva-border/50 hover:bg-tva-red-xlt cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="text-[13px] font-medium text-tva-ink truncate">{task.title}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" />
                          <span className="text-[12px] text-tva-ink">{task.assignee.name?.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-tva-ink-m">Unassigned</span>
                      )}
                    </td>
                    <td className={cn("px-4 py-3 text-[12px]", dueClass[due.variant])}>
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-tva-ink-m flex items-center gap-1">
                        {(projectProp ?? task.project)?.emoji} {(projectProp ?? task.project)?.name}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-tva-ink-m">No tasks found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <TaskDetailModal task={selected} open={!!selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
