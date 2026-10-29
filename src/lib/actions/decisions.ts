"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { decisionInclude, serializeDecision, type DecisionWithRelations } from "@/lib/business-queries";
import type { ActionResult } from "@/types";

const optional = z.string().trim().optional().transform((v) => v || undefined);

const optionSchema = z.object({
  label:       z.string().trim().min(1, "Every option needs a name").max(200),
  description: z.string().trim().optional(),
  cost:        z.number().nonnegative("Costs can't be negative").nullable().optional(),
});

const decisionSchema = z.object({
  title:     z.string().trim().min(1, "State what needs deciding").max(200),
  context:   optional,
  category:  z.enum(["STRATEGIC", "OPERATIONAL", "FINANCIAL", "TECHNICAL", "PEOPLE", "CLIENT", "SECURITY"]),
  impact:    z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  decideBy:  optional,
  projectId: optional,
  meetingId: optional,
});

const recordSchema = z.object({
  status:           z.enum(["PROPOSED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DEFERRED", "IMPLEMENTED"]),
  outcome:          optional,
  rationale:        optional,
  selectedOptionId: optional,
});

function parseOptions(raw: FormDataEntryValue | null) {
  if (!raw) return { ok: true as const, options: [] };
  try {
    const parsed = z.array(optionSchema).safeParse(JSON.parse(String(raw)));
    if (!parsed.success) return { ok: false as const, error: parsed.error.errors[0].message };
    return { ok: true as const, options: parsed.data };
  } catch {
    return { ok: false as const, error: "Options could not be read" };
  }
}

function revalidateDecisions(meetingId?: string | null) {
  revalidatePath("/decisions");
  revalidatePath("/dashboard");
  if (meetingId) revalidatePath(`/meetings/${meetingId}`);
}

export async function getDecisions(): Promise<DecisionWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await prisma.decision.findMany({ include: decisionInclude, orderBy: [{ decideBy: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }] });
  return rows.map(serializeDecision);
}

export async function createDecision(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = decisionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const options = parseOptions(formData.get("options"));
  if (!options.ok) return { success: false, error: options.error };

  const { decideBy, ...data } = parsed.data;
  const decision = await prisma.decision.create({
    data: {
      ...data,
      decideBy: decideBy ? new Date(decideBy) : undefined,
      proposerId: userId,
      options: { create: options.options.map((o, position) => ({ ...o, cost: o.cost ?? undefined, position })) },
    },
  });

  // Raised from the minutes: link the agenda item so the record points both ways.
  const meetingItemId = formData.get("meetingItemId") as string | null;
  if (meetingItemId) {
    await prisma.meetingItem.updateMany({ where: { id: meetingItemId, meetingId: data.meetingId }, data: { decisionId: decision.id } });
  }

  await prisma.activityLog.create({
    data: { action: "raised a decision", entity: "decision", entityId: decision.id, detail: decision.title, userId, projectId: data.projectId },
  });
  revalidateDecisions(data.meetingId);
  return { success: true, data: { id: decision.id } };
}

export async function updateDecision(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const existing = await prisma.decision.findUnique({ where: { id }, select: { proposerId: true, status: true, meetingId: true } });
  if (!existing) return { success: false, error: "Decision not found" };
  if (existing.proposerId !== userId) return { success: false, error: "Only the person who raised this decision can edit it" };
  if (existing.status !== "PROPOSED" && existing.status !== "UNDER_REVIEW") {
    return { success: false, error: "This decision has been made. Its options and context are now part of the record." };
  }

  const parsed = decisionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const options = parseOptions(formData.get("options"));
  if (!options.ok) return { success: false, error: options.error };

  const { decideBy, ...data } = parsed.data;
  await prisma.$transaction([
    prisma.decisionOption.deleteMany({ where: { decisionId: id } }),
    prisma.decision.update({
      where: { id },
      data: {
        ...data,
        context: data.context ?? null,
        projectId: data.projectId ?? null,
        decideBy: decideBy ? new Date(decideBy) : null,
        options: { create: options.options.map((o, position) => ({ ...o, cost: o.cost ?? undefined, position })) },
      },
    }),
  ]);

  revalidateDecisions(existing.meetingId);
  return { success: true, data: null };
}

/** Moves a decision through review and records the outcome, who made it and when. */
export async function recordDecision(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = recordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const { status, outcome, rationale, selectedOptionId } = parsed.data;

  const decision = await prisma.decision.findUnique({ where: { id }, select: { title: true, meetingId: true, projectId: true, decidedAt: true, options: { select: { id: true } } } });
  if (!decision) return { success: false, error: "Decision not found" };
  if ((status === "APPROVED" || status === "REJECTED") && !outcome) {
    return { success: false, error: "Write down what was decided" };
  }
  if (selectedOptionId && !decision.options.some((o) => o.id === selectedOptionId)) {
    return { success: false, error: "That option belongs to another decision" };
  }

  const isDecided = status === "APPROVED" || status === "REJECTED" || status === "IMPLEMENTED";
  await prisma.$transaction([
    prisma.decisionOption.updateMany({ where: { decisionId: id }, data: { selected: false } }),
    ...(selectedOptionId ? [prisma.decisionOption.update({ where: { id: selectedOptionId }, data: { selected: true } })] : []),
    prisma.decision.update({
      where: { id },
      data: {
        status,
        outcome: outcome ?? null,
        rationale: rationale ?? null,
        decidedAt: isDecided ? (decision.decidedAt ?? new Date()) : null,
        deciderId: isDecided ? userId : null,
      },
    }),
  ]);

  await prisma.activityLog.create({
    data: {
      action: `marked decision ${status.toLowerCase().replace("_", " ")}`,
      entity: "decision",
      entityId: id,
      detail: decision.title,
      userId,
      projectId: decision.projectId,
    },
  });
  revalidateDecisions(decision.meetingId);
  return { success: true, data: null };
}

export async function deleteDecision(id: string): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Not authenticated" };

  const decision = await prisma.decision.findUnique({ where: { id }, select: { proposerId: true, status: true, meetingId: true } });
  if (!decision) return { success: false, error: "Decision not found" };
  if (decision.proposerId !== userId) return { success: false, error: "Only the person who raised this decision can delete it" };
  if (decision.status !== "PROPOSED") return { success: false, error: "Decisions under review or made stay on the record. Mark it deferred or rejected instead." };

  await prisma.decision.delete({ where: { id } });
  revalidateDecisions(decision.meetingId);
  return { success: true, data: null };
}
