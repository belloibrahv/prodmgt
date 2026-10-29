"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Health, MeetingItemKind, ProjectStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  meetingDetailInclude, meetingListInclude, type MeetingDetail, type MeetingListItem,
} from "@/lib/business-queries";
import type { ActionResult } from "@/types";

const MEETING_TYPES = ["WEEKLY_REVIEW", "MIDWEEK_CHECKIN", "WEEKLY_REPORT", "MANAGEMENT", "CLIENT", "OTHER"] as const;
const HEALTHS = ["ON_TRACK", "AT_RISK", "OFF_TRACK", "BLOCKED", "ON_HOLD", "NOT_STARTED", "DONE"] as const;
const ITEM_KINDS = ["PROJECT_UPDATE", "DISCUSSION", "DECISION", "RECOMMENDATION", "ANNOUNCEMENT"] as const;

const optional = z.string().trim().optional().transform((v) => v || undefined);

const meetingSchema = z.object({
  title:        z.string().trim().min(1, "Give the meeting a title").max(200),
  type:         z.enum(MEETING_TYPES),
  scheduledAt:  z.string().min(1, "Choose when the meeting takes place"),
  purpose:      optional,
  location:     optional,
  chairId:      optional,
  guests:       optional,
  recordingUrl: z.string().trim().url("Recording link must be a full URL").optional().or(z.literal("")).transform((v) => v || undefined),
  nextReviewAt: optional,
  summary:      optional,
});

const itemSchema = z.object({
  title:      z.string().trim().min(1, "Item title is required").max(200),
  kind:       z.enum(ITEM_KINDS),
  health:     z.enum(HEALTHS).optional().or(z.literal("")).transform((v) => v || undefined),
  statusNote: optional,
  discussion: optional,
  followUp:   optional,
  projectId:  optional,
  ownerId:    optional,
});

/** Agenda health for a project that has no check-in yet. */
const STATUS_HEALTH: Record<ProjectStatus, Health> = {
  PLANNING: "NOT_STARTED",
  ACTIVE: "ON_TRACK",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "DONE",
  CANCELLED: "ON_HOLD",
};

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

interface AgendaSeed {
  position: number;
  kind: MeetingItemKind;
  title: string;
  projectId: string | null;
  ownerId: string | null;
  health: Health | null;
  statusNote: string | null;
}

function revalidateMeetings(id?: string) {
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/meetings/${id}`);
}

async function logMeeting(userId: string, meetingId: string, action: string, detail?: string) {
  await prisma.activityLog.create({ data: { action, entity: "meeting", entityId: meetingId, detail, userId } });
}

type Access = { ok: true; meeting: { id: string; status: string; chairId: string | null; createdById: string } } | { ok: false; error: string };

/**
 * Minutes can be written by whoever created the meeting, its chair or an attendee.
 * Once minuted they are locked so the record can't drift; the chair or creator can reopen.
 */
async function authorizeMeeting(meetingId: string, userId: string, { allowLocked = false } = {}): Promise<Access> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { id: true, status: true, chairId: true, createdById: true, attendees: { where: { userId }, select: { userId: true } } },
  });
  if (!meeting) return { ok: false, error: "Meeting not found" };
  const isLead = meeting.createdById === userId || meeting.chairId === userId;
  if (!isLead && meeting.attendees.length === 0) {
    return { ok: false, error: "Only the chair, organiser or attendees can edit these minutes" };
  }
  if (!allowLocked && (meeting.status === "COMPLETED" || meeting.status === "CANCELLED")) {
    return { ok: false, error: "These minutes are locked. Reopen the meeting to change them." };
  }
  return { ok: true, meeting };
}

export async function getMeetings(): Promise<MeetingListItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.meeting.findMany({ include: meetingListInclude, orderBy: { scheduledAt: "desc" } });
}

export async function getMeeting(id: string): Promise<MeetingDetail | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.meeting.findUnique({ where: { id }, include: meetingDetailInclude });
}

/** Agenda items for every live project, using each project's latest check-in. */
async function portfolioAgenda(): Promise<AgendaSeed[]> {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { status: { in: ["PLANNING", "ACTIVE", "ON_HOLD"] } },
        { status: "COMPLETED", completedAt: { gte: new Date(Date.now() - TWO_WEEKS_MS) } },
      ],
    },
    select: {
      id: true, name: true, ownerId: true, status: true,
      statusUpdates: { orderBy: { createdAt: "desc" }, take: 1, select: { health: true, nextAction: true } },
    },
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  });
  return projects.map((p, position) => ({
    position,
    kind: "PROJECT_UPDATE",
    title: p.name,
    projectId: p.id,
    ownerId: p.ownerId,
    health: p.statusUpdates[0]?.health ?? STATUS_HEALTH[p.status],
    statusNote: p.statusUpdates[0]?.nextAction ? `Next: ${p.statusUpdates[0].nextAction}` : null,
  }));
}

export async function createMeeting(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = meetingSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const template = String(formData.get("template") ?? "blank");
  const previousId = (formData.get("previousId") as string) || undefined;
  const attendeeIds = new Set(formData.getAll("attendeeIds").map(String).filter(Boolean));
  attendeeIds.add(userId);

  let items: AgendaSeed[] = [];
  if (template === "portfolio") items = await portfolioAgenda();

  if (previousId) {
    const previous = await prisma.meeting.findUnique({
      where: { id: previousId },
      include: { items: { orderBy: { position: "asc" } }, attendees: true },
    });
    if (!previous) return { success: false, error: "The meeting being followed up no longer exists" };
    // Same agenda, fresh discussion: owners report against the previous follow-ups.
    items = previous.items.map((i, position) => ({
      position,
      kind: i.kind,
      title: i.title,
      projectId: i.projectId,
      ownerId: i.ownerId,
      health: i.health,
      statusNote: i.statusNote,
    }));
    previous.attendees.forEach((a) => attendeeIds.add(a.userId));
  }

  const { scheduledAt, nextReviewAt, ...rest } = parsed.data;
  const meeting = await prisma.meeting.create({
    data: {
      ...rest,
      scheduledAt: new Date(scheduledAt),
      nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : undefined,
      createdById: userId,
      chairId: rest.chairId ?? userId,
      previousId,
      attendees: { create: [...attendeeIds].map((id) => ({ userId: id })) },
      items: { createMany: { data: items } },
    },
  });

  await logMeeting(userId, meeting.id, "scheduled meeting", meeting.title);
  revalidateMeetings();
  return { success: true, data: { id: meeting.id } };
}

export async function updateMeeting(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  const access = await authorizeMeeting(id, userId);
  if (!access.ok) return { success: false, error: access.error };

  const parsed = meetingSchema.partial().safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { scheduledAt, nextReviewAt, ...rest } = parsed.data;
  await prisma.meeting.update({
    where: { id },
    data: {
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      nextReviewAt: formData.has("nextReviewAt") ? (nextReviewAt ? new Date(nextReviewAt) : null) : undefined,
      // Blank fields in the form clear the stored value.
      ...Object.fromEntries(
        ["purpose", "location", "guests", "recordingUrl", "summary"]
          .filter((k) => formData.has(k) && !formData.get(k))
          .map((k) => [k, null]),
      ),
    },
  });

  revalidateMeetings(id);
  return { success: true, data: null };
}

export async function setMeetingStatus(
  id: string,
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const reopening = status === "SCHEDULED" || status === "IN_PROGRESS";
  const access = await authorizeMeeting(id, userId, { allowLocked: reopening });
  if (!access.ok) return { success: false, error: access.error };
  const locked = access.meeting.status === "COMPLETED" || access.meeting.status === "CANCELLED";
  if (locked && reopening && access.meeting.chairId !== userId && access.meeting.createdById !== userId) {
    return { success: false, error: "Only the chair or organiser can reopen minuted meetings" };
  }

  await prisma.meeting.update({
    where: { id },
    data: { status, completedAt: status === "COMPLETED" ? new Date() : null },
  });

  const verb = { SCHEDULED: "reopened", IN_PROGRESS: "started", COMPLETED: "finalised minutes for", CANCELLED: "cancelled" }[status];
  await logMeeting(userId, id, `${verb} meeting`);
  revalidateMeetings(id);
  return { success: true, data: null };
}

export async function deleteMeeting(id: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const meeting = await prisma.meeting.findUnique({ where: { id }, select: { createdById: true, status: true } });
  if (!meeting) return { success: false, error: "Meeting not found" };
  if (meeting.createdById !== userId) return { success: false, error: "Only the organiser can delete a meeting" };
  if (meeting.status === "COMPLETED") return { success: false, error: "Minuted meetings are part of the record and can't be deleted" };

  await prisma.meeting.delete({ where: { id } });
  revalidateMeetings();
  return { success: true, data: null };
}

export async function setAttendance(meetingId: string, userId: string, present: boolean | null): Promise<ActionResult> {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) return { success: false, error: "Not authenticated" };
  const access = await authorizeMeeting(meetingId, currentUserId);
  if (!access.ok) return { success: false, error: access.error };

  if (present === null) {
    await prisma.meetingAttendee.deleteMany({ where: { meetingId, userId } });
  } else {
    await prisma.meetingAttendee.upsert({
      where: { meetingId_userId: { meetingId, userId } },
      create: { meetingId, userId, present },
      update: { present },
    });
  }

  revalidateMeetings(meetingId);
  return { success: true, data: null };
}

export async function saveMeetingItem(meetingId: string, formData: FormData, itemId?: string): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  const access = await authorizeMeeting(meetingId, userId);
  if (!access.ok) return { success: false, error: access.error };

  const parsed = itemSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const data = {
    ...parsed.data,
    health: parsed.data.health ?? null,
    statusNote: parsed.data.statusNote ?? null,
    discussion: parsed.data.discussion ?? null,
    followUp: parsed.data.followUp ?? null,
    projectId: parsed.data.projectId ?? null,
    ownerId: parsed.data.ownerId ?? null,
  };

  if (itemId) {
    const existing = await prisma.meetingItem.findUnique({ where: { id: itemId }, select: { meetingId: true } });
    if (existing?.meetingId !== meetingId) return { success: false, error: "Item not found in this meeting" };
    await prisma.meetingItem.update({ where: { id: itemId }, data });
    revalidateMeetings(meetingId);
    return { success: true, data: { id: itemId } };
  }

  const last = await prisma.meetingItem.findFirst({ where: { meetingId }, orderBy: { position: "desc" }, select: { position: true } });
  const item = await prisma.meetingItem.create({ data: { ...data, meetingId, position: (last?.position ?? -1) + 1 } });
  revalidateMeetings(meetingId);
  return { success: true, data: { id: item.id } };
}

export async function deleteMeetingItem(meetingId: string, itemId: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  const access = await authorizeMeeting(meetingId, userId);
  if (!access.ok) return { success: false, error: access.error };

  await prisma.meetingItem.deleteMany({ where: { id: itemId, meetingId } });
  revalidateMeetings(meetingId);
  return { success: true, data: null };
}

export async function moveMeetingItem(meetingId: string, itemId: string, direction: -1 | 1): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  const access = await authorizeMeeting(meetingId, userId);
  if (!access.ok) return { success: false, error: access.error };

  const items = await prisma.meetingItem.findMany({ where: { meetingId }, orderBy: { position: "asc" }, select: { id: true } });
  const from = items.findIndex((i) => i.id === itemId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= items.length) return { success: true, data: null };

  [items[from], items[to]] = [items[to], items[from]];
  await prisma.$transaction(items.map((i, position) => prisma.meetingItem.update({ where: { id: i.id }, data: { position } })));
  revalidateMeetings(meetingId);
  return { success: true, data: null };
}
