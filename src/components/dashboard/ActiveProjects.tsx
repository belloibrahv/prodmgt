import Link from "next/link";
import { ArrowRight, CalendarDays, FolderKanban } from "lucide-react";
import { AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { formatDate, getProgressPercent } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

export default function ActiveProjects({ projects }: { projects: ProjectWithRelations[] }) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Active projects</CardTitle>
        <CardDescription>Progress by completed tasks</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" render={<Link href="/projects" />} nativeButton={false}>
            All projects <ArrowRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {projects.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><FolderKanban /></EmptyMedia>
              <EmptyTitle>No active projects</EmptyTitle>
              <EmptyDescription>Projects you mark as active will show up here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y">
            {projects.map((p) => {
              const done = p.tasks.filter((t) => t.status === "DONE").length;
              const pct = getProgressPercent(done, p.tasks.length);
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,180px)_auto]"
                  >
                    <ProjectIcon icon={p.emoji} color={p.color} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{p.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {p.dueDate ? `Due ${formatDate(p.dueDate)}` : "No due date"}
                        <span aria-hidden>·</span>
                        {done}/{p.tasks.length} tasks
                      </p>
                    </div>
                    <div className="col-span-3 col-start-1 flex items-center gap-2 sm:col-span-1 sm:col-start-auto">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.name} progress`}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="w-9 text-right text-xs font-medium tabular-nums">{pct}%</span>
                    </div>
                    <div className="col-start-3 row-start-1 flex items-center gap-3 sm:col-start-auto">
                      <div className="hidden lg:block">
                        <AvatarGroup users={p.members.map((m) => m.user)} max={3} />
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
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
