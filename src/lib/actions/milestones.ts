"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import type { ActionResult } from "@/types";

const milestoneSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate:     z.string().min(1, "Due date is required"),
});

export async function createMilestone(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = {
    name:        formData.get("name"),
    description: formData.get("description") || undefined,
    dueDate:     formData.get("dueDate"),
  };

  const parsed = milestoneSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const milestone = await prisma.milestone.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: { id: milestone.id } };
}

export async function updateMilestone(id: string, projectId: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = {
    name:        formData.get("name"),
    description: formData.get("description") || undefined,
    dueDate:     formData.get("dueDate"),
  };

  const parsed = milestoneSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.milestone.update({
    where: { id },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: null };
}

export async function deleteMilestone(id: string, projectId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await prisma.milestone.delete({ where: { id } });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: null };
}

export async function toggleMilestoneComplete(id: string, projectId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const milestone = await prisma.milestone.findUnique({ where: { id }, select: { completedAt: true } });
  if (!milestone) return { success: false, error: "Milestone not found" };

  await prisma.milestone.update({
    where: { id },
    data: { completedAt: milestone.completedAt ? null : new Date() },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: null };
}
