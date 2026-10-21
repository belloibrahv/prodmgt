"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, Flag } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useWorkspace } from "@/components/layout/AppShell";
import { formatDate, formatRelative } from "@/lib/utils";
import { addComment, deleteTask, updateTask } from "@/lib/actions/tasks";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./NewTaskModal";
import type { TaskWithRelations } from "@/types";

interface Props { task: TaskWithRelations; open: boolean; onClose: () => void }

const fieldClass =
  "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors focus-visible:border-ring focus:bg-card";

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
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Task deleted");
      setConfirmDelete(false);
      onClose();
      router.refresh();
    });
  }

  const assigneeOptions = [...members];
  if (task.assignee && !members.some((m) => m.id === task.assignee!.id)) assigneeOptions.push(task.assignee);

  return (
    <Modal open={open} onClose={onClose} title={task.project?.name ?? "Task"} size="lg">
      <div className="flex flex-col gap-5">
        {/* Title & description, saved on blur */}
        <div className="flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => { if (title.trim() && title !== task.title) save("title", title); else setTitle(task.title); }}
            aria-label="Task title"
            className="w-full rounded-lg border border-transparent px-2 py-1.5 -mx-2 text-[19px] font-semibold text-foreground outline-none hover:border-border focus-visible:border-ring"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => { if (description !== (task.description ?? "")) save("description", description); }}
            placeholder="Add a description…"
            rows={3}
            aria-label="Description"
            className="w-full resize-y rounded-lg border border-border bg-muted px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus:bg-card"
          />
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Status</span>
            <select className={fieldClass} defaultValue={task.status} onChange={(e) => save("status", e.target.value)} disabled={pending}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Priority</span>
            <select className={fieldClass} defaultValue={task.priority} onChange={(e) => save("priority", e.target.value)} disabled={pending}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Assignee</span>
            <select className={fieldClass} defaultValue={task.assigneeId ?? ""} onChange={(e) => save("assigneeId", e.target.value)} disabled={pending}>
              <option value="">Unassigned</option>
              {assigneeOptions.map((m) => <option key={m.id} value={m.id}>{m.name ?? m.email}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Due date</span>
            <input type="date" className={fieldClass} defaultValue={toDateInput(task.dueDate)} onChange={(e) => save("dueDate", e.target.value)} disabled={pending} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Estimate (hours)</span>
            <input
              type="number" min="0" step="0.5" className={fieldClass}
              defaultValue={task.estimate ?? ""}
              onBlur={(e) => { if (e.target.value !== String(task.estimate ?? "")) save("estimate", e.target.value); }}
              disabled={pending}
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">Created</span>
            <span className="px-1 py-2 text-sm text-foreground">
              {formatDate(task.createdAt)}{task.creator ? ` by ${task.creator.name?.split(" ")[0] ?? "someone"}` : ""}
            </span>
          </div>
        </div>

        {task.milestone && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-info">
            <Flag className="size-3.5" aria-hidden /> Milestone: {task.milestone.name}
          </p>
        )}

        {/* Comments */}
        <div className="border-t border-border pt-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Comments ({task.comments.length})</h4>
          {task.comments.length === 0 ? (
            <p className="mb-4 text-xs text-muted-foreground">No comments yet. Start the conversation.</p>
          ) : (
            <ul className="flex flex-col gap-3 mb-4">
              {task.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <Avatar name={c.user.name} image={c.user.image} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">{c.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{c.content}</p>
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
              className="flex-1 bg-muted border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring transition-colors"
            />
            <Button type="submit" loading={commenting} size="icon-lg" className="rounded-full" aria-label="Post comment">
              {!commenting && <Send size={14} />}
            </Button>
          </form>
        </div>

        <div className="flex justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete task
          </button>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this task?"
        description={<>&ldquo;{task.title}&rdquo; and its comments will be permanently deleted.</>}
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        pending={pending}
      />
    </Modal>
  );
}
