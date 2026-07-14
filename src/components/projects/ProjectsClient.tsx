"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import ProjectCard from "./ProjectCard";
import NewProjectModal from "./NewProjectModal";
import type { ProjectWithRelations } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_OPTS = [
  { value: "all", label: "All Status" },
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
];

export default function ProjectsClient({ projects }: { projects: ProjectWithRelations[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = projects.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  return (
    <>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-tva-ink">Projects</h1>
            <p className="text-sm text-tva-ink-m mt-0.5">
              {projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-tva-surface border border-tva-border rounded-full px-3.5 py-2 text-[13px] text-tva-ink outline-none focus:border-tva-red cursor-pointer appearance-none pr-8"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
            >
              {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex bg-tva-surface border border-tva-border rounded-8 p-0.5 gap-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn("p-2 rounded-6 transition-colors", view === "grid" ? "bg-tva-red-lt text-tva-red" : "text-tva-ink-m hover:text-tva-red")}
                aria-label="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("p-2 rounded-6 transition-colors", view === "list" ? "bg-tva-red-lt text-tva-red" : "text-tva-ink-m hover:text-tva-red")}
                aria-label="List view"
              >
                <List size={15} />
              </button>
            </div>

            <Button onClick={() => setShowModal(true)}>
              <Plus size={15} /> New Project
            </Button>
          </div>
        </div>

        {/* Grid or list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={48} />}
            title="No projects found"
            description={statusFilter !== "all" ? "Try a different filter." : "Create your first project to get started."}
            action={{ label: "Create Project", onClick: () => setShowModal(true) }}
          />
        ) : (
          <div className={cn(
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-3",
          )}>
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} listView={view === "list"} />
            ))}
          </div>
        )}
      </div>

      <NewProjectModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
