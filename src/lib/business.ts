import type {
  ActionStatus, DecisionCategory, DecisionStatus, Health, MeetingItemKind, MeetingStatus, MeetingType,
} from "@prisma/client";

// Labels, colours and calculations for meetings, decisions, check-ins and goals.
// Kept free of server imports so client components can use them too.

interface Tone {
  label: string;
  /** Solid swatch for dots, bars and chart cells. */
  color: string;
  /** Badge tint. */
  badge: string;
}

export const HEALTH: Record<Health, Tone> = {
  ON_TRACK:    { label: "On track",    color: "#12a150", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  AT_RISK:     { label: "At risk",     color: "#d97706", badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  OFF_TRACK:   { label: "Off track",   color: "#c0262d", badge: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  BLOCKED:     { label: "Blocked",     color: "#9f1239", badge: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200" },
  ON_HOLD:     { label: "On hold",     color: "#64748b", badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300" },
  NOT_STARTED: { label: "Not started", color: "#2563eb", badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  DONE:        { label: "Completed",   color: "#0d9488", badge: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" },
};

export const HEALTH_ORDER: Health[] = ["ON_TRACK", "AT_RISK", "OFF_TRACK", "BLOCKED", "ON_HOLD", "NOT_STARTED", "DONE"];

export const MEETING_TYPES: Record<MeetingType, { label: string; short: string; description: string }> = {
  WEEKLY_REVIEW:   { label: "Monday project review", short: "Review",    description: "Review every project, surface decisions and assign deliverables for the week." },
  MIDWEEK_CHECKIN: { label: "Midweek check-in",      short: "Check-in",  description: "Owners report against what Monday's review asked of them." },
  WEEKLY_REPORT:   { label: "Friday weekly report",  short: "Report",    description: "Close the week: what shipped, what slipped and why." },
  MANAGEMENT:      { label: "Management meeting",    short: "Management", description: "Strategy, budgets, people and decisions that need sign-off." },
  CLIENT:          { label: "Client meeting",        short: "Client",    description: "Meeting with a client or partner." },
  OTHER:           { label: "Other meeting",         short: "Meeting",   description: "Any other meeting worth minuting." },
};

export const MEETING_STATUS: Record<MeetingStatus, { label: string; badge: string }> = {
  SCHEDULED:   { label: "Scheduled",   badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  IN_PROGRESS: { label: "In session",  badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  COMPLETED:   { label: "Minuted",     badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  CANCELLED:   { label: "Cancelled",   badge: "bg-muted text-muted-foreground" },
};

export const ITEM_KINDS: Record<MeetingItemKind, { label: string; section: string }> = {
  PROJECT_UPDATE: { label: "Project update",  section: "Project updates and discussions" },
  DISCUSSION:     { label: "Discussion",      section: "General discussion" },
  DECISION:       { label: "Decision needed", section: "Decisions required" },
  RECOMMENDATION: { label: "Recommendation",  section: "Recommendations for management consideration" },
  ANNOUNCEMENT:   { label: "Announcement",    section: "Announcements" },
};

export const ITEM_KIND_ORDER: MeetingItemKind[] = ["PROJECT_UPDATE", "DECISION", "RECOMMENDATION", "DISCUSSION", "ANNOUNCEMENT"];

export const ACTION_STATUS: Record<ActionStatus, { label: string; badge: string }> = {
  OPEN:        { label: "Open",        badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  IN_PROGRESS: { label: "In progress", badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  DONE:        { label: "Done",        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  CANCELLED:   { label: "Cancelled",   badge: "bg-muted text-muted-foreground" },
};

export const DECISION_STATUS: Record<DecisionStatus, { label: string; color: string; badge: string }> = {
  PROPOSED:     { label: "Proposed",     color: "#2563eb", badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  UNDER_REVIEW: { label: "Under review", color: "#d97706", badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  APPROVED:     { label: "Approved",     color: "#12a150", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  REJECTED:     { label: "Rejected",     color: "#d92d20", badge: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  DEFERRED:     { label: "Deferred",     color: "#64748b", badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300" },
  IMPLEMENTED:  { label: "Implemented",  color: "#0f766e", badge: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300" },
};

export const DECISION_PIPELINE: DecisionStatus[] = ["PROPOSED", "UNDER_REVIEW", "APPROVED", "IMPLEMENTED", "DEFERRED", "REJECTED"];
export const OPEN_DECISION_STATUSES: DecisionStatus[] = ["PROPOSED", "UNDER_REVIEW"];

export const DECISION_CATEGORIES: Record<DecisionCategory, string> = {
  STRATEGIC: "Strategic",
  OPERATIONAL: "Operational",
  FINANCIAL: "Financial",
  TECHNICAL: "Technical",
  PEOPLE: "People",
  CLIENT: "Client",
  SECURITY: "Security",
};

/** The five things everyone reports on, in order. */
export const UPDATE_FIELDS = [
  { key: "completed",   label: "Completed",                  hint: "What has been done so far" },
  { key: "inProgress",  label: "In progress",                hint: "What is being worked on now" },
  { key: "outstanding", label: "Outstanding",                hint: "What remains to be done" },
  { key: "challenges",  label: "Challenges / support needed", hint: "Obstacles, or help you need" },
  { key: "nextAction",  label: "Next action",                hint: "The very next step" },
] as const;

// ── Goals ──────────────────────────────────────────────────────

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Share of the way from start to target, 0–1. Works for targets below the start too. */
export function keyResultProgress(kr: { startValue: number; targetValue: number; currentValue: number }): number {
  const span = kr.targetValue - kr.startValue;
  if (span === 0) return kr.currentValue >= kr.targetValue ? 1 : 0;
  return clamp((kr.currentValue - kr.startValue) / span);
}

export function objectiveProgress(keyResults: { startValue: number; targetValue: number; currentValue: number }[]): number {
  if (keyResults.length === 0) return 0;
  return keyResults.reduce((sum, kr) => sum + keyResultProgress(kr), 0) / keyResults.length;
}

/** Share of the period that has elapsed, 0–1. */
export function periodElapsed(start: Date | string, end: Date | string, now = new Date()): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (e <= s) return 1;
  return clamp((now.getTime() - s) / (e - s));
}

/**
 * Health of a goal judged against the calendar: progress is compared with how
 * much of the period has gone, so 40% done at the halfway point is at risk.
 */
export function goalHealth(progress: number, elapsed: number): Health {
  if (progress >= 1) return "DONE";
  if (elapsed <= 0) return "NOT_STARTED";
  const gap = elapsed - progress;
  if (gap <= 0.1) return "ON_TRACK";
  if (gap <= 0.25) return "AT_RISK";
  return "OFF_TRACK";
}

export function formatMetric(value: number, unit?: string | null): string {
  const n = Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (!unit) return n;
  if (unit === "%") return `${n}%`;
  if (unit === "NGN" || unit === "₦") return `₦${n}`;
  return `${n} ${unit}`;
}

export function formatNaira(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

/** What the signed-in user may do with a meeting's minutes. Mirrors the server checks. */
export function meetingPermissions(
  meeting: { createdById: string; chairId: string | null; status: MeetingStatus; attendees: { userId: string }[] },
  userId: string,
) {
  const isLead = meeting.createdById === userId || meeting.chairId === userId;
  const isAttendee = meeting.attendees.some((a) => a.userId === userId);
  const locked = meeting.status === "COMPLETED" || meeting.status === "CANCELLED";
  return { canEdit: (isLead || isAttendee) && !locked, canReopen: isLead && locked, isLead, locked };
}
