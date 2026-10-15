"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, LogOut, User, ChevronDown, FileText, CheckSquare, FolderOpen, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import NewProjectModal from "@/components/projects/NewProjectModal";
import { globalSearch, type SearchResult } from "@/lib/actions/search";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  project: FolderOpen,
  task: CheckSquare,
  document: FileText,
};

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  onOpenNav: () => void;
}

export default function Topbar({ user, onOpenNav }: TopbarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!search.trim()) { setResults([]); setShowResults(false); setSearching(false); return; }

    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await globalSearch(search);
      setResults(res);
      setHighlight(0);
      setShowResults(true);
      setSearching(false);
    }, 250);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    // Cmd/Ctrl+K or "/" jumps to search from anywhere.
    function handleShortcut(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  function handleSelect(r: SearchResult) {
    setSearch("");
    setShowResults(false);
    inputRef.current?.blur();
    router.push(r.href);
  }

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setShowResults(false); inputRef.current?.blur(); return; }
    if (!showResults || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % results.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + results.length) % results.length); }
    if (e.key === "Enter") { e.preventDefault(); handleSelect(results[highlight]); }
  }

  return (
    <>
      <header className="h-16 flex-shrink-0 bg-white border-b border-tva-border/60 flex items-center justify-between px-3 sm:px-6 gap-3">
        <button
          onClick={onOpenNav}
          className="lg:hidden p-2 rounded-12 text-tva-ink-m hover:bg-tva-red-xlt hover:text-tva-red"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative flex items-center gap-2 bg-tva-surface border border-tva-border/60 rounded-full px-4 py-2.5 min-w-0 max-w-md flex-1 transition-all focus-within:border-tva-red focus-within:bg-white focus-within:shadow-md">
          <Search size={15} className="text-tva-ink-m flex-shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
            onKeyDown={handleSearchKey}
            placeholder="Search projects, tasks, docs…"
            className="flex-1 min-w-0 bg-transparent text-[14px] text-tva-ink placeholder:text-tva-ink-m outline-none"
            aria-label="Global search"
            role="combobox"
            aria-expanded={showResults}
            aria-controls="global-search-results"
          />
          {searching ? (
            <div className="w-4 h-4 border-2 border-tva-red/30 border-t-tva-red rounded-full animate-spin flex-shrink-0" />
          ) : (
            <kbd className="hidden md:inline-flex flex-shrink-0 items-center rounded-4 border border-tva-border/70 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-tva-ink-m">⌘K</kbd>
          )}

          {showResults && (
            <div id="global-search-results" role="listbox" className="absolute top-full left-0 right-0 mt-2 bg-white border border-tva-border rounded-16 shadow-xl z-50 max-h-[400px] overflow-y-auto animate-slide-up">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-tva-ink-m">
                  No results for &ldquo;{search}&rdquo;
                </div>
              ) : (
                results.map((r, i) => {
                  const Icon = ICONS[r.type] ?? FileText;
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      role="option"
                      aria-selected={i === highlight}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => handleSelect(r)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors border-b border-tva-border/30 last:border-0",
                        i === highlight && "bg-tva-red-xlt",
                      )}
                    >
                      <div className="w-8 h-8 rounded-8 bg-tva-surface flex items-center justify-center flex-shrink-0">
                        {r.emoji ? <span className="text-base">{r.emoji}</span> : <Icon size={14} className="text-tva-ink-m" />}
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
                })
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 bg-tva-red text-white text-[13px] font-semibold p-2.5 sm:px-5 rounded-full hover:bg-tva-red-dk transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            aria-label="New project"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Project</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-12 hover:bg-tva-red-xlt transition-all duration-200"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <Avatar name={user.name} image={user.image} size="sm" />
              <ChevronDown size={14} className={cn("hidden sm:block text-tva-ink-m transition-transform", showUserMenu && "rotate-180")} />
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
