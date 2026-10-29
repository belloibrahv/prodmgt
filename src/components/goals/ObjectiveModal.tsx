"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspace } from "@/components/layout/AppShell";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { MemberSelect, toDateInput } from "@/components/business/fields";
import { createObjective, updateObjective } from "@/lib/actions/goals";
import type { ObjectiveWithRelations, ProjectOption } from "@/lib/business-queries";

interface KrDraft { title: string; unit: string; startValue: string; targetValue: string; ownerId: string }
const blankKr = (): KrDraft => ({ title: "", unit: "", startValue: "0", targetValue: "", ownerId: "" });

/** The calendar quarter containing a date, e.g. Q4 2026 → 1 Oct – 31 Dec. */
export function quarterOf(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  return {
    period: `Q${q + 1} ${d.getFullYear()}`,
    start: new Date(d.getFullYear(), q * 3, 1),
    end: new Date(d.getFullYear(), q * 3 + 3, 0),
  };
}

interface Props { open: boolean; onClose: () => void; projects: ProjectOption[]; objective?: ObjectiveWithRelations | null }

export default function ObjectiveModal({ open, onClose, projects, objective }: Props) {
  const { members, currentUserId } = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [krs, setKrs] = useState<KrDraft[]>([blankKr()]);
  const [linked, setLinked] = useState<Set<string>>(new Set());
  const quarter = quarterOf();

  useEffect(() => {
    if (!open) return;
    setKrs([blankKr()]);
    setLinked(new Set(objective?.projects.map((p) => p.id) ?? []));
  }, [open, objective]);

  const setKr = (i: number, patch: Partial<KrDraft>) => setKrs((list) => list.map((k, j) => (j === i ? { ...k, ...patch } : k)));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    linked.forEach((id) => fd.append("projectIds", id));
    if (!objective) {
      fd.set("keyResults", JSON.stringify(krs.filter((k) => k.title.trim()).map((k) => ({
        title: k.title.trim(),
        unit: k.unit.trim() || undefined,
        startValue: Number(k.startValue),
        targetValue: k.targetValue === "" ? Number.NaN : Number(k.targetValue),
        ownerId: k.ownerId || undefined,
      }))));
    }
    startTransition(async () => {
      const res = objective ? await updateObjective(objective.id, fd) : await createObjective(fd);
      if (res.success) {
        toast.success(objective ? "Objective updated" : "Objective set");
        onClose();
      } else {
        toast.error(res.error);
      }
    });
  }

  const field = "h-9 rounded-lg border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20";

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={objective ? "Edit objective" : "Set an objective"}
      description="An objective is the outcome the company commits to. Key results are the numbers that prove it happened."
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="objective-form" loading={pending}>{objective ? "Save objective" : "Set objective"}</Button>
        </>
      }
    >
      <form id="objective-form" key={`${objective?.id}-${open}`} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="title" label="Objective" defaultValue={objective?.title} placeholder="e.g. Launch StockVaults commercially" required />
        <Textarea name="description" label="Why it matters" defaultValue={objective?.description ?? ""} className="min-h-[64px]" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="period" label="Period" defaultValue={objective?.period ?? quarter.period} required />
          <Input name="startDate" label="Starts" type="date" defaultValue={toDateInput(objective?.startDate ?? quarter.start)} required />
          <Input name="endDate" label="Ends" type="date" defaultValue={toDateInput(objective?.endDate ?? quarter.end)} required />
        </div>
        <MemberSelect members={members} name="ownerId" label="Owner" defaultValue={objective?.ownerId ?? currentUserId} placeholder="You" />

        {!objective && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Key results</legend>
            {krs.map((k, i) => (
              <div key={i} className="grid gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-[1fr_auto]">
                <input value={k.title} onChange={(e) => setKr(i, { title: e.target.value })} placeholder="e.g. Paying StockVaults customers" aria-label={`Key result ${i + 1}`} className={field} />
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove key result ${i + 1}`} onClick={() => setKrs((l) => l.filter((_, j) => j !== i))}><X /></Button>
                <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-4">
                  <input value={k.startValue} onChange={(e) => setKr(i, { startValue: e.target.value })} type="number" step="any" placeholder="From" aria-label="Starting value" className={field} />
                  <input value={k.targetValue} onChange={(e) => setKr(i, { targetValue: e.target.value })} type="number" step="any" placeholder="Target" aria-label="Target value" className={field} />
                  <input value={k.unit} onChange={(e) => setKr(i, { unit: e.target.value })} placeholder="Unit: %, NGN, clients" aria-label="Unit" className={field} />
                  <select value={k.ownerId} onChange={(e) => setKr(i, { ownerId: e.target.value })} aria-label="Owner" className={field}>
                    <option value="">Objective owner</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name ?? m.email}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setKrs((l) => [...l, blankKr()])}><Plus /> Add key result</Button>
          </fieldset>
        )}

        {projects.length > 0 && (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1 text-sm font-medium">Projects that deliver it</legend>
            <ul className="grid max-h-48 gap-1 overflow-y-auto rounded-lg border p-1.5 sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                    <Checkbox checked={linked.has(p.id)} onCheckedChange={(on) => setLinked((s) => { const n = new Set(s); if (on) n.add(p.id); else n.delete(p.id); return n; })} />
                    <ProjectIcon icon={p.emoji} color={p.color} size="xs" />
                    <span className="min-w-0 truncate">{p.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
      </form>
    </Modal>
  );
}
