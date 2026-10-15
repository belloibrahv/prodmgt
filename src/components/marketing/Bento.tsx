"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CheckSquare, FileText, FolderKanban, Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Donut, MiniAvatar, people } from "./demo/primitives";
import Reveal from "./Reveal";

const inView = { once: true, margin: "-100px" } as const;

const cell = "group relative flex flex-col overflow-hidden rounded-[28px] border border-tva-border/70 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg";

function CellText({ title, body }: { title: string; body: string }) {
  return (
    <div className="pb-7">
      <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-tva-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-tva-ink-m">{body}</p>
    </div>
  );
}

/* ── Search: types a query, then shows results across record types ── */

const QUERY = "portal";
const results = [
  { icon: FolderKanban, type: "Project", title: "Client Portal", sub: "Active · due Sep 30" },
  { icon: CheckSquare, type: "Task", title: "Portal wireframes v3", sub: "Client Portal · Done" },
  { icon: FileText, type: "Document", title: "Client Portal requirements", sub: "PRD · Client Portal" },
];

function SearchVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, inView);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!seen || typed >= QUERY.length) return;
    const t = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 500 : 130);
    return () => clearTimeout(t);
  }, [seen, typed]);

  const done = typed >= QUERY.length;

  return (
    <div ref={ref} className="mt-auto rounded-[20px] border border-tva-border/60 bg-tva-surface p-3">
      <div className="flex h-11 items-center gap-2.5 rounded-12 border border-tva-red bg-white px-3.5 text-[14px] text-tva-ink">
        <Search size={15} className="text-tva-ink-m" />
        <span>{QUERY.slice(0, typed)}</span>
        <motion.span
          aria-hidden
          className="-ml-2 h-4 w-px bg-tva-red"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
      <ul className="mt-2 flex flex-col gap-1">
        {results.map((r, i) => (
          <motion.li
            key={r.title}
            initial={false}
            animate={{ opacity: done ? 1 : 0, y: done ? 0 : 8 }}
            transition={{ duration: 0.35, delay: done ? 0.1 + i * 0.1 : 0 }}
            className={cn("flex items-center gap-3 rounded-12 px-3 py-2.5", i === 0 && "bg-white shadow-sm")}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-8 bg-tva-red-xlt text-tva-red"><r.icon size={15} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold text-tva-ink">{r.title}</span>
              <span className="block truncate text-[12px] text-tva-ink-m">{r.sub}</span>
            </span>
            <span className="text-[11px] font-medium text-tva-ink-m">{r.type}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ── Roles ── */

const roles = [
  { role: "Owner", who: 3, tint: "bg-tva-red text-white" },
  { role: "Admin", who: 0, tint: "bg-tva-red-lt text-tva-red" },
  { role: "Member", who: 1, tint: "bg-tva-info-lt text-tva-info" },
  { role: "Viewer", who: 2, tint: "bg-tva-surface text-tva-ink-m" },
];

function RolesVisual() {
  return (
    <ul className="mt-auto flex flex-col gap-2">
      {roles.map((r, i) => (
        <motion.li
          key={r.role}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={inView}
          transition={{ duration: 0.45, delay: i * 0.09 }}
          className="flex items-center gap-3 rounded-12 border border-tva-border/50 bg-white px-3 py-2.5"
        >
          <MiniAvatar name={people[r.who].name} color={people[r.who].color} size={30} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold text-tva-ink">{people[r.who].name}</span>
            <span className="block truncate text-[12px] text-tva-ink-m">{people[r.who].role}</span>
          </span>
          <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold", r.tint)}>{r.role}</span>
        </motion.li>
      ))}
    </ul>
  );
}

/* ── Reports ring ── */

function ReportVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, inView);
  return (
    <div ref={ref} className="flex items-center gap-6">
      <div className="h-[132px] w-[132px] flex-shrink-0">
        {seen && (
          <Donut segments={[{ value: 78, color: "#bc0004" }, { value: 22, color: "#ffdad6" }]} size={132} stroke={16}>
            <span className="text-[28px] font-bold leading-none text-tva-ink">78%</span>
            <span className="mt-1 text-[11px] text-tva-ink-m">completion</span>
          </Donut>
        )}
      </div>
      <ul className="flex flex-1 flex-col gap-3">
        {([["Done", 49, "#1da851"], ["In Progress", 14, "#2563eb"], ["Blocked", 4, "#e53935"]] as const).map(([label, value, color], i) => (
          <li key={label}>
            <span className="flex justify-between text-[12.5px]">
              <span className="text-tva-ink-m">{label}</span>
              <span className="font-semibold text-tva-ink">{value}</span>
            </span>
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-tva-surface">
              <motion.span
                className="block h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(value / 49) * 100}%` }}
                viewport={inView}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.12, ease: "easeOut" }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Workload ── */

function WorkloadVisual() {
  const loads = [8, 6, 4, 7];
  return (
    <div className="mt-auto flex h-[150px] items-end gap-4">
      {people.map((p, i) => (
        <div key={p.name} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[12px] font-semibold text-tva-ink">{loads[i]}</span>
          <motion.span
            className="w-full rounded-12"
            style={{ backgroundColor: p.color, opacity: 0.9 }}
            initial={{ height: 0 }}
            whileInView={{ height: loads[i] * 11 }}
            viewport={inView}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <MiniAvatar name={p.name} color={p.color} size={26} />
        </div>
      ))}
    </div>
  );
}

/* ── Activity ── */

const feed = [
  { who: 1, text: "moved Invoice export to In Review", time: "2m ago" },
  { who: 2, text: "added the document Portal wireframes v3", time: "18m ago" },
  { who: 3, text: "completed the milestone Design Handoff", time: "1h ago" },
  { who: 0, text: "created the project Billing Integration", time: "3h ago" },
];

function ActivityVisual() {
  return (
    <ul className="relative mt-auto flex flex-col gap-4">
      <span aria-hidden className="absolute bottom-3 left-[14px] top-3 w-px bg-tva-border/70" />
      {feed.map((f, i) => (
        <motion.li
          key={f.text}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.45, delay: i * 0.12 }}
          className="relative flex items-start gap-3"
        >
          <MiniAvatar name={people[f.who].name} color={people[f.who].color} size={29} />
          <span className="flex-1 text-[13.5px] leading-snug text-tva-ink-m">
            <span className="font-semibold text-tva-ink">{people[f.who].name.split(" ")[0]}</span> {f.text}
            <span className="mt-0.5 block text-[12px]">{f.time}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

/* ── Invite ── */

function InviteVisual() {
  return (
    <div className="mt-auto rounded-[20px] border border-tva-border/60 bg-tva-surface p-4">
      <div className="flex h-11 items-center gap-2.5 rounded-12 border border-tva-border/70 bg-white px-3.5 text-[13.5px] text-tva-ink">
        <Mail size={15} className="flex-shrink-0 text-tva-ink-m" />
        <span className="truncate">colleague@company.com</span>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="flex h-11 flex-1 items-center justify-between rounded-12 border border-tva-border/70 bg-white px-3.5 text-[13.5px] text-tva-ink">
          Member
          <span className="text-tva-ink-m">▾</span>
        </span>
        <motion.span
          whileInView={{ scale: [1, 1.06, 1] }}
          viewport={inView}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex h-11 items-center rounded-full bg-tva-red px-5 text-[13.5px] font-semibold text-white"
        >
          Send invite
        </motion.span>
      </div>
    </div>
  );
}

export default function Bento() {
  return (
    <section className="border-y border-tva-border/50 bg-white/50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-tva-red">And the rest</p>
          <h2 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-tva-ink sm:text-[52px]">
            The small things that keep a team moving.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <div className={cn(cell, "h-full")}>
              <CellText title="Find anything in a few keystrokes" body="One search box covers projects, tasks and documents, so nobody has to remember where something was filed." />
              <SearchVisual />
            </div>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-2">
            <div className={cn(cell, "h-full")}>
              <CellText title="Roles on every project" body="Owner, Admin, Member or Viewer. Everyone on a project has a clear role." />
              <RolesVisual />
            </div>
          </Reveal>
          <Reveal className="md:col-span-2">
            <div className={cn(cell, "h-full")}>
              <CellText title="Balanced workload" body="See how many open tasks each person is carrying before you assign the next one." />
              <WorkloadVisual />
            </div>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-2">
            <div className={cn(cell, "h-full")}>
              <CellText title="A running record" body="The activity feed shows who changed what, across every project." />
              <ActivityVisual />
            </div>
          </Reveal>
          <Reveal delay={0.16} className="md:col-span-2">
            <div className={cn(cell, "h-full")}>
              <CellText title="Bring the team in" body="Invite colleagues by email and add them to the projects they work on." />
              <InviteVisual />
            </div>
          </Reveal>
          <Reveal className="md:col-span-6">
            <div className={cn(cell, "md:flex-row md:items-center md:gap-14")}>
              <div className="md:flex-1 md:[&>div]:pb-0">
                <CellText title="Reports that are already written" body="Completion rate, tasks by status and priority, project health and team performance are calculated from the work itself. Open the page and the numbers are there." />
              </div>
              <div className="md:w-[420px]">
                <ReportVisual />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
