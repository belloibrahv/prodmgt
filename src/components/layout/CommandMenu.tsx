"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FolderPlus, ListChecks, Loader2 } from "lucide-react";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { ALL_NAV } from "@/components/layout/nav";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewProject: () => void;
}

const RESULT_GROUPS: { type: SearchResult["type"]; heading: string }[] = [
  { type: "project",  heading: "Projects" },
  { type: "task",     heading: "Tasks" },
  { type: "document", heading: "Documents" },
];

/** ⌘K palette: jump to a page, run a quick action, or search the workspace. */
export default function CommandMenu({ open, onOpenChange, onNewProject }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const res = await globalSearch(q);
      // Ignore responses that arrive after a newer query.
      if (id !== requestId.current) return;
      setResults(res);
      setSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  const q = query.trim().toLowerCase();
  const pages = ALL_NAV.filter((n) => !q || n.label.toLowerCase().includes(q));
  const hasAnything = pages.length > 0 || results.length > 0 || !q;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search TechVaults"
      description="Search projects, tasks and documents, or jump to a page."
    >
      {/* Results come from the server, so cmdk's own filtering is off. */}
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search projects, tasks, docs…"
        />
        <CommandList>
          {searching && results.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </div>
          )}
          {!searching && !hasAnything && <CommandEmpty>No results for “{query}”.</CommandEmpty>}

          {RESULT_GROUPS.map(({ type, heading }) => {
            const group = results.filter((r) => r.type === type);
            if (group.length === 0) return null;
            return (
              <CommandGroup key={type} heading={heading}>
                {group.map((r) => (
                  <CommandItem key={`${r.type}-${r.id}`} value={`${r.type}-${r.id}`} onSelect={() => run(() => router.push(r.href))}>
                    {r.type === "project" ? (
                      <ProjectIcon icon={r.icon} color={r.color} size="xs" />
                    ) : r.type === "task" ? (
                      <ListChecks className="text-muted-foreground" />
                    ) : (
                      <FileText className="text-muted-foreground" />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{r.title}</span>
                      {r.subtitle && <span className="truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

          {results.length > 0 && <CommandSeparator />}

          {!q && (
            <CommandGroup heading="Quick actions">
              <CommandItem value="new-project" onSelect={() => run(onNewProject)}>
                <FolderPlus className="text-muted-foreground" /> New project
              </CommandItem>
            </CommandGroup>
          )}

          {pages.length > 0 && (
            <CommandGroup heading="Go to">
              {pages.map(({ href, label, icon: Icon }) => (
                <CommandItem key={href} value={`page-${href}`} onSelect={() => run(() => router.push(href))}>
                  <Icon className="text-muted-foreground" /> {label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
