"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import KanbanBoard from "./KanbanBoard";
import TaskTable from "./TaskTable";
import NewTaskModal from "./NewTaskModal";
import { cn } from "@/lib/utils";
import type { TaskWithRelations, ProjectWithRelations } from "@/types";

interface Props {
  tasks: TaskWithRelations[];
  projects: ProjectWithRelations[];
}

export default function TasksClient({ tasks, projects }: Props) {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalProjectId, setModalProjectId] = useState(projects[0]?.id ?? "");

  const filtered = projectFilter === "all"
    ? tasks
    : tasks.filter((t) => t.projectId === projectFilter);

  const selectedProject = projects.find((p) => p.id === modalProjectId);

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-tva-ink">Tasks</h1>
            <p className="text-sm text-tva-ink-m mt-0.5">{tasks.length} tasks across all projects</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-tva-surface border border-tva-border rounded-full px-3.5 py-2 text-[13px] text-tva-ink outline-none focus:border-tva-red cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
            >
              <option value="all">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>

            <div className="flex bg-tva-surface border border-tva-border rounded-8 p-0.5">
              <button onClick={() => setView("kanban")} className={cn("px-3 py-1.5 text-[12px] font-medium rounded-6 transition-colors", view === "kanban" ? "bg-tva-red-lt text-tva-red" : "text-tva-ink-m hover:text-tva-red")} aria-label="Kanban view">
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setView("table")} className={cn("px-3 py-1.5 text-[12px] font-medium rounded-6 transition-colors", view === "table" ? "bg-tva-red-lt text-tva-red" : "text-tva-ink-m hover:text-tva-red")} aria-label="Table view">
                <List size={14} />
              </button>
            </div>

            <Button onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add Task
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={48} />}
            title="No tasks yet"
            description="Create your first task to start tracking work."
            action={{ label: "Add Task", onClick: () => setShowModal(true) }}
          />
        ) : view === "kanban" ? (
          <KanbanBoard
            tasks={filtered}
            projectId={projectFilter !== "all" ? projectFilter : projects[0]?.id ?? ""}
            onAddTask={() => setShowModal(true)}
          />
        ) : (
          <TaskTable tasks={filtered} />
        )}
      </div>

      <NewTaskModal
        open={showModal}
        onClose={() => setShowModal(false)}
        projectId={modalProjectId}
        members={selectedProject?.members.map(m => m.user)}
        milestones={selectedProject?.milestones}
      />
    </>
  );
}
