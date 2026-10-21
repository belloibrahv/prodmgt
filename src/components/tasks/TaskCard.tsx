"use client";

import { useState } from "react";
import { ArrowRight, CalendarIcon, MessageSquareIcon } from "lucide-react";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getDueLabel, cn, KANBAN_COLUMNS } from "@/lib/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

const dueClass: Record<string, string> = {
  overdue:  "bg-destructive/10 text-destructive",
  today:    "bg-warning/12 text-warning",
  tomorrow: "bg-info/10 text-info",
  upcoming: "text-muted-foreground",
  none:     "text-muted-foreground",
};

// The next step in the normal flow, offered as a one-click shortcut on each card.
const NEXT_STATUS: Record<string, string> = {
  BACKLOG: "TODO", TODO: "IN_PROGRESS", IN_PROGRESS: "IN_REVIEW", IN_REVIEW: "DONE", BLOCKED: "IN_PROGRESS",
};

interface Props {
  task: TaskWithRelations;
  onMove?: (status: string) => void;
}

export default function TaskCard({ task, onMove }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const due = task.status === "DONE" ? { label: "", variant: "none" } : getDueLabel(task.dueDate);
  const next = NEXT_STATUS[task.status];
  const nextLabel = KANBAN_COLUMNS.find((c) => c.id === next)?.label;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowDetail(true); } }}
        className="group rounded-lg border bg-card p-3 shadow-xs transition-all hover:border-primary/25 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        {task.project && (
          <div className="mb-2 flex items-center gap-1.5">
            <ProjectIcon icon={task.project.emoji} color={task.project.color} size="xs" />
            <span className="truncate text-xs text-muted-foreground">{task.project.name}</span>
          </div>
        )}

        <p className={cn(
          "line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary",
          task.status === "DONE" && "text-muted-foreground line-through decoration-muted-foreground/50",
        )}>
          {task.title}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-label={`${task.comments.length} comments`}>
              <MessageSquareIcon className="size-3.5" aria-hidden /> {task.comments.length}
            </span>
          )}
          <span className="ml-auto flex items-center gap-2">
            {task.dueDate && due.label && (
              <span className={cn("flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium", dueClass[due.variant])}>
                <CalendarIcon className="size-3" aria-hidden />
                {due.label}
              </span>
            )}
            {task.assignee && <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" />}
          </span>
        </div>

        {onMove && next && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMove(next); }}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-dashed py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          >
            Move to {nextLabel} <ArrowRight className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      {showDetail && <TaskDetailModal task={task} open onClose={() => setShowDetail(false)} />}
    </>
  );
}
