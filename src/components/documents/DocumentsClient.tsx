"use client";

import { useState } from "react";
import { MdAdd, MdDescription } from "react-icons/md";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import ProjectDocuments from "./ProjectDocuments";
import NewDocumentModal from "./NewDocumentModal";
import type { DocumentWithRelations } from "@/types";

interface ProjectOption { id: string; name: string; emoji: string }

interface Props {
  documents: DocumentWithRelations[];
  projects?: ProjectOption[];
}

export default function DocumentsClient({ documents, projects = [] }: Props) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Unique projects from documents (fallback if no projects prop)
  const docProjects = Array.from(
    new Map(documents.map((d) => [d.project.id, d.project])).values()
  );
  const allProjects = projects.length > 0 ? projects : docProjects;

  const filtered = documents.filter((d) => {
    const matchProject = projectFilter === "all" || d.project.id === projectFilter;
    const matchType = typeFilter === "all" || d.type === typeFilter;
    return matchProject && matchType;
  });

  const types = ["PRD", "SPEC", "DESIGN", "MEETING_NOTES", "REPORT", "OTHER"];

  function handleNewDoc(projectId?: string) {
    if (allProjects.length === 1) {
      setSelectedProjectId(allProjects[0].id);
    } else if (projectId) {
      setSelectedProjectId(projectId);
    } else {
      setSelectedProjectId(null);
    }
    setShowNewDoc(true);
  }

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tva-ink">Documents</h1>
          <p className="text-sm text-tva-ink-m mt-1">
            {documents.length} document{documents.length !== 1 ? "s" : ""} across all projects
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-white border border-tva-border/60 rounded-full px-4 py-2.5 text-sm text-tva-ink outline-none focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 cursor-pointer appearance-none pr-10 transition-all"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
          >
            <option value="all">All Projects</option>
            {docProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-tva-border/60 rounded-full px-4 py-2.5 text-sm text-tva-ink outline-none focus:border-tva-red focus:ring-2 focus:ring-tva-red/10 cursor-pointer appearance-none pr-10 transition-all"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
            ))}
          </select>

          <Button onClick={() => handleNewDoc()} className="gap-2 bg-tva-red text-white hover:bg-tva-red-dk">
            <MdAdd size={18} /> New Document
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MdDescription size={48} />}
          title="No documents found"
          description="Create PRDs, specs, meeting notes, and more."
          action={{ label: "New Document", onClick: () => handleNewDoc(), className: "bg-tva-red text-white hover:bg-tva-red-dk" }}
        />
      ) : (
        <ProjectDocuments documents={filtered} />
      )}

      {/* New Document Modal - project picker */}
      {showNewDoc && !selectedProjectId && allProjects.length > 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tva-ink/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-24 shadow-xl p-6">
            <h3 className="text-lg font-semibold text-tva-ink mb-4">Select Project</h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {allProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProjectId(p.id); }}
                  className="flex items-center gap-3 p-3 rounded-12 hover:bg-tva-surface transition-colors text-left"
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-sm font-medium text-tva-ink">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowNewDoc(false); setSelectedProjectId(null); }}
              className="mt-4 w-full text-sm text-tva-ink-m hover:text-tva-red transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showNewDoc && selectedProjectId && selectedProject && (
        <NewDocumentModal
          open={true}
          onClose={() => { setShowNewDoc(false); setSelectedProjectId(null); }}
          projectId={selectedProjectId}
          projectName={selectedProject.name}
        />
      )}
    </div>
  );
}
