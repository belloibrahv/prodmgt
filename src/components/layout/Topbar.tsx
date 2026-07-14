"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Plus, Search, LogOut, User, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import NewProjectModal from "@/components/projects/NewProjectModal";

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <>
      <header className="h-16 flex-shrink-0 bg-white border-b border-tva-border flex items-center justify-between px-6 gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-tva-surface border border-tva-border rounded-full px-4 py-2 min-w-[220px] max-w-md flex-1 transition-all focus-within:border-tva-red focus-within:bg-white">
          <Search size={14} className="text-tva-ink-m flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tasks…"
            className="flex-1 bg-transparent text-[13px] text-tva-ink placeholder:text-tva-ink-m outline-none"
            aria-label="Global search"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-8 text-tva-ink-m hover:bg-tva-surface hover:text-tva-red transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-tva-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
          </button>

          {/* New project */}
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-1.5 bg-tva-red text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-tva-red-dk transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Plus size={15} />
            New Project
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-12 hover:bg-tva-surface transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <Avatar name={user.name} image={user.image} size="sm" />
              {!showUserMenu && <ChevronDown size={14} className="text-tva-ink-m" />}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-tva-border rounded-16 shadow-lg z-50 animate-slide-up overflow-hidden">
                  <div className="px-4 py-3 border-b border-tva-border">
                    <p className="text-[13px] font-semibold text-tva-ink truncate">{user.name}</p>
                    <p className="text-[11px] text-tva-ink-m truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setShowUserMenu(false); router.push("/settings"); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-tva-ink hover:bg-tva-red-xlt hover:text-tva-red transition-colors"
                    >
                      <User size={15} /> Profile & Settings
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-tva-error hover:bg-tva-error-lt transition-colors"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <NewProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />
    </>
  );
}
