"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import ProjectDocuments from "./ProjectDocuments";
import type { DocumentWithRelations } from "@/types";

export default function DocumentsClient({ documents }: { documents: DocumentWithRelations[] }) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Unique projects from documents
  const projects = Array.from(
    new Map(documents.map((d) => [d.project.id, d.project])).values()
  );

  const filtered = documents.filter((d) => {
    const matchProject = projectFilter === "all" || d.project.id === projectFilter;
    const matchType = typeFilter === "all" || d.type === typeFilter;
    return matchProject && matchType;
  });

  const types = ["PRD", "SPEC", "DESIGN", "MEETING_NOTES", "REPORT", "OTHER"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tva-ink">Documents</h1>
          <p className="text-sm text-tva-ink-m mt-0.5">
            {documents.length} document{documents.length !== 1 ? "s" : ""} across all projects
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-tva-surface border border-tva-border rounded-full px-3.5 py-2 text-[13px] text-tva-ink outline-none focus:border-tva-red cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-tva-surface border border-tva-border rounded-full px-3.5 py-2 text-[13px] text-tva-ink outline-none focus:border-tva-red cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b4f4f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>

          <Button>
            <Plus size={15} /> New Document
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="No documents found"
          description="Create PRDs, specs, meeting notes, and more."
          action={{ label: "New Document", onClick: () => {} }}
        />
      ) : (
        <ProjectDocuments documents={filtered} />
      )}
    </div>
  );
}
