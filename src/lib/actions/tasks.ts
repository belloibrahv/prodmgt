"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import type { ActionResult, TaskWithRelations } from "@/types";

const taskSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().optional(),
  status:      z.enum(["BACKLOG","TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED"]).optional(),
  priority:    z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  dueDate:     z.string().optional(),
  assigneeId:  z.string().optional(),
  milestoneId: z.string().optional(),
  estimate:    z.coerce.number().optional(),
});

export async function getTasksForProject(projectId: string): Promise<TaskWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.task.findMany({
    where: { projectId, parentId: null },
    include: {
      project: { select: { id: true, name: true, color: true, emoji: true } },
      assignee: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      creator: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      milestone: true,
      subtasks: true,
      comments: { include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } }, orderBy: { createdAt: "asc" } },
      tags: { include: { tag: true } },
    },
    orderBy: { position: "asc" },
  }) as unknown as TaskWithRelations[];
}

export async function getAllTasks(): Promise<TaskWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.task.findMany({
    where: {
      parentId: null,
      project: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    },
    include: {
      project: { select: { id: true, name: true, color: true, emoji: true } },
      assignee: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      creator: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      milestone: true,
      subtasks: true,
      comments: { include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } }, orderBy: { createdAt: "asc" } },
      tags: { include: { tag: true } },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  }) as unknown as TaskWithRelations[];
}

export async function createTask(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = {
    title:       formData.get("title"),
    description: formData.get("description") || undefined,
    status:      formData.get("status") || "TODO",
    priority:    formData.get("priority") || "MEDIUM",
    dueDate:     formData.get("dueDate") || undefined,
    assigneeId:  formData.get("assigneeId") || undefined,
    milestoneId: formData.get("milestoneId") || undefined,
    estimate:    formData.get("estimate") || undefined,
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      status:     (parsed.data.status ?? "TODO") as never,
      priority:   (parsed.data.priority ?? "MEDIUM") as never,
      dueDate:    parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      assigneeId: parsed.data.assigneeId || null,
      milestoneId:parsed.data.milestoneId || null,
      projectId,
      creatorId:  session.user.id,
      position:   (lastTask?.position ?? -1) + 1,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "created task",
      entity: "task",
      entityId: task.id,
      detail: task.title,
      userId: session.user.id,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  return { success: true, data: { id: task.id } };
}

export async function updateTaskStatus(taskId: string, status: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as never,
      completedAt: status === "DONE" ? new Date() : null,
    },
    select: { projectId: true, title: true },
  });

  await prisma.activityLog.create({
    data: {
      action: `moved task to ${status}`,
      entity: "task",
      entityId: taskId,
      detail: task.title,
      userId: session.user.id,
      projectId: task.projectId,
    },
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
  return { success: true, data: null };
}

export async function updateTask(taskId: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = taskSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...parsed.data,
      status:     parsed.data.status as never,
      priority:   parsed.data.priority as never,
      dueDate:    parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      assigneeId: parsed.data.assigneeId || null,
      milestoneId:parsed.data.milestoneId || null,
    },
    select: { projectId: true },
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
  return { success: true, data: null };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const task = await prisma.task.delete({ where: { id: taskId }, select: { projectId: true } });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
  return { success: true, data: null };
}

export async function addComment(taskId: string, content: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!content.trim()) return { success: false, error: "Comment cannot be empty" };

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) return { success: false, error: "Task not found" };

  await prisma.comment.create({ data: { content, taskId, userId: session.user.id } });

  revalidatePath(`/projects/${task.projectId}`);
  return { success: true, data: null };
}
