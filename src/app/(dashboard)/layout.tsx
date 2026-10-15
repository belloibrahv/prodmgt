import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceMembers } from "@/lib/actions/team";
import AppShell from "@/components/layout/AppShell";

// Dashboard content is per-user and reads live project data from PostgreSQL.
// Keep it out of the image build/static-generation phase.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const members = await getWorkspaceMembers();

  return (
    <AppShell user={session.user} members={members}>
      {children}
    </AppShell>
  );
}
