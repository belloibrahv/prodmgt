"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Edit3, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AvatarGroup, Avatar } from "@/components/ui/Avatar";
import { formatDate, getProgressPercent } from "@/lib/utils";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskTable from "@/components/tasks/TaskTable";
import ProjectDocuments from "@/components/documents/ProjectDocuments";
import ProjectMilestones from "./ProjectMilestones";
import NewTaskModal from "@/components/tasks/NewTaskModal";
import EditProjectModal from "./EditProjectModal";
import NewDocumentModal from "@/components/documents/NewDocumentModal";
import { deleteProject } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

const TABS = ["Overview", "Tasks", "Milestones", "Documents", "Members"] as const;
type Tab = (typeof TABS)[number];

export default function ProjectDetailClient({ project }: { project: ProjectWithRelations }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("Overview");
  const [taskView, setTaskView] = useState<"kanban" | "table">("kanban");
  const [showNewTask, setShowNewTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const pct = getProgressPercent(project.tasks);

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (res.success) {
        toast.success("Project deleted");
        router.push("/projects");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-tva-ink-m">
          <Link href="/projects" className="hover:text-tva-red transition-colors">Projects</Link>
          <ChevronRight size={13} />
          <span className="text-tva-ink font-medium">{project.name}</span>
        </div>

        {/* Project header card */}
        <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ backgroundColor: project.color }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-16 bg-tva-surface flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{project.emoji}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-tva-ink">{project.name}</h1>
                  {project.description && (
                    <p className="text-[13px] text-tva-ink-m mt-1">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={project.status} />
                    <PriorityBadge priority={project.priority} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditProject(true)}>
                  <Edit3 size={13} /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-tva-border/60">
              {[
                { label: "Owner", value: project.owner.name },
                { label: "Start date", value: formatDate(project.startDate) },
                { label: "Due date", value: formatDate(project.dueDate) },
                { label: "Team", value: <AvatarGroup users={project.members.map(m => m.user)} max={4} /> },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold text-tva-ink-m uppercase tracking-wide">{label}</p>
                  <div className="mt-1 text-[13px] font-medium text-tva-ink">{value}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-[12px] font-medium text-tva-ink-m mb-1.5">
                <span>Overall progress</span>
                <span>{pct}% of {project.tasks.length} tasks</span>
              </div>
              <ProgressBar value={pct} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-tva-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
                tab === t
                  ? "text-tva-red border-tva-red font-semibold"
                  : "text-tva-ink-m border-transparent hover:text-tva-red",
              )}
            >
              {t}
            </button>
          ))}

          {/* Tab-specific actions */}
          {tab === "Tasks" && (
            <div className="ml-auto flex items-center gap-2 pb-1">
              <div className="flex bg-tva-surface border border-tva-border rounded-8 p-0.5">
                {(["kanban","table"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setTaskView(v)}
                    className={cn("px-3 py-1 text-[12px] font-medium rounded-6 capitalize transition-colors",
                      taskView === v ? "bg-tva-red-lt text-tva-red" : "text-tva-ink-m hover:text-tva-red"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={() => setShowNewTask(true)}>
                <Plus size={13} /> Add Task
              </Button>
            </div>
          )}
          {tab === "Documents" && (
            <div className="ml-auto pb-1">
              <Button size="sm" onClick={() => setShowNewDoc(true)}><Plus size={13} /> Add Doc</Button>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {tab === "Overview" && <ProjectOverview project={project} pct={pct} />}
          {tab === "Tasks" && (
            taskView === "kanban"
              ? <KanbanBoard tasks={project.tasks as never} projectId={project.id} members={project.members.map(m => m.user)} />
              : <TaskTable tasks={project.tasks as never} project={{ emoji: project.emoji, name: project.name }} />
          )}
          {tab === "Milestones" && <ProjectMilestones milestones={project.milestones} tasks={project.tasks} />}
          {tab === "Documents" && <ProjectDocuments documents={project.documents} />}
          {tab === "Members" && <ProjectMembersTab members={project.members} />}
        </div>
      </div>

      <NewTaskModal
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        projectId={project.id}
        members={project.members.map(m => m.user)}
        milestones={project.milestones}
      />

      <EditProjectModal
        open={showEditProject}
        onClose={() => setShowEditProject(false)}
        project={project}
      />

      <NewDocumentModal
        open={showNewDoc}
        onClose={() => setShowNewDoc(false)}
        projectId={project.id}
        projectName={project.name}
      />
    </>
  );
}

// ── Overview sub-component ────────────────────────────────────
function ProjectOverview({ project, pct }: { project: ProjectWithRelations; pct: number }) {
  const done = project.tasks.filter(t => t.status === "DONE").length;
  const inProgress = project.tasks.filter(t => t.status === "IN_PROGRESS").length;
  const blocked = project.tasks.filter(t => t.status === "BLOCKED").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Task breakdown */}
      <div className="lg:col-span-2 bg-white border border-tva-border rounded-16 p-5 shadow-sm">
        <h2 className="text-[15px] font-semibold text-tva-ink mb-4">Task Breakdown</h2>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Done", value: done, color: "text-tva-success", bg: "bg-tva-success-lt" },
            { label: "In Progress", value: inProgress, color: "text-tva-info", bg: "bg-tva-info-lt" },
            { label: "Blocked", value: blocked, color: "text-tva-error", bg: "bg-tva-error-lt" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-12 p-4 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[12px] text-tva-ink-m mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-[12px] mb-1.5 font-medium text-tva-ink-m">
            <span>Completion</span><span>{pct}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </div>

      {/* Milestones quick view */}
      <div className="bg-white border border-tva-border rounded-16 p-5 shadow-sm">
        <h2 className="text-[15px] font-semibold text-tva-ink mb-4">Milestones</h2>
        {project.milestones.length === 0 ? (
          <p className="text-sm text-tva-ink-m">No milestones yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {project.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  m.completedAt ? "bg-tva-success" : "bg-tva-warn",
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-tva-ink truncate">{m.name}</p>
                  <p className="text-[11px] text-tva-ink-m">{formatDate(m.dueDate)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Members sub-component ─────────────────────────────────────
function ProjectMembersTab({ members }: { members: ProjectWithRelations["members"] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <div key={m.id} className="bg-white border border-tva-border rounded-16 p-4 flex items-center gap-3 shadow-sm">
          <Avatar name={m.user.name} image={m.user.image} size="lg" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-tva-ink truncate">{m.user.name}</p>
            <p className="text-[12px] text-tva-ink-m truncate">{m.user.email}</p>
            <span className="mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 bg-tva-red-lt text-tva-red rounded-full capitalize">
              {m.role.toLowerCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
