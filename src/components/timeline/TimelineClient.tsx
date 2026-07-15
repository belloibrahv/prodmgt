"use client";

import { MdDateRange } from "react-icons/md";
import { differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from "date-fns";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

export default function TimelineClient({ projects }: { projects: ProjectWithRelations[] }) {
  const active = projects.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED" && p.startDate && p.dueDate);

  if (active.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-tva-ink">Timeline</h1>
          <p className="text-sm text-tva-ink-m mt-1">Project schedules and milestones</p>
        </div>
        <EmptyState
          icon={<MdDateRange size={48} />}
          title="No active projects with dates"
          description="Set start and due dates on your projects to see them on the timeline."
        />
      </div>
    );
  }

  // Calculate global date range: earliest start → latest due, padded by 7 days each side
  const allDates = active.flatMap((p) => [new Date(p.startDate!), new Date(p.dueDate!)]);
  const rangeStart = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const rangeEnd   = new Date(Math.max(...allDates.map((d) => d.getTime())));
  rangeStart.setDate(rangeStart.getDate() - 7);
  rangeEnd.setDate(rangeEnd.getDate() + 7);

  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;
  const dayWidth  = 36; // px per day

  // Month headers
  const months: { label: string; days: number }[] = [];
  let cursor = new Date(rangeStart);
  while (cursor <= rangeEnd) {
    const monthStart = startOfMonth(cursor);
    const monthEnd   = endOfMonth(cursor);
    const clampStart = cursor < rangeStart ? rangeStart : cursor;
    const clampEnd   = monthEnd  > rangeEnd  ? rangeEnd  : monthEnd;
    months.push({
      label: format(monthStart, "MMM yyyy"),
      days:  differenceInDays(clampEnd, clampStart) + 1,
    });
    cursor = new Date(monthEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-tva-ink">Timeline</h1>
        <p className="text-sm text-tva-ink-m mt-1">
          {active.length} active project{active.length !== 1 ? "s" : ""} scheduled
        </p>
      </div>

      <div className="bg-white border border-tva-border/60 rounded-20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: totalDays * dayWidth + 220 }}>

            {/* Month header row */}
            <div className="flex border-b border-tva-border/40">
              {/* Project label column */}
              <div className="w-52 min-w-[208px] flex-shrink-0 bg-tva-surface/50 border-r border-tva-border/40" />
              <div className="flex">
                {months.map((m, i) => (
                  <div
                    key={i}
                    style={{ width: m.days * dayWidth }}
                    className="px-3 py-3 text-xs font-semibold text-tva-ink border-r border-tva-border/30 bg-tva-surface/50"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Day header row */}
            <div className="flex border-b border-tva-border/40">
              <div className="w-52 min-w-[208px] flex-shrink-0 border-r border-tva-border/40 bg-tva-surface/50" />
              <div className="flex">
                {days.map((day, i) => (
                  <div
                    key={i}
                    style={{ width: dayWidth }}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 border-r border-tva-border/20 text-[10px] font-medium select-none",
                      isWeekend(day) && "bg-tva-surface/30",
                      isToday(day) && "bg-tva-red-lt font-bold text-tva-red",
                      !isWeekend(day) && !isToday(day) && "text-tva-ink-m",
                    )}
                  >
                    <span>{format(day, "d")}</span>
                    <span className="opacity-60">{format(day, "E")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project rows */}
            {active.map((project) => {
              const start = new Date(project.startDate!);
              const end   = new Date(project.dueDate!);
              const offsetDays = differenceInDays(start, rangeStart);
              const spanDays   = differenceInDays(end, start) + 1;
              const pct = Math.min(100, Math.round(
                (project.tasks.filter(t => t.status === "DONE").length / Math.max(project.tasks.length, 1)) * 100
              ));

              return (
                <div key={project.id} className="flex items-center border-b border-tva-border/40 hover:bg-tva-red-xlt/50 transition-colors group">
                  {/* Label */}
                  <div className="w-52 min-w-[208px] flex-shrink-0 px-4 py-4 border-r border-tva-border/40 flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <span className="text-xl">{project.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-tva-ink truncate group-hover:text-tva-red transition-colors">
                        {project.name}
                      </p>
                      <StatusBadge status={project.status} />
                    </div>
                  </div>

                  {/* Bar track */}
                  <div className="relative flex-1" style={{ height: 56 }}>
                    {/* Today line */}
                    {(() => {
                      const todayOffset = differenceInDays(new Date(), rangeStart);
                      if (todayOffset >= 0 && todayOffset <= totalDays) {
                        return (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-tva-red z-10"
                            style={{ left: todayOffset * dayWidth + dayWidth / 2 }}
                          />
                        );
                      }
                      return null;
                    })()}

                    {/* Project bar */}
                    <div
                      className="absolute top-3.5 rounded-12 flex items-center overflow-hidden shadow-sm"
                      style={{
                        left:   offsetDays * dayWidth + 4,
                        width:  Math.max(spanDays * dayWidth - 8, 0),
                        height: 32,
                        backgroundColor: project.color,
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 opacity-30 bg-white"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="relative z-10 px-2.5 text-xs font-semibold text-white truncate whitespace-nowrap">
                        {project.name} · {pct}%
                      </span>
                    </div>

                    {/* Milestone diamonds */}
                    {project.milestones.map((ms) => {
                      const msOffset = differenceInDays(new Date(ms.dueDate), rangeStart);
                      if (msOffset < 0 || msOffset > totalDays) return null;
                      return (
                        <div
                          key={ms.id}
                          title={`${ms.name} · ${formatDate(ms.dueDate)}`}
                          className="absolute z-20 cursor-pointer"
                          style={{ left: msOffset * dayWidth + dayWidth / 2 - 6, top: 12 }}
                        >
                          <div className={cn(
                            "w-3 h-3 rotate-45 border-2",
                            ms.completedAt ? "bg-tva-success border-tva-success" : "bg-white border-tva-warn",
                          )} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-tva-border/40 flex items-center gap-6 text-xs text-tva-ink-m bg-tva-surface/50">
          <span className="flex items-center gap-2">
            <span className="w-px h-4 bg-tva-red inline-block" /> Today
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 border-2 border-tva-warn bg-white inline-block" /> Milestone
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 border-2 border-tva-success bg-tva-success inline-block" /> Completed milestone
          </span>
        </div>
      </div>
    </div>
  );
}
