"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { CalendarClock, CheckCheck, Hourglass, Plus, Scale, Timer } from "lucide-react";
import type { DecisionCategory, DecisionStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { StatTile } from "@/components/business/primitives";
import DecisionModal from "./DecisionModal";
import DecisionSheet from "./DecisionSheet";
import { DECISION_CATEGORIES, DECISION_STATUS, OPEN_DECISION_STATUSES, formatNaira } from "@/lib/business";
import type { DecisionWithRelations, ProjectOption } from "@/lib/business-queries";
import { cn, getDueLabel } from "@/lib/utils";

const BOARD: DecisionStatus[] = ["PROPOSED", "UNDER_REVIEW", "APPROVED", "IMPLEMENTED"];
const CLOSED: DecisionStatus[] = ["DEFERRED", "REJECTED"];

interface Props { decisions: DecisionWithRelations[]; projects: ProjectOption[] }

export default function DecisionsClient({ decisions, projects }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const openId = params.get("open");
  const [category, setCategory] = useState<DecisionCategory | "ALL">("ALL");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DecisionWithRelations | null>(null);

  // The open decision lives in the URL so links from minutes land on it.
  const setOpen = (id: string | null) => router.replace(id ? `${pathname}?open=${id}` : pathname, { scroll: false });
  const openDecision = decisions.find((d) => d.id === openId) ?? null;

  const visible = decisions.filter((d) => category === "ALL" || d.category === category);
  const pending = decisions.filter((d) => OPEN_DECISION_STATUSES.includes(d.status));
  const overdue = pending.filter((d) => getDueLabel(d.decideBy).variant === "overdue");
  const monthAgo = subDays(new Date(), 30);
  const recent = decisions.filter((d) => d.decidedAt && new Date(d.decidedAt) >= monthAgo);
  const decided = decisions.filter((d) => d.decidedAt);
  const avgDays = decided.length
    ? Math.round(decided.reduce((s, d) => s + Math.max(0, differenceInCalendarDays(new Date(d.decidedAt!), new Date(d.createdAt))), 0) / decided.length)
    : null;

  const categories = useMemo(() => {
    const used = new Set(decisions.map((d) => d.category));
    return (Object.keys(DECISION_CATEGORIES) as DecisionCategory[]).filter((c) => used.has(c));
  }, [decisions]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Decision register"
        description="Every business decision from proposal to outcome, with the options, costs, who decided and why."
        actions={<Button onClick={() => setCreating(true)}><Plus /> Raise decision</Button>}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Awaiting decision" value={pending.length} hint="Proposed or under review" icon={Hourglass} tone={pending.length ? "warning" : undefined} />
        <StatTile label="Past their deadline" value={overdue.length} hint={overdue.length ? "Holding up delivery" : "All within deadline"} icon={CalendarClock} tone={overdue.length ? "danger" : "success"} />
        <StatTile label="Decided in 30 days" value={recent.length} hint={`${decided.length} decided in total`} icon={CheckCheck} />
        <StatTile label="Average time to decide" value={avgDays === null ? "—" : `${avgDays}d`} hint="From raising to recording" icon={Timer} />
      </div>

      {decisions.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Scale /></EmptyMedia>
            <EmptyTitle>No decisions on record</EmptyTitle>
            <EmptyDescription>Raise budget calls, hires, priorities and policy changes here, or log them from meeting minutes, so the reasoning isn&apos;t lost.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button onClick={() => setCreating(true)}><Plus /> Raise the first decision</Button></EmptyContent>
        </Empty>
      ) : (
        <>
          {categories.length > 1 && (
            <ToggleGroup value={[category]} onValueChange={(v) => v[0] && setCategory(v[0] as typeof category)} variant="outline" spacing={0} size="sm" className="flex-wrap">
              <ToggleGroupItem value="ALL">All</ToggleGroupItem>
              {categories.map((c) => <ToggleGroupItem key={c} value={c}>{DECISION_CATEGORIES[c]}</ToggleGroupItem>)}
            </ToggleGroup>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {BOARD.map((s) => {
              const list = visible.filter((d) => d.status === s);
              return (
                <section key={s} aria-label={DECISION_STATUS[s].label} className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2">
                  <h2 className="flex items-center gap-2 px-2 pt-1 text-sm font-semibold">
                    <span className="size-2 rounded-full" style={{ backgroundColor: DECISION_STATUS[s].color }} aria-hidden />
                    {DECISION_STATUS[s].label}
                    <span className="ml-auto text-xs font-normal tabular-nums text-muted-foreground">{list.length}</span>
                  </h2>
                  {list.length === 0 ? (
                    <p className="px-2 pb-2 text-xs text-muted-foreground">None</p>
                  ) : list.map((d) => <DecisionCard key={d.id} decision={d} onOpen={() => setOpen(d.id)} />)}
                </section>
              );
            })}
          </div>

          {visible.some((d) => CLOSED.includes(d.status)) && (
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Deferred and rejected</h2>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {visible.filter((d) => CLOSED.includes(d.status)).map((d) => <DecisionCard key={d.id} decision={d} onOpen={() => setOpen(d.id)} />)}
              </div>
            </section>
          )}
        </>
      )}

      <DecisionSheet decision={openDecision} onClose={() => setOpen(null)} onEdit={(d) => setEditing(d)} />
      <DecisionModal open={creating || editing !== null} onClose={() => { setCreating(false); setEditing(null); }} projects={projects} decision={editing} />
    </div>
  );
}

function DecisionCard({ decision: d, onOpen }: { decision: DecisionWithRelations; onOpen: () => void }) {
  const open = OPEN_DECISION_STATUSES.includes(d.status);
  const due = getDueLabel(d.decideBy);
  const late = open && due.variant === "overdue";
  const chosen = d.options.find((o) => o.selected);
  const costed = d.options.filter((o) => o.cost !== null);
  const doneActions = d.actionItems.filter((a) => a.status === "DONE").length;

  return (
    <button type="button" onClick={onOpen} className={cn(
      "flex w-full flex-col gap-2.5 rounded-lg border bg-card p-3 text-left shadow-xs transition-colors hover:border-primary/40",
      late && "border-destructive/40",
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{d.title}</p>
        <PriorityBadge priority={d.impact} className="px-1.5" />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{DECISION_CATEGORIES[d.category]}</span>
        {d.project && <span className="inline-flex items-center gap-1"><ProjectIcon icon={d.project.emoji} color={d.project.color} size="xs" className="size-4 [&_svg]:size-2.5" />{d.project.name}</span>}
        {d.options.length > 0 && <span>{d.options.length} options</span>}
      </div>
      {chosen ? (
        <p className="rounded-md bg-success/10 px-2 py-1 text-xs text-success">Chose {chosen.label}{chosen.cost !== null && ` · ${formatNaira(chosen.cost)}`}</p>
      ) : costed.length > 1 && open ? (
        <p className="text-xs text-muted-foreground">{formatNaira(Math.min(...costed.map((o) => o.cost!)))} – {formatNaira(Math.max(...costed.map((o) => o.cost!)))}</p>
      ) : null}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Avatar name={d.proposer.name} image={d.proposer.image} size="xs" />{d.proposer.name?.split(" ")[0]}</span>
        {open && d.decideBy ? (
          <span className={cn("inline-flex items-center gap-1", late ? "font-medium text-destructive" : "text-muted-foreground")}>
            <CalendarClock className="size-3" />{late ? `Overdue · ${format(new Date(d.decideBy), "d MMM")}` : due.label}
          </span>
        ) : d.actionItems.length > 0 ? (
          <span className="text-muted-foreground tabular-nums">{doneActions}/{d.actionItems.length} actions</span>
        ) : null}
      </div>
    </button>
  );
}
