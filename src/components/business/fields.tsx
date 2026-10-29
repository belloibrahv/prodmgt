"use client";

import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { HEALTH, HEALTH_ORDER } from "@/lib/business";
import type { WorkspaceMember } from "@/types";

/** Value for <input type="date">. */
export const toDateInput = (d: Date | string | null | undefined) => (d ? format(new Date(d), "yyyy-MM-dd") : "");
/** Value for <input type="datetime-local">. */
export const toDateTimeInput = (d: Date | string | null | undefined) => (d ? format(new Date(d), "yyyy-MM-dd'T'HH:mm") : "");

/** The next given weekday (0 = Sunday) at a set hour, today included if it's still ahead. */
export function nextWeekday(day: number, hour = 10, from = new Date()) {
  const d = new Date(from);
  d.setHours(hour, 0, 0, 0);
  const diff = (day - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 && d < from ? 7 : diff));
  return d;
}

export function MemberSelect({
  members, name, label, defaultValue, placeholder = "Unassigned", id,
}: { members: WorkspaceMember[]; name: string; label?: string; defaultValue?: string | null; placeholder?: string; id?: string }) {
  return (
    <Select
      id={id ?? name}
      name={name}
      label={label}
      defaultValue={defaultValue ?? ""}
      options={[{ value: "", label: placeholder }, ...members.map((m) => ({ value: m.id, label: m.name ?? m.email }))]}
    />
  );
}

export function HealthSelect({ name = "health", label = "Status", defaultValue, allowEmpty = false, id }: {
  name?: string; label?: string; defaultValue?: string | null; allowEmpty?: boolean; id?: string;
}) {
  return (
    <Select
      id={id ?? name}
      name={name}
      label={label}
      defaultValue={defaultValue ?? (allowEmpty ? "" : "ON_TRACK")}
      options={[
        ...(allowEmpty ? [{ value: "", label: "No status" }] : []),
        ...HEALTH_ORDER.map((h) => ({ value: h, label: HEALTH[h].label })),
      ]}
    />
  );
}

/** Tick list of people, e.g. meeting attendees. */
export function MemberChecklist({
  members, selected, onChange, className,
}: { members: WorkspaceMember[]; selected: Set<string>; onChange: (next: Set<string>) => void; className?: string }) {
  function toggle(id: string, on: boolean) {
    const next = new Set(selected);
    if (on) next.add(id); else next.delete(id);
    onChange(next);
  }
  return (
    <ul className={cn("grid max-h-56 gap-1 overflow-y-auto rounded-lg border p-1.5 sm:grid-cols-2", className)}>
      {members.map((m) => (
        <li key={m.id}>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <Checkbox checked={selected.has(m.id)} onCheckedChange={(on) => toggle(m.id, on)} />
            <Avatar name={m.name} image={m.image} size="xs" />
            <span className="min-w-0 truncate">{m.name ?? m.email}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
