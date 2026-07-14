import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import SettingsClient from "@/components/settings/SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, jobTitle: true },
  });

  return <SettingsClient user={user as never} />;
}
