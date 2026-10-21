"use client";

import { useState } from "react";
import { FileTextIcon, PlusIcon, SearchIcon, SearchXIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Modal } from "@/components/ui/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import ProjectDocuments from "./ProjectDocuments";
import NewDocumentModal from "./NewDocumentModal";
import type { DocumentWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

const TYPE_LABELS: Record<string, string> = {
  PRD: "PRD", SPEC: "Spec", DESIGN: "Design", MEETING_NOTES: "Meeting notes", REPORT: "Report", OTHER: "Other",
};

interface ProjectOption { id: string; name: string; emoji: string; color: string }

interface Props {
  documents: DocumentWithRelations[];
  projects?: ProjectOption[];
}

export default function DocumentsClient({ documents, projects = [] }: Props) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [query, setQuery] = useState("");
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
    const q = query.trim().toLowerCase();
    const matchQuery = !q || d.title.toLowerCase().includes(q) || (d.content?.toLowerCase().includes(q) ?? false);
    return matchProject && matchType && matchQuery;
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

  const projectItems = [{ value: "all", label: "All projects" }, ...allProjects.map((p) => ({ value: p.id, label: p.name }))];
  const typeItems = [{ value: "all", label: "All types" }, ...types.map((t) => ({ value: t, label: TYPE_LABELS[t] }))];
  const filtering = projectFilter !== "all" || typeFilter !== "all" || query.trim() !== "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Documents"
        description={`${documents.length} document${documents.length !== 1 ? "s" : ""} across all projects`}
        actions={
          <Button onClick={() => handleNewDoc()} disabled={allProjects.length === 0}>
            <PlusIcon /> New document
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="h-8 w-full bg-card sm:w-64">
          <InputGroupAddon><SearchIcon /></InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
          />
        </InputGroup>
        <Select items={projectItems} value={projectFilter} onValueChange={(v) => v && setProjectFilter(String(v))}>
          <SelectTrigger className="h-8 w-[190px] bg-card" aria-label="Filter by project"><SelectValue /></SelectTrigger>
          <SelectContent>
            {projectItems.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select items={typeItems} value={typeFilter} onValueChange={(v) => v && setTypeFilter(String(v))}>
          <SelectTrigger className="h-8 w-[160px] bg-card" aria-label="Filter by type"><SelectValue /></SelectTrigger>
          <SelectContent>
            {typeItems.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {filtering && (
          <Button variant="ghost" onClick={() => { setProjectFilter("all"); setTypeFilter("all"); setQuery(""); }}>
            <XIcon /> Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Empty className="rounded-xl border border-dashed bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">{filtering ? <SearchXIcon /> : <FileTextIcon />}</EmptyMedia>
            <EmptyTitle>{filtering ? "No matching documents" : "No documents yet"}</EmptyTitle>
            <EmptyDescription>
              {filtering ? "Try another project, type or search term."
                : allProjects.length === 0 ? "Documents belong to a project. Create a project first."
                : "Write PRDs, specs, meeting notes and more."}
            </EmptyDescription>
          </EmptyHeader>
          {!filtering && allProjects.length > 0 && (
            <EmptyContent>
              <Button onClick={() => handleNewDoc()}><PlusIcon /> New document</Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <ProjectDocuments documents={filtered} />
      )}

      {/* Pick a project first when there's more than one */}
      <Modal
        open={showNewDoc && !selectedProjectId && allProjects.length > 1}
        onClose={() => setShowNewDoc(false)}
        title="New document"
        description="Which project does this document belong to?"
        size="sm"
      >
        <div className="-mx-2 flex max-h-[320px] flex-col gap-0.5 overflow-y-auto">
          {allProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <ProjectIcon icon={p.emoji} color={p.color} size="sm" />
              <span className="text-sm font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </Modal>

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
