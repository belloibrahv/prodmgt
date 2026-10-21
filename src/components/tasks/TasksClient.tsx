"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheckIcon, Columns3, ListIcon, PlusIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader } from "@/components/layout/PageHeader";
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
type View = "kanban" | "table";
const VIEW_KEY = "tva-tasks-view";

export default function TasksClient({ tasks, projects }: Props) {
  const { currentUserId } = useWorkspace();
  const [view, setView] = useState<View>("kanban");
  const [projectFilter, setProjectFilter] = useState("all");
  const [scope, setScope] = useState<Scope>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ status: string } | null>(null);

  // Remember the chosen view between visits.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "kanban" || saved === "table") setView(saved);
    } catch { /* storage unavailable */ }
  }, []);

  function changeView(next: View) {
    setView(next);
    try { localStorage.setItem(VIEW_KEY, next); } catch { /* storage unavailable */ }
  }

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

  const projectItems = [{ value: "all", label: "All projects" }, ...projects.map((p) => ({ value: p.id, label: p.name }))];

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Tasks"
          description={`${tasks.length} task${tasks.length !== 1 ? "s" : ""} across ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          actions={
            <Button onClick={() => setModal({ status: "TODO" })} disabled={projects.length === 0}>
              <PlusIcon /> Add task
            </Button>
          }
        />

        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
            <TabsList aria-label="Task scope">
              {([["all", "All"], ["mine", "Assigned to me"], ["overdue", "Overdue"]] as const).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="px-2.5">
                  {label}
                  <span className={cn(
                    "rounded px-1.5 text-xs tabular-nums",
                    key === "overdue" && counts.overdue > 0 ? "bg-destructive/10 text-destructive" : "bg-foreground/5 text-muted-foreground",
                  )}>
                    {counts[key]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="h-8 w-full bg-card sm:w-56">
              <InputGroupAddon><Search /></InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by title…"
                aria-label="Filter tasks by title"
              />
            </InputGroup>
            <Select items={projectItems} value={projectFilter} onValueChange={(v) => v && setProjectFilter(String(v))}>
              <SelectTrigger className="h-8 w-[190px] bg-card" aria-label="Filter by project">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectItems.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {filtering && (
              <Button variant="ghost" onClick={() => { setProjectFilter("all"); setScope("all"); setQuery(""); }}>
                <X /> Clear
              </Button>
            )}
            <ToggleGroup
              value={[view]}
              onValueChange={(v) => v[0] && changeView(v[0] as View)}
              variant="outline"
              spacing={0}
              className="bg-card"
            >
              <ToggleGroupItem value="kanban" aria-label="Board view"><Columns3 /></ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view"><ListIcon /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {tasks.length === 0 ? (
          <Empty className="rounded-xl border border-dashed bg-card py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon"><CircleCheckIcon /></EmptyMedia>
              <EmptyTitle>{projects.length === 0 ? "Create a project first" : "No tasks yet"}</EmptyTitle>
              <EmptyDescription>
                {projects.length === 0 ? "Tasks live inside projects. Use New project at the top to start one." : "Create your first task to start tracking work."}
              </EmptyDescription>
            </EmptyHeader>
            {projects.length > 0 && (
              <EmptyContent>
                <Button onClick={() => setModal({ status: "TODO" })}><PlusIcon /> Add task</Button>
              </EmptyContent>
            )}
          </Empty>
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
