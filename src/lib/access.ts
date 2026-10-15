import { prisma } from "@/lib/db/prisma";
import type { MemberRole } from "@prisma/client";

/**
 * Project-level authorisation shared by server actions.
 * Owners and members can read; everyone except viewers can write.
 */
export async function getProjectRole(projectId: string, userId: string): Promise<MemberRole | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, members: { where: { userId }, select: { role: true } } },
  });
  if (!project) return null;
  if (project.ownerId === userId) return "OWNER";
  return project.members[0]?.role ?? null;
}

export async function canEditProject(projectId: string, userId: string): Promise<boolean> {
  const role = await getProjectRole(projectId, userId);
  return role !== null && role !== "VIEWER";
}

export async function canManageProject(projectId: string, userId: string): Promise<boolean> {
  const role = await getProjectRole(projectId, userId);
  return role === "OWNER" || role === "ADMIN";
}

export const NO_ACCESS = "You don't have permission to change this project";
