import type {
  User, Project, Task, Milestone, Document, Comment,
  ProjectMember, ActivityLog, Tag, ProjectStatus, TaskStatus,
  Priority, MemberRole, DocType,
} from "@prisma/client";

// ── Re-export Prisma enums ────────────────────────────────────
export type { ProjectStatus, TaskStatus, Priority, MemberRole, DocType };

// ── Enriched types used across the UI ────────────────────────

export type UserSafe = Omit<User, "passwordHash">;

export type ProjectWithRelations = Project & {
  owner: UserSafe;
  members: (ProjectMember & { user: UserSafe })[];
  tasks: Task[];
  milestones: Milestone[];
  documents: DocumentWithRelations[];
  _count: { tasks: number; documents: number; members: number };
};

export type TaskWithRelations = Task & {
  project: Pick<Project, "id" | "name" | "color" | "emoji">;
  assignee: UserSafe | null;
  creator: UserSafe;
  milestone: Milestone | null;
  subtasks: Task[];
  comments: (Comment & { user: UserSafe })[];
  tags: { tag: Tag }[];
};

export type DocumentWithRelations = Document & {
  project: Pick<Project, "id" | "name" | "color" | "emoji">;
  author: UserSafe;
};

export type ActivityWithRelations = ActivityLog & {
  user: UserSafe;
  project: Pick<Project, "id" | "name"> | null;
};

// ── Server Action response type ───────────────────────────────
export type ActionResult<T = null> =
  | { success: true;  data: T;     error?: never }
  | { success: false; error: string; data?: never };

// ── Dashboard stats ───────────────────────────────────────────
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  teamSize: number;
}
