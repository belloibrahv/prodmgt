"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/AppShell";
import { MemberSelect, toDateTimeInput } from "@/components/business/fields";
import { updateMeeting } from "@/lib/actions/meetings";
import { MEETING_TYPES } from "@/lib/business";
import type { MeetingDetail } from "@/lib/business-queries";

interface Props { open: boolean; onClose: () => void; meeting: MeetingDetail }

export default function EditMeetingModal({ open, onClose, meeting }: Props) {
  const { members } = useWorkspace();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Send local times as ISO so they're stored as the user meant them.
    for (const key of ["scheduledAt", "nextReviewAt"]) {
      const v = fd.get(key) as string;
      if (v) fd.set(key, new Date(v).toISOString());
    }
    startTransition(async () => {
      const res = await updateMeeting(meeting.id, fd);
      if (res.success) {
        toast.success("Meeting updated");
        onClose();
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
      title="Meeting details"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-meeting-form" loading={pending}>Save details</Button>
        </>
      }
    >
      <form id="edit-meeting-form" onSubmit={handleSubmit} className="flex flex-col gap-4" key={String(open)}>
        <Input name="title" label="Title" defaultValue={meeting.title} required />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select name="type" label="Meeting type" defaultValue={meeting.type}
            options={Object.entries(MEETING_TYPES).map(([value, t]) => ({ value, label: t.label }))} />
          <Input name="scheduledAt" label="Date and time" type="datetime-local" defaultValue={toDateTimeInput(meeting.scheduledAt)} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MemberSelect members={members} name="chairId" label="Chair" defaultValue={meeting.chairId} placeholder="No chair" />
          <Input name="nextReviewAt" label="Next progress review" type="datetime-local" defaultValue={toDateTimeInput(meeting.nextReviewAt)}
            hint="When owners report back on this meeting's follow-ups" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="location" label="Location or link" defaultValue={meeting.location ?? ""} />
          <Input name="recordingUrl" label="Recording link" type="url" defaultValue={meeting.recordingUrl ?? ""} placeholder="https://…" hint="Audio or video of the meeting, if recorded" />
        </div>
        <Input name="guests" label="Guests" defaultValue={meeting.guests ?? ""} placeholder="People without an account, comma separated" />
        <Textarea name="purpose" label="Purpose" defaultValue={meeting.purpose ?? ""} className="min-h-[72px]" />
      </form>
    </Modal>
  );
}
