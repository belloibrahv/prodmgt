"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import type { ActionResult } from "@/types";

const docSchema = z.object({
  title:   z.string().min(1).max(200),
  content: z.string().optional(),
  type:    z.enum(["SPEC", "PRD", "DESIGN", "MEETING_NOTES", "REPORT", "OTHER"]).optional(),
});

export async function createDocument(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = docSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const doc = await prisma.document.create({
    data: {
      ...parsed.data,
      type: (parsed.data.type ?? "OTHER") as never,
      projectId,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/documents");
  return { success: true, data: { id: doc.id } };
}

export async function updateDocument(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = docSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const doc = await prisma.document.update({
    where: { id },
    data: { ...parsed.data, type: parsed.data.type as never },
    select: { projectId: true },
  });

  revalidatePath(`/projects/${doc.projectId}`);
  revalidatePath("/documents");
  return { success: true, data: null };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const doc = await prisma.document.delete({ where: { id }, select: { projectId: true } });
  revalidatePath(`/projects/${doc.projectId}`);
  revalidatePath("/documents");
  return { success: true, data: null };
}
