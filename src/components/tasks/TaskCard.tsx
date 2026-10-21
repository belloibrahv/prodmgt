"use client";

import { useState } from "react";
import { ChevronRight, CalendarIcon, MessageSquareIcon } from "lucide-react";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getDueLabel, cn, KANBAN_COLUMNS } from "@/lib/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

const dueClass: Record<string, string> = {
  overdue: "text-tva-error bg-tva-error-lt",
  today:   "text-tva-warn bg-tva-warn-lt",
  tomorrow:"text-tva-info bg-tva-info-lt",
  upcoming:"text-tva-ink-m bg-tva-surface",
  none:    "text-tva-ink-m bg-tva-surface",
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
        onKeyDown={(e) => { if (e.key === "Enter") setShowDetail(true); }}
        className="bg-white border border-tva-border/60 rounded-16 p-4 shadow-sm hover:border-tva-red/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus-visible:outline focus-visible:outline-2 focus-visible:outline-tva-red"
      >
        {task.project && (
          <div className="flex items-center gap-2 mb-2.5">
            <ProjectIcon icon={task.project.emoji} color={task.project.color} size="xs" />
            <span className="text-xs font-medium text-tva-ink-m truncate">{task.project.name}</span>
          </div>
        )}

        <p className={cn(
          "text-sm font-semibold group-hover:text-tva-red transition-colors line-clamp-2 leading-relaxed",
          task.status === "DONE" ? "text-tva-ink-m line-through decoration-tva-ink-m/40" : "text-tva-ink",
        )}>
          {task.title}
        </p>

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <PriorityBadge priority={task.priority} />
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-tva-ink-m font-medium">
                <MessageSquareIcon size={12} /> {task.comments.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.dueDate && due.label && (
              <span className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-8 whitespace-nowrap", dueClass[due.variant])}>
                <CalendarIcon size={11} />
                {due.label}
              </span>
            )}
            {task.assignee && (
              <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" />
            )}
          </div>
        </div>

        {onMove && next && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMove(next); }}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-8 border border-tva-border/60 py-1.5 text-[11.5px] font-semibold text-tva-ink-m opacity-100 transition-all hover:border-tva-red/40 hover:bg-tva-red-xlt hover:text-tva-red lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
          >
            Move to {nextLabel} <ChevronRight size={13} />
          </button>
        )}
      </div>

      {showDetail && <TaskDetailModal task={task} open onClose={() => setShowDetail(false)} />}
    </>
  );
}
