"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import type { ActionResult, WorkspaceMember } from "@/types";

const workspaceMemberSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  jobTitle: true,
} as const;

/** All registered users in the workspace (company roster). */
export async function getWorkspaceMembers(): Promise<WorkspaceMember[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.user.findMany({
    where: { passwordHash: { not: null } },
    select: workspaceMemberSelect,
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
}

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  jobTitle: z.string().optional(),
});

export async function inviteTeamMember(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = {
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    jobTitle: formData.get("jobTitle") || undefined,
  };

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { success: false, error: "User with this email already exists in the workspace" };
  }

  // For now, we'll create a placeholder user record
  // In production, you'd send an email invitation instead
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      jobTitle: parsed.data.jobTitle,
    },
  });

  revalidatePath("/team");
  return { success: true, data: { id: user.id } };
}
