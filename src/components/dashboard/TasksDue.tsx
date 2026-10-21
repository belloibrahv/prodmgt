import Link from "next/link";
import { ArrowRight, CalendarClock, CircleCheckBig } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { cn, getDueLabel } from "@/lib/utils";
import type { TaskWithRelations } from "@/types";

const DUE_STYLES: Record<string, string> = {
  overdue:  "bg-destructive/10 text-destructive",
  today:    "bg-warning/12 text-warning",
  tomorrow: "bg-info/10 text-info",
  upcoming: "bg-muted text-muted-foreground",
  none:     "bg-muted text-muted-foreground",
};

export default function TasksDue({ tasks }: { tasks: TaskWithRelations[] }) {
  const open = tasks.filter((t) => t.status !== "DONE" && t.dueDate);
  const upcoming = open
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 7);

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Upcoming deadlines</CardTitle>
        <CardDescription>Open tasks, soonest first</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" render={<Link href="/tasks" />} nativeButton={false}>
            All tasks <ArrowRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {upcoming.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><CircleCheckBig /></EmptyMedia>
              <EmptyTitle>You&apos;re all caught up</EmptyTitle>
              <EmptyDescription>No open tasks have a due date.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y">
            {upcoming.map((task) => {
              const due = getDueLabel(task.dueDate);
              return (
                <li key={task.id}>
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    <ProjectIcon icon={task.project.emoji} color={task.project.color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>
                    </div>
                    <div className="hidden sm:block">
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <span
                      className={cn(
                        "inline-flex w-[92px] shrink-0 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                        DUE_STYLES[due.variant],
                      )}
                    >
                      <CalendarClock className="size-3.5" aria-hidden />
                      {due.label}
                    </span>
                    {task.assignee ? (
                      <Avatar name={task.assignee.name} image={task.assignee.image} size="xs" className="hidden md:inline-flex" />
                    ) : (
                      <span className="hidden size-6 md:block" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
