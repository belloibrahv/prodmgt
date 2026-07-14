import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProgressPercent } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

export default function ActiveProjects({ projects }: { projects: ProjectWithRelations[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
        <Link href="/projects" className="text-[13px] font-medium text-tva-red hover:underline flex items-center gap-1">
          View all <ArrowRight size={13} />
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        {projects.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-tva-ink-m">No active projects yet.</p>
        ) : (
          <ul>
            {projects.map((p) => {
              const pct = getProgressPercent(p.tasks);
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-tva-red-xlt transition-colors group"
                  >
                    {/* Color bar */}
                    <span
                      className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    {/* Emoji + info */}
                    <span className="text-xl flex-shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-tva-ink truncate group-hover:text-tva-red transition-colors">
                        {p.name}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <ProgressBar value={pct} className="flex-1" />
                        <span className="text-[11px] font-semibold text-tva-ink-m w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={p.status} />
                      <span className="text-[11px] text-tva-ink-m">{p._count.tasks} tasks</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
