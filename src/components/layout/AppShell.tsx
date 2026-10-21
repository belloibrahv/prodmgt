"use client";

import { createContext, useContext } from "react";
import AppSidebar from "@/components/layout/Sidebar";
import SiteHeader from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
  /** Sidebar expanded state, read from its cookie on the server so it doesn't flash. */
  sidebarOpen: boolean;
  children: React.ReactNode;
}

export default function AppShell({ user, members, sidebarOpen, children }: Props) {
  return (
    <WorkspaceContext.Provider value={{ members, currentUserId: user.id ?? "" }}>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0">
          <SiteHeader />
          <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1440px] animate-fade-in">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceContext.Provider>
  );
}
