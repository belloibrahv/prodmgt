"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarClock, MessageSquarePlus, NotebookPen } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { HealthBadge } from "@/components/business/primitives";
import { HealthSelect } from "@/components/business/fields";
import { postStatusUpdate } from "@/lib/actions/status-updates";
import { HEALTH, UPDATE_FIELDS } from "@/lib/business";
import type { StatusUpdateWithRelations } from "@/lib/business-queries";

interface Props { projectId: string; updates: StatusUpdateWithRelations[]; canEdit: boolean }

/** The structured weekly report: completed, in progress, outstanding, challenges, next action and deadline. */
export default function ProjectCheckIns({ projectId, updates, canEdit }: Props) {
  const [writing, setWriting] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await postStatusUpdate(projectId, fd);
      if (res.success) { toast.success("Check-in posted"); setWriting(false); }
      else toast.error(res.error);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        {canEdit && (writing ? (
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Post a check-in</CardTitle>
              <CardDescription>It appears in the project review agenda, on the dashboard and here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <HealthSelect label="Overall status" />
                {UPDATE_FIELDS.map((f) => (
                  <Textarea key={f.key} name={f.key} label={f.label} placeholder={f.hint} className="min-h-[64px]" />
                ))}
                <Input name="nextActionDue" label="Next action deadline" type="date" />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setWriting(false)}>Cancel</Button>
                  <Button type="submit" loading={pending}>Post check-in</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <button type="button" onClick={() => setWriting(true)}
            className="flex items-center gap-3 rounded-xl border border-dashed bg-card p-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <MessageSquarePlus className="size-5 text-primary" />
            <span><span className="font-medium text-foreground">Post a check-in.</span> What&apos;s done, in progress, outstanding, what&apos;s blocking you, and the next step with its deadline.</span>
          </button>
        ))}

        {updates.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><NotebookPen /></EmptyMedia>
              <EmptyTitle>No check-ins yet</EmptyTitle>
              <EmptyDescription>Check-ins give everyone the same picture before each review, so meetings go straight to the decisions.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol className="relative flex flex-col gap-4 border-l pl-6">
            {updates.map((u) => (
              <li key={u.id} className="relative">
                <span className="absolute top-4 -left-[31px] size-3 rounded-full ring-4 ring-background" style={{ backgroundColor: HEALTH[u.health].color }} aria-hidden />
                <Card className="gap-3 shadow-xs">
                  <CardHeader className="flex flex-row flex-wrap items-center gap-3">
                    <Avatar name={u.author.name} image={u.author.image} size="sm" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm">{u.author.name}</CardTitle>
                      <CardDescription title={format(new Date(u.createdAt), "PPpp")}>{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</CardDescription>
                    </div>
                    <HealthBadge health={u.health} />
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {UPDATE_FIELDS.filter((f) => u[f.key]).map((f) => (
                        <div key={f.key} className={f.key === "nextAction" || f.key === "challenges" ? "rounded-lg bg-muted/50 p-2.5 sm:col-span-2" : ""}>
                          <dt className="text-xs font-semibold text-muted-foreground">{f.label}</dt>
                          <dd className="mt-0.5 text-sm whitespace-pre-wrap">{u[f.key]}</dd>
                          {f.key === "nextAction" && u.nextActionDue && (
                            <dd className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3" /> by {format(new Date(u.nextActionDue), "EEE d MMM")}</dd>
                          )}
                        </div>
                      ))}
                    </dl>
                    {u.meeting && (
                      <Link href={`/meetings/${u.meeting.id}`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <NotebookPen className="size-3" /> For {u.meeting.title}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Card className="h-fit shadow-xs">
        <CardHeader>
          <CardTitle>Health over time</CardTitle>
          <CardDescription>One square per check-in, oldest first</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Appears after the first check-in.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1" role="img" aria-label={`Last ${updates.length} check-ins`}>
                {[...updates].reverse().map((u) => (
                  <span key={u.id} className="size-5 rounded" style={{ backgroundColor: HEALTH[u.health].color }}
                    title={`${format(new Date(u.createdAt), "d MMM")}: ${HEALTH[u.health].label}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {updates.filter((u) => u.health === "ON_TRACK" || u.health === "DONE").length} of {updates.length} check-ins on track or done
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
