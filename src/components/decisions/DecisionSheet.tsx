"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Gavel, NotebookPen, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { DecisionStatus } from "@prisma/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useWorkspace } from "@/components/layout/AppShell";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { ToneBadge } from "@/components/business/primitives";
import { ActionList, AddActionForm } from "@/components/business/ActionItems";
import { deleteDecision, recordDecision } from "@/lib/actions/decisions";
import { DECISION_CATEGORIES, DECISION_PIPELINE, DECISION_STATUS, formatNaira } from "@/lib/business";
import type { DecisionWithRelations } from "@/lib/business-queries";
import { cn, getDueLabel } from "@/lib/utils";

interface Props {
  decision: DecisionWithRelations | null;
  onClose: () => void;
  onEdit: (d: DecisionWithRelations) => void;
}

export default function DecisionSheet({ decision, onClose, onEdit }: Props) {
  // Keep the last decision while the sheet animates closed.
  const [shown, setShown] = useState(decision);
  useEffect(() => { if (decision) setShown(decision); }, [decision]);

  return (
    <Sheet open={decision !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto data-[side=right]:sm:max-w-2xl">
        {shown && <DecisionBody decision={shown} onClose={onClose} onEdit={onEdit} />}
      </SheetContent>
    </Sheet>
  );
}

function DecisionBody({ decision: d, onClose, onEdit }: { decision: DecisionWithRelations; onClose: () => void; onEdit: (d: DecisionWithRelations) => void }) {
  const { currentUserId } = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<DecisionStatus>(d.status);
  const [selected, setSelected] = useState(d.options.find((o) => o.selected)?.id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { setStatus(d.status); setSelected(d.options.find((o) => o.selected)?.id ?? ""); }, [d]);

  const isProposer = d.proposerId === currentUserId;
  const open = d.status === "PROPOSED" || d.status === "UNDER_REVIEW";
  const due = getDueLabel(d.decideBy);
  const late = open && due.variant === "overdue";
  const costs = d.options.map((o) => o.cost ?? 0);
  const maxCost = Math.max(1, ...costs);
  const cheapest = d.options.filter((o) => o.cost !== null).sort((a, b) => a.cost! - b.cost!)[0];

  function handleRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("selectedOptionId", selected);
    startTransition(async () => {
      const res = await recordDecision(d.id, fd);
      if (res.success) toast.success("Decision recorded");
      else toast.error(res.error);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteDecision(d.id);
      if (res.success) { toast.success("Decision deleted"); setConfirmDelete(false); onClose(); }
      else toast.error(res.error);
    });
  }

  return (
    <>
      <SheetHeader className="gap-3 border-b p-6 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <ToneBadge label={DECISION_STATUS[d.status].label} badge={DECISION_STATUS[d.status].badge} />
          <span className="text-xs text-muted-foreground">{DECISION_CATEGORIES[d.category]}</span>
          <PriorityBadge priority={d.impact} />
        </div>
        <SheetTitle className="text-xl leading-snug">{d.title}</SheetTitle>
        <SheetDescription className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Raised by {d.proposer.name} on {format(new Date(d.createdAt), "d MMM yyyy")}</span>
          {d.decideBy && (
            <span className={cn("inline-flex items-center gap-1", late && "font-medium text-destructive")}>
              <CalendarClock className="size-3.5" /> Decide by {format(new Date(d.decideBy), "d MMM")}{late && " · overdue"}
            </span>
          )}
        </SheetDescription>
        {isProposer && open && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(d)}><Pencil /> Edit</Button>
            {d.status === "PROPOSED" && <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 /> Delete</Button>}
          </div>
        )}
      </SheetHeader>

      <div className="flex flex-col gap-6 p-6">
        {(d.project || d.meeting) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {d.project && (
              <Link href={`/projects/${d.project.id}`} className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 hover:border-primary/40">
                <ProjectIcon icon={d.project.emoji} color={d.project.color} size="xs" />{d.project.name}
              </Link>
            )}
            {d.meeting && (
              <Link href={`/meetings/${d.meeting.id}`} className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 hover:border-primary/40">
                <NotebookPen className="size-3.5 text-muted-foreground" />{d.meeting.title} · {format(new Date(d.meeting.scheduledAt), "d MMM")}
              </Link>
            )}
          </div>
        )}

        {d.context && (
          <section>
            <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Context</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{d.context}</p>
          </section>
        )}

        {d.options.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Options compared</h3>
            <ul className="flex flex-col gap-2">
              {d.options.map((o, i) => (
                <li key={o.id} className={cn("rounded-lg border p-3", o.selected && "border-success/50 bg-success/5")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">
                      <span className="mr-1.5 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>{o.label}
                      {o.selected && <span className="ml-2 inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="size-3.5" /> Chosen</span>}
                    </p>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{formatNaira(o.cost)}</span>
                  </div>
                  {o.cost !== null && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full" style={{ width: `${(o.cost / maxCost) * 100}%`, backgroundColor: o.selected ? "var(--success)" : "var(--chart-2)" }} />
                      </span>
                      {cheapest?.id === o.id && d.options.filter((x) => x.cost !== null).length > 1 && (
                        <span className="text-[11px] text-muted-foreground">Lowest cost</span>
                      )}
                    </div>
                  )}
                  {o.description && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{o.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border bg-muted/30 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Gavel className="size-4" /> {open ? "Record the decision" : "Decision"}</h3>
          {!open && d.outcome && (
            <div className="mb-4 space-y-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{d.outcome}</p>
              {d.rationale && <p className="text-sm text-muted-foreground whitespace-pre-wrap"><span className="font-medium text-foreground">Why: </span>{d.rationale}</p>}
              {d.decider && d.decidedAt && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Avatar name={d.decider.name} image={d.decider.image} size="xs" />
                  Recorded by {d.decider.name} on {format(new Date(d.decidedAt), "d MMM yyyy")}
                </p>
              )}
            </div>
          )}
          <form key={d.id + d.updatedAt} onSubmit={handleRecord} className="flex flex-col gap-3">
            <Select name="status" label="Status" value={status} onChange={(e) => setStatus(e.target.value as DecisionStatus)}
              options={DECISION_PIPELINE.map((s) => ({ value: s, label: DECISION_STATUS[s].label }))} />
            {d.options.length > 0 && (status === "APPROVED" || status === "IMPLEMENTED") && (
              <Select id="selectedOption" label="Option chosen" value={selected} onChange={(e) => setSelected(e.target.value)}
                options={[{ value: "", label: "None of the options" }, ...d.options.map((o) => ({ value: o.id, label: `${o.label}${o.cost !== null ? ` · ${formatNaira(o.cost)}` : ""}` }))]} />
            )}
            <Textarea name="outcome" label="What was decided" defaultValue={d.outcome ?? ""} className="min-h-[72px]"
              placeholder="e.g. Proceed with the multifunctional blender for 40 clients, branded, delivered by 10 December" />
            <Textarea name="rationale" label="Why" defaultValue={d.rationale ?? ""} className="min-h-[60px]" placeholder="The reasoning, so it can be understood later" />
            <Button type="submit" className="self-end" loading={pending}>Save decision</Button>
          </form>
        </section>

        <section>
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Follow-through</h3>
          <p className="mb-2 text-xs text-muted-foreground">Actions that put this decision into effect.</p>
          <ActionList actions={d.actionItems} editable empty={<p className="py-2 text-sm text-muted-foreground">No actions yet.</p>} />
          <div className="mt-2"><AddActionForm decisionId={d.id} projectId={d.projectId} placeholder="Add an action to implement this…" /></div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this decision?"
        description="It's removed from the register. Only proposals that haven't gone to review can be deleted."
        confirmLabel="Delete decision"
        onConfirm={handleDelete}
        pending={pending}
      />
    </>
  );
}
