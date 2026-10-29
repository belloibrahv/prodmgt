"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, NotebookPen, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspace } from "@/components/layout/AppShell";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { createActionItem, deleteActionItem, setActionStatus } from "@/lib/actions/action-items";
import type { ActionItemWithRelations } from "@/lib/business-queries";
import { cn, getDueLabel } from "@/lib/utils";

interface ListProps {
  actions: ActionItemWithRelations[];
  /** Show which meeting each action came from (off inside the meeting itself). */
  showSource?: boolean;
  showProject?: boolean;
  /** Allow deleting actions (the server still checks who may). */
  editable?: boolean;
  className?: string;
  empty?: React.ReactNode;
}

export function ActionList({ actions, showSource, showProject, editable, className, empty }: ListProps) {
  const [pending, startTransition] = useTransition();

  function toggle(a: ActionItemWithRelations, done: boolean) {
    startTransition(async () => {
      const res = await setActionStatus(a.id, done ? "DONE" : "OPEN");
      if (!res.success) toast.error(res.error);
    });
  }

  function remove(a: ActionItemWithRelations) {
    startTransition(async () => {
      const res = await deleteActionItem(a.id);
      if (!res.success) toast.error(res.error);
    });
  }

  if (actions.length === 0) return empty ? <>{empty}</> : null;

  return (
    <ul className={cn("flex flex-col divide-y", className)}>
      {actions.map((a) => {
        const done = a.status === "DONE";
        const cancelled = a.status === "CANCELLED";
        const due = getDueLabel(a.dueDate);
        const late = !done && !cancelled && due.variant === "overdue";
        return (
          <li key={a.id} className="group/action flex items-start gap-3 py-2.5">
            <Checkbox
              className="mt-0.5"
              checked={done}
              disabled={pending || cancelled}
              onCheckedChange={(on) => toggle(a, on)}
              aria-label={done ? `Reopen ${a.title}` : `Mark ${a.title} done`}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className={cn("text-sm leading-snug", (done || cancelled) && "text-muted-foreground line-through")}>{a.title}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {a.owner ? (
                  <span className="inline-flex items-center gap-1.5"><Avatar name={a.owner.name} image={a.owner.image} size="xs" className="[&>div]:size-4 [&>div]:text-[7px]" />{a.owner.name}</span>
                ) : (
                  <span className="italic">No owner</span>
                )}
                {a.dueDate && (
                  <span className={cn("inline-flex items-center gap-1", late && "font-medium text-destructive")}>
                    <CalendarClock className="size-3" aria-hidden />{late ? `Overdue · ${format(new Date(a.dueDate), "d MMM")}` : due.label}
                  </span>
                )}
                {showProject && a.project && (
                  <Link href={`/projects/${a.project.id}`} className="inline-flex items-center gap-1 hover:text-foreground">
                    <ProjectIcon icon={a.project.emoji} color={a.project.color} size="xs" className="size-4 [&_svg]:size-2.5" />{a.project.name}
                  </Link>
                )}
                {showSource && a.meeting && (
                  <Link href={`/meetings/${a.meeting.id}`} className="inline-flex items-center gap-1 hover:text-foreground">
                    <NotebookPen className="size-3" aria-hidden />{a.meeting.title}
                  </Link>
                )}
              </div>
            </div>
            {editable && (
              <Tooltip>
                <TooltipTrigger render={
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground opacity-0 group-hover/action:opacity-100 focus-visible:opacity-100 hover:text-destructive print:hidden"
                    onClick={() => remove(a)} disabled={pending} aria-label={`Delete ${a.title}`} />
                }>
                  <Trash2 />
                </TooltipTrigger>
                <TooltipContent>Delete action</TooltipContent>
              </Tooltip>
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface AddProps {
  meetingId?: string;
  meetingItemId?: string;
  projectId?: string | null;
  decisionId?: string;
  defaultOwnerId?: string | null;
  defaultDue?: string;
  placeholder?: string;
}

/** One-line form for assigning a deliverable with an owner and deadline. */
export function AddActionForm({ meetingId, meetingItemId, projectId, decisionId, defaultOwnerId, defaultDue, placeholder = "Add an action…" }: AddProps) {
  const { members } = useWorkspace();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (meetingId) fd.set("meetingId", meetingId);
    if (meetingItemId) fd.set("meetingItemId", meetingItemId);
    if (projectId) fd.set("projectId", projectId);
    if (decisionId) fd.set("decisionId", decisionId);
    startTransition(async () => {
      const res = await createActionItem(fd);
      if (res.success) {
        (form.elements.namedItem("title") as HTMLInputElement).value = "";
        (form.elements.namedItem("title") as HTMLInputElement).focus();
      } else {
        toast.error(res.error);
      }
    });
  }

  const field = "h-8 rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 print:hidden">
      <input name="title" required placeholder={placeholder} aria-label="Action" className={cn(field, "min-w-48 flex-1")} />
      <select name="ownerId" defaultValue={defaultOwnerId ?? ""} aria-label="Owner" className={cn(field, "w-36")}>
        <option value="">No owner</option>
        {members.map((m) => <option key={m.id} value={m.id}>{m.name ?? m.email}</option>)}
      </select>
      <input name="dueDate" type="date" defaultValue={defaultDue} aria-label="Due date" className={cn(field, "w-36")} />
      <Button type="submit" size="sm" variant="secondary" loading={pending}><Plus /> Add</Button>
    </form>
  );
}
