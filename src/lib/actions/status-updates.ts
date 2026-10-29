"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canEditProject, NO_ACCESS } from "@/lib/access";
import { statusUpdateInclude, type StatusUpdateWithRelations } from "@/lib/business-queries";
import type { ActionResult } from "@/types";

const optional = z.string().trim().optional().transform((v) => v || undefined);

const updateSchema = z
  .object({
    health:        z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK", "BLOCKED", "ON_HOLD", "NOT_STARTED", "DONE"]),
    completed:     optional,
    inProgress:    optional,
    outstanding:   optional,
    challenges:    optional,
    nextAction:    optional,
    nextActionDue: optional,
    meetingId:     optional,
  })
  .refine((u) => u.completed || u.inProgress || u.outstanding || u.challenges || u.nextAction, {
    message: "Fill in at least one section of the update",
  })
  .refine((u) => !u.nextActionDue || u.nextAction, {
    message: "Describe the next action its deadline belongs to",
  });

export async function getProjectStatusUpdates(projectId: string): Promise<StatusUpdateWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.statusUpdate.findMany({ where: { projectId }, include: statusUpdateInclude, orderBy: { createdAt: "desc" } });
}

/** Recent check-ins across the company, newest first. */
export async function getRecentStatusUpdates(limit = 200): Promise<StatusUpdateWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.statusUpdate.findMany({ include: statusUpdateInclude, orderBy: { createdAt: "desc" }, take: limit });
}

export async function postStatusUpdate(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  if (!(await canEditProject(projectId, userId))) return { success: false, error: NO_ACCESS };

  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const { nextActionDue, ...data } = parsed.data;

  const update = await prisma.statusUpdate.create({
    data: { ...data, nextActionDue: nextActionDue ? new Date(nextActionDue) : undefined, projectId, authorId: userId },
  });
  await prisma.activityLog.create({
    data: {
      action: "posted a check-in",
      entity: "project",
      entityId: projectId,
      detail: data.health.toLowerCase().replace("_", " "),
      userId,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  if (data.meetingId) revalidatePath(`/meetings/${data.meetingId}`);
  return { success: true, data: { id: update.id } };
}

/** Each project's most recent check-in, keyed by project id. */
export async function getLatestUpdatesByProject(projectIds?: string[]): Promise<Record<string, StatusUpdateWithRelations>> {
  const session = await auth();
  if (!session?.user?.id) return {};
  const updates = await prisma.statusUpdate.findMany({
    where: projectIds ? { projectId: { in: projectIds } } : undefined,
    distinct: ["projectId"],
    orderBy: [{ projectId: "asc" }, { createdAt: "desc" }],
    include: statusUpdateInclude,
  });
  return Object.fromEntries(updates.map((u) => [u.projectId, u]));
}
