"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, LayoutList, Repeat } from "lucide-react";
import toast from "react-hot-toast";
import type { MeetingType } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/AppShell";
import { MemberChecklist, MemberSelect, nextWeekday, toDateTimeInput } from "@/components/business/fields";
import { createMeeting } from "@/lib/actions/meetings";
import { MEETING_TYPES } from "@/lib/business";
import { cn } from "@/lib/utils";

/** Weekday each meeting in the weekly rhythm normally falls on. */
const TYPE_DAY: Partial<Record<MeetingType, number>> = { WEEKLY_REVIEW: 1, MIDWEEK_CHECKIN: 3, WEEKLY_REPORT: 5 };
const TYPE_PURPOSE: Partial<Record<MeetingType, string>> = {
  WEEKLY_REVIEW: "Project review, operational planning, identification of pending decisions, and assignment of deliverables for midweek progress reporting.",
  MIDWEEK_CHECKIN: "Brief progress updates on all ongoing projects, proper assignment of tasks and deadlines, and identification of delays, outstanding tasks and areas requiring support.",
  WEEKLY_REPORT: "Close the week: confirm what was delivered, what slipped and why, and set priorities for next week.",
};

export interface NewMeetingDefaults {
  type?: MeetingType;
  scheduledAt?: Date;
  /** Follow up this meeting: its agenda and attendees are carried over. */
  previous?: { id: string; title: string };
}

interface Props { open: boolean; onClose: () => void; defaults?: NewMeetingDefaults }

export default function NewMeetingModal({ open, onClose, defaults }: Props) {
  const router = useRouter();
  const { members, currentUserId } = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<MeetingType>("WEEKLY_REVIEW");
  const [when, setWhen] = useState("");
  const [template, setTemplate] = useState<"portfolio" | "blank">("portfolio");
  const [attendees, setAttendees] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);

  // Reset each time the dialog opens so defaults from the caller apply.
  useEffect(() => {
    if (!open) return;
    const t = defaults?.type ?? "WEEKLY_REVIEW";
    setType(t);
    setWhen(toDateTimeInput(defaults?.scheduledAt ?? nextWeekday(TYPE_DAY[t] ?? 1)));
    setTemplate(t === "WEEKLY_REVIEW" ? "portfolio" : "blank");
    setAttendees(new Set(members.map((m) => m.id)));
    setTitleTouched(false);
  }, [open, defaults, members]);

  // Suggest a title from the type until the user writes their own; the date is shown alongside it everywhere.
  useEffect(() => {
    if (!titleTouched) setTitle(MEETING_TYPES[type].label.replace(/\b\w/g, (c) => c.toUpperCase()));
  }, [type, titleTouched]);

  function changeType(next: MeetingType) {
    setType(next);
    if (!defaults?.scheduledAt && TYPE_DAY[next] !== undefined) setWhen(toDateTimeInput(nextWeekday(TYPE_DAY[next]!)));
    if (!defaults?.previous) setTemplate(next === "WEEKLY_REVIEW" ? "portfolio" : "blank");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("template", defaults?.previous ? "followup" : template);
    if (defaults?.previous) fd.set("previousId", defaults.previous.id);
    // datetime-local has no zone; send an ISO string so the server stores the local time the user meant.
    fd.set("scheduledAt", new Date(when).toISOString());
    attendees.forEach((id) => fd.append("attendeeIds", id));

    startTransition(async () => {
      const res = await createMeeting(fd);
      if (res.success) {
        toast.success("Meeting scheduled");
        onClose();
        router.push(`/meetings/${res.data.id}`);
      } else {
        toast.error(res.error);
      }
    });
  }

  const templates = [
    { value: "portfolio" as const, icon: LayoutList, title: "Portfolio review", body: "One agenda item per live project, with its owner and latest check-in." },
    { value: "blank" as const, icon: FileText, title: "Blank agenda", body: "Start empty and add items as you go." },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={defaults?.previous ? "Schedule follow-up" : "Schedule a meeting"}
      description={defaults?.previous
        ? `Carries over the agenda and attendees of ${defaults.previous.title}, so owners report against what was asked.`
        : "Minutes, decisions and actions recorded here are visible to everyone in the company."}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="new-meeting-form" loading={pending}>Schedule meeting</Button>
        </>
      }
    >
      <form id="new-meeting-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="type" label="Meeting type" value={type}
            onChange={(e) => changeType(e.target.value as MeetingType)}
            options={Object.entries(MEETING_TYPES).map(([value, t]) => ({ value, label: t.label }))}
          />
          <Input name="scheduledAt" label="Date and time" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
        </div>
        <Input name="title" label="Title" value={title} onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }} required />

        {defaults?.previous ? (
          <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/40 p-3 text-sm">
            <Repeat className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p>Agenda copied from <span className="font-medium">{defaults.previous.title}</span>. Each item will show what its owner was asked to report.</p>
          </div>
        ) : (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Agenda</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {templates.map(({ value, icon: Icon, title: t, body }) => (
                <label key={value} className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                  template === value && "border-primary bg-primary/5 ring-1 ring-primary/30",
                )}>
                  <input type="radio" name="templateChoice" value={value} checked={template === value} onChange={() => setTemplate(value)} className="sr-only" />
                  <Icon className={cn("mt-0.5 size-4 shrink-0", template === value ? "text-primary" : "text-muted-foreground")} aria-hidden />
                  <span>
                    <span className="block text-sm font-medium">{t}</span>
                    <span className="block text-xs text-muted-foreground">{body}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <MemberSelect members={members} name="chairId" label="Chair" defaultValue={currentUserId} placeholder="You" />
          <Input name="location" label="Location or link" placeholder="Office, Google Meet, WhatsApp call…" />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Attendees</span>
            <span className="text-xs text-muted-foreground tabular-nums">{attendees.size} of {members.length}</span>
          </div>
          <MemberChecklist members={members} selected={attendees} onChange={setAttendees} />
        </div>

        <Textarea key={type} name="purpose" label="Purpose" defaultValue={TYPE_PURPOSE[type] ?? ""} className="min-h-[72px]" />
      </form>
    </Modal>
  );
}
