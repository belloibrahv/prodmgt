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
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-xs">
        <p className="text-[15px] font-semibold text-foreground">No milestones yet</p>
        <p className="text-sm text-muted-foreground mt-1">Add milestones to track key project phases.</p>
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
          <div key={m.id} className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle size={20} className="text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{m.name}</h3>
                  {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Calendar size={12} /> {formatDate(m.dueDate)}
              </span>
            </div>

            {mTasks.length > 0 && (
              <div className="mt-3 ml-8">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{done}/{mTasks.length} tasks</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
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
