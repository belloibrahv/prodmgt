import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import DocumentsClient from "@/components/documents/DocumentsClient";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [documents, projects] = await Promise.all([
    prisma.document.findMany({
      where: {
        project: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
      },
      include: {
        project: { select: { id: true, name: true, color: true, emoji: true } },
        author: { select: { id: true, name: true, email: true, image: true, jobTitle: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <DocumentsClient documents={documents as never} projects={projects} />;
}
