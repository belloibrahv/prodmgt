"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export interface SearchResult {
  type: "project" | "task" | "document";
  id: string;
  title: string;
  subtitle: string;
  emoji?: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const session = await auth();
  if (!session?.user?.id) return [];

  const term = query.trim();
  const limit = 5;

  const [projects, tasks, documents] = await Promise.all([
    prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { userId: session.user.id } } },
            ],
          },
          {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, name: true, emoji: true, description: true },
      take: limit,
    }),
    prisma.task.findMany({
      where: {
        AND: [
          {
            project: {
              OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id } } },
              ],
            },
          },
          {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        project: { select: { id: true, name: true, emoji: true } },
      },
      take: limit,
    }),
    prisma.document.findMany({
      where: {
        AND: [
          {
            project: {
              OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id } } },
              ],
            },
          },
          {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { content: { contains: term, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        type: true,
        project: { select: { id: true, name: true, emoji: true } },
      },
      take: limit,
    }),
  ]);

  const results: SearchResult[] = [
    ...projects.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.name,
      subtitle: p.description?.slice(0, 80) ?? "Project",
      emoji: p.emoji,
      href: `/projects/${p.id}`,
    })),
    ...tasks.map((t) => ({
      type: "task" as const,
      id: t.id,
      title: t.title,
      subtitle: `${t.project.emoji} ${t.project.name}`,
      href: `/projects/${t.project.id}`,
    })),
    ...documents.map((d) => ({
      type: "document" as const,
      id: d.id,
      title: d.title,
      subtitle: `${d.project.emoji} ${d.project.name} · ${d.type.replace("_", " ")}`,
      href: `/projects/${d.project.id}`,
    })),
  ];

  return results;
}
