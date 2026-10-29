"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, format, isSameDay, isThisMonth, startOfWeek } from "date-fns";
import {
  AlarmClock, CalendarCheck2, CalendarPlus, CheckCircle2, CircleDashed, ListTodo, NotebookPen, Plus, Scale,
} from "lucide-react";
import type { MeetingType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AvatarGroup, Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { HealthBar, StatTile, ToneBadge } from "@/components/business/primitives";
import { ActionList } from "@/components/business/ActionItems";
import NewMeetingModal, { type NewMeetingDefaults } from "./NewMeetingModal";
import { MEETING_STATUS, MEETING_TYPES } from "@/lib/business";
import type { ActionItemWithRelations, MeetingListItem } from "@/lib/business-queries";
import { cn, getDueLabel } from "@/lib/utils";

const RHYTHM: { type: MeetingType; offset: number; hour: number }[] = [
  { type: "WEEKLY_REVIEW", offset: 0, hour: 10 },
  { type: "MIDWEEK_CHECKIN", offset: 2, hour: 10 },
  { type: "WEEKLY_REPORT", offset: 4, hour: 15 },
];

const isOpen = (a: { status: string }) => a.status === "OPEN" || a.status === "IN_PROGRESS";
const isLate = (a: { status: string; dueDate: Date | null }) => isOpen(a) && getDueLabel(a.dueDate).variant === "overdue";

interface Props { meetings: MeetingListItem[]; actions: ActionItemWithRelations[] }

export default function MeetingsClient({ meetings, actions }: Props) {
  const [scheduling, setScheduling] = useState<NewMeetingDefaults | null>(null);
  const [actionFilter, setActionFilter] = useState<"open" | "overdue" | "done">("open");

  const now = new Date();
  const upcoming = meetings
    .filter((m) => m.status === "SCHEDULED" || m.status === "IN_PROGRESS")
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  const archive = meetings.filter((m) => m.status === "COMPLETED" || m.status === "CANCELLED");

  const openActions = actions.filter(isOpen);
  const lateActions = actions.filter(isLate);
  const recentlyDue = actions.filter((a) => a.dueDate && new Date(a.dueDate) <= now && a.status !== "CANCELLED");
  const onTimeRate = recentlyDue.length
    ? Math.round((recentlyDue.filter((a) => a.status === "DONE" && a.completedAt && new Date(a.completedAt) <= endOfDay(a.dueDate!)).length / recentlyDue.length) * 100)
    : null;

  const filteredActions = actions.filter((a) =>
    actionFilter === "open" ? isOpen(a) : actionFilter === "overdue" ? isLate(a) : a.status === "DONE");

  // Group the tracker by owner so accountability is visible per person.
  const byOwner = useMemo(() => {
    const groups = new Map<string, { owner: ActionItemWithRelations["owner"]; items: ActionItemWithRelations[] }>();
    for (const a of filteredActions) {
      const key = a.owner?.id ?? "none";
      if (!groups.has(key)) groups.set(key, { owner: a.owner, items: [] });
      groups.get(key)!.items.push(a);
    }
    return [...groups.values()].sort((a, b) => b.items.length - a.items.length);
  }, [filteredActions]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meetings & minutes"
        description="Every review, check-in and report, minuted with owners, deadlines and follow-ups. Visible to the whole company."
        actions={<Button onClick={() => setScheduling({})}><Plus /> Schedule meeting</Button>}
      />

      <WeeklyRhythm meetings={meetings} onSchedule={setScheduling} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Meetings this month" value={meetings.filter((m) => isThisMonth(new Date(m.scheduledAt)) && m.status !== "CANCELLED").length} hint={`${archive.filter((m) => m.status === "COMPLETED").length} minuted in total`} icon={NotebookPen} />
        <StatTile label="Open actions" value={openActions.length} hint={`${actions.length} raised in meetings`} icon={ListTodo} />
        <StatTile label="Overdue actions" value={lateActions.length} hint={lateActions.length ? "Chase these before the next review" : "Nothing overdue"} icon={AlarmClock} tone={lateActions.length ? "danger" : "success"} />
        <StatTile label="Delivered on time" value={onTimeRate === null ? "—" : `${onTimeRate}%`} hint="Of actions whose deadline has passed" icon={CheckCircle2} tone={onTimeRate === null ? undefined : onTimeRate >= 80 ? "success" : onTimeRate >= 50 ? "warning" : "danger"} />
      </div>

      <Tabs defaultValue="upcoming" className="gap-4">
        <TabsList variant="line" className="h-10 border-b w-full justify-start">
          <TabsTrigger value="upcoming" className="px-3">Upcoming <span className="text-xs tabular-nums text-muted-foreground">{upcoming.length}</span></TabsTrigger>
          <TabsTrigger value="archive" className="px-3">Minutes archive <span className="text-xs tabular-nums text-muted-foreground">{archive.length}</span></TabsTrigger>
          <TabsTrigger value="actions" className="px-3">Action tracker <span className="text-xs tabular-nums text-muted-foreground">{openActions.length}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <MeetingList meetings={upcoming} empty={
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><CalendarPlus /></EmptyMedia>
                <EmptyTitle>Nothing scheduled</EmptyTitle>
                <EmptyDescription>Schedule Monday&apos;s project review to start the week&apos;s rhythm. Its agenda is built from your live projects.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button onClick={() => setScheduling({ type: "WEEKLY_REVIEW" })}><Plus /> Schedule project review</Button></EmptyContent>
            </Empty>
          } />
        </TabsContent>

        <TabsContent value="archive">
          <MeetingList meetings={archive} empty={
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><NotebookPen /></EmptyMedia>
                <EmptyTitle>No minutes yet</EmptyTitle>
                <EmptyDescription>When a meeting is finalised its minutes are locked and kept here as the company record.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          } />
        </TabsContent>

        <TabsContent value="actions" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Deliverables assigned in meetings and decisions, grouped by who owns them.</p>
            <ToggleGroup value={[actionFilter]} onValueChange={(v) => v[0] && setActionFilter(v[0] as typeof actionFilter)} variant="outline" spacing={0} size="sm">
              <ToggleGroupItem value="open">Open</ToggleGroupItem>
              <ToggleGroupItem value="overdue">Overdue</ToggleGroupItem>
              <ToggleGroupItem value="done">Done</ToggleGroupItem>
            </ToggleGroup>
          </div>
          {byOwner.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><CheckCircle2 /></EmptyMedia>
                <EmptyTitle>{actionFilter === "overdue" ? "Nothing overdue" : actionFilter === "done" ? "Nothing completed yet" : "No open actions"}</EmptyTitle>
                <EmptyDescription>Actions are added against agenda items in the minutes.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {byOwner.map(({ owner, items }) => {
                const late = items.filter(isLate).length;
                return (
                  <Card key={owner?.id ?? "none"} className="gap-2 shadow-xs">
                    <CardHeader className="flex flex-row items-center gap-3">
                      {owner ? <Avatar name={owner.name} image={owner.image} size="sm" /> : <span className="flex size-8 items-center justify-center rounded-md bg-muted"><CircleDashed className="size-4 text-muted-foreground" /></span>}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate">{owner?.name ?? "No owner yet"}</CardTitle>
                        <CardDescription>{items.length} {items.length === 1 ? "action" : "actions"}{late > 0 && <span className="font-medium text-destructive"> · {late} overdue</span>}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent><ActionList actions={items} showSource showProject /></CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewMeetingModal open={scheduling !== null} onClose={() => setScheduling(null)} defaults={scheduling ?? undefined} />
    </div>
  );
}

function endOfDay(d: Date | string) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** This week's Monday review → Wednesday check-in → Friday report, and whether each happened. */
function WeeklyRhythm({ meetings, onSchedule }: { meetings: MeetingListItem[]; onSchedule: (d: NewMeetingDefaults) => void }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const today = new Date();

  return (
    <section aria-label="This week's meeting rhythm" className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">This week&apos;s rhythm</h2>
        <p className="text-xs text-muted-foreground">Week of {format(monday, "d MMMM")}</p>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {RHYTHM.map(({ type, offset, hour }, i) => {
          const day = addDays(monday, offset);
          const meeting = meetings.find((m) => m.type === type && isSameDay(new Date(m.scheduledAt), day) && m.status !== "CANCELLED")
            ?? meetings.find((m) => m.type === type && +new Date(m.scheduledAt) >= +monday && +new Date(m.scheduledAt) < +addDays(monday, 7) && m.status !== "CANCELLED");
          const past = day < today && !isSameDay(day, today);
          const state = meeting?.status === "COMPLETED" ? "done" : meeting ? "scheduled" : past ? "missed" : "todo";
          const when = new Date(day); when.setHours(hour);

          return (
            <li key={type} className="relative">
              {i < RHYTHM.length - 1 && <span className="absolute top-5 left-[calc(100%-4px)] z-0 hidden h-px w-[calc(0.75rem+8px)] bg-border md:block" aria-hidden />}
              <div className={cn(
                "relative flex h-full items-start gap-3 rounded-lg border p-3",
                state === "done" && "border-success/30 bg-success/5",
                state === "missed" && "border-dashed",
                isSameDay(day, today) && state !== "done" && "border-primary/40 ring-1 ring-primary/20",
              )}>
                <span className={cn(
                  "flex size-9 shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-semibold uppercase leading-none",
                  state === "done" ? "bg-success text-white" : "bg-muted text-muted-foreground",
                )}>
                  {format(day, "EEE")}
                  <span className="mt-0.5 text-sm">{format(day, "d")}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{MEETING_TYPES[type].label}</p>
                  {meeting ? (
                    <Link href={`/meetings/${meeting.id}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      {state === "done" ? <CalendarCheck2 className="size-3.5 text-success" /> : <AlarmClock className="size-3.5" />}
                      {state === "done" ? "Minuted · view minutes" : `${format(new Date(meeting.scheduledAt), "EEE HH:mm")} · open agenda`}
                    </Link>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">{state === "missed" ? "Not held" : "Not scheduled yet"}</p>
                  )}
                </div>
                {!meeting && !past && (
                  <Button size="xs" variant="outline" onClick={() => onSchedule({ type, scheduledAt: when })}>Schedule</Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MeetingList({ meetings, empty }: { meetings: MeetingListItem[]; empty: React.ReactNode }) {
  if (meetings.length === 0) return <>{empty}</>;
  return (
    <ul className="flex flex-col gap-2">
      {meetings.map((m) => {
        const date = new Date(m.scheduledAt);
        const done = m.actionItems.filter((a) => a.status === "DONE").length;
        const status = MEETING_STATUS[m.status];
        return (
          <li key={m.id}>
            <Link href={`/meetings/${m.id}`} className="group flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-primary/30 hover:bg-accent/30 sm:flex-nowrap">
              <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border bg-background leading-none">
                <span className="text-[10px] font-semibold uppercase text-primary">{format(date, "MMM")}</span>
                <span className="text-lg font-semibold tabular-nums">{format(date, "d")}</span>
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium group-hover:text-primary">{m.title}</p>
                  <ToneBadge label={status.label} badge={status.badge} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(date, "EEEE · HH:mm")} · {MEETING_TYPES[m.type].short}
                  {m.chair && <> · chaired by {m.chair.name}</>}
                </p>
              </div>
              <div className="flex w-full items-center gap-5 sm:w-auto">
                <div className="w-full min-w-36 sm:w-40">
                  <p className="mb-1.5 text-[11px] text-muted-foreground">{m.items.length} agenda {m.items.length === 1 ? "item" : "items"}</p>
                  <HealthBar values={m.items.map((i) => i.health)} />
                </div>
                <div className="hidden text-right text-xs text-muted-foreground md:block">
                  <p className="font-medium text-foreground tabular-nums">{done}/{m.actionItems.length}</p>
                  <p>actions</p>
                </div>
                {m._count.decisions > 0 && (
                  <span className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex"><Scale className="size-3.5" />{m._count.decisions}</span>
                )}
                <AvatarGroup users={m.attendees.map((a) => a.user)} max={4} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
