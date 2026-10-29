import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getProjectRole } from "@/lib/access";
import { getProjectById } from "@/lib/actions/projects";
import { getWorkspaceMembers } from "@/lib/actions/team";
import { getProjectStatusUpdates } from "@/lib/actions/status-updates";
import ProjectDetailClient from "@/components/projects/ProjectDetailClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const [{ id }, { tab }, session] = await Promise.all([params, searchParams, auth()]);
  const [project, workspaceMembers, updates, role, objectives] = await Promise.all([
    getProjectById(id),
    getWorkspaceMembers(),
    getProjectStatusUpdates(id),
    session?.user?.id ? getProjectRole(id, session.user.id) : null,
    prisma.objective.findMany({
      where: { archived: false, projects: { some: { id } } },
      select: { id: true, title: true, period: true },
    }),
  ]);
  if (!project) notFound();

  // Everyone can see every project; only members change it.
  const access = {
    canEdit: role !== null && role !== "VIEWER",
    canManage: role === "OWNER" || role === "ADMIN",
    isOwner: role === "OWNER",
  };

  return (
    <ProjectDetailClient
      project={project}
      workspaceMembers={workspaceMembers}
      updates={updates}
      access={access}
      objectives={objectives}
      initialTab={tab}
    />
  );
}
