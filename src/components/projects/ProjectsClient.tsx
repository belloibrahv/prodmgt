"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FolderOpenIcon, LayoutGridIcon, ListIcon, PlusIcon, SearchIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AvatarGroup } from "@/components/ui/Avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectIcon } from "./ProjectIcon";
import ProjectCard from "./ProjectCard";
import NewProjectModal from "./NewProjectModal";
import { formatDate, getProgressPercent } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

const STATUS_TABS = [
  { value: "all",       label: "All" },
  { value: "ACTIVE",    label: "Active" },
  { value: "PLANNING",  label: "Planning" },
  { value: "ON_HOLD",   label: "On hold" },
  { value: "COMPLETED", label: "Completed" },
];

const SORTS = [
  { value: "updated",  label: "Recently updated" },
  { value: "due",      label: "Due date" },
  { value: "progress", label: "Progress" },
  { value: "name",     label: "Name" },
];

type View = "grid" | "list";
const VIEW_KEY = "tva-projects-view";

export default function ProjectsClient({ projects }: { projects: ProjectWithRelations[] }) {
  const [view, setView] = useState<View>("grid");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("updated");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Remember the chosen view between visits.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "grid" || saved === "list") setView(saved);
    } catch { /* storage unavailable */ }
  }, []);

  function changeView(next: View) {
    setView(next);
    try { localStorage.setItem(VIEW_KEY, next); } catch { /* storage unavailable */ }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) =>
      (status === "all" || p.status === status) &&
      (!q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)),
    );
    const progress = (p: ProjectWithRelations) => getProgressPercent(p.tasks);
    return list.sort((a, b) => {
      switch (sort) {
        case "name":     return a.name.localeCompare(b.name);
        case "progress": return progress(b) - progress(a);
        case "due": {
          // Projects without a due date go last.
          const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return ad - bd;
        }
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [projects, status, sort, query]);

  const filtering = status !== "all" || query.trim() !== "";

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Projects"
          description={`${projects.length} project${projects.length === 1 ? "" : "s"} in your workspace`}
          actions={
            <Button onClick={() => setShowModal(true)}>
              <PlusIcon /> New project
            </Button>
          }
        />

        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={status} onValueChange={(v) => setStatus(String(v))} className="min-w-0">
            <TabsList className="max-w-full overflow-x-auto">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="px-2.5">
                  {t.label}
                  <span className="rounded bg-foreground/5 px-1.5 text-xs tabular-nums text-muted-foreground">
                    {counts[t.value] ?? 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <InputGroup className="h-8 w-full bg-card sm:w-60">
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter projects…"
                aria-label="Filter projects"
              />
            </InputGroup>
            <Select items={SORTS} value={sort} onValueChange={(v) => v && setSort(String(v))}>
              <SelectTrigger className="h-8 w-[170px] bg-card" aria-label="Sort projects">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <ToggleGroup
              value={[view]}
              onValueChange={(v) => v[0] && changeView(v[0] as View)}
              variant="outline"
              spacing={0}
              className="bg-card"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGridIcon /></ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view"><ListIcon /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {visible.length === 0 ? (
          <Empty className="rounded-xl border border-dashed bg-card py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">{filtering ? <SearchXIcon /> : <FolderOpenIcon />}</EmptyMedia>
              <EmptyTitle>{filtering ? "No matching projects" : "No projects yet"}</EmptyTitle>
              <EmptyDescription>
                {filtering ? "Try another status or search term." : "Create your first project to start planning work."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {filtering ? (
                <Button variant="outline" onClick={() => { setStatus("all"); setQuery(""); }}>Clear filters</Button>
              ) : (
                <Button onClick={() => setShowModal(true)}><PlusIcon /> New project</Button>
              )}
            </EmptyContent>
          </Empty>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <ProjectsTable projects={visible} />
        )}
      </div>

      <NewProjectModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

function ProjectsTable({ projects }: { projects: ProjectWithRelations[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Priority</TableHead>
            <TableHead className="w-[180px]">Progress</TableHead>
            <TableHead className="hidden lg:table-cell">Team</TableHead>
            <TableHead className="hidden sm:table-cell pr-4">Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => {
            const pct = getProgressPercent(p.tasks);
            return (
              <TableRow key={p.id} className="group">
                <TableCell className="pl-4">
                  <Link href={`/projects/${p.id}`} className="flex items-center gap-3 focus-visible:outline-none">
                    <ProjectIcon icon={p.emoji} color={p.color} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium group-hover:text-primary">{p.name}</span>
                      <span className="block max-w-[320px] truncate text-xs text-muted-foreground">
                        {p._count.tasks} tasks · {p._count.documents} docs
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="hidden md:table-cell"><PriorityBadge priority={p.priority} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <AvatarGroup users={p.members.map((m) => m.user)} max={3} />
                </TableCell>
                <TableCell className="hidden sm:table-cell pr-4 text-muted-foreground">
                  {p.dueDate ? formatDate(p.dueDate) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
