"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import type { WorkspaceMember } from "@/types";

interface Workspace {
  members: WorkspaceMember[];
  currentUserId: string;
}

const WorkspaceContext = createContext<Workspace>({ members: [], currentUserId: "" });

/** Registered workspace members and the signed-in user, for pickers anywhere in the app. */
export function useWorkspace() {
  return useContext(WorkspaceContext);
}

interface Props {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
  members: WorkspaceMember[];
  children: React.ReactNode;
}

export default function AppShell({ user, members, children }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer after navigating.
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <WorkspaceContext.Provider value={{ members, currentUserId: user.id ?? "" }}>
      <div className="flex h-screen overflow-hidden bg-tva-surface">
        <Sidebar mobileOpen={navOpen} onMobileClose={() => setNavOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar user={user} onOpenNav={() => setNavOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <div className="mx-auto max-w-[1600px] animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
