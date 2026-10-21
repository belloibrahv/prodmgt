"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, FileText, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { MiniAvatar, SCENE, ScaledStage, people } from "./demo/primitives";
import { TimelineScene } from "./demo/scenes";
import Reveal from "./Reveal";

const inView = { once: true, margin: "-120px" } as const;

/* ── Visual: a project with its milestones ── */

const milestones = [
  { name: "Design Handoff", date: "Jul 15", state: "done" },
  { name: "Beta Launch", date: "Aug 30", state: "next" },
  { name: "Public Launch", date: "Sep 30", state: "later" },
];

function ProjectPlanVisual() {
  return (
    <div className="relative mx-auto max-w-md">
      <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(closest-side,rgba(188,0,4,0.16),transparent)] blur-2xl" />
      <div className="relative rounded-24 border border-tva-border/70 bg-white p-6 shadow-lg">
        <div className="flex items-start gap-3.5">
          <ProjectIcon icon="building" color="#bc0004" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-tva-ink">Client Portal</p>
            <p className="truncate text-[13px] text-tva-ink-m">Self-service portal for project status and documents</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-tva-success-lt px-2.5 py-1 text-[11.5px] font-semibold text-tva-success">Active</span>
          <span className="rounded-full bg-tva-warn-lt px-2.5 py-1 text-[11.5px] font-semibold text-[#b45309]">High priority</span>
          <span className="rounded-full bg-tva-surface px-2.5 py-1 text-[11.5px] font-semibold text-tva-ink-m">Due Sep 30</span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="font-medium text-tva-ink-m">Progress</span>
            <span className="font-semibold text-tva-ink">72%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-tva-surface">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#e3262a] to-tva-red"
              initial={{ width: 0 }}
              whileInView={{ width: "72%" }}
              viewport={inView}
              transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-2">
            {people.map((p) => <MiniAvatar key={p.name} name={p.name} color={p.color} size={30} />)}
          </div>
          <span className="text-[12.5px] text-tva-ink-m">4 members</span>
        </div>

        <div className="mt-5 border-t border-tva-border/50 pt-5">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-tva-ink-m">Milestones</p>
          <ul className="mt-3 flex flex-col gap-2">
            {milestones.map((m, i) => (
              <motion.li
                key={m.name}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={inView}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                className={cn(
                  "flex items-center gap-3 rounded-12 border px-3.5 py-3",
                  m.state === "next" ? "border-tva-red/30 bg-tva-red-xlt" : "border-tva-border/50 bg-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                    m.state === "done" && "border-tva-success bg-tva-success text-white",
                    m.state === "next" && "border-tva-red",
                    m.state === "later" && "border-tva-border",
                  )}
                >
                  {m.state === "done" && <Check size={11} strokeWidth={3.5} />}
                  {m.state === "next" && <span className="h-2 w-2 rounded-full bg-tva-red" />}
                </span>
                <span className={cn("flex-1 text-[14px] font-medium", m.state === "done" ? "text-tva-ink-m line-through" : "text-tva-ink")}>
                  {m.name}
                </span>
                <span className="text-[12.5px] text-tva-ink-m">{m.date}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Visual: the task table ── */

const statusClass: Record<string, string> = {
  "In Progress": "bg-tva-info-lt text-tva-info",
  "In Review": "bg-tva-warn-lt text-[#b45309]",
  "To Do": "bg-tva-surface text-tva-ink-m",
  Blocked: "bg-tva-error-lt text-tva-error",
  Done: "bg-tva-success-lt text-tva-success",
};

const priorityDot: Record<string, string> = {
  Critical: "bg-tva-error", High: "bg-tva-warn", Medium: "bg-tva-info", Low: "bg-tva-border",
};

const rows = [
  { title: "Offline sync for task lists", status: "In Progress", priority: "Critical", who: 0, due: "Today" },
  { title: "Invoice export to PDF", status: "In Review", priority: "High", who: 1, due: "Tomorrow" },
  { title: "Payment gateway sandbox access", status: "Blocked", priority: "High", who: 3, due: "Aug 14" },
  { title: "Set up client onboarding flow", status: "To Do", priority: "Medium", who: 3, due: "Aug 22" },
  { title: "Portal wireframes v3", status: "Done", priority: "High", who: 2, due: "Aug 12" },
];

function TaskTableVisual() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(closest-side,rgba(37,99,235,0.12),transparent)] blur-2xl" />
      <div className="relative overflow-hidden rounded-24 border border-tva-border/70 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-tva-border/50 px-5 py-4">
          <p className="text-[15px] font-semibold text-tva-ink">Tasks</p>
          <div className="flex rounded-12 border border-tva-border/60 bg-tva-surface p-0.5 text-[12px] font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-tva-ink-m"><LayoutGrid size={13} /> Board</span>
            <span className="flex items-center gap-1.5 rounded-[10px] bg-tva-red px-2.5 py-1.5 text-white"><List size={13} /> Table</span>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_64px] items-center gap-x-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-tva-ink-m">
          <span>Task</span>
          <span>Status</span>
          <span className="text-right">Due</span>
        </div>
        <ul>
          {rows.map((r, i) => (
            <motion.li
              key={r.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.09 }}
              className="grid grid-cols-[minmax(0,1fr)_auto_64px] items-center gap-x-4 border-t border-tva-border/40 px-5 py-3"
            >
              <span className="flex min-w-0 items-center gap-3">
                <MiniAvatar name={people[r.who].name} color={people[r.who].color} size={30} />
                <span className="min-w-0">
                  <span className={cn("block truncate text-[14px] font-medium", r.status === "Done" ? "text-tva-ink-m" : "text-tva-ink")}>{r.title}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-tva-ink-m">
                    <span className={cn("h-1.5 w-1.5 rounded-full", priorityDot[r.priority])} />
                    {r.priority}
                  </span>
                </span>
              </span>
              <span><span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold", statusClass[r.status])}>{r.status}</span></span>
              <span className={cn("text-right text-[13px] font-medium", r.due === "Today" ? "text-[#b45309]" : "text-tva-ink-m")}>{r.due}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Visual: timeline close-up (the same scene the tour uses) ── */

function TimelineVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, inView);
  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(closest-side,rgba(29,168,81,0.12),transparent)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[18px] border border-tva-border/70 bg-tva-surface shadow-lg sm:rounded-24">
        <ScaledStage width={SCENE.width} height={528}>
          {seen && <TimelineScene />}
        </ScaledStage>
      </div>
    </div>
  );
}

/* ── Visual: documents ── */

const docs = [
  { type: "PRD", tint: "bg-tva-red-lt text-tva-red", title: "Client Portal requirements", project: "Client Portal", icon: "building", color: "#bc0004", who: 3 },
  { type: "Spec", tint: "bg-tva-info-lt text-tva-info", title: "API Specification v2", project: "Mobile App v2.0", icon: "smartphone", color: "#2563eb", who: 0 },
  { type: "Design", tint: "bg-[#ede9fe] text-[#7c3aed]", title: "Portal wireframes v3", project: "Client Portal", icon: "building", color: "#bc0004", who: 2 },
  { type: "Meeting notes", tint: "bg-tva-warn-lt text-[#b45309]", title: "Sprint 14 planning", project: "Internal Dashboard", icon: "chart", color: "#1da851", who: 1 },
];

function DocumentsVisual() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(closest-side,rgba(124,58,237,0.12),transparent)] blur-2xl" />
      <div className="relative grid gap-3.5 sm:grid-cols-2">
        {docs.map((d, i) => (
          <motion.div
            key={d.title}
            initial={{ opacity: 0, y: 22, rotate: i % 2 ? 1.5 : -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={inView}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="rounded-[20px] border border-tva-border/70 bg-white p-5 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-12 bg-tva-surface text-tva-ink-m"><FileText size={18} /></span>
              <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold", d.tint)}>{d.type}</span>
            </div>
            <p className="mt-4 text-[15px] font-semibold leading-snug text-tva-ink">{d.title}</p>
            <div className="mt-2 flex flex-col gap-1.5" aria-hidden>
              <span className="h-1.5 w-full rounded-full bg-tva-surface" />
              <span className="h-1.5 w-4/5 rounded-full bg-tva-surface" />
              <span className="h-1.5 w-3/5 rounded-full bg-tva-surface" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-tva-border/40 pt-3.5">
              <span className="flex items-center gap-1.5 text-[12.5px] text-tva-ink-m"><ProjectIcon icon={d.icon} color={d.color} size="xs" />{d.project}</span>
              <MiniAvatar name={people[d.who].name} color={people[d.who].color} size={24} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Section ── */

const features: {
  eyebrow: string; title: string; body: string; points: string[];
  Visual: React.ComponentType; wide?: boolean;
}[] = [
  {
    eyebrow: "Projects and milestones",
    title: "Plan the work, then watch it land.",
    body: "Give every project an owner, a priority, dates and a team. Break delivery into milestones so everyone agrees on what done looks like.",
    points: ["Statuses from Planning through to Completed", "Milestones with their own due dates", "Each member has a role on the project"],
    Visual: ProjectPlanVisual,
  },
  {
    eyebrow: "Tasks",
    title: "A board for doing. A table for sorting.",
    body: "Drag cards across the board when you are in the flow, then flip to the table when you need to scan everything at once.",
    points: ["Six statuses, including In Review and Blocked", "Priorities from Low to Critical", "Comments and due dates on every task"],
    Visual: TaskTableVisual,
  },
  {
    eyebrow: "Timeline",
    title: "Every deadline in one line of sight.",
    body: "See how projects overlap across the months ahead, where the milestones fall and what is due next, without building a single chart.",
    points: ["All project schedules on one view", "Milestones marked on the dates they fall", "Progress shown inside every bar"],
    Visual: TimelineVisual,
    wide: true,
  },
  {
    eyebrow: "Documents",
    title: "Keep the spec next to the work.",
    body: "PRDs, specs, design notes, meeting notes and reports live inside the project they belong to, written in Markdown and found in seconds.",
    points: ["Six document types to keep things tidy", "Attached to the project they describe", "Included in global search"],
    Visual: DocumentsVisual,
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-tva-red">Features</p>
          <h2 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-tva-ink sm:text-[52px]">
            One place for the plan, the work and the proof.
          </h2>
        </Reveal>

        <div className="mt-20 flex flex-col gap-24 sm:mt-28 sm:gap-36">
          {features.map(({ eyebrow, title, body, points, Visual, wide }, i) => {
            const heading = (
              <>
                <p className="inline-flex items-center gap-2 rounded-full bg-tva-red-xlt px-3 py-1.5 text-[12.5px] font-semibold text-tva-red">
                  <span className="h-1.5 w-1.5 rounded-full bg-tva-red" />
                  {eyebrow}
                </p>
                <h3 className="mt-5 text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.025em] text-tva-ink sm:text-[40px]">
                  {title}
                </h3>
              </>
            );
            const list = (
              <ul className="mt-7 flex flex-col gap-3.5">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15.5px] text-tva-ink">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-tva-red text-white">
                      <Check size={12} strokeWidth={3.5} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            );

            // Wide features put the copy on top and give the visual the full width.
            if (wide) {
              return (
                <div key={eyebrow}>
                  <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-20">
                    <div>{heading}</div>
                    <div>
                      <p className="max-w-lg text-[17px] leading-relaxed text-tva-ink-m">{body}</p>
                      {list}
                    </div>
                  </Reveal>
                  <Reveal delay={0.1} className="mt-12 min-w-0">
                    <Visual />
                  </Reveal>
                </div>
              );
            }

            return (
              <div key={eyebrow} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <Reveal className={cn(i % 2 === 1 && "lg:order-2")}>
                  {heading}
                  <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-tva-ink-m">{body}</p>
                  {list}
                </Reveal>
                <Reveal delay={0.1} className={cn("min-w-0", i % 2 === 1 && "lg:order-1")}>
                  <Visual />
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
