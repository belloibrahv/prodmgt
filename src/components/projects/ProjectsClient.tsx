"use client";

import { useState } from "react";
import { MdGridOn, MdViewList, MdAdd, MdFolderOpen } from "react-icons/md";
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
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tva-ink">Projects</h1>
            <p className="text-sm text-tva-ink-m mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-tva-border/60 rounded-full px-4 py-2.5 text-sm text-tva-ink outline-none focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 cursor-pointer appearance-none pr-10 transition-all"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
            >
              {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex bg-white border border-tva-border/60 rounded-12 p-1 gap-1">
              <button
                onClick={() => setView("grid")}
                className={cn("p-2 rounded-8 transition-all duration-200", view === "grid" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m hover:text-tva-red hover:bg-tva-red-xlt")}
                aria-label="Grid view"
              >
                <MdGridOn size={18} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("p-2 rounded-8 transition-all duration-200", view === "list" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m hover:text-tva-red hover:bg-tva-red-xlt")}
                aria-label="List view"
              >
                <MdViewList size={18} />
              </button>
            </div>

            <Button onClick={() => setShowModal(true)} className="gap-2">
              <MdAdd size={18} /> New Project
            </Button>
          </div>
        </div>

        {/* Grid or list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<MdFolderOpen size={48} />}
            title="No projects found"
            description={statusFilter !== "all" ? "Try a different filter." : "Create your first project to get started."}
            action={{ label: "Create Project", onClick: () => setShowModal(true) }}
          />
        ) : (
          <div className={cn(
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              : "flex flex-col gap-3",
          )}>
            {filtered.map((p, index) => (
              <div key={p.id} style={{ animationDelay: `${index * 50}ms` }}>
                <ProjectCard project={p} listView={view === "list"} />
              </div>
            ))}
          </div>
        )}
      </div>

      <NewProjectModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
