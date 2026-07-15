"use client";

import { useState } from "react";
import { MdCalendarToday, MdChatBubbleOutline } from "react-icons/md";
import { motion } from "framer-motion";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getDueLabel, cn } from "@/lib/utils";
import TaskDetailModal from "./TaskDetailModal";
import type { TaskWithRelations } from "@/types";

export default function TaskCard({ task }: { task: TaskWithRelations }) {
  const [showDetail, setShowDetail] = useState(false);
  const due = getDueLabel(task.dueDate);

  const dueClass: Record<string, string> = {
    overdue: "text-tva-error bg-tva-error-lt",
    today:   "text-tva-warn bg-tva-warn-lt",
    tomorrow:"text-tva-info bg-tva-info-lt",
    upcoming:"text-tva-ink-m bg-tva-surface",
    none:    "text-tva-ink-m bg-tva-surface",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, boxShadow: "0 8px 16px -4px rgba(0,0,0,0.1)" }}
        onClick={() => setShowDetail(true)}
        className="bg-white border border-tva-border/60 rounded-16 p-4 shadow-sm hover:border-tva-red/40 transition-all cursor-pointer group"
      >
        {/* Project tag */}
        {task.project && (
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: task.project.color }} />
            <span className="text-xs text-tva-ink-m">{task.project.emoji}</span>
            <span className="text-xs font-medium text-tva-ink-m">{task.project.name}</span>
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-semibold text-tva-ink group-hover:text-tva-red transition-colors line-clamp-2 leading-relaxed">
          {task.title}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-tva-ink-m font-medium">
                <MdChatBubbleOutline size={12} /> {task.comments.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-8", dueClass[due.variant])}>
                <MdCalendarToday size={11} />
                {due.label.replace("Overdue · ", "")}
              </span>
            )}
            {task.assignee && (
              <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" />
            )}
          </div>
        </div>
      </motion.div>

      <TaskDetailModal task={task} open={showDetail} onClose={() => setShowDetail(false)} />
    </>
  );
}
