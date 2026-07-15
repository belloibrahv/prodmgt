"use client";

import { useState, useTransition } from "react";
import { Calendar, User, Flag, Clock, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate, formatRelative, STATUS_LABELS } from "@/lib/utils";
import { addComment } from "@/lib/actions/tasks";
import type { TaskWithRelations } from "@/types";

interface Props { task: TaskWithRelations; open: boolean; onClose: () => void }

export default function TaskDetailModal({ task, open, onClose }: Props) {
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    startTransition(async () => {
      const res = await addComment(task.id, comment);
      if (res.success) { setComment(""); toast.success("Comment added"); }
      else toast.error(res.error);
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={task.title} size="lg">
      <div className="flex flex-col gap-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.milestone && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-tva-info-lt text-tva-info">
              🏁 {task.milestone.name}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-[13px] text-tva-ink-m bg-tva-surface rounded-12 p-4">{task.description}</p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <User size={13}/>, label: "Assignee", value: task.assignee?.name ?? "Unassigned" },
            { icon: <Calendar size={13}/>, label: "Due date", value: formatDate(task.dueDate) },
            { icon: <Flag size={13}/>, label: "Priority", value: task.priority },
            { icon: <Clock size={13}/>, label: "Estimate", value: task.estimate ? `${task.estimate}h` : "—" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-2 bg-tva-surface rounded-12 p-3">
              <span className="text-tva-ink-m mt-0.5 flex-shrink-0">{icon}</span>
              <div>
                <p className="text-[11px] font-semibold text-tva-ink-m">{label}</p>
                <p className="text-[13px] font-medium text-tva-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div>
            <h4 className="text-[13px] font-semibold text-tva-ink mb-2">Subtasks ({task.subtasks.length})</h4>
            <ul className="flex flex-col gap-1.5">
              {task.subtasks.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-[13px] text-tva-ink">
                  <span className={`w-4 h-4 rounded border-2 flex-shrink-0 ${s.status === "DONE" ? "bg-tva-success border-tva-success" : "border-tva-border"}`} />
                  <span className={s.status === "DONE" ? "line-through text-tva-ink-m" : ""}>{s.title}</span>
                  <span className="ml-auto"><StatusBadge status={s.status} /></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comments */}
        <div>
          <h4 className="text-[13px] font-semibold text-tva-ink mb-3">
            Comments ({task.comments.length})
          </h4>
          {task.comments.length === 0 ? (
            <p className="text-[12px] text-tva-ink-m">No comments yet. Start the conversation.</p>
          ) : (
            <ul className="flex flex-col gap-3 mb-4">
              {task.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <Avatar name={c.user.name} image={c.user.image} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 bg-tva-surface rounded-12 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-semibold text-tva-ink">{c.user.name}</span>
                      <span className="text-[11px] text-tva-ink-m">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-tva-ink">{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-tva-surface border border-tva-border rounded-full px-4 py-2.5 text-[13px] text-tva-ink placeholder:text-tva-ink-m outline-none focus:border-tva-red transition-colors"
            />
            <Button type="submit" loading={pending} size="sm" variant="default" className="rounded-full p-2.5 bg-tva-red text-white hover:bg-tva-red-dk">
              <Send size={14} />
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
