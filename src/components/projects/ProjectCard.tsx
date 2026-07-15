"use client";

import { useRouter } from "next/navigation";
import { MdCalendarToday, MdAssignment, MdPeople, MdDescription } from "react-icons/md";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => router.push(`/projects/${p.id}`)}
        className="bg-white border border-tva-border/60 rounded-20 px-5 py-4 flex items-center gap-5 cursor-pointer hover:shadow-lg hover:border-tva-red/40 transition-all group"
        style={{ borderLeft: `4px solid ${p.color}` }}
      >
        <div className="flex-shrink-0 drop-shadow-sm">
          <span className="text-3xl">{p.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-tva-ink group-hover:text-tva-red transition-colors truncate">{p.name}</p>
          <p className="text-xs text-tva-ink-m truncate">{p.description}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <StatusBadge status={p.status} />
          <PriorityBadge priority={p.priority} />
          <div className="flex items-center gap-1.5 text-xs text-tva-ink-m font-medium">
            <MdAssignment size={14} /> {p._count.tasks}
          </div>
          <div className="w-24">
            <ProgressBar value={pct} showLabel />
          </div>
          <AvatarGroup users={members} max={3} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.15)" }}
      onClick={() => router.push(`/projects/${p.id}`)}
      className="bg-white border border-tva-border/60 rounded-20 shadow-sm cursor-pointer hover:border-tva-red/40 transition-all flex flex-col overflow-hidden group"
    >
      {/* Top color bar */}
      <div className="h-1.5" style={{ backgroundColor: p.color }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="drop-shadow-sm">
            <span className="text-3xl">{p.emoji}</span>
          </div>
          <StatusBadge status={p.status} />
        </div>

        {/* Name & desc */}
        <div>
          <h3 className="text-base font-semibold text-tva-ink group-hover:text-tva-red transition-colors leading-tight">{p.name}</h3>
          {p.description && (
            <p className="text-xs text-tva-ink-m mt-1.5 line-clamp-2 leading-relaxed">{p.description}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 text-xs text-tva-ink-m">
          <span className="flex items-center gap-1.5 font-medium"><MdAssignment size={14} />{p._count.tasks} tasks</span>
          <span className="flex items-center gap-1.5 font-medium"><MdDescription size={14} />{p._count.documents} docs</span>
          <span className="flex items-center gap-1.5 font-medium"><MdPeople size={14} />{p._count.members}</span>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-tva-ink-m">
            <span>Progress</span><span>{pct}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-tva-border/40 flex items-center justify-between bg-tva-surface/30">
        <AvatarGroup users={members} max={3} />
        {p.dueDate && (
          <span className="flex items-center gap-1.5 text-xs text-tva-ink-m font-medium">
            <MdCalendarToday size={13} /> {formatDate(p.dueDate)}
          </span>
        )}
        <PriorityBadge priority={p.priority} />
      </div>
    </motion.div>
  );
}
