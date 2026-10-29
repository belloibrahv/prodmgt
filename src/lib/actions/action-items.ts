"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { actionItemInclude, type ActionItemWithRelations } from "@/lib/business-queries";
import type { ActionResult } from "@/types";

const optional = z.string().trim().optional().transform((v) => v || undefined);

const actionSchema = z.object({
  title:         z.string().trim().min(1, "Describe the action").max(300),
  notes:         optional,
  ownerId:       optional,
  dueDate:       optional,
  meetingId:     optional,
  meetingItemId: optional,
  projectId:     optional,
  decisionId:    optional,
});

const STATUSES = ["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"] as const;

function revalidateActions(meetingId?: string | null, decisionId?: string | null) {
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
  revalidatePath("/decisions");
  if (meetingId) revalidatePath(`/meetings/${meetingId}`);
  if (decisionId) revalidatePath("/decisions");
}

/** Every action item, open ones first, for the company-wide tracker. */
export async function getActionItems(): Promise<ActionItemWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.actionItem.findMany({
    include: actionItemInclude,
    orderBy: [{ status: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }],
  });
}

export async function getMyOpenActionItems(): Promise<ActionItemWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.actionItem.findMany({
    where: { ownerId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
    include: actionItemInclude,
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  });
}

export async function createActionItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = actionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const { dueDate, ...data } = parsed.data;

  if (data.meetingId) {
    const meeting = await prisma.meeting.findUnique({ where: { id: data.meetingId }, select: { status: true } });
    if (!meeting) return { success: false, error: "Meeting not found" };
    if (meeting.status === "COMPLETED") return { success: false, error: "These minutes are locked. Reopen the meeting to add actions." };
  }
  // An action raised against an agenda item inherits that item's project.
  if (data.meetingItemId && !data.projectId) {
    const item = await prisma.meetingItem.findUnique({ where: { id: data.meetingItemId }, select: { projectId: true } });
    data.projectId = item?.projectId ?? undefined;
  }

  const action = await prisma.actionItem.create({
    data: { ...data, dueDate: dueDate ? new Date(dueDate) : undefined, createdById: userId },
  });

  revalidateActions(data.meetingId, data.decisionId);
  return { success: true, data: { id: action.id } };
}

export async function setActionStatus(id: string, status: (typeof STATUSES)[number]): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  if (!STATUSES.includes(status)) return { success: false, error: "Unknown status" };

  const action = await prisma.actionItem.findUnique({
    where: { id },
    select: { ownerId: true, createdById: true, meetingId: true, decisionId: true, title: true, projectId: true, meeting: { select: { chairId: true } } },
  });
  if (!action) return { success: false, error: "Action not found" };
  // The person accountable, whoever raised it, or the chair of the meeting it came from.
  const allowed = [action.ownerId, action.createdById, action.meeting?.chairId].includes(userId);
  if (!allowed) return { success: false, error: "Only the owner, the person who raised it or the meeting chair can update this action" };

  await prisma.actionItem.update({
    where: { id },
    data: { status, completedAt: status === "DONE" ? new Date() : null },
  });
  if (status === "DONE") {
    await prisma.activityLog.create({
      data: { action: "completed action", entity: "action", entityId: id, detail: action.title, userId, projectId: action.projectId },
    });
  }

  revalidateActions(action.meetingId, action.decisionId);
  return { success: true, data: null };
}

export async function updateActionItem(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const action = await prisma.actionItem.findUnique({
    where: { id },
    select: { ownerId: true, createdById: true, meetingId: true, decisionId: true, meeting: { select: { chairId: true } } },
  });
  if (!action) return { success: false, error: "Action not found" };
  if (![action.ownerId, action.createdById, action.meeting?.chairId].includes(userId)) {
    return { success: false, error: "Only the owner, the person who raised it or the meeting chair can edit this action" };
  }

  const parsed = actionSchema.pick({ title: true, notes: true, ownerId: true, dueDate: true }).safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.actionItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      notes: parsed.data.notes ?? null,
      ownerId: parsed.data.ownerId ?? null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  revalidateActions(action.meetingId, action.decisionId);
  return { success: true, data: null };
}

export async function deleteActionItem(id: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const action = await prisma.actionItem.findUnique({
    where: { id },
    select: { createdById: true, meetingId: true, decisionId: true, meeting: { select: { chairId: true, status: true } } },
  });
  if (!action) return { success: false, error: "Action not found" };
  if (action.createdById !== userId && action.meeting?.chairId !== userId) {
    return { success: false, error: "Only the person who raised it or the meeting chair can delete this action" };
  }
  if (action.meeting?.status === "COMPLETED") return { success: false, error: "Actions in minuted meetings can be cancelled, not deleted" };

  await prisma.actionItem.delete({ where: { id } });
  revalidateActions(action.meetingId, action.decisionId);
  return { success: true, data: null };
}

/** Open actions from meetings held before this one, so nothing is dropped between reviews. */
export async function getCarriedForwardActions(meetingId: string, before: Date): Promise<ActionItemWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.actionItem.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      meetingId: { not: meetingId },
      meeting: { scheduledAt: { lt: before } },
    },
    include: actionItemInclude,
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  });
}
