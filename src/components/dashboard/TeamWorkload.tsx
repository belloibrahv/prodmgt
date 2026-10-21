import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

interface Member {
  id: string;
  name: string;
  image: string | null;
  jobTitle: string | null;
  tasks: number;
}

export default function TeamWorkload({ members }: { members: Member[] }) {
  const top = members.slice(0, 6);
  const max = Math.max(1, ...top.map((m) => m.tasks));

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Team workload</CardTitle>
        <CardDescription>Open tasks per person</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" render={<Link href="/team" />} nativeButton={false}>
            Team <ArrowRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Users /></EmptyMedia>
              <EmptyTitle>No assignments yet</EmptyTitle>
              <EmptyDescription>Assign tasks to see who&apos;s carrying what.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="grid gap-4">
            {top.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar name={m.name} image={m.image} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      <span className="font-semibold text-foreground">{m.tasks}</span> open
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={m.tasks} aria-valuemin={0} aria-valuemax={max} aria-label={`${m.name} workload`}>
                    <div className="h-full rounded-full bg-chart-2" style={{ width: `${(m.tasks / max) * 100}%` }} />
                  </div>
                  {m.jobTitle && <p className="mt-1 truncate text-xs text-muted-foreground">{m.jobTitle}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
