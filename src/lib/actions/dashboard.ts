"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ProjectStatus, TaskStatus } from "@prisma/client";
import type { DashboardStats, ActivityWithRelations } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user?.id) {
    return { totalProjects: 0, activeProjects: 0, completedProjects: 0, totalTasks: 0, openTasks: 0, overdueTasks: 0, teamSize: 0 };
  }

  const uid = session.user.id;

  const [totalProjects, activeProjects, completedProjects, totalTasks, openTasks, overdueTasks, teamSize] =
    await Promise.all([
      prisma.project.count({ where: { OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] } }),
      prisma.project.count({ where: { status: ProjectStatus.ACTIVE, OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] } }),
      prisma.project.count({ where: { status: ProjectStatus.COMPLETED, OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] } }),
      prisma.task.count({ where: { project: { OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] } } }),
      prisma.task.count({ where: { status: { notIn: [TaskStatus.DONE, TaskStatus.BLOCKED] }, project: { OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] } } }),
      prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { notIn: [TaskStatus.DONE] }, project: { OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] } } }),
      prisma.user.count(),
    ]);

  return { totalProjects, activeProjects, completedProjects, totalTasks, openTasks, overdueTasks, teamSize };
}

export async function getRecentActivity(limit = 10): Promise<ActivityWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.activityLog.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { project: { members: { some: { userId: session.user.id } } } },
      ],
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  }) as unknown as ActivityWithRelations[];
}
