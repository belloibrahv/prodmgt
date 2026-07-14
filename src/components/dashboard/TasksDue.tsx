"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { getDueLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TaskWithRelations } from "@/types";

export default function TasksDue({ tasks }: { tasks: TaskWithRelations[] }) {
  const upcoming = tasks
    .filter((t) => t.status !== "DONE" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 8);

  const dueVariantClass: Record<string, string> = {
    overdue:  "text-tva-error",
    today:    "text-tva-warn",
    tomorrow: "text-tva-info",
    upcoming: "text-tva-ink-m",
    none:     "text-tva-ink-m",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Due</CardTitle>
        <Link href="/tasks" className="text-[13px] font-medium text-tva-red hover:underline flex items-center gap-1">
          View all <ArrowRight size={13} />
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        {upcoming.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-tva-ink-m">No upcoming deadlines. 🎉</p>
        ) : (
          <ul className="divide-y divide-tva-border/60">
            {upcoming.map((task) => {
              const due = getDueLabel(task.dueDate);
              return (
                <li key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-tva-red-xlt transition-colors">
                  {/* Color dot for project */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-tva-ink truncate">{task.title}</p>
                    <p className="text-[11px] text-tva-ink-m">{task.project.emoji} {task.project.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <span className={cn("flex items-center gap-1 text-[11px] font-medium", dueVariantClass[due.variant])}>
                      <Calendar size={11} />
                      {due.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
