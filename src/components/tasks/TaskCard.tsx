"use client";

import { useState } from "react";
import { Calendar, MessageSquare } from "lucide-react";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getDueLabel, cn } from "@/lib/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskWithRelations } from "@/types";

export default function TaskCard({ task }: { task: TaskWithRelations }) {
  const [showDetail, setShowDetail] = useState(false);
  const due = getDueLabel(task.dueDate);

  const dueClass: Record<string, string> = {
    overdue: "text-tva-error",
    today:   "text-tva-warn",
    tomorrow:"text-tva-info",
    upcoming:"text-tva-ink-m",
    none:    "text-tva-ink-m",
  };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-white border border-tva-border rounded-12 p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
      >
        {/* Project tag */}
        {task.project && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color }} />
            <span className="text-[11px] font-medium text-tva-ink-m">{task.project.emoji} {task.project.name}</span>
          </div>
        )}

        {/* Title */}
        <p className="text-[13px] font-semibold text-tva-ink group-hover:text-tva-red transition-colors line-clamp-2">
          {task.title}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-tva-ink-m">
                <MessageSquare size={11} /> {task.comments.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className={cn("flex items-center gap-1 text-[11px] font-medium", dueClass[due.variant])}>
                <Calendar size={11} />
                {due.label.replace("Overdue · ", "")}
              </span>
            )}
            {task.assignee && (
              <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" />
            )}
          </div>
        </div>
      </div>

      <TaskDetailModal task={task} open={showDetail} onClose={() => setShowDetail(false)} />
    </>
  );
}
