"use client";

import { useMemo, useState } from "react";
import { Search, X, CircleCheckIcon, LayoutGridIcon, ListIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWorkspace } from "@/components/layout/AppShell";
import KanbanBoard from "./KanbanBoard";
import TaskTable from "./TaskTable";
import NewTaskModal from "./NewTaskModal";
import { cn } from "@/lib/utils";
import type { TaskWithRelations, ProjectWithRelations } from "@/types";

interface Props {
  tasks: TaskWithRelations[];
  projects: ProjectWithRelations[];
}

type Scope = "all" | "mine" | "overdue";

const selectClass =
  "bg-white border border-tva-border/60 rounded-full pl-4 pr-10 py-2.5 text-sm text-tva-ink outline-none focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 cursor-pointer appearance-none transition-all max-w-[220px]";
const chevron = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

export default function TasksClient({ tasks, projects }: Props) {
  const { currentUserId } = useWorkspace();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [projectFilter, setProjectFilter] = useState("all");
  const [scope, setScope] = useState<Scope>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ status: string } | null>(null);

  const now = Date.now();
  const counts = {
    all: tasks.length,
    mine: tasks.filter((t) => t.assigneeId === currentUserId && t.status !== "DONE").length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "DONE").length,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
      if (scope === "mine" && (t.assigneeId !== currentUserId || t.status === "DONE")) return false;
      if (scope === "overdue" && !(t.dueDate && new Date(t.dueDate).getTime() < Date.now() && t.status !== "DONE")) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, projectFilter, scope, query, currentUserId]);

  const filtering = projectFilter !== "all" || scope !== "all" || query.trim() !== "";
  // Offer the filtered project first so new tasks land where the user is looking.
  const projectOptions = useMemo(() => {
    const opts = projects.map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, milestones: p.milestones }));
    return projectFilter === "all" ? opts : [...opts.filter((p) => p.id === projectFilter), ...opts.filter((p) => p.id !== projectFilter)];
  }, [projects, projectFilter]);

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tva-ink">Tasks</h1>
            <p className="text-sm text-tva-ink-m mt-1">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} across {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setModal({ status: "TODO" })} size="lg" className="gap-2 rounded-full px-5">
            <PlusIcon size={18} /> Add task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-tva-border/60 bg-white p-1" role="tablist" aria-label="Task scope">
            {([["all", "All"], ["mine", "Assigned to me"], ["overdue", "Overdue"]] as const).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={scope === key}
                onClick={() => setScope(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  scope === key ? "bg-tva-red text-white" : "text-tva-ink-m hover:text-tva-red",
                )}
              >
                {label}
                <span className={cn(
                  "rounded-full px-1.5 text-[11px] font-semibold",
                  scope === key ? "bg-white/20" : key === "overdue" && counts.overdue > 0 ? "bg-tva-error-lt text-tva-error" : "bg-tva-surface",
                )}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className={selectClass} style={chevron} aria-label="Filter by project">
            <option value="all">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-full border border-tva-border/60 bg-white px-4 py-2.5 focus-within:border-tva-red sm:max-w-xs">
            <Search size={14} className="text-tva-ink-m" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title"
              className="min-w-0 flex-1 bg-transparent text-sm text-tva-ink outline-none placeholder:text-tva-ink-m"
              aria-label="Filter tasks by title"
            />
          </label>

          {filtering && (
            <button
              onClick={() => { setProjectFilter("all"); setScope("all"); setQuery(""); }}
              className="flex items-center gap-1 text-[13px] font-medium text-tva-ink-m hover:text-tva-red"
            >
              <X size={14} /> Clear
            </button>
          )}

          <div className="ml-auto flex bg-white border border-tva-border/60 rounded-12 p-1 gap-1">
            <button onClick={() => setView("kanban")} className={cn("p-2 rounded-8 transition-all duration-200", view === "kanban" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m hover:text-tva-red hover:bg-tva-red-xlt")} aria-label="Board view" aria-pressed={view === "kanban"}>
              <LayoutGridIcon size={18} />
            </button>
            <button onClick={() => setView("table")} className={cn("p-2 rounded-8 transition-all duration-200", view === "table" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m hover:text-tva-red hover:bg-tva-red-xlt")} aria-label="Table view" aria-pressed={view === "table"}>
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            icon={<CircleCheckIcon size={48} />}
            title={projects.length === 0 ? "Create a project first" : "No tasks yet"}
            description={projects.length === 0 ? "Tasks live inside projects. Use New Project at the top to start one." : "Create your first task to start tracking work."}
            action={projects.length > 0 ? { label: "Add task", onClick: () => setModal({ status: "TODO" }) } : undefined}
          />
        ) : view === "kanban" ? (
          <KanbanBoard tasks={filtered} onAddTask={(status) => setModal({ status })} />
        ) : (
          <TaskTable tasks={filtered} />
        )}
      </div>

      <NewTaskModal
        open={modal !== null}
        onClose={() => setModal(null)}
        projects={projectOptions}
        defaultStatus={modal?.status}
      />
    </>
  );
}
