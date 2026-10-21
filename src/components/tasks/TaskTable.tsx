"use client";

import { useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getDueLabel, formatDate, cn } from "@/lib/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

const PRIORITY_RANK: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
const STATUS_RANK: Record<string, number> = { BACKLOG: 0, TODO: 1, IN_PROGRESS: 2, IN_REVIEW: 3, BLOCKED: 4, DONE: 5 };

type SortKey = "title" | "status" | "priority" | "dueDate" | "assignee";

interface TaskTableProps {
  tasks: TaskWithRelations[];
  /** When rendering inside a project detail, pass the project to avoid requiring task.project relation */
  project?: { emoji: string; name: string; color?: string };
}

export default function TaskTable({ tasks, project: projectProp }: TaskTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Look the task up by id so the modal shows fresh data after each save.
  const selected = tasks.find((t) => t.id === selectedId) ?? null;
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
    if (sort.key === "priority") return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * dir;
    return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * dir;
  });

  function SortIcon({ k }: { k: SortKey }) {
    if (sort.key !== k) return <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />;
    return sort.dir === "asc" ? <ChevronUp className="size-3.5 text-foreground" aria-hidden /> : <ChevronDown className="size-3.5 text-foreground" aria-hidden />;
  }

  const Th = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => (
    <TableHead className={className} aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="-ml-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted hover:text-foreground"
      >
        {label} <SortIcon k={k} />
      </button>
    </TableHead>
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <Th k="title" label="Task" className="pl-4" />
              <Th k="status" label="Status" />
              <Th k="priority" label="Priority" className="hidden md:table-cell" />
              <Th k="assignee" label="Assignee" className="hidden md:table-cell" />
              <Th k="dueDate" label="Due" />
              <TableHead className="hidden lg:table-cell pr-4">Project</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((task) => {
              const due = getDueLabel(task.dueDate);
              const project = projectProp ?? task.project;
              return (
                <TableRow
                  key={task.id}
                  onClick={() => setSelectedId(task.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="max-w-[320px] pl-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedId(task.id); }}
                      className={cn(
                        "block max-w-full truncate text-left font-medium hover:text-primary focus-visible:underline focus-visible:outline-none",
                        task.status === "DONE" && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </button>
                  </TableCell>
                  <TableCell><StatusBadge status={task.status} /></TableCell>
                  <TableCell className="hidden md:table-cell"><PriorityBadge priority={task.priority} /></TableCell>
                  <TableCell className="hidden md:table-cell">
                    {task.assignee ? (
                      <span className="flex items-center gap-2">
                        <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" />
                        <span className="truncate">{task.assignee.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className={cn(
                    task.status !== "DONE" && due.variant === "overdue" ? "font-medium text-destructive" :
                    task.status !== "DONE" && due.variant === "today" ? "font-medium text-warning" : "text-muted-foreground",
                  )}>
                    {formatDate(task.dueDate)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell pr-4">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ProjectIcon icon={project?.emoji} color={project?.color} size="xs" />
                      <span className="truncate">{project?.name}</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No tasks match these filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <TaskDetailModal key={selected.id} task={selected} open onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
