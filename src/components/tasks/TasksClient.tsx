"use client";

import { useState } from "react";
import { MdAdd, MdGridOn, MdViewList, MdCheckCircle } from "react-icons/md";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import KanbanBoard from "./KanbanBoard";
import TaskTable from "./TaskTable";
import NewTaskModal from "./NewTaskModal";
import { cn, KANBAN_COLUMNS } from "@/lib/utils";
import type { TaskWithRelations, ProjectWithRelations, WorkspaceMember } from "@/types";

interface Props {
  tasks: TaskWithRelations[];
  projects: ProjectWithRelations[];
  workspaceMembers: WorkspaceMember[];
}

export default function TasksClient({ tasks, projects, workspaceMembers }: Props) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tva-ink">Tasks</h1>
            <p className="text-sm text-tva-ink-m mt-1">{tasks.length} tasks across all projects</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-white border border-tva-border/60 rounded-full px-4 py-2.5 text-sm text-tva-ink outline-none focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 cursor-pointer appearance-none pr-10 transition-all"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
            >
              <option value="all">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>

            <div className="flex bg-white border border-tva-border/60 rounded-12 p-1 gap-1">
              <button onClick={() => setView("kanban")} className={cn("p-2 rounded-8 transition-all duration-200", view === "kanban" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m hover:text-tva-red hover:bg-tva-red-xlt")} aria-label="Kanban view">
                <MdGridOn size={18} />
              </button>
              <button onClick={() => setView("table")} className={cn("p-2 rounded-8 transition-all duration-200", view === "table" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m hover:text-tva-red hover:bg-tva-red-xlt")} aria-label="Table view">
                <MdViewList size={18} />
              </button>
            </div>

            <Button onClick={() => setShowModal(true)} className="gap-2 bg-tva-red text-white hover:bg-tva-red-dk">
              <MdAdd size={18} /> Add Task
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<MdCheckCircle size={48} />}
            title="No tasks yet"
            description="Create your first task to start tracking work."
            action={{ label: "Add Task", onClick: () => setShowModal(true), className: "bg-tva-red text-white hover:bg-tva-red-dk" }}
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
        members={workspaceMembers}
        milestones={selectedProject?.milestones}
      />
    </>
  );
}
