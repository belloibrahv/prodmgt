/**
 * Imports the Monday 26 October 2026 project review minutes, its follow-up
 * meetings, actions and decisions. Safe to run more than once.
 *
 *   npm run db:seed:minutes                        # minutes only
 *   npm run db:seed:minutes -- --with-example-goals  # plus starter Q4 objectives
 *
 * Projects are matched by name and created if missing. People are matched to
 * registered users by name; anyone not found is named in the text instead.
 * SEED_OWNER_EMAIL picks who records the meeting (default: earliest user).
 */
import type { ProjectIconKey } from "../src/lib/project-icons";
import { PrismaClient, type Health, type MeetingItemKind, type ProjectStatus, type Priority } from "@prisma/client";

const prisma = new PrismaClient();
const withGoals = process.argv.includes("--with-example-goals");

const at = (iso: string) => new Date(iso);
const MONDAY = at("2026-10-26T10:00:00+01:00");
const WEDNESDAY = at("2026-10-28T10:00:00+01:00");
const FRIDAY = at("2026-10-30T15:00:00+01:00");
const WED_DUE = at("2026-10-28T17:00:00+01:00");

async function findUser(name: string) {
  return prisma.user.findFirst({ where: { name: { contains: name, mode: "insensitive" }, passwordHash: { not: null } } });
}

async function ensureProject(ownerId: string, p: { name: string; client?: string; status: ProjectStatus; priority?: Priority; emoji?: ProjectIconKey; color?: string }) {
  const existing = await prisma.project.findFirst({ where: { name: { equals: p.name, mode: "insensitive" } } });
  if (existing) return existing;
  return prisma.project.create({
    data: {
      name: p.name,
      client: p.client,
      status: p.status,
      priority: p.priority ?? "MEDIUM",
      emoji: p.emoji ?? "globe",
      color: p.color ?? "#bc0004",
      completedAt: p.status === "COMPLETED" ? MONDAY : undefined,
      ownerId,
      members: { create: [{ userId: ownerId, role: "OWNER" }] },
    },
  });
}

interface ItemSeed {
  kind: MeetingItemKind;
  title: string;
  project?: { name: string; client?: string; status: ProjectStatus; priority?: Priority; emoji?: ProjectIconKey; color?: string };
  health: Health;
  statusNote: string;
  discussion: string;
  followUp: string;
  owner?: string;
  actions?: { title: string; owner?: string }[];
  decision?: { title: string; category: "STRATEGIC" | "OPERATIONAL" | "FINANCIAL" | "TECHNICAL" | "PEOPLE" | "CLIENT" | "SECURITY"; impact: Priority; options?: { label: string; description?: string }[] };
}

const ITEMS: ItemSeed[] = [
  {
    kind: "PROJECT_UPDATE", title: "Hon. Shanana Website",
    project: { name: "Hon. Shanana Website", client: "Hon. Shanana", status: "COMPLETED" },
    health: "DONE", statusNote: "Completed.",
    discussion: "The website has been completed, and all necessary changes have been implemented, including the removal of dummy images and their replacement with appropriate images.",
    followUp: "Confirm that the website is ready for final handover, where applicable, and identify any outstanding client-facing requirements.",
  },
  {
    kind: "PROJECT_UPDATE", title: "Rose Petals Website",
    project: { name: "Rose Petals Website", client: "Rose Petals", status: "ON_HOLD", color: "#ec4899" },
    health: "ON_HOLD", statusNote: "Paused pending completion or reprioritisation of Soft e Box.",
    discussion: "Work on the Rose Petals website is temporarily on hold due to the urgent need to prioritise the Soft e Box website.",
    followUp: "Provide an update on when work can resume and the revised delivery timeline.",
  },
  {
    kind: "PROJECT_UPDATE", title: "Soft e Box Website",
    project: { name: "Soft e Box Website", client: "Soft e Box", status: "ACTIVE", priority: "HIGH", color: "#2563eb" },
    health: "ON_TRACK", statusNote: "In progress; deployment pending.", owner: "Abdulqobeed",
    discussion: "Development is ongoing, with the possibility of going live today or tomorrow and, in any case, within the current week. Abdulqobeed is responsible for reporting on the project's progress.",
    followUp: "Report on development completion, testing, outstanding issues, and whether the website has gone live. If it has not, provide a confirmed launch timeline and identify any blockers.",
    actions: [{ title: "Report Soft e Box development, testing and go-live status", owner: "Abdulqobeed" }],
  },
  {
    kind: "PROJECT_UPDATE", title: "Elsatech Website Revamp",
    project: { name: "Elsatech Website Revamp", client: "Elsatech", status: "PLANNING", color: "#0891b2" },
    health: "NOT_STARTED", statusNote: "Pending commencement and deadline confirmation.",
    discussion: "Work on the proposed website revamp has not commenced. The team needs to establish whether a deadline has been agreed with the client.",
    followUp: "Confirm the delivery deadline, clarify the scope of the revamp, and outline the next steps for commencement.",
    actions: [{ title: "Confirm Elsatech revamp deadline and scope with the client" }],
  },
  {
    kind: "PROJECT_UPDATE", title: "LGA Training",
    project: { name: "LGA Training", client: "Local Government Area", status: "ACTIVE", emoji: "document", color: "#8b5cf6" },
    health: "ON_TRACK", statusNote: "Proposal submitted; accompanying letter outstanding.", owner: "Ibrahim",
    discussion: "The training proposal has been submitted and attested. An accompanying letter of introduction for Techvaults Nigeria Limited is still required. Mr. Ibrahim Zakariyah is to prepare the letter.",
    followUp: "Report on the preparation and submission of the letter and identify any further documentation or follow-up required.",
    actions: [{ title: "Prepare and submit the Techvaults letter of introduction for the LGA training proposal", owner: "Ibrahim" }],
  },
  {
    kind: "PROJECT_UPDATE", title: "Abu Twins — StockVaults Software",
    project: { name: "StockVaults Software", client: "Abu Twins", status: "ACTIVE", priority: "HIGH", emoji: "rocket", color: "#1da851" },
    health: "ON_TRACK", statusNote: "Operational; commercial readiness pending.",
    discussion: "The StockVaults software is functioning well, and several of Abu Twins' contacts have already expressed interest in using it.\n\nThe team agreed that Techvaults must put its internal affairs in order before commencing wider engagement, marketing, or sales.",
    followUp: "Provide progress on product readiness, including documentation, pricing, support arrangements, user onboarding, ownership of responsibilities, and any other requirements necessary before commercial launch.",
  },
  {
    kind: "PROJECT_UPDATE", title: "Abu Twins — E-commerce Website",
    project: { name: "Abu Twins E-commerce Website", client: "Abu Twins", status: "ACTIVE", emoji: "cart", color: "#f59e0b" },
    health: "ON_TRACK", statusNote: "Functional; interface selection and further testing outstanding.",
    discussion: "The e-commerce website is functioning well. However, the team needs to select a suitable interface and ensure the necessary refinements are completed. Another business should also be identified to test the platform in a practical business environment.",
    followUp: "Report on interface selection, outstanding improvements, and the identification of a suitable business for a pilot or trial.",
    actions: [{ title: "Identify a second business to pilot the e-commerce platform" }],
  },
  {
    kind: "PROJECT_UPDATE", title: "Custodian Website",
    project: { name: "Custodian Website", client: "Custodian", status: "ACTIVE" },
    health: "ON_TRACK", statusNote: "In progress.",
    discussion: "Custodian requested an update on its website, and work is currently being undertaken to address the request.",
    followUp: "Provide the current state of the website, the changes made, any outstanding issues, and the next communication or deliverable due to the client.",
  },
  {
    kind: "PROJECT_UPDATE", title: "Cooperative Web Application",
    project: { name: "Cooperative Web Application", client: "Mr. Adams", status: "ACTIVE", emoji: "building", color: "#d97706" },
    health: "AT_RISK", statusNote: "Awaiting confirmation.",
    discussion: "Development of the cooperative web application is progressing well. The current work is with Mr. Adams, pending his confirmation.",
    followUp: "Confirm whether feedback has been received, identify any required changes, and establish the next action if approval remains pending.",
  },
  {
    kind: "DECISION", title: "End-of-Year Client Souvenirs",
    health: "AT_RISK", statusNote: "Pending budget review and final selection.",
    discussion: "The team is considering end-of-year souvenirs for clients, with two proposed options: a fibre gas cylinder and a multifunctional blender.\n\nThe budgets for both options will be reviewed and revised before a final decision is made. Given the approaching deadline, the team needs to conclude this decision as soon as possible.",
    followUp: "Present revised cost estimates, quantities, supplier availability, branding options, and the proposed delivery timeline for both alternatives. Recommend a final option for approval.",
    actions: [{ title: "Present revised souvenir cost estimates, quantities, suppliers and delivery timeline" }],
    decision: {
      title: "End-of-year client souvenirs", category: "FINANCIAL", impact: "HIGH",
      options: [
        { label: "Fibre gas cylinder", description: "Budget under review. Confirm quantities, supplier availability, branding and delivery timeline." },
        { label: "Multifunctional blender", description: "Budget under review. Confirm quantities, supplier availability, branding and delivery timeline." },
      ],
    },
  },
  {
    kind: "PROJECT_UPDATE", title: "Rafkaz — Social Media and Website Updates",
    project: { name: "Rafkaz Social Media & Website", client: "Rafkaz", status: "ACTIVE", emoji: "palette", color: "#ec4899" },
    health: "NOT_STARTED", statusNote: "Review and updates required.",
    discussion: "Rafkaz's social media platforms require updates, including the addition of relevant images. The website may also require further updates following a review.",
    followUp: "Report on the social media updates completed, assess the website for necessary changes, and list any outstanding tasks.",
  },
  {
    kind: "PROJECT_UPDATE", title: "Al Haleem School — Follow-Up",
    project: { name: "Al Haleem School", client: "Al Haleem School", status: "ACTIVE", emoji: "lightbulb", color: "#0891b2" },
    health: "AT_RISK", statusNote: "Awaiting response.",
    discussion: "The team has not yet received feedback from Al Haleem School.",
    followUp: "Follow up with the school and report the response received, any requirements communicated, and the recommended next steps.",
    actions: [{ title: "Follow up with Al Haleem School for feedback" }],
  },
  {
    kind: "RECOMMENDATION", title: "Social Media Management and Content Creation",
    health: "NOT_STARTED", statusNote: "For management approval.", owner: "Chidinma",
    discussion: "It was recommended that Miss Chidinma serve as Techvaults' social media manager and content creator for the time being.\n\nThe objective is to establish a consistent and vibrant social media presence, improve the company's visibility, and build credibility ahead of the wider marketing and sale of its software products and applications.\n\nProposed next steps:\n• Agree on her responsibilities, reporting line, and approval process.\n• Develop a practical content calendar and consistent publishing schedule.\n• Showcase company projects, software demonstrations, development milestones, and relevant technology insights.\n• Track engagement, enquiries, leads, and other meaningful results.",
    followUp: "Confirm whether the recommendation has been approved and, if so, outline the initial implementation plan.",
    decision: { title: "Appoint Miss Chidinma as interim social media manager and content creator", category: "PEOPLE", impact: "MEDIUM" },
  },
  {
    kind: "RECOMMENDATION", title: "Deployment of Security Updates Across Client Websites",
    health: "AT_RISK", statusNote: "For management approval.",
    discussion: "It was recommended that the security update deployed on the Custodian website in response to the reported global PHP cybersecurity threat over the weekend be assessed for deployment across all relevant client websites.\n\nThe objective is to reduce avoidable security exposure and establish a consistent website maintenance practice.\n\nProposed next steps:\n• Identify all client websites and their respective PHP versions, dependencies, and hosting environments.\n• Confirm the specific vulnerability or threat and verify the appropriate security patches.\n• Test updates for compatibility before deployment.\n• Apply verified updates, maintain backups, and document the changes.\n• Confirm successful deployment and monitor for errors.\n\nTechnical note: the security updates should be verified against the specific vulnerability and each website's environment rather than deployed indiscriminately.",
    followUp: "Present the list of affected or relevant websites, the scope of the required updates, deployment progress, and any compatibility issues.",
    actions: [{ title: "List all client websites with PHP versions, dependencies and hosting environments" }],
    decision: { title: "Roll out the PHP security update across all relevant client websites", category: "SECURITY", impact: "CRITICAL" },
  },
];

async function main() {
  const recorder = process.env.SEED_OWNER_EMAIL
    ? await prisma.user.findUnique({ where: { email: process.env.SEED_OWNER_EMAIL } })
    : await prisma.user.findFirst({ where: { passwordHash: { not: null } }, orderBy: { createdAt: "asc" } });
  if (!recorder) throw new Error("No registered user found. Register an account first, or set SEED_OWNER_EMAIL.");

  const existing = await prisma.meeting.findFirst({ where: { type: "WEEKLY_REVIEW", scheduledAt: MONDAY } });
  if (existing) {
    console.log(`Minutes of ${MONDAY.toDateString()} already imported (${existing.id}).`);
  } else {
    const people = new Map<string, string | null>();
    for (const name of ["Abdulqobeed", "Ibrahim", "Chidinma"]) people.set(name, (await findUser(name))?.id ?? null);
    const who = (name?: string) => (name ? people.get(name) ?? null : null);
    const attendeeIds = new Set([recorder.id, ...[...people.values()].filter((v): v is string => Boolean(v))]);

    const meeting = await prisma.meeting.create({
      data: {
        title: "Monday Project Review Meeting",
        type: "WEEKLY_REVIEW",
        status: "COMPLETED",
        scheduledAt: MONDAY,
        nextReviewAt: WEDNESDAY,
        completedAt: MONDAY,
        purpose: "Project review, operational planning, identification of pending decisions, and assignment of deliverables for midweek progress reporting.",
        summary: "Weekly reporting falls on Friday, 30 October 2026. Owners report against each item's Wednesday update at the midweek progress review.",
        chairId: recorder.id,
        createdById: recorder.id,
        attendees: { create: [...attendeeIds].map((userId) => ({ userId })) },
      },
    });

    for (const [position, seed] of ITEMS.entries()) {
      const project = seed.project ? await ensureProject(recorder.id, seed.project) : null;
      const ownerId = who(seed.owner) ?? (seed.project ? project?.ownerId ?? null : null);

      const decision = seed.decision
        ? await prisma.decision.create({
            data: {
              title: seed.decision.title,
              context: seed.discussion,
              category: seed.decision.category,
              impact: seed.decision.impact,
              status: "UNDER_REVIEW",
              decideBy: WEDNESDAY,
              proposerId: recorder.id,
              meetingId: meeting.id,
              projectId: project?.id,
              options: { create: (seed.decision.options ?? []).map((o, i) => ({ ...o, position: i })) },
            },
          })
        : null;

      const item = await prisma.meetingItem.create({
        data: {
          meetingId: meeting.id,
          position,
          kind: seed.kind,
          title: seed.title,
          health: seed.health,
          statusNote: seed.statusNote,
          discussion: seed.discussion,
          followUp: seed.followUp,
          projectId: project?.id,
          ownerId,
          decisionId: decision?.id,
        },
      });

      for (const a of seed.actions ?? []) {
        const actionOwner = who(a.owner);
        await prisma.actionItem.create({
          data: {
            // Name the person in the text when they don't have an account yet.
            title: a.owner && !actionOwner ? `${a.title} (${a.owner})` : a.title,
            ownerId: actionOwner,
            dueDate: WED_DUE,
            createdById: recorder.id,
            meetingId: meeting.id,
            meetingItemId: item.id,
            projectId: project?.id,
            decisionId: decision?.id,
          },
        });
      }
    }

    // The week's rhythm: Wednesday reports against Monday's follow-ups, Friday closes the week.
    const items = await prisma.meetingItem.findMany({ where: { meetingId: meeting.id }, orderBy: { position: "asc" } });
    const copyAgenda = items.map(({ kind, title, projectId, ownerId, health, statusNote, position }) => ({ kind, title, projectId, ownerId, health, statusNote, position }));
    for (const follow of [
      { title: "Midweek Progress Review", type: "MIDWEEK_CHECKIN" as const, scheduledAt: WEDNESDAY, purpose: "Brief progress updates on all ongoing projects, proper assignment of tasks, responsibilities and deadlines, and identification of delays, outstanding tasks and areas requiring support." },
      { title: "Friday Weekly Report", type: "WEEKLY_REPORT" as const, scheduledAt: FRIDAY, purpose: "Close the week: confirm what was delivered, what slipped and why, and set priorities for next week." },
    ]) {
      await prisma.meeting.create({
        data: {
          ...follow,
          chairId: recorder.id,
          createdById: recorder.id,
          previousId: meeting.id,
          attendees: { create: [...attendeeIds].map((userId) => ({ userId })) },
          items: { createMany: { data: copyAgenda } },
        },
      });
    }

    console.log(`Imported the 26 October minutes (${meeting.id}) with ${ITEMS.length} items.`);
    const missing = [...people.entries()].filter(([, id]) => !id).map(([n]) => n);
    if (missing.length) console.log(`No account found for: ${missing.join(", ")}. Their actions name them in the text; assign owners once they register.`);
  }

  if (withGoals) await seedExampleGoals(recorder.id);
}

/** Starter Q4 objectives drawn from the minutes. Edit the targets to match the real plan. */
async function seedExampleGoals(ownerId: string) {
  if (await prisma.objective.findFirst({ where: { period: "Q4 2026" } })) {
    console.log("Q4 2026 objectives already exist; skipping example goals.");
    return;
  }
  const byName = async (name: string) => (await prisma.project.findFirst({ where: { name } }))?.id;
  const start = at("2026-10-01T00:00:00+01:00");
  const end = at("2026-12-31T23:59:59+01:00");
  const ids = async (...names: string[]) => (await Promise.all(names.map(byName))).filter((x): x is string => Boolean(x)).map((id) => ({ id }));

  const goals = [
    {
      title: "Launch StockVaults commercially",
      description: "Put internal affairs in order, then take StockVaults to the businesses already asking for it.",
      projects: await ids("StockVaults Software"),
      krs: [
        { title: "Launch readiness checklist complete (docs, pricing, support, onboarding)", unit: "%", startValue: 0, targetValue: 100, checkIns: [20, 35] },
        { title: "Paying StockVaults customers", unit: "customers", startValue: 0, targetValue: 5, checkIns: [0] },
      ],
    },
    {
      title: "Deliver every client website on its agreed date",
      description: "No project waits more than a week for a decision or a client response without escalation.",
      projects: await ids("Soft e Box Website", "Elsatech Website Revamp", "Custodian Website", "Rose Petals Website", "Hon. Shanana Website"),
      krs: [
        { title: "Client websites live this quarter", unit: "sites", startValue: 0, targetValue: 5, checkIns: [1, 1] },
        { title: "Client sites patched against the PHP threat", unit: "%", startValue: 0, targetValue: 100, checkIns: [15] },
      ],
    },
    {
      title: "Build a visible, credible brand online",
      description: "A consistent social presence ahead of selling Techvaults' software products.",
      projects: await ids("Rafkaz Social Media & Website"),
      krs: [
        { title: "Posts published on schedule", unit: "posts", startValue: 0, targetValue: 36, checkIns: [2, 4] },
        { title: "Inbound enquiries from social media", unit: "leads", startValue: 0, targetValue: 10, checkIns: [1] },
      ],
    },
  ];

  for (const g of goals) {
    await prisma.objective.create({
      data: {
        title: g.title, description: g.description, period: "Q4 2026", startDate: start, endDate: end, ownerId,
        projects: { connect: g.projects },
        keyResults: {
          create: g.krs.map((kr) => ({
            title: kr.title, unit: kr.unit, startValue: kr.startValue, targetValue: kr.targetValue,
            currentValue: kr.checkIns.at(-1) ?? kr.startValue, ownerId,
            checkIns: {
              create: kr.checkIns.map((value, i) => ({
                value, authorId: ownerId, createdAt: new Date(start.getTime() + (i + 1) * 9 * 86_400_000),
              })),
            },
          })),
        },
      },
    });
  }
  console.log(`Added ${goals.length} example Q4 2026 objectives.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
