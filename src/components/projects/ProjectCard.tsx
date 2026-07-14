"use client";

import { useRouter } from "next/navigation";
import { Calendar, CheckSquare, Users, FileText } from "lucide-react";
import { AvatarGroup } from "@/components/ui/Avatar";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate, getProgressPercent } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

interface Props { project: ProjectWithRelations; listView?: boolean }

export default function ProjectCard({ project: p, listView }: Props) {
  const router = useRouter();
  const pct = getProgressPercent(p.tasks);
  const members = p.members.map((m) => m.user);

  if (listView) {
    return (
      <div
        onClick={() => router.push(`/projects/${p.id}`)}
        className="bg-white border border-tva-border rounded-16 px-5 py-4 flex items-center gap-5 cursor-pointer hover:shadow-md hover:border-tva-red/30 transition-all group"
        style={{ borderLeft: `4px solid ${p.color}` }}
      >
        <span className="text-2xl flex-shrink-0">{p.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-tva-ink group-hover:text-tva-red transition-colors truncate">{p.name}</p>
          <p className="text-[12px] text-tva-ink-m truncate">{p.description}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <StatusBadge status={p.status} />
          <PriorityBadge priority={p.priority} />
          <div className="flex items-center gap-1 text-[12px] text-tva-ink-m">
            <CheckSquare size={13} /> {p._count.tasks}
          </div>
          <div className="w-24">
            <ProgressBar value={pct} showLabel />
          </div>
          <AvatarGroup users={members} max={3} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/projects/${p.id}`)}
      className="bg-white border border-tva-border rounded-16 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden group"
    >
      {/* Top color bar */}
      <div className="h-1" style={{ backgroundColor: p.color }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-2xl">{p.emoji}</span>
          <StatusBadge status={p.status} />
        </div>

        {/* Name & desc */}
        <div>
          <h3 className="text-[15px] font-semibold text-tva-ink group-hover:text-tva-red transition-colors">{p.name}</h3>
          {p.description && (
            <p className="text-[12px] text-tva-ink-m mt-1 line-clamp-2">{p.description}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 text-[12px] text-tva-ink-m">
          <span className="flex items-center gap-1"><CheckSquare size={12} />{p._count.tasks} tasks</span>
          <span className="flex items-center gap-1"><FileText size={12} />{p._count.documents} docs</span>
          <span className="flex items-center gap-1"><Users size={12} />{p._count.members}</span>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-medium text-tva-ink-m">
            <span>Progress</span><span>{pct}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-tva-border/60 flex items-center justify-between">
        <AvatarGroup users={members} max={3} />
        {p.dueDate && (
          <span className="flex items-center gap-1 text-[11px] text-tva-ink-m">
            <Calendar size={11} /> {formatDate(p.dueDate)}
          </span>
        )}
        <PriorityBadge priority={p.priority} />
      </div>
    </div>
  );
}
