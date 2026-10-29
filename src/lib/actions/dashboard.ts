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

  const [totalProjects, activeProjects, completedProjects, totalTasks, openTasks, overdueTasks, teamSize] =
    await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: ProjectStatus.ACTIVE } }),
      prisma.project.count({ where: { status: ProjectStatus.COMPLETED } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: { notIn: [TaskStatus.DONE, TaskStatus.BLOCKED] } } }),
      prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { notIn: [TaskStatus.DONE] } } }),
      prisma.user.count({ where: { passwordHash: { not: null } } }),
    ]);

  return { totalProjects, activeProjects, completedProjects, totalTasks, openTasks, overdueTasks, teamSize };
}

export async function getRecentActivity(limit = 10): Promise<ActivityWithRelations[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.activityLog.findMany({
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
      status: TaskStatus.DONE,
    },
    select: { completedAt: true, updatedAt: true },
  });

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const completionByDate = tasks.reduce((acc, task) => {
    const date = (task.completedAt ?? task.updatedAt).toISOString().split('T')[0];
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

  // Open tasks per assignee across the company.
  const groups = await prisma.task.groupBy({
    by: ["assigneeId"],
    where: {
      assigneeId: { not: null },
      status: { notIn: [TaskStatus.DONE, TaskStatus.BLOCKED] },
    },
    _count: { _all: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((g) => g.assigneeId!) } },
    select: { id: true, name: true, email: true, image: true, jobTitle: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  return groups
    .map((g) => {
      const u = byId.get(g.assigneeId!);
      return {
        id: g.assigneeId!,
        name: u?.name || u?.email || "Unknown",
        image: u?.image ?? null,
        jobTitle: u?.jobTitle ?? null,
        tasks: g._count._all,
      };
    })
    .sort((a, b) => b.tasks - a.tasks);
}
