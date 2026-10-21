"use client";

import { differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from "date-fns";
import { CalendarRangeIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

export default function TimelineClient({ projects }: { projects: ProjectWithRelations[] }) {
  const active = projects.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED" && p.startDate && p.dueDate);

  if (active.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Timeline" description="Project schedules and milestones" />
        <Empty className="rounded-xl border border-dashed bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon"><CalendarRangeIcon /></EmptyMedia>
            <EmptyTitle>Nothing scheduled yet</EmptyTitle>
            <EmptyDescription>Set start and due dates on your projects to see them on the timeline.</EmptyDescription>
          </EmptyHeader>
        </Empty>
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timeline"
        description={`${active.length} project${active.length !== 1 ? "s" : ""} scheduled`}
      />

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: totalDays * dayWidth + 220 }}>

            {/* Month header row */}
            <div className="flex border-b border-border">
              {/* Project label column */}
              <div className="w-52 min-w-[208px] flex-shrink-0 bg-muted/50 border-r border-border" />
              <div className="flex">
                {months.map((m, i) => (
                  <div
                    key={i}
                    style={{ width: m.days * dayWidth }}
                    className="px-3 py-3 text-xs font-semibold text-foreground border-r border-border bg-muted/50"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Day header row */}
            <div className="flex border-b border-border">
              <div className="w-52 min-w-[208px] flex-shrink-0 border-r border-border bg-muted/50" />
              <div className="flex">
                {days.map((day, i) => (
                  <div
                    key={i}
                    style={{ width: dayWidth }}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 border-r border-border text-xs font-medium select-none",
                      isWeekend(day) && "bg-muted/30",
                      isToday(day) && "bg-primary/10 font-bold text-primary",
                      !isWeekend(day) && !isToday(day) && "text-muted-foreground",
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
                <div key={project.id} className="flex items-center border-b border-border hover:bg-accent/50 transition-colors group">
                  {/* Label */}
                  <div className="w-52 min-w-[208px] flex-shrink-0 px-4 py-4 border-r border-border flex items-center gap-2">
                    <ProjectIcon icon={project.emoji} color={project.color} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
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
                            className="absolute top-0 bottom-0 w-px bg-primary z-10"
                            style={{ left: todayOffset * dayWidth + dayWidth / 2 }}
                          />
                        );
                      }
                      return null;
                    })()}

                    {/* Project bar */}
                    <div
                      className="absolute top-3.5 rounded-lg flex items-center overflow-hidden shadow-xs"
                      style={{
                        left:   offsetDays * dayWidth + 4,
                        width:  Math.max(spanDays * dayWidth - 8, 0),
                        height: 32,
                        backgroundColor: project.color,
                      }}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 opacity-30 bg-card"
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
                            ms.completedAt ? "bg-success border-tva-success" : "bg-card border-tva-warn",
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
        <div className="px-6 py-4 border-t border-border flex items-center gap-6 text-xs text-muted-foreground bg-muted/50">
          <span className="flex items-center gap-2">
            <span className="w-px h-4 bg-primary inline-block" /> Today
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 border-2 border-tva-warn bg-card inline-block" /> Milestone
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 border-2 border-tva-success bg-success inline-block" /> Completed milestone
          </span>
        </div>
      </div>
    </div>
  );
}
