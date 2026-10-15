"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/AppShell";
import { formatDate, formatRelative } from "@/lib/utils";
import { addComment, deleteTask, updateTask } from "@/lib/actions/tasks";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./NewTaskModal";
import type { TaskWithRelations } from "@/types";

interface Props { task: TaskWithRelations; open: boolean; onClose: () => void }

const fieldClass =
  "w-full rounded-12 border border-tva-border bg-tva-surface px-3 py-2 text-[13px] font-medium text-tva-ink outline-none transition-colors focus:border-tva-red focus:bg-white";

function toDateInput(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function TaskDetailModal({ task, open, onClose }: Props) {
  const router = useRouter();
  const { members } = useWorkspace();
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  // Comments get their own pending state so a field save never blocks posting.
  const [commenting, startComment] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  /** Save a single field as soon as it changes. */
  function save(field: string, value: string) {
    const fd = new FormData();
    fd.set(field, value);
    startTransition(async () => {
      const res = await updateTask(task.id, fd);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Saved");
      router.refresh();
    });
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    startComment(async () => {
      const res = await addComment(task.id, comment);
      if (res.success) { setComment(""); router.refresh(); }
      else toast.error(res.error);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Task deleted");
      onClose();
      router.refresh();
    });
  }

  const assigneeOptions = [...members];
  if (task.assignee && !members.some((m) => m.id === task.assignee!.id)) assigneeOptions.push(task.assignee);

  return (
    <Modal open={open} onClose={onClose} title={task.project ? `${task.project.emoji} ${task.project.name}` : "Task"} size="lg">
      <div className="flex flex-col gap-5">
        {/* Title & description, saved on blur */}
        <div className="flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => { if (title.trim() && title !== task.title) save("title", title); else setTitle(task.title); }}
            aria-label="Task title"
            className="w-full rounded-12 border border-transparent px-2 py-1.5 -mx-2 text-[19px] font-semibold text-tva-ink outline-none hover:border-tva-border focus:border-tva-red"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => { if (description !== (task.description ?? "")) save("description", description); }}
            placeholder="Add a description…"
            rows={3}
            aria-label="Description"
            className="w-full resize-y rounded-12 border border-tva-border/60 bg-tva-surface px-3 py-2.5 text-[13px] leading-relaxed text-tva-ink outline-none transition-colors placeholder:text-tva-ink-m focus:border-tva-red focus:bg-white"
          />
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-tva-ink-m">Status</span>
            <select className={fieldClass} defaultValue={task.status} onChange={(e) => save("status", e.target.value)} disabled={pending}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-tva-ink-m">Priority</span>
            <select className={fieldClass} defaultValue={task.priority} onChange={(e) => save("priority", e.target.value)} disabled={pending}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-tva-ink-m">Assignee</span>
            <select className={fieldClass} defaultValue={task.assigneeId ?? ""} onChange={(e) => save("assigneeId", e.target.value)} disabled={pending}>
              <option value="">Unassigned</option>
              {assigneeOptions.map((m) => <option key={m.id} value={m.id}>{m.name ?? m.email}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-tva-ink-m">Due date</span>
            <input type="date" className={fieldClass} defaultValue={toDateInput(task.dueDate)} onChange={(e) => save("dueDate", e.target.value)} disabled={pending} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-tva-ink-m">Estimate (hours)</span>
            <input
              type="number" min="0" step="0.5" className={fieldClass}
              defaultValue={task.estimate ?? ""}
              onBlur={(e) => { if (e.target.value !== String(task.estimate ?? "")) save("estimate", e.target.value); }}
              disabled={pending}
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-tva-ink-m">Created</span>
            <span className="px-1 py-2 text-[13px] text-tva-ink">
              {formatDate(task.createdAt)}{task.creator ? ` by ${task.creator.name?.split(" ")[0] ?? "someone"}` : ""}
            </span>
          </div>
        </div>

        {task.milestone && (
          <p className="text-[12px] font-semibold text-tva-info">🏁 Milestone: {task.milestone.name}</p>
        )}

        {/* Comments */}
        <div className="border-t border-tva-border/60 pt-5">
          <h4 className="text-[13px] font-semibold text-tva-ink mb-3">Comments ({task.comments.length})</h4>
          {task.comments.length === 0 ? (
            <p className="mb-4 text-[12px] text-tva-ink-m">No comments yet. Start the conversation.</p>
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
                    <p className="whitespace-pre-wrap text-[13px] text-tva-ink">{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              aria-label="Add a comment"
              className="flex-1 bg-tva-surface border border-tva-border rounded-full px-4 py-2.5 text-[13px] text-tva-ink placeholder:text-tva-ink-m outline-none focus:border-tva-red transition-colors"
            />
            <Button type="submit" loading={commenting} size="icon-lg" className="rounded-full" aria-label="Post comment">
              {!commenting && <Send size={14} />}
            </Button>
          </form>
        </div>

        <div className="flex justify-between border-t border-tva-border/60 pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-8 px-2 py-1.5 text-[12.5px] font-semibold text-tva-error hover:bg-tva-error-lt disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete task
          </button>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
