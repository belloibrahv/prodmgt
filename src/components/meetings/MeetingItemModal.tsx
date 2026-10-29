"use client";

import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import type { MeetingItemKind } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/AppShell";
import { HealthSelect } from "@/components/business/fields";
import { saveMeetingItem } from "@/lib/actions/meetings";
import { ITEM_KINDS, ITEM_KIND_ORDER } from "@/lib/business";
import type { MeetingDetail, ProjectOption } from "@/lib/business-queries";

type Item = MeetingDetail["items"][number];

interface Props {
  open: boolean;
  onClose: () => void;
  meetingId: string;
  projects: ProjectOption[];
  /** Label for the follow-up field, e.g. "Wednesday update". */
  followUpLabel: string;
  item?: Item | null;
  defaultKind?: MeetingItemKind;
}

export default function MeetingItemModal({ open, onClose, meetingId, projects, followUpLabel, item, defaultKind = "PROJECT_UPDATE" }: Props) {
  const { members } = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<MeetingItemKind>(defaultKind);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [ownerId, setOwnerId] = useState("");

  useEffect(() => {
    if (!open) return;
    setKind(item?.kind ?? defaultKind);
    setProjectId(item?.projectId ?? "");
    setTitle(item?.title ?? "");
    setOwnerId(item?.ownerId ?? "");
  }, [open, item, defaultKind]);

  // Picking a project fills in its name and owner, which can still be changed.
  function pickProject(id: string) {
    setProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p && !title) setTitle(p.name);
    if (p && !ownerId) setOwnerId(p.ownerId);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveMeetingItem(meetingId, fd, item?.id);
      if (res.success) {
        toast.success(item ? "Item updated" : "Item added to the minutes");
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
      title={item ? "Edit minute item" : "Add to the minutes"}
      description="Record what was discussed, where it stands and what must be reported next time."
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="meeting-item-form" loading={pending}>{item ? "Save item" : "Add item"}</Button>
        </>
      }
    >
      <form id="meeting-item-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="kind" label="Type" value={kind} onChange={(e) => setKind(e.target.value as MeetingItemKind)}
            options={ITEM_KIND_ORDER.map((k) => ({ value: k, label: ITEM_KINDS[k].label }))}
          />
          <Select
            name="projectId" label="Project" value={projectId} onChange={(e) => pickProject(e.target.value)}
            options={[{ value: "", label: "Not about a project" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
        </div>
        <Input name="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Soft e Box Website" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <HealthSelect key={`h-${item?.id ?? "new"}-${open}`} allowEmpty defaultValue={item?.health ?? (kind === "PROJECT_UPDATE" ? "ON_TRACK" : "")} />
          <Select
            name="ownerId" id="item-owner" label="Responsible" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
            options={[{ value: "", label: "No one yet" }, ...members.map((m) => ({ value: m.id, label: m.name ?? m.email }))]}
          />
        </div>
        <Input key={`s-${item?.id}-${open}`} name="statusNote" label="Status line" defaultValue={item?.statusNote ?? ""} placeholder="e.g. In progress; deployment pending" />
        <Textarea key={`d-${item?.id}-${open}`} name="discussion" label="Discussion" defaultValue={item?.discussion ?? ""} placeholder="What was said and agreed" />
        <Textarea
          key={`f-${item?.id}-${open}`}
          name="followUp" label={followUpLabel} defaultValue={item?.followUp ?? ""} className="min-h-[72px]"
          hint="What the owner must report at the next review. It appears on their follow-up agenda and in the reminder."
          placeholder="e.g. Confirm go-live, or give a confirmed launch date and any blockers"
        />
      </form>
    </Modal>
  );
}
