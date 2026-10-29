"use client";

import Link from "next/link";
import { addWeeks, format, isWithinInterval, startOfWeek } from "date-fns";
import { Activity } from "lucide-react";
import type { Health } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { HealthBadge } from "@/components/business/primitives";
import { HEALTH } from "@/lib/business";
import { cn } from "@/lib/utils";

const WEEKS = 8;

interface Props {
  projects: { id: string; name: string; emoji: string; color: string; client: string | null; owner: { name: string | null } }[];
  updates: { projectId: string; health: Health; createdAt: Date; author: { name: string | null } }[];
}

/**
 * One row per live project, one cell per week: the health its owner reported,
 * or a hollow cell where nobody reported. Gaps in reporting are as telling as red.
 */
export default function PortfolioPulse({ projects, updates }: Props) {
  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeks = Array.from({ length: WEEKS }, (_, i) => addWeeks(thisWeek, i - WEEKS + 1));
  const reportedThisWeek = new Set(updates.filter((u) => new Date(u.createdAt) >= thisWeek).map((u) => u.projectId));

  const rows = projects.map((p) => {
    const own = updates.filter((u) => u.projectId === p.id);
    const cells = weeks.map((start) => {
      const end = addWeeks(start, 1);
      // Updates arrive newest first, so the first match is the week's last word.
      return own.find((u) => isWithinInterval(new Date(u.createdAt), { start, end: new Date(end.getTime() - 1) })) ?? null;
    });
    return { project: p, cells, latest: own[0] ?? null };
  });

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Portfolio pulse</CardTitle>
        <CardDescription>
          Weekly check-in health for every live project · {reportedThisWeek.size} of {projects.length} reported this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Activity /></EmptyMedia>
              <EmptyTitle>No live projects</EmptyTitle>
              <EmptyDescription>Active and planned projects appear here with their weekly check-ins.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-1 text-sm">
              <thead>
                <tr className="text-[11px] text-muted-foreground">
                  <th className="pb-1 text-left font-medium">Project</th>
                  {weeks.map((w, i) => (
                    <th key={i} className="w-8 pb-1 text-center font-medium tabular-nums">{i === WEEKS - 1 ? "Now" : format(w, "d/M")}</th>
                  ))}
                  <th className="pb-1 pl-3 text-left font-medium">Latest</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ project: p, cells, latest }) => (
                  <tr key={p.id}>
                    <td className="max-w-0 pr-3">
                      <Link href={`/projects/${p.id}?tab=updates`} className="flex min-w-0 items-center gap-2 hover:text-primary">
                        <ProjectIcon icon={p.emoji} color={p.color} size="xs" />
                        <span className="truncate font-medium">{p.name}</span>
                      </Link>
                    </td>
                    {cells.map((u, i) => (
                      <td key={i} className="p-0 text-center">
                        <Tooltip>
                          <TooltipTrigger render={
                            <span
                              className={cn("mx-auto block size-6 rounded-md", !u && "border border-dashed border-border", !u && i === WEEKS - 1 && "border-warning/60")}
                              style={u ? { backgroundColor: HEALTH[u.health].color } : undefined}
                              aria-label={u ? `${format(weeks[i], "d MMM")}: ${HEALTH[u.health].label}` : `${format(weeks[i], "d MMM")}: no check-in`}
                            />
                          } />
                          <TooltipContent>
                            Week of {format(weeks[i], "d MMM")}: {u ? `${HEALTH[u.health].label}, by ${u.author.name}` : "no check-in"}
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                    <td className="pl-3">{latest ? <HealthBadge health={latest.health} /> : <span className="text-xs text-muted-foreground">Never reported</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
              {(["ON_TRACK", "AT_RISK", "OFF_TRACK", "BLOCKED", "ON_HOLD", "DONE"] as const).map((h) => (
                <li key={h} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: HEALTH[h].color }} />{HEALTH[h].label}</li>
              ))}
              <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-dashed border-muted-foreground/60" />No check-in</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
