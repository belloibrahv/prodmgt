import { PrismaClient, ProjectStatus, TaskStatus, Priority, MemberRole, DocType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TechVaults Project Manager...");

  // ── Users ─────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const kudirat = await prisma.user.upsert({
    where: { email: "kudirat@techvaults.com" },
    update: {},
    create: {
      email: "kudirat@techvaults.com",
      name: "Kudirat Taiwo",
      passwordHash: password,
      jobTitle: "Product Manager",
    },
  });

  const dev1 = await prisma.user.upsert({
    where: { email: "dev1@techvaults.com" },
    update: {},
    create: { email: "dev1@techvaults.com", name: "Akin Adeyemi", passwordHash: password, jobTitle: "Lead Engineer" },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: "dev2@techvaults.com" },
    update: {},
    create: { email: "dev2@techvaults.com", name: "Fatima Bello", passwordHash: password, jobTitle: "Frontend Developer" },
  });

  const designer = await prisma.user.upsert({
    where: { email: "design@techvaults.com" },
    update: {},
    create: { email: "design@techvaults.com", name: "Chidi Okafor", passwordHash: password, jobTitle: "UI/UX Designer" },
  });

  // ── Projects ──────────────────────────────────────────────
  const p1 = await prisma.project.create({
    data: {
      name: "TechVaults Client Portal",
      description: "A self-service portal allowing clients to view project status, invoices, and documents.",
      emoji: "🏢",
      color: "#bc0004",
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      startDate: new Date("2026-06-01"),
      dueDate: new Date("2026-09-30"),
      ownerId: kudirat.id,
      members: {
        create: [
          { userId: kudirat.id, role: MemberRole.OWNER },
          { userId: dev1.id, role: MemberRole.ADMIN },
          { userId: dev2.id, role: MemberRole.MEMBER },
          { userId: designer.id, role: MemberRole.MEMBER },
        ],
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: "Mobile App v2.0",
      description: "Major redesign of the TechVaults mobile application with new features.",
      emoji: "📱",
      color: "#2563eb",
      status: ProjectStatus.ACTIVE,
      priority: Priority.CRITICAL,
      startDate: new Date("2026-05-15"),
      dueDate: new Date("2026-08-15"),
      ownerId: dev1.id,
      members: {
        create: [
          { userId: dev1.id, role: MemberRole.OWNER },
          { userId: kudirat.id, role: MemberRole.ADMIN },
          { userId: designer.id, role: MemberRole.MEMBER },
        ],
      },
    },
  });

  const p3 = await prisma.project.create({
    data: {
      name: "Internal Dashboard",
      description: "Internal analytics and operations dashboard for the TechVaults team.",
      emoji: "📊",
      color: "#1da851",
      status: ProjectStatus.PLANNING,
      priority: Priority.MEDIUM,
      startDate: new Date("2026-08-01"),
      dueDate: new Date("2026-11-30"),
      ownerId: kudirat.id,
      members: {
        create: [
          { userId: kudirat.id, role: MemberRole.OWNER },
          { userId: dev2.id, role: MemberRole.MEMBER },
        ],
      },
    },
  });

  // ── Milestones ────────────────────────────────────────────
  const ms1 = await prisma.milestone.create({
    data: { name: "Design Handoff", dueDate: new Date("2026-07-15"), projectId: p1.id },
  });
  const ms2 = await prisma.milestone.create({
    data: { name: "Beta Launch", dueDate: new Date("2026-08-30"), projectId: p1.id },
  });

  // ── Tasks ─────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      // Project 1
      { title: "Wireframe client portal screens", projectId: p1.id, assigneeId: designer.id, creatorId: kudirat.id, status: TaskStatus.DONE, priority: Priority.HIGH, milestoneId: ms1.id, dueDate: new Date("2026-07-10") },
      { title: "Set up Next.js project scaffold", projectId: p1.id, assigneeId: dev1.id, creatorId: kudirat.id, status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: new Date("2026-07-05") },
      { title: "Build authentication flow", projectId: p1.id, assigneeId: dev1.id, creatorId: kudirat.id, status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, dueDate: new Date("2026-07-20") },
      { title: "Implement project overview page", projectId: p1.id, assigneeId: dev2.id, creatorId: kudirat.id, status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, milestoneId: ms2.id, dueDate: new Date("2026-08-01") },
      { title: "Invoice history & download", projectId: p1.id, assigneeId: dev2.id, creatorId: kudirat.id, status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: new Date("2026-08-10") },
      { title: "Write API documentation", projectId: p1.id, assigneeId: dev1.id, creatorId: kudirat.id, status: TaskStatus.TODO, priority: Priority.LOW, dueDate: new Date("2026-08-25") },
      { title: "QA & bug fixing", projectId: p1.id, creatorId: kudirat.id, status: TaskStatus.BACKLOG, priority: Priority.HIGH, milestoneId: ms2.id, dueDate: new Date("2026-08-28") },

      // Project 2
      { title: "User research & competitive analysis", projectId: p2.id, assigneeId: kudirat.id, creatorId: dev1.id, status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: new Date("2026-06-01") },
      { title: "Design system update for mobile", projectId: p2.id, assigneeId: designer.id, creatorId: dev1.id, status: TaskStatus.IN_PROGRESS, priority: Priority.CRITICAL, dueDate: new Date("2026-07-20") },
      { title: "Implement new onboarding flow", projectId: p2.id, assigneeId: dev1.id, creatorId: dev1.id, status: TaskStatus.IN_REVIEW, priority: Priority.HIGH, dueDate: new Date("2026-07-25") },
      { title: "Push notifications integration", projectId: p2.id, assigneeId: dev1.id, creatorId: dev1.id, status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: new Date("2026-08-05") },

      // Project 3
      { title: "Define KPI requirements", projectId: p3.id, assigneeId: kudirat.id, creatorId: kudirat.id, status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, dueDate: new Date("2026-08-10") },
      { title: "Data architecture design", projectId: p3.id, assigneeId: dev2.id, creatorId: kudirat.id, status: TaskStatus.TODO, priority: Priority.HIGH, dueDate: new Date("2026-08-20") },
    ],
  });

  // ── Documents ─────────────────────────────────────────────
  await prisma.document.createMany({
    data: [
      { title: "Client Portal PRD", type: DocType.PRD, projectId: p1.id, authorId: kudirat.id, content: "# Product Requirements\n\nThis document outlines the requirements for the TechVaults Client Portal..." },
      { title: "Design Spec v1.0", type: DocType.DESIGN, projectId: p1.id, authorId: designer.id, content: "# Design Specifications\n\nColors, typography, and component guidelines..." },
      { title: "Sprint 1 Meeting Notes", type: DocType.MEETING_NOTES, projectId: p1.id, authorId: kudirat.id, content: "# Sprint 1 Kickoff\n\nDate: June 15, 2026\nAttendees: Kudirat, Akin, Fatima, Chidi\n\n## Agenda..." },
      { title: "Mobile App v2.0 Spec", type: DocType.SPEC, projectId: p2.id, authorId: kudirat.id, content: "# Mobile App v2.0 Technical Spec..." },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Login: kudirat@techvaults.com / password123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
