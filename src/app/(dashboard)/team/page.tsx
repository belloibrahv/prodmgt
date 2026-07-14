import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import TeamClient from "@/components/team/TeamClient";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const members = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, image: true, jobTitle: true, createdAt: true,
      memberships: {
        include: { project: { select: { id: true, name: true, color: true } } },
      },
      _count: { select: { assignedTasks: true } },
    },
    orderBy: { name: "asc" },
  });

  return <TeamClient members={members as never} />;
}
