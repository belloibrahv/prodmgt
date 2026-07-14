import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDueLabel(date: Date | string | null | undefined): {
  label: string;
  variant: "overdue" | "today" | "tomorrow" | "upcoming" | "none";
} {
  if (!date) return { label: "No due date", variant: "none" };
  const d = new Date(date);
  if (isPast(d) && !isToday(d)) return { label: `Overdue · ${formatDate(d)}`, variant: "overdue" };
  if (isToday(d)) return { label: "Due today", variant: "today" };
  if (isTomorrow(d)) return { label: "Due tomorrow", variant: "tomorrow" };
  return { label: formatDate(d), variant: "upcoming" };
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getProgressPercent(tasks: { status: string }[]): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export const STATUS_LABELS: Record<string, string> = {
  PLANNING:    "Planning",
  ACTIVE:      "Active",
  ON_HOLD:     "On Hold",
  COMPLETED:   "Completed",
  CANCELLED:   "Cancelled",
  BACKLOG:     "Backlog",
  TODO:        "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW:   "In Review",
  DONE:        "Done",
  BLOCKED:     "Blocked",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW:      "Low",
  MEDIUM:   "Medium",
  HIGH:     "High",
  CRITICAL: "Critical",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW:      "bg-tva-success-lt text-tva-success",
  MEDIUM:   "bg-tva-info-lt text-tva-info",
  HIGH:     "bg-tva-warn-lt text-tva-warn",
  CRITICAL: "bg-tva-error-lt text-tva-error",
};

export const STATUS_COLORS: Record<string, string> = {
  PLANNING:    "bg-tva-info-lt text-tva-info",
  ACTIVE:      "bg-tva-success-lt text-tva-success",
  ON_HOLD:     "bg-tva-warn-lt text-tva-warn",
  COMPLETED:   "bg-gray-100 text-gray-500",
  CANCELLED:   "bg-tva-error-lt text-tva-error",
  BACKLOG:     "bg-gray-100 text-gray-500",
  TODO:        "bg-gray-100 text-gray-500",
  IN_PROGRESS: "bg-tva-info-lt text-tva-info",
  IN_REVIEW:   "bg-tva-warn-lt text-tva-warn",
  DONE:        "bg-tva-success-lt text-tva-success",
  BLOCKED:     "bg-tva-error-lt text-tva-error",
};

export const KANBAN_COLUMNS = [
  { id: "BACKLOG",     label: "Backlog",      color: "#9ca3af" },
  { id: "TODO",        label: "To Do",        color: "#6b7280" },
  { id: "IN_PROGRESS", label: "In Progress",  color: "#2563eb" },
  { id: "IN_REVIEW",   label: "In Review",    color: "#f59e0b" },
  { id: "DONE",        label: "Done",         color: "#1da851" },
  { id: "BLOCKED",     label: "Blocked",      color: "#e53935" },
];
