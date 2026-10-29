import type { Prisma } from "@prisma/client";

// Prisma include shapes for the business features, shared by server actions
// (for queries) and components (for the resulting types).

export const userSelect = { id: true, name: true, email: true, image: true, jobTitle: true } as const;
const projectRef = { select: { id: true, name: true, color: true, emoji: true } } as const;

export const actionItemInclude = {
  owner: { select: userSelect },
  project: projectRef,
  meeting: { select: { id: true, title: true, scheduledAt: true } },
  decision: { select: { id: true, title: true } },
} satisfies Prisma.ActionItemInclude;

export const meetingListInclude = {
  chair: { select: userSelect },
  attendees: { include: { user: { select: userSelect } } },
  items: { select: { id: true, kind: true, health: true } },
  actionItems: { select: { id: true, status: true, dueDate: true } },
  _count: { select: { decisions: true } },
} satisfies Prisma.MeetingInclude;

export const meetingDetailInclude = {
  chair: { select: userSelect },
  createdBy: { select: userSelect },
  attendees: { include: { user: { select: userSelect } }, orderBy: { user: { name: "asc" } } },
  items: {
    include: {
      project: { select: { id: true, name: true, color: true, emoji: true, status: true, dueDate: true } },
      owner: { select: userSelect },
      decision: { select: { id: true, title: true, status: true } },
      actionItems: { include: actionItemInclude, orderBy: { createdAt: "asc" } },
    },
    orderBy: { position: "asc" },
  },
  actionItems: { include: actionItemInclude, orderBy: { createdAt: "asc" } },
  decisions: { select: { id: true, title: true, status: true, decideBy: true } },
  previous: {
    select: {
      id: true, title: true, scheduledAt: true,
      items: { select: { id: true, title: true, projectId: true, followUp: true, health: true, statusNote: true } },
    },
  },
  followUps: { select: { id: true, title: true, scheduledAt: true, status: true } },
} satisfies Prisma.MeetingInclude;

export const statusUpdateInclude = {
  author: { select: userSelect },
  project: projectRef,
  meeting: { select: { id: true, title: true } },
} satisfies Prisma.StatusUpdateInclude;

export const decisionInclude = {
  proposer: { select: userSelect },
  decider: { select: userSelect },
  project: projectRef,
  meeting: { select: { id: true, title: true, scheduledAt: true } },
  options: { orderBy: { position: "asc" } },
  actionItems: { include: actionItemInclude, orderBy: { createdAt: "asc" } },
} satisfies Prisma.DecisionInclude;

export const objectiveInclude = {
  owner: { select: userSelect },
  keyResults: {
    include: {
      owner: { select: userSelect },
      checkIns: { include: { author: { select: userSelect } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  },
  projects: { select: { id: true, name: true, color: true, emoji: true, status: true } },
} satisfies Prisma.ObjectiveInclude;

export type ActionItemWithRelations = Prisma.ActionItemGetPayload<{ include: typeof actionItemInclude }>;
export type MeetingListItem = Prisma.MeetingGetPayload<{ include: typeof meetingListInclude }>;
export type MeetingDetail = Prisma.MeetingGetPayload<{ include: typeof meetingDetailInclude }>;
export type StatusUpdateWithRelations = Prisma.StatusUpdateGetPayload<{ include: typeof statusUpdateInclude }>;
export type ObjectiveWithRelations = Prisma.ObjectiveGetPayload<{ include: typeof objectiveInclude }>;

type DecisionRow = Prisma.DecisionGetPayload<{ include: typeof decisionInclude }>;
/** Decimal costs can't cross to client components, so they're sent as numbers. */
export type DecisionWithRelations = Omit<DecisionRow, "options"> & {
  options: (Omit<DecisionRow["options"][number], "cost"> & { cost: number | null })[];
};

export function serializeDecision(d: DecisionRow): DecisionWithRelations {
  return { ...d, options: d.options.map((o) => ({ ...o, cost: o.cost === null ? null : Number(o.cost) })) };
}

export type ProjectOption = { id: string; name: string; emoji: string; color: string; ownerId: string; status: string };
