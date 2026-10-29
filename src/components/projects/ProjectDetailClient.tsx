"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, CalendarDays, CircleCheck, CircleDot, Columns3, Eye, FileText, Flag, Goal, ListIcon,
  MoreHorizontal, OctagonAlert, Pencil, Plus, Trash2, UserMinus, UserRound,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { AvatarGroup, Avatar } from "@/components/ui/Avatar";
import { formatDate, getDueLabel, getProgressPercent, cn } from "@/lib/utils";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskTable from "@/components/tasks/TaskTable";
import ProjectDocuments from "@/components/documents/ProjectDocuments";
import ProjectMilestones from "./ProjectMilestones";
import NewTaskModal from "@/components/tasks/NewTaskModal";
import EditProjectModal from "./EditProjectModal";
import NewDocumentModal from "@/components/documents/NewDocumentModal";
import InviteMemberModal from "./InviteMemberModal";
import { deleteProject, removeProjectMember, updateProjectMemberRole } from "@/lib/actions/projects";
import type { ProjectWithRelations, WorkspaceMember } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import ProjectCheckIns from "./ProjectCheckIns";
import { HealthBadge } from "@/components/business/primitives";
import type { StatusUpdateWithRelations } from "@/lib/business-queries";

type Tab = "overview" | "updates" | "tasks" | "milestones" | "documents" | "members";
const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "updates", label: "Check-ins" },
  { value: "tasks", label: "Tasks" },
  { value: "milestones", label: "Milestones" },
  { value: "documents", label: "Documents" },
  { value: "members", label: "Members" },
];

export interface ProjectAccess {
  /** Member who can change tasks, milestones and documents. */
  canEdit: boolean;
  /** Owner or admin, who can change project details and members. */
  canManage: boolean;
  isOwner: boolean;
}

interface LinkedObjective { id: string; title: string; period: string }

export default function ProjectDetailClient({
  project,
  workspaceMembers,
  updates,
  access,
  objectives,
  initialTab = "overview",
}: {
  project: ProjectWithRelations;
  workspaceMembers: WorkspaceMember[];
  updates: StatusUpdateWithRelations[];
  access: ProjectAccess;
  objectives: LinkedObjective[];
  /** From the ?tab= query; ignored if it isn't a known tab. */
  initialTab?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>(TABS.find((t) => t.value === initialTab)?.value ?? "overview");
  const { canEdit, canManage, isOwner } = access;
  const latest = updates[0];
  const [taskView, setTaskView] = useState<"kanban" | "table">("kanban");
  const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pct = getProgressPercent(project.tasks);
  const done = project.tasks.filter((t) => t.status === "DONE").length;
  const overdue = project.status !== "COMPLETED" && getDueLabel(project.dueDate).variant === "overdue";

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteProject(project.id);
      if (res.success) {
        toast.success("Project deleted");
        router.push("/projects");
      } else {
        toast.error(res.error);
        setConfirmDelete(false);
      }
    });
  }

  const counts: Record<Tab, number | null> = {
    overview: null,
    updates: updates.length,
    tasks: project.tasks.length,
    milestones: project.milestones.length,
    documents: project.documents.length,
    members: project.members.length,
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <ProjectIcon icon={project.emoji} color={project.color} size="lg" className="size-14 rounded-2xl [&_svg]:size-7" />
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                  {latest && <HealthBadge health={latest.health} />}
                </div>
                {(project.client || objectives.length > 0) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {project.client && <span className="inline-flex items-center gap-1.5"><Building2 className="size-3.5" />{project.client}</span>}
                    {objectives.map((o) => (
                      <Link key={o.id} href={`/goals#objective-${o.id}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                        <Goal className="size-3.5" />{o.title} <span className="opacity-70">· {o.period}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {project.description && (
                  <p className="max-w-3xl text-sm text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!canEdit && (
                <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <Eye className="size-3.5" /> View only · ask {project.owner.name?.split(" ")[0] ?? "the owner"} to add you
                </span>
              )}
              {canManage && (
              <Button variant="outline" onClick={() => setShowEditProject(true)}>
                <Pencil /> Edit
              </Button>
              )}
              {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More project actions" />}>
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setTab("updates")}><Flag /> Post check-in</DropdownMenuItem>
                  {canManage && <DropdownMenuItem onClick={() => setShowInviteMember(true)}><UserRound /> Add member</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => setShowNewDoc(true)}><FileText /> New document</DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                        <Trash2 /> Delete project
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              )}
            </div>
          </div>

          {/* Key facts */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
            {[
              { label: "Owner", value: (
                <span className="flex items-center gap-2"><Avatar name={project.owner.name} image={project.owner.image} size="xs" />{project.owner.name}</span>
              ) },
              { label: "Timeline", value: `${formatDate(project.startDate)} → ${formatDate(project.dueDate)}`, danger: overdue },
              { label: "Team", value: <AvatarGroup users={project.members.map((m) => m.user)} max={5} /> },
              { label: "Progress", value: (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: project.color }} />
                  </span>
                  <span className="tabular-nums">{pct}%</span>
                </span>
              ) },
            ].map(({ label, value, danger }) => (
              <div key={label} className="bg-card px-4 py-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className={cn("mt-1 truncate text-sm font-medium", danger && "text-destructive")}>{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b">
            <TabsList variant="line" className="-mb-px h-10 overflow-x-auto">
              {TABS.map(({ value: t, label }) => (
                <TabsTrigger key={t} value={t} className="px-3">
                  {label}
                  {counts[t] !== null && <span className="text-xs tabular-nums text-muted-foreground">{counts[t]}</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2 pb-2">
              {tab === "tasks" && (
                <>
                  <ToggleGroup value={[taskView]} onValueChange={(v) => v[0] && setTaskView(v[0] as "kanban" | "table")} variant="outline" spacing={0} size="sm">
                    <ToggleGroupItem value="kanban" aria-label="Board view"><Columns3 /></ToggleGroupItem>
                    <ToggleGroupItem value="table" aria-label="Table view"><ListIcon /></ToggleGroupItem>
                  </ToggleGroup>
                  {canEdit && <Button size="sm" onClick={() => setNewTaskStatus("TODO")}><Plus /> Add task</Button>}
                </>
              )}
              {tab === "documents" && canEdit && <Button size="sm" onClick={() => setShowNewDoc(true)}><Plus /> New document</Button>}
              {tab === "members" && canManage && <Button size="sm" onClick={() => setShowInviteMember(true)}><Plus /> Add member</Button>}
            </div>
          </div>

          <TabsContent value="updates"><ProjectCheckIns projectId={project.id} updates={updates} canEdit={canEdit} /></TabsContent>
          <TabsContent value="overview"><ProjectOverview project={project} pct={pct} done={done} onOpenTab={setTab} /></TabsContent>
          <TabsContent value="tasks">
            {taskView === "kanban"
              ? <KanbanBoard tasks={project.tasks as never} onAddTask={(status) => setNewTaskStatus(status)} />
              : <TaskTable tasks={project.tasks as never} project={{ emoji: project.emoji, color: project.color, name: project.name }} />}
          </TabsContent>
          <TabsContent value="milestones"><ProjectMilestones milestones={project.milestones} tasks={project.tasks} /></TabsContent>
          <TabsContent value="documents"><ProjectDocuments documents={project.documents} /></TabsContent>
          <TabsContent value="members"><ProjectMembersTab members={project.members} projectId={project.id} ownerId={project.ownerId} canManage={canManage} /></TabsContent>
        </Tabs>
      </div>

      <NewTaskModal
        open={newTaskStatus !== null}
        onClose={() => setNewTaskStatus(null)}
        projectId={project.id}
        members={workspaceMembers}
        milestones={project.milestones}
        defaultStatus={newTaskStatus ?? "TODO"}
      />
      <EditProjectModal open={showEditProject} onClose={() => setShowEditProject(false)} project={project} />
      <NewDocumentModal open={showNewDoc} onClose={() => setShowNewDoc(false)} projectId={project.id} projectName={project.name} />
      <InviteMemberModal
        open={showInviteMember}
        onClose={() => setShowInviteMember(false)}
        projectId={project.id}
        workspaceMembers={workspaceMembers}
        currentMemberIds={project.members.map((m) => m.userId)}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${project.name}?`}
        description={`Its ${project.tasks.length} tasks, ${project.milestones.length} milestones and ${project.documents.length} documents will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete project"
        onConfirm={handleDelete}
        pending={pending}
      />
    </>
  );
}

// ── Overview ──────────────────────────────────────────────────
function ProjectOverview({
  project, pct, done, onOpenTab,
}: { project: ProjectWithRelations; pct: number; done: number; onOpenTab: (t: Tab) => void }) {
  const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length;
  const blocked = project.tasks.filter((t) => t.status === "BLOCKED").length;
  const overdue = project.tasks.filter((t) => t.status !== "DONE" && getDueLabel(t.dueDate).variant === "overdue").length;

  const tiles = [
    { label: "Completed", value: done, icon: CircleCheck, tone: "text-success" },
    { label: "In progress", value: inProgress, icon: CircleDot, tone: "text-info" },
    { label: "Blocked", value: blocked, icon: OctagonAlert, tone: blocked ? "text-destructive" : "text-muted-foreground" },
    { label: "Overdue", value: overdue, icon: CalendarDays, tone: overdue ? "text-destructive" : "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="shadow-xs lg:col-span-2">
        <CardHeader>
          <CardTitle>Task breakdown</CardTitle>
          <CardDescription>{done} of {project.tasks.length} tasks done · {pct}% complete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-lg border bg-muted/30 p-3">
                <Icon className={cn("size-4", tone)} aria-hidden />
                <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Project progress">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: project.color }} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>{project.milestones.filter((m) => m.completedAt).length} of {project.milestones.length} reached</CardDescription>
        </CardHeader>
        <CardContent>
          {project.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {project.milestones.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  {m.completedAt
                    ? <CircleCheck className="size-4 shrink-0 text-success" aria-label="Reached" />
                    : <Flag className="size-4 shrink-0 text-muted-foreground" aria-label="Upcoming" />}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
          {project.milestones.length > 5 && (
            <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => onOpenTab("milestones")}>
              View all {project.milestones.length}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Members ───────────────────────────────────────────────────
const ROLES = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

function ProjectMembersTab({ members, projectId, ownerId, canManage }: { members: ProjectWithRelations["members"]; projectId: string; ownerId: string; canManage: boolean }) {
  const [pending, startTransition] = useTransition();
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);

  function handleRemoveMember() {
    if (!removing) return;
    startTransition(async () => {
      const res = await removeProjectMember(projectId, removing.id);
      if (res.success) toast.success("Member removed");
      else toast.error(res.error);
      setRemoving(null);
    });
  }

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      const res = await updateProjectMemberRole(projectId, userId, newRole);
      if (res.success) toast.success("Role updated");
      else toast.error(res.error);
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Member</TableHead>
              <TableHead className="hidden sm:table-cell">Job title</TableHead>
              <TableHead className="w-[150px]">Role</TableHead>
              <TableHead className="w-12 pr-4"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => {
              const isOwner = m.user.id === ownerId;
              return (
                <TableRow key={m.id}>
                  <TableCell className="pl-4">
                    <span className="flex items-center gap-3">
                      <Avatar name={m.user.name} image={m.user.image} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{m.user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{m.user.email}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{m.user.jobTitle ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      items={ROLES}
                      value={m.role}
                      onValueChange={(v) => v && handleRoleChange(m.user.id, String(v))}
                      disabled={pending || isOwner || !canManage}
                    >
                      <SelectTrigger size="sm" className="w-[120px]" aria-label={`Role for ${m.user.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="pr-4">
                    {!isOwner && canManage && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoving({ id: m.user.id, name: m.user.name || "this member" })}
                        disabled={pending}
                        aria-label={`Remove ${m.user.name}`}
                      >
                        <UserMinus />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => { if (!o) setRemoving(null); }}
        title={`Remove ${removing?.name ?? "member"}?`}
        description="They'll lose access to this project's tasks and documents. Tasks assigned to them stay assigned."
        confirmLabel="Remove member"
        onConfirm={handleRemoveMember}
        pending={pending}
      />
    </>
  );
}
