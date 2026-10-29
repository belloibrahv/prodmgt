"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toDateInput } from "@/components/business/fields";
import { createDecision, updateDecision } from "@/lib/actions/decisions";
import { DECISION_CATEGORIES, formatNaira } from "@/lib/business";
import type { DecisionWithRelations, ProjectOption } from "@/lib/business-queries";
import { PRIORITY_LABELS } from "@/lib/utils";

interface OptionDraft { label: string; cost: string; description: string }

export interface DecisionDefaults {
  title?: string;
  context?: string;
  projectId?: string | null;
  meetingId?: string;
  meetingItemId?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  projects: ProjectOption[];
  decision?: DecisionWithRelations | null;
  defaults?: DecisionDefaults;
}

const blank = (): OptionDraft => ({ label: "", cost: "", description: "" });

export default function DecisionModal({ open, onClose, projects, decision, defaults }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [options, setOptions] = useState<OptionDraft[]>([]);

  useEffect(() => {
    if (!open) return;
    setOptions(decision
      ? decision.options.map((o) => ({ label: o.label, cost: o.cost === null ? "" : String(o.cost), description: o.description ?? "" }))
      : [blank(), blank()]);
  }, [open, decision]);

  const setOption = (i: number, patch: Partial<OptionDraft>) => setOptions((list) => list.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const total = options.filter((o) => o.cost).map((o) => Number(o.cost));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const filled = options.filter((o) => o.label.trim());
    fd.set("options", JSON.stringify(filled.map((o) => ({
      label: o.label.trim(),
      description: o.description.trim() || undefined,
      cost: o.cost === "" ? null : Number(o.cost),
    }))));
    if (defaults?.meetingId) fd.set("meetingId", defaults.meetingId);
    if (defaults?.meetingItemId) fd.set("meetingItemId", defaults.meetingItemId);

    startTransition(async () => {
      const res = decision ? await updateDecision(decision.id, fd) : await createDecision(fd);
      if (res.success) {
        toast.success(decision ? "Decision updated" : "Decision added to the register");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={decision ? "Edit decision" : "Raise a decision"}
      description="Capture what needs deciding, the options on the table and what each costs, so the decision and its reasoning stay on record."
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="decision-form" loading={pending}>{decision ? "Save changes" : "Add to register"}</Button>
        </>
      }
    >
      <form id="decision-form" key={`${decision?.id}-${open}`} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="title" label="What needs deciding?" defaultValue={decision?.title ?? defaults?.title ?? ""} placeholder="e.g. End-of-year client souvenir" required />
        <div className="grid gap-3 sm:grid-cols-3">
          <Select name="category" label="Category" defaultValue={decision?.category ?? "OPERATIONAL"}
            options={Object.entries(DECISION_CATEGORIES).map(([value, label]) => ({ value, label }))} />
          <Select name="impact" label="Impact" defaultValue={decision?.impact ?? "MEDIUM"}
            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))} />
          <Input name="decideBy" label="Decide by" type="date" defaultValue={toDateInput(decision?.decideBy)} />
        </div>
        <Select name="projectId" label="Related project" defaultValue={decision?.projectId ?? defaults?.projectId ?? ""}
          options={[{ value: "", label: "Company-wide" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
        <Textarea name="context" label="Context" defaultValue={decision?.context ?? defaults?.context ?? ""} placeholder="Background, constraints, deadlines, and who is affected" />

        <fieldset className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <legend className="text-sm font-medium">Options</legend>
            {total.length > 1 && (
              <span className="text-xs text-muted-foreground">Range {formatNaira(Math.min(...total))} – {formatNaira(Math.max(...total))}</span>
            )}
          </div>
          {options.map((o, i) => (
            <div key={i} className="grid gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[1fr_160px_auto]">
              <input
                value={o.label} onChange={(e) => setOption(i, { label: e.target.value })}
                placeholder={`Option ${i + 1}, e.g. ${i === 0 ? "Fibre gas cylinder" : "Multifunctional blender"}`}
                aria-label={`Option ${i + 1} name`}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              />
              <input
                value={o.cost} onChange={(e) => setOption(i, { cost: e.target.value })} type="number" min="0" step="any" inputMode="decimal"
                placeholder="Cost (₦)" aria-label={`Option ${i + 1} cost in naira`}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
              />
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove option ${i + 1}`} onClick={() => setOptions((list) => list.filter((_, j) => j !== i))}>
                <X />
              </Button>
              <textarea
                value={o.description} onChange={(e) => setOption(i, { description: e.target.value })} rows={2}
                placeholder="Quantities, supplier, branding, delivery time, pros and cons"
                aria-label={`Option ${i + 1} details`}
                className="rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 sm:col-span-3"
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setOptions((list) => [...list, blank()])}>
            <Plus /> Add option
          </Button>
        </fieldset>
      </form>
    </Modal>
  );
}
