import { CheckCircle2, Circle, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Milestone, Task } from "@prisma/client";

interface Props {
  milestones: Milestone[];
  tasks: Task[];
}

export default function ProjectMilestones({ milestones, tasks }: Props) {
  if (milestones.length === 0) {
    return (
      <div className="bg-white border border-tva-border rounded-16 p-8 text-center shadow-sm">
        <p className="text-[15px] font-semibold text-tva-ink">No milestones yet</p>
        <p className="text-sm text-tva-ink-m mt-1">Add milestones to track key project phases.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {milestones.map((m) => {
        const mTasks = tasks.filter((t) => t.milestoneId === m.id);
        const done = mTasks.filter((t) => t.status === "DONE").length;
        const pct = mTasks.length ? Math.round((done / mTasks.length) * 100) : 0;
        const isComplete = !!m.completedAt || pct === 100;

        return (
          <div key={m.id} className="bg-white border border-tva-border rounded-16 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-tva-success mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle size={20} className="text-tva-border mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-[14px] font-semibold text-tva-ink">{m.name}</h3>
                  {m.description && <p className="text-[12px] text-tva-ink-m mt-0.5">{m.description}</p>}
                </div>
              </div>
              <span className="flex items-center gap-1 text-[12px] text-tva-ink-m flex-shrink-0">
                <Calendar size={12} /> {formatDate(m.dueDate)}
              </span>
            </div>

            {mTasks.length > 0 && (
              <div className="mt-3 ml-8">
                <div className="flex justify-between text-[11px] text-tva-ink-m mb-1">
                  <span>{done}/{mTasks.length} tasks</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-tva-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tva-success rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
