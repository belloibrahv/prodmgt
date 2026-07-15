"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import type { ActionResult, ProjectWithRelations } from "@/types";

const projectSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().optional(),
  emoji:       z.string().optional(),
  color:       z.string().optional(),
  status:      z.enum(["PLANNING","ACTIVE","ON_HOLD","COMPLETED","CANCELLED"]).optional(),
  priority:    z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  startDate:   z.string().optional(),
  dueDate:     z.string().optional(),
});

export async function getProjects(): Promise<ProjectWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } } },
      tasks: true,
      milestones: true,
      _count: { select: { tasks: true, documents: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  }) as unknown as ProjectWithRelations[];
}

export async function getProjectById(id: string): Promise<ProjectWithRelations | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.project.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
          creator: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
          subtasks: true,
          comments: { include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } }, orderBy: { createdAt: "asc" } },
          tags: { include: { tag: true } },
        },
        orderBy: { position: "asc" },
      },
      milestones: { orderBy: { dueDate: "asc" } },
      documents: {
        include: {
          author: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
          project: { select: { id: true, name: true, color: true, emoji: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { tasks: true, documents: true, members: true } },
    },
  }) as unknown as ProjectWithRelations | null;
}

export async function createProject(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = {
    name:        formData.get("name"),
    description: formData.get("description") || undefined,
    emoji:       formData.get("emoji") || "📁",
    color:       formData.get("color") || "#bc0004",
    status:      formData.get("status") || "PLANNING",
    priority:    formData.get("priority") || "MEDIUM",
    startDate:   formData.get("startDate") || undefined,
    dueDate:     formData.get("dueDate") || undefined,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      status:    (parsed.data.status ?? "PLANNING") as never,
      priority:  (parsed.data.priority ?? "MEDIUM") as never,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      dueDate:   parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      ownerId:   session.user.id,
      members: {
        create: [{ userId: session.user.id, role: "OWNER" }],
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "created project",
      entity: "project",
      entityId: project.id,
      userId: session.user.id,
      projectId: project.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return { success: true, data: { id: project.id } };
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = projectSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.project.update({
    where: { id },
    data: {
      ...parsed.data,
      status:    parsed.data.status as never,
      priority:  parsed.data.priority as never,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      dueDate:   parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  return { success: true, data: null };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const project = await prisma.project.findFirst({ where: { id, ownerId: session.user.id } });
  if (!project) return { success: false, error: "Project not found or not authorized" };

  await prisma.project.delete({ where: { id } });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true, data: null };
}

export async function addProjectMember(projectId: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!email || !role) return { success: false, error: "Email and role are required" };

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: false, error: "User with this email not found. Please ask them to sign up first." };

  // Check if user is already a member
  const existingMember = await prisma.projectMember.findFirst({
    where: { projectId, userId: user.id },
  });
  if (existingMember) return { success: false, error: "User is already a member of this project" };

  // Check if user has permission (owner or admin)
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) return { success: false, error: "Project not found" };

  const currentUserMember = project.members.find(m => m.userId === session.user.id);
  if (!currentUserMember || (currentUserMember.role !== "OWNER" && currentUserMember.role !== "ADMIN")) {
    return { success: false, error: "You don't have permission to add members" };
  }

  // Add member
  await prisma.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: role as never,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: `added ${user.name || user.email} to project`,
      entity: "project",
      entityId: projectId,
      detail: `as ${role.toLowerCase()}`,
      userId: session.user.id,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { success: true, data: null };
}

export async function removeProjectMember(projectId: string, userId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Check permissions
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) return { success: false, error: "Project not found" };

  const currentUserMember = project.members.find(m => m.userId === session.user.id);
  if (!currentUserMember || (currentUserMember.role !== "OWNER" && currentUserMember.role !== "ADMIN")) {
    return { success: false, error: "You don't have permission to remove members" };
  }

  // Don't allow removing the owner
  if (userId === project.ownerId) return { success: false, error: "Cannot remove project owner" };

  await prisma.projectMember.deleteMany({
    where: { projectId, userId },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { success: true, data: null };
}

export async function updateProjectMemberRole(projectId: string, userId: string, role: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Check permissions
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) return { success: false, error: "Project not found" };

  const currentUserMember = project.members.find(m => m.userId === session.user.id);
  if (!currentUserMember || currentUserMember.role !== "OWNER") {
    return { success: false, error: "Only project owners can change member roles" };
  }

  // Don't allow changing owner's role
  if (userId === project.ownerId) return { success: false, error: "Cannot change owner's role" };

  await prisma.projectMember.updateMany({
    where: { projectId, userId },
    data: { role: role as never },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { success: true, data: null };
}
