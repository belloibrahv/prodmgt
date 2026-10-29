"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { objectiveInclude, type ObjectiveWithRelations } from "@/lib/business-queries";
import type { ActionResult } from "@/types";

const optional = z.string().trim().optional().transform((v) => v || undefined);

const keyResultSchema = z.object({
  title:       z.string().trim().min(1, "Every key result needs a name").max(200),
  unit:        z.string().trim().max(20).optional(),
  startValue:  z.number({ invalid_type_error: "Enter a starting value" }),
  targetValue: z.number({ invalid_type_error: "Enter a target value" }),
  ownerId:     z.string().optional(),
}).refine((kr) => kr.targetValue !== kr.startValue, { message: "A key result's target must differ from its starting value" });

const objectiveSchema = z.object({
  title:       z.string().trim().min(1, "Name the objective").max(200),
  description: optional,
  period:      z.string().trim().min(1, "Give the period a name, e.g. Q4 2026").max(40),
  startDate:   z.string().min(1, "Choose a start date"),
  endDate:     z.string().min(1, "Choose an end date"),
  ownerId:     optional,
}).refine((o) => new Date(o.endDate) > new Date(o.startDate), { message: "The period must end after it starts", path: ["endDate"] });

function revalidateGoals() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function getObjectives(): Promise<ObjectiveWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.objective.findMany({
    where: { archived: false },
    include: objectiveInclude,
    orderBy: [{ endDate: "asc" }, { createdAt: "asc" }],
  });
}

async function canChangeObjective(objectiveId: string, userId: string) {
  const o = await prisma.objective.findUnique({ where: { id: objectiveId }, select: { ownerId: true } });
  return o?.ownerId === userId;
}

export async function createObjective(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = objectiveSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  let keyResults: z.infer<typeof keyResultSchema>[] = [];
  try {
    const krs = z.array(keyResultSchema).min(1, "Add at least one measurable key result").safeParse(JSON.parse(String(formData.get("keyResults") ?? "[]")));
    if (!krs.success) return { success: false, error: krs.error.errors[0].message };
    keyResults = krs.data;
  } catch {
    return { success: false, error: "Key results could not be read" };
  }

  const projectIds = formData.getAll("projectIds").map(String).filter(Boolean);
  const { startDate, endDate, ownerId, ...data } = parsed.data;
  const objective = await prisma.objective.create({
    data: {
      ...data,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ownerId: ownerId ?? userId,
      projects: { connect: projectIds.map((id) => ({ id })) },
      keyResults: {
        create: keyResults.map((kr) => ({
          ...kr,
          unit: kr.unit || undefined,
          ownerId: kr.ownerId || undefined,
          currentValue: kr.startValue,
        })),
      },
    },
  });

  await prisma.activityLog.create({ data: { action: "set an objective", entity: "objective", entityId: objective.id, detail: objective.title, userId } });
  revalidateGoals();
  return { success: true, data: { id: objective.id } };
}

export async function updateObjective(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  if (!(await canChangeObjective(id, userId))) return { success: false, error: "Only the objective's owner can change it" };

  const parsed = objectiveSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const projectIds = formData.getAll("projectIds").map(String).filter(Boolean);
  const { startDate, endDate, ownerId, ...data } = parsed.data;
  await prisma.objective.update({
    where: { id },
    data: {
      ...data,
      description: data.description ?? null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ownerId: ownerId ?? userId,
      projects: { set: projectIds.map((pid) => ({ id: pid })) },
    },
  });

  revalidateGoals();
  return { success: true, data: null };
}

export async function archiveObjective(id: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  if (!(await canChangeObjective(id, userId))) return { success: false, error: "Only the objective's owner can archive it" };

  await prisma.objective.update({ where: { id }, data: { archived: true } });
  revalidateGoals();
  return { success: true, data: null };
}

export async function addKeyResult(objectiveId: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  if (!(await canChangeObjective(objectiveId, userId))) return { success: false, error: "Only the objective's owner can add key results" };

  const parsed = keyResultSchema.safeParse({
    title: formData.get("title"),
    unit: formData.get("unit") || undefined,
    startValue: Number(formData.get("startValue")),
    targetValue: Number(formData.get("targetValue")),
    ownerId: formData.get("ownerId") || undefined,
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.keyResult.create({ data: { ...parsed.data, objectiveId, currentValue: parsed.data.startValue } });
  revalidateGoals();
  return { success: true, data: null };
}

export async function deleteKeyResult(id: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };
  const kr = await prisma.keyResult.findUnique({ where: { id }, select: { objectiveId: true } });
  if (!kr || !(await canChangeObjective(kr.objectiveId, userId))) return { success: false, error: "Only the objective's owner can remove key results" };

  await prisma.keyResult.delete({ where: { id } });
  revalidateGoals();
  return { success: true, data: null };
}

/** Records a new measurement; the history drives the trend charts. */
export async function checkInKeyResult(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const value = Number(formData.get("value"));
  if (!Number.isFinite(value)) return { success: false, error: "Enter the current value as a number" };
  const note = String(formData.get("note") ?? "").trim() || undefined;

  const kr = await prisma.keyResult.findUnique({ where: { id }, select: { ownerId: true, title: true, objective: { select: { ownerId: true } } } });
  if (!kr) return { success: false, error: "Key result not found" };
  if (kr.ownerId !== userId && kr.objective.ownerId !== userId) {
    return { success: false, error: "Only the key result's owner or the objective's owner can check in" };
  }

  await prisma.$transaction([
    prisma.keyResultCheckIn.create({ data: { keyResultId: id, value, note, authorId: userId } }),
    prisma.keyResult.update({ where: { id }, data: { currentValue: value } }),
  ]);

  revalidateGoals();
  return { success: true, data: null };
}
