"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canEditProject, NO_ACCESS } from "@/lib/access";
import { z } from "zod";
import type { ActionResult } from "@/types";

const docSchema = z.object({
  title:   z.string().trim().min(1, "Document title is required").max(200),
  content: z.string().optional(),
  type:    z.enum(["SPEC", "PRD", "DESIGN", "MEETING_NOTES", "REPORT", "OTHER"]).optional(),
});

export async function createDocument(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!(await canEditProject(projectId, session.user.id))) return { success: false, error: NO_ACCESS };

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

  const existing = await prisma.document.findUnique({ where: { id }, select: { projectId: true } });
  if (!existing) return { success: false, error: "Document not found" };
  if (!(await canEditProject(existing.projectId, session.user.id))) return { success: false, error: NO_ACCESS };

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

  const existing = await prisma.document.findUnique({ where: { id }, select: { projectId: true } });
  if (!existing) return { success: false, error: "Document not found" };
  if (!(await canEditProject(existing.projectId, session.user.id))) return { success: false, error: NO_ACCESS };

  const doc = await prisma.document.delete({ where: { id }, select: { projectId: true } });
  revalidatePath(`/projects/${doc.projectId}`);
  revalidatePath("/documents");
  return { success: true, data: null };
}
