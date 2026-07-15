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

export async function getProjectStatusDistribution() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
    },
    select: { status: true },
  });

  const distribution = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution).map(([status, count]) => ({
    name: status.toLowerCase(),
    value: count,
  }));
}

export async function getTaskCompletionTrend() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const tasks = await prisma.task.findMany({
    where: {
      project: {
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
      },
      status: TaskStatus.DONE,
    },
    select: { updatedAt: true },
    orderBy: { updatedAt: "asc" },
  });

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const completionByDate = tasks.reduce((acc, task) => {
    const date = task.updatedAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return last30Days.map(date => ({
    date,
    completed: completionByDate[date] || 0,
  }));
}

export async function getTeamWorkloadData() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });

  const workload = await Promise.all(
    users.map(async (user) => {
      const assignedTasks = await prisma.task.count({
        where: {
          assigneeId: user.id,
          status: { notIn: [TaskStatus.DONE, TaskStatus.BLOCKED] },
        },
      });

      return {
        name: user.name || 'Unknown',
        tasks: assignedTasks,
      };
    })
  );

  return workload.filter(w => w.tasks > 0);
}
