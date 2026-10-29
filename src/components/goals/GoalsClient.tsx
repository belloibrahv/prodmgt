"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Archive, Flag, Goal, MoreHorizontal, Pencil, Plus, Target, TrendingUp, Trash2, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useWorkspace } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { HealthBadge, ProgressRing, Sparkline, StatTile } from "@/components/business/primitives";
import ObjectiveModal from "./ObjectiveModal";
import PaceChart, { type PacePoint } from "./PaceChart";
import { addKeyResult, archiveObjective, checkInKeyResult, deleteKeyResult } from "@/lib/actions/goals";
import { HEALTH, formatMetric, goalHealth, keyResultProgress, objectiveProgress, periodElapsed } from "@/lib/business";
import type { ObjectiveWithRelations, ProjectOption } from "@/lib/business-queries";
import { cn } from "@/lib/utils";

type KeyResult = ObjectiveWithRelations["keyResults"][number];

interface Props { objectives: ObjectiveWithRelations[]; projects: ProjectOption[] }

export default function GoalsClient({ objectives, projects }: Props) {
  const periods = useMemo(() => [...new Set(objectives.map((o) => o.period))], [objectives]);
  const [period, setPeriod] = useState<string>("all");
  const [modal, setModal] = useState<{ objective: ObjectiveWithRelations | null } | null>(null);

  const visible = objectives.filter((o) => period === "all" || o.period === period);
  const scored = visible.map((o) => {
    const progress = objectiveProgress(o.keyResults);
    const elapsed = periodElapsed(o.startDate, o.endDate);
    return { o, progress, elapsed, health: goalHealth(progress, elapsed) };
  });

  const healthy = scored.filter((s) => s.health === "ON_TRACK" || s.health === "DONE").length;
  const achieved = scored.filter((s) => s.health === "DONE").length;
  const allKrs = visible.flatMap((o) => o.keyResults);
  const krsHit = allKrs.filter((kr) => keyResultProgress(kr) >= 1).length;
  const avg = scored.length ? scored.reduce((s, x) => s + x.progress, 0) / scored.length : 0;
  const avgElapsed = scored.length ? scored.reduce((s, x) => s + x.elapsed, 0) / scored.length : 0;

  const points: PacePoint[] = scored.map(({ o, progress, elapsed, health }) => ({
    id: o.id, title: o.title, progress: progress * 100, elapsed: elapsed * 100, health,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Goals & objectives"
        description="What the company has committed to this period, measured by key results and judged against the calendar."
        actions={<Button onClick={() => setModal({ objective: null })}><Plus /> Set objective</Button>}
      />

      {objectives.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Goal /></EmptyMedia>
            <EmptyTitle>No objectives yet</EmptyTitle>
            <EmptyDescription>Set the few outcomes that matter most this quarter, such as launching StockVaults commercially or growing visibility on social media, and how you&apos;ll measure them.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button onClick={() => setModal({ objective: null })}><Plus /> Set the first objective</Button></EmptyContent>
        </Empty>
      ) : (
        <>
          {periods.length > 1 && (
            <ToggleGroup value={[period]} onValueChange={(v) => v[0] && setPeriod(v[0])} variant="outline" spacing={0} size="sm">
              <ToggleGroupItem value="all">All periods</ToggleGroupItem>
              {periods.map((p) => <ToggleGroupItem key={p} value={p}>{p}</ToggleGroupItem>)}
            </ToggleGroup>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Scorecard */}
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>Scorecard</CardTitle>
                <CardDescription>{period === "all" ? "Every live objective" : period}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-center gap-5">
                  <ProgressRing value={avg} expected={avgElapsed} size={112} stroke={10} color="var(--primary)">
                    <span className="text-2xl font-semibold tabular-nums">{Math.round(avg * 100)}%</span>
                    <span className="text-[10px] text-muted-foreground">average</span>
                  </ProgressRing>
                  <div className="space-y-1">
                    <p className="text-3xl font-semibold tabular-nums">{healthy}<span className="text-lg text-muted-foreground">/{scored.length}</span></p>
                    <p className="text-sm text-muted-foreground">objectives on track or achieved</p>
                    <p className="text-xs text-muted-foreground">The tick marks where progress should be by now ({Math.round(avgElapsed * 100)}% of time gone).</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(["DONE", "ON_TRACK", "AT_RISK", "OFF_TRACK", "NOT_STARTED"] as const)
                    .map((h) => ({ h, n: scored.filter((s) => s.health === h).length }))
                    .filter((x) => x.n > 0)
                    .map(({ h, n }) => (
                      <div key={h} className="rounded-lg border bg-muted/30 px-2 py-2">
                        <p className="text-lg font-semibold tabular-nums">{n}</p>
                        <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: HEALTH[h].color }} />{HEALTH[h].label}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Pace */}
            <Card className="shadow-xs lg:col-span-2">
              <CardHeader>
                <CardTitle>Are we on pace?</CardTitle>
                <CardDescription>Each dot is an objective. Above the line is ahead of the calendar; in the shaded area it&apos;s falling behind.</CardDescription>
              </CardHeader>
              <CardContent>
                <PaceChart points={points} onSelect={(id) => document.getElementById(`objective-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} />
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
                  {(["ON_TRACK", "AT_RISK", "OFF_TRACK", "DONE"] as const).map((h) => (
                    <li key={h} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: HEALTH[h].color }} />{HEALTH[h].label}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatTile label="Objectives achieved" value={achieved} hint={`of ${scored.length} this view`} icon={Trophy} tone={achieved ? "success" : undefined} />
            <StatTile label="Key results hit" value={`${krsHit}/${allKrs.length}`} hint="Reached or beat their target" icon={Target} />
            <StatTile label="Need attention" value={scored.filter((s) => s.health === "AT_RISK" || s.health === "OFF_TRACK").length} hint="Behind the calendar" icon={Flag} tone={scored.some((s) => s.health === "OFF_TRACK") ? "danger" : undefined} />
            <StatTile label="Projects contributing" value={new Set(visible.flatMap((o) => o.projects.map((p) => p.id))).size} hint="Linked to an objective" icon={TrendingUp} />
          </div>

          <div className="flex flex-col gap-4">
            {scored.map(({ o, progress, elapsed, health }) => (
              <ObjectiveCard key={o.id} objective={o} progress={progress} elapsed={elapsed} health={health} onEdit={() => setModal({ objective: o })} />
            ))}
          </div>
        </>
      )}

      <ObjectiveModal open={modal !== null} onClose={() => setModal(null)} projects={projects} objective={modal?.objective} />
    </div>
  );
}

function ObjectiveCard({ objective: o, progress, elapsed, health, onEdit }: {
  objective: ObjectiveWithRelations; progress: number; elapsed: number; health: ReturnType<typeof goalHealth>; onEdit: () => void;
}) {
  const { currentUserId } = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [addingKr, setAddingKr] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const isOwner = o.ownerId === currentUserId;
  const daysLeft = Math.ceil((new Date(o.endDate).getTime() - Date.now()) / 86_400_000);

  function handleAddKr(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addKeyResult(o.id, fd);
      if (res.success) setAddingKr(false); else toast.error(res.error);
    });
  }

  return (
    <Card id={`objective-${o.id}`} className="scroll-mt-20 gap-0 overflow-hidden p-0 shadow-xs">
      <div className="flex flex-wrap items-start gap-5 p-5">
        <ProgressRing value={progress} expected={elapsed} size={76} stroke={7} color={HEALTH[health].color}>
          <span className="text-base font-semibold tabular-nums">{Math.round(progress * 100)}%</span>
        </ProgressRing>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold leading-snug">{o.title}</h2>
            <HealthBadge health={health} />
          </div>
          {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Avatar name={o.owner.name} image={o.owner.image} size="xs" />{o.owner.name}</span>
            <span>{o.period} · {format(new Date(o.startDate), "d MMM")} – {format(new Date(o.endDate), "d MMM yyyy")}</span>
            <span className={cn(daysLeft < 0 && "text-destructive")}>{daysLeft < 0 ? "Period ended" : `${daysLeft} days left`}</span>
          </div>
          {o.projects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {o.projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs hover:border-primary/40">
                  <ProjectIcon icon={p.emoji} color={p.color} size="xs" className="size-4 [&_svg]:size-2.5" />{p.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${o.title}`} />}><MoreHorizontal /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onEdit}><Pencil /> Edit objective</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddingKr(true)}><Plus /> Add key result</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmArchive(true)}><Archive /> Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ul className="divide-y border-t">
        {o.keyResults.map((kr) => <KeyResultRow key={kr.id} kr={kr} elapsed={elapsed} canEdit={isOwner || kr.ownerId === currentUserId} canDelete={isOwner} />)}
      </ul>

      {addingKr && (
        <form onSubmit={handleAddKr} className="flex flex-wrap items-end gap-2 border-t bg-muted/30 p-4">
          {[
            { name: "title", placeholder: "Key result", className: "min-w-56 flex-1", type: "text" },
            { name: "startValue", placeholder: "From", className: "w-24", type: "number" },
            { name: "targetValue", placeholder: "Target", className: "w-24", type: "number" },
            { name: "unit", placeholder: "Unit", className: "w-24", type: "text" },
          ].map((f) => (
            <input key={f.name} name={f.name} type={f.type} step="any" placeholder={f.placeholder} aria-label={f.placeholder} required={f.name !== "unit"}
              defaultValue={f.name === "startValue" ? "0" : undefined}
              className={cn("h-8 rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20", f.className)} />
          ))}
          <Button type="button" size="sm" variant="ghost" onClick={() => setAddingKr(false)}>Cancel</Button>
          <Button type="submit" size="sm" loading={pending}>Add</Button>
        </form>
      )}

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={`Archive ${o.title}?`}
        description="It leaves the scorecard. Its key results and check-in history are kept."
        confirmLabel="Archive objective"
        onConfirm={() => startTransition(async () => {
          const res = await archiveObjective(o.id);
          if (res.success) { toast.success("Objective archived"); setConfirmArchive(false); } else toast.error(res.error);
        })}
        pending={pending}
      />
    </Card>
  );
}

function KeyResultRow({ kr, elapsed, canEdit, canDelete }: { kr: KeyResult; elapsed: number; canEdit: boolean; canDelete: boolean }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [pending, startTransition] = useTransition();
  const p = keyResultProgress(kr);
  const health = goalHealth(p, elapsed);
  const history = [kr.startValue, ...kr.checkIns.map((c) => c.value)];
  const last = kr.checkIns.at(-1);

  function handleCheckIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await checkInKeyResult(kr.id, fd);
      if (res.success) { toast.success("Progress recorded"); setCheckingIn(false); } else toast.error(res.error);
    });
  }

  return (
    <li className="group/kr flex flex-col gap-3 px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-48 flex-1">
          <p className="text-sm font-medium">{kr.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatMetric(kr.currentValue, kr.unit)} of {formatMetric(kr.targetValue, kr.unit)}
            {kr.owner && <> · {kr.owner.name}</>}
            {last && <> · updated {formatDistanceToNow(new Date(last.createdAt), { addSuffix: true })}</>}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger render={<span className="hidden sm:block" />}>
            <Sparkline values={history} color={HEALTH[health].color} />
          </TooltipTrigger>
          <TooltipContent>{history.length < 2 ? "Check in to start a trend" : `${kr.checkIns.length} check-ins`}</TooltipContent>
        </Tooltip>
        {/* Bar with a tick where it should be by now. */}
        <div className="relative h-2 w-full overflow-visible rounded-full bg-muted sm:w-48" role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${kr.title} progress`}>
          <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${p * 100}%`, backgroundColor: HEALTH[health].color }} />
          <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-foreground/50" style={{ left: `calc(${elapsed * 100}% - 1px)` }} aria-hidden />
        </div>
        <span className="w-10 text-right text-sm font-semibold tabular-nums">{Math.round(p * 100)}%</span>
        <div className="flex items-center gap-1">
          {canEdit && <Button size="xs" variant="outline" onClick={() => setCheckingIn((v) => !v)}>Check in</Button>}
          {canDelete && (
            <Button size="icon-xs" variant="ghost" className="text-muted-foreground opacity-0 group-hover/kr:opacity-100 focus-visible:opacity-100 hover:text-destructive" aria-label={`Remove ${kr.title}`}
              onClick={() => startTransition(async () => { const r = await deleteKeyResult(kr.id); if (!r.success) toast.error(r.error); })}><Trash2 /></Button>
          )}
        </div>
      </div>
      {checkingIn && (
        <form onSubmit={handleCheckIn} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-2">
          <input name="value" type="number" step="any" required defaultValue={kr.currentValue} aria-label="Current value" autoFocus
            className="h-8 w-28 rounded-md border border-input bg-card px-2 text-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20" />
          <span className="text-xs text-muted-foreground">{kr.unit}</span>
          <input name="note" placeholder="What moved it? (optional)" aria-label="Note"
            className="h-8 min-w-48 flex-1 rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20" />
          <Button type="submit" size="sm" loading={pending}>Record</Button>
        </form>
      )}
      {last?.note && !checkingIn && <p className="text-xs text-muted-foreground">&ldquo;{last.note}&rdquo; · {last.author.name}</p>}
    </li>
  );
}
