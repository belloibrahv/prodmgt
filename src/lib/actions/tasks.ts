"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canEditProject, NO_ACCESS } from "@/lib/access";
import { ensureProjectMember } from "@/lib/actions/projects";
import { z } from "zod";
import type { ActionResult, TaskWithRelations } from "@/types";

const STATUSES = ["BACKLOG","TODO","IN_PROGRESS","IN_REVIEW","DONE","BLOCKED"] as const;

const taskSchema = z.object({
  title:       z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().optional(),
  status:      z.enum(STATUSES).optional(),
  priority:    z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).optional(),
  dueDate:     z.string().optional(),
  assigneeId:  z.string().optional(),
  milestoneId: z.string().optional(),
  estimate:    z.coerce.number().min(0).optional(),
});

const taskInclude = {
  project: { select: { id: true, name: true, color: true, emoji: true } },
  assignee: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
  creator: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
  milestone: true,
  subtasks: true,
  comments: { include: { user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } } }, orderBy: { createdAt: "asc" as const } },
  tags: { include: { tag: true } },
};

async function resolveAssignee(assigneeId: string | undefined, projectId: string): Promise<null | { assigneeId: string } | { error: string }> {
  if (!assigneeId) return null;

  const assignee = await prisma.user.findFirst({
    where: { id: assigneeId, passwordHash: { not: null } },
  });
  if (!assignee) return { error: "Assignee not found in workspace" };

  await ensureProjectMember(projectId, assigneeId);
  return { assigneeId };
}

/** Loads a task's project and checks the current user may change it. */
async function authorizeTask(
  taskId: string,
  userId: string,
): Promise<{ ok: true; task: { projectId: string; title: string } } | { ok: false; error: string }> {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true, title: true } });
  if (!task) return { ok: false, error: "Task not found" };
  if (!(await canEditProject(task.projectId, userId))) return { ok: false, error: NO_ACCESS };
  return { ok: true, task };
}

function revalidateTaskViews(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function getTasksForProject(projectId: string): Promise<TaskWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.task.findMany({
    where: {
      projectId,
      parentId: null,
    },
    include: taskInclude,
    orderBy: { position: "asc" },
  }) as unknown as TaskWithRelations[];
}

export async function getAllTasks(): Promise<TaskWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await prisma.task.findMany({
      where: {
        parentId: null,
      },
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    }) as unknown as TaskWithRelations[];
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
}

export async function createTask(projectId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!projectId) return { success: false, error: "Choose a project for this task" };
  if (!(await canEditProject(projectId, session.user.id))) return { success: false, error: NO_ACCESS };

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

  const assigneeResult = await resolveAssignee(parsed.data.assigneeId, projectId);
  if (assigneeResult && "error" in assigneeResult) {
    return { success: false, error: assigneeResult.error };
  }

  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const status = parsed.data.status ?? "TODO";
  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      status,
      priority:    parsed.data.priority ?? "MEDIUM",
      dueDate:     parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      assigneeId:  parsed.data.assigneeId || null,
      milestoneId: parsed.data.milestoneId || null,
      completedAt: status === "DONE" ? new Date() : null,
      projectId,
      creatorId:   session.user.id,
      position:    (lastTask?.position ?? -1) + 1,
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

  revalidateTaskViews(projectId);
  return { success: true, data: { id: task.id } };
}

export async function updateTaskStatus(taskId: string, status: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsedStatus = z.enum(STATUSES).safeParse(status);
  if (!parsedStatus.success) return { success: false, error: "Unknown status" };

  const access = await authorizeTask(taskId, session.user.id);
  if (!access.ok) return { success: false, error: access.error };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: parsedStatus.data,
      completedAt: parsedStatus.data === "DONE" ? new Date() : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: `moved task to ${parsedStatus.data}`,
      entity: "task",
      entityId: taskId,
      detail: access.task.title,
      userId: session.user.id,
      projectId: access.task.projectId,
    },
  });

  revalidateTaskViews(access.task.projectId);
  return { success: true, data: null };
}

/**
 * Partial update: only fields present in the form are changed. An empty
 * assignee, milestone or due date clears that field.
 */
export async function updateTask(taskId: string, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const access = await authorizeTask(taskId, session.user.id);
  if (!access.ok) return { success: false, error: access.error };
  const { projectId } = access.task;

  const raw = Object.fromEntries(formData.entries());
  const parsed = taskSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const d = parsed.data;

  if (d.assigneeId) {
    const assigneeResult = await resolveAssignee(d.assigneeId, projectId);
    if (assigneeResult && "error" in assigneeResult) {
      return { success: false, error: assigneeResult.error };
    }
  }

  const has = (key: string) => formData.has(key);

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(has("title") && { title: d.title }),
      ...(has("description") && { description: d.description || null }),
      ...(has("status") && d.status && { status: d.status, completedAt: d.status === "DONE" ? new Date() : null }),
      ...(has("priority") && d.priority && { priority: d.priority }),
      ...(has("dueDate") && { dueDate: d.dueDate ? new Date(d.dueDate) : null }),
      ...(has("assigneeId") && { assigneeId: d.assigneeId || null }),
      ...(has("milestoneId") && { milestoneId: d.milestoneId || null }),
      ...(has("estimate") && { estimate: d.estimate ?? null }),
    },
  });

  revalidateTaskViews(projectId);
  return { success: true, data: null };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const access = await authorizeTask(taskId, session.user.id);
  if (!access.ok) return { success: false, error: access.error };

  await prisma.task.delete({ where: { id: taskId } });

  await prisma.activityLog.create({
    data: {
      action: "deleted task",
      entity: "task",
      entityId: taskId,
      detail: access.task.title,
      userId: session.user.id,
      projectId: access.task.projectId,
    },
  });

  revalidateTaskViews(access.task.projectId);
  return { success: true, data: null };
}

export async function addComment(taskId: string, content: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!content.trim()) return { success: false, error: "Comment cannot be empty" };

  const access = await authorizeTask(taskId, session.user.id);
  if (!access.ok) return { success: false, error: access.error };

  await prisma.comment.create({ data: { content: content.trim(), taskId, userId: session.user.id } });

  revalidateTaskViews(access.task.projectId);
  return { success: true, data: null };
}
