import Link from "next/link";
import { CalendarIcon, ClipboardListIcon, FileTextIcon } from "lucide-react";
import { AvatarGroup } from "@/components/ui/Avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, getDueLabel, getProgressPercent, cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

export default function ProjectCard({ project: p }: { project: ProjectWithRelations }) {
  const done = p.tasks.filter((t) => t.status === "DONE").length;
  const pct = getProgressPercent(p.tasks);
  const overdue = p.status !== "COMPLETED" && getDueLabel(p.dueDate).variant === "overdue";

  return (
    <Link
      href={`/projects/${p.id}`}
      className="group flex flex-col rounded-xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <ProjectIcon icon={p.emoji} color={p.color} size="lg" />
          <StatusBadge status={p.status} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-tight group-hover:text-primary">{p.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {p.description || "No description"}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{done} of {p.tasks.length} tasks done</span>
            <span className="font-medium tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.name} progress`}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t px-5 py-3 text-xs text-muted-foreground">
        <AvatarGroup users={p.members.map((m) => m.user)} max={3} />
        <span className="flex items-center gap-1"><ClipboardListIcon className="size-3.5" aria-hidden />{p._count.tasks}</span>
        <span className="flex items-center gap-1"><FileTextIcon className="size-3.5" aria-hidden />{p._count.documents}</span>
        <span className="ml-auto flex items-center gap-2">
          <PriorityBadge priority={p.priority} className="hidden sm:inline-flex" />
          {p.dueDate && (
            <span className={cn("flex items-center gap-1", overdue && "font-medium text-destructive")}>
              <CalendarIcon className="size-3.5" aria-hidden />{formatDate(p.dueDate)}
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}
