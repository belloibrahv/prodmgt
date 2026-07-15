"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Bell, Plus, Search, LogOut, User, ChevronDown, FileText, CheckSquare, FolderOpen } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import NewProjectModal from "@/components/projects/NewProjectModal";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

const ICONS: Record<string, React.ElementType> = {
  project: FolderOpen,
  task: CheckSquare,
  document: FileText,
};

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!search.trim()) { setResults([]); setShowResults(false); return; }

    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await globalSearch(search);
      setResults(res);
      setShowResults(true);
      setSearching(false);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(r: SearchResult) {
    setSearch("");
    setShowResults(false);
    router.push(r.href);
  }

  return (
    <>
      <header className="h-16 flex-shrink-0 bg-white border-b border-tva-border/60 flex items-center justify-between px-6 gap-4">
        {/* Search */}
        <div ref={searchRef} className="relative flex items-center gap-2 bg-tva-surface border border-tva-border/60 rounded-full px-4 py-2.5 min-w-[240px] max-w-md flex-1 transition-all focus-within:border-tva-red focus-within:bg-white focus-within:shadow-md">
          <Search size={15} className="text-tva-ink-m flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
            placeholder="Search projects, tasks…"
            className="flex-1 bg-transparent text-[14px] text-tva-ink placeholder:text-tva-ink-m outline-none"
            aria-label="Global search"
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-tva-red/30 border-t-tva-red rounded-full animate-spin flex-shrink-0" />
          )}

          {/* Search results dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-tva-border rounded-16 shadow-xl z-50 max-h-[400px] overflow-y-auto animate-slide-up">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-tva-ink-m">
                  No results found for &ldquo;{search}&rdquo;
                </div>
              ) : (
                <>
                  {results.map((r) => {
                    const Icon = ICONS[r.type] ?? FileText;
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => handleSelect(r)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-tva-red-xlt transition-colors border-b border-tva-border/30 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-8 bg-tva-surface flex items-center justify-center flex-shrink-0">
                          {r.emoji ? (
                            <span className="text-base">{r.emoji}</span>
                          ) : (
                            <Icon size={14} className="text-tva-ink-m" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-tva-ink truncate">{r.title}</p>
                          <p className="text-[11px] text-tva-ink-m truncate">{r.subtitle}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-tva-ink-m uppercase bg-tva-surface px-2 py-0.5 rounded-full flex-shrink-0">
                          {r.type}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-full text-tva-ink-m hover:bg-tva-red-xlt hover:text-tva-red transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          {/* New project */}
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 bg-tva-red text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-tva-red-dk transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            New Project
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-12 hover:bg-tva-red-xlt transition-all duration-200"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <Avatar name={user.name} image={user.image} size="sm" />
              {!showUserMenu && <ChevronDown size={14} className="text-tva-ink-m" />}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-tva-border/60 rounded-16 shadow-xl z-50 animate-slide-up overflow-hidden">
                  <div className="px-4 py-3 border-b border-tva-border/40 bg-tva-surface/50">
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
