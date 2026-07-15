import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getDueLabel(dueDate: Date | string | null | undefined): { label: string; variant: string } {
  if (!dueDate) return { label: "No date", variant: "none" };
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: "Overdue", variant: "overdue" };
  if (diffDays === 0) return { label: "Today", variant: "today" };
  if (diffDays === 1) return { label: "Tomorrow", variant: "tomorrow" };
  if (diffDays <= 7) return { label: `${diffDays} days`, variant: "upcoming" };
  return { label: format(due, "MMM d"), variant: "upcoming" };
}

export function getProgressPercent(completed: number, total: number): number;
export function getProgressPercent(tasks: { status: string }[]): number;
export function getProgressPercent(completedOrTasks: number | { status: string }[], total?: number): number {
  if (typeof completedOrTasks === "number") {
    if (total === 0) return 0;
    return Math.round((completedOrTasks / (total ?? 0)) * 100);
  }
  const tasks = completedOrTasks;
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "bg-gray-100 text-gray-600",
  TODO: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  IN_REVIEW: "bg-purple-50 text-purple-700",
  DONE: "bg-green-50 text-green-700",
  BLOCKED: "bg-red-50 text-red-700",
};

export const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  BLOCKED: "Blocked",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-50 text-gray-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  CRITICAL: "bg-red-50 text-red-700",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const KANBAN_COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "#9ca3af" },
  { id: "TODO", label: "To Do", color: "#2563eb" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#f59e0b" },
  { id: "IN_REVIEW", label: "In Review", color: "#a855f7" },
  { id: "DONE", label: "Done", color: "#1da851" },
  { id: "BLOCKED", label: "Blocked", color: "#e53935" },
];
