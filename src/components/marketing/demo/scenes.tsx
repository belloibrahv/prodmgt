"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle, Check, Plus,
  LayoutGrid, List, CalendarDays, MessageSquare, TrendingUp, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp, Donut, MiniAvatar, people, projects } from "./primitives";

const card = "rounded-16 border border-tva-border/60 bg-white shadow-sm";

function SceneHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-[20px] font-semibold leading-tight text-tva-ink">{title}</h3>
        <p className="mt-0.5 text-[12px] text-tva-ink-m">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

/* ───────────────────────── Dashboard ───────────────────────── */

const stats = [
  { label: "Total Projects", value: 12, note: "5 active", noteClass: "text-tva-success", icon: FolderKanban, tint: "bg-tva-red-lt text-tva-red" },
  { label: "Completed", value: 4, note: "On track", noteClass: "text-tva-success", icon: CheckCircle2, tint: "bg-tva-success-lt text-tva-success" },
  { label: "Open Tasks", value: 37, note: "86 total", noteClass: "text-tva-ink-m", icon: Clock, tint: "bg-tva-info-lt text-tva-info" },
  { label: "Overdue Tasks", value: 2, note: "Needs attention", noteClass: "text-tva-error", icon: AlertTriangle, tint: "bg-tva-error-lt text-tva-error" },
];

const statusSegments = [
  { label: "Active", value: 5, color: "#bc0004" },
  { label: "Completed", value: 4, color: "#1da851" },
  { label: "Planning", value: 2, color: "#2563eb" },
  { label: "On hold", value: 1, color: "#f59e0b" },
];

const trendPath = "M0,92 C28,86 40,70 66,72 C92,74 104,50 132,52 C160,54 170,34 198,30 C222,27 236,16 262,10";

const activity = [
  { who: 1, text: "moved Invoice export to In Review", time: "2m" },
  { who: 2, text: "uploaded Portal wireframes v3", time: "18m" },
  { who: 3, text: "completed milestone Design Handoff", time: "1h" },
];

export function DashboardScene() {
  return (
    <div className="h-full w-full p-6">
      <SceneHeader title="Welcome back, Akin 👋" subtitle="Here’s what’s happening across your projects" />

      <div className="grid grid-cols-4 gap-3.5">
        {stats.map(({ label, value, note, noteClass, icon: Icon, tint }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={cn(card, "flex items-start gap-3 p-4")}
          >
            <span className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-12", tint)}>
              <Icon size={19} />
            </span>
            <span className="flex flex-col">
              <span className="text-[11px] font-medium text-tva-ink-m">{label}</span>
              <span className="text-[26px] font-bold leading-tight text-tva-ink"><CountUp to={value} /></span>
              <span className={cn("text-[10.5px] font-medium", noteClass)}>{note}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-3.5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cn(card, "p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Project Status Distribution</p>
          <div className="mt-3 flex items-center gap-4">
            <Donut segments={statusSegments} size={112} stroke={15}>
              <span className="text-[20px] font-bold leading-none text-tva-ink">12</span>
              <span className="text-[9.5px] text-tva-ink-m">projects</span>
            </Donut>
            <ul className="flex flex-col gap-1.5">
              {statusSegments.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-[11px] text-tva-ink-m">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                  <span className="font-semibold text-tva-ink">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className={cn(card, "p-4")}>
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-tva-ink">Task Completion (30 Days)</p>
            <span className="flex items-center gap-1 rounded-full bg-tva-success-lt px-2 py-0.5 text-[10px] font-semibold text-tva-success">
              <TrendingUp size={10} /> 49 done
            </span>
          </div>
          <svg viewBox="0 0 262 104" className="mt-3 h-[112px] w-full overflow-visible">
            <defs>
              <linearGradient id="tva-trend-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#bc0004" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#bc0004" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[26, 52, 78].map((y) => (
              <line key={y} x1="0" x2="262" y1={y} y2={y} stroke="#ddc8c8" strokeOpacity="0.5" strokeDasharray="3 4" />
            ))}
            <motion.path
              d={`${trendPath} L262,104 L0,104 Z`}
              fill="url(#tva-trend-fill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            />
            <motion.path
              d={trendPath}
              fill="none"
              stroke="#bc0004"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
            />
            <motion.circle
              cx="262" cy="10" r="4" fill="#fff" stroke="#bc0004" strokeWidth="2.5"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 }}
            />
          </svg>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} className={cn(card, "p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Team Workload</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {people.map((p, i) => {
              const load = [82, 64, 47, 71][i];
              return (
                <li key={p.name} className="flex items-center gap-2.5">
                  <MiniAvatar name={p.name} color={p.color} size={22} />
                  <span className="w-[52px] truncate text-[11px] font-medium text-tva-ink">{p.name.split(" ")[0]}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-tva-surface">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ backgroundColor: p.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${load}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                    />
                  </span>
                  <span className="w-5 text-right text-[10.5px] text-tva-ink-m">{Math.round(load / 9)}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>

      <div className="mt-3.5 grid grid-cols-5 gap-3.5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className={cn(card, "col-span-3 p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Active Projects</p>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {projects.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-8 text-[15px]" style={{ backgroundColor: `${p.color}14` }}>{p.emoji}</span>
                <span className="w-[136px] truncate text-[12px] font-semibold text-tva-ink">{p.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-tva-surface">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.9, delay: 0.7 + i * 0.12, ease: "easeOut" }}
                  />
                </span>
                <span className="w-8 text-right text-[11px] font-semibold text-tva-ink">{p.progress}%</span>
                <span className="w-12 text-right text-[10.5px] text-tva-ink-m">{p.due}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }} className={cn(card, "col-span-2 p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Recent Activity</p>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {activity.map((a, i) => (
              <motion.li
                key={a.text}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.15 }}
                className="flex items-start gap-2"
              >
                <MiniAvatar name={people[a.who].name} color={people[a.who].color} size={22} />
                <span className="flex-1 text-[11px] leading-snug text-tva-ink-m">
                  <span className="font-semibold text-tva-ink">{people[a.who].name.split(" ")[0]}</span> {a.text}
                </span>
                <span className="text-[10px] text-tva-ink-m">{a.time}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────── Board ───────────────────────── */

const columns = [
  { label: "To Do", dot: "#6b4f4f" },
  { label: "In Progress", dot: "#2563eb" },
  { label: "In Review", dot: "#f59e0b" },
  { label: "Done", dot: "#1da851" },
];

const priorityClass: Record<string, string> = {
  Critical: "bg-tva-error-lt text-tva-error",
  High: "bg-tva-warn-lt text-[#b45309]",
  Medium: "bg-tva-info-lt text-tva-info",
  Low: "bg-tva-surface text-tva-ink-m",
};

interface BoardTask { title: string; project: number; priority: string; who: number; due: string; comments: number }

const boardTasks: Record<string, BoardTask> = {
  t1: { title: "Set up client onboarding flow", project: 0, priority: "Medium", who: 3, due: "Aug 22", comments: 2 },
  t2: { title: "Push notification settings", project: 1, priority: "Low", who: 1, due: "Aug 28", comments: 0 },
  t3: { title: "Invoice export to PDF", project: 0, priority: "High", who: 1, due: "Tomorrow", comments: 4 },
  t4: { title: "Offline sync for task lists", project: 1, priority: "Critical", who: 0, due: "Today", comments: 6 },
  t5: { title: "Portal wireframes v3", project: 0, priority: "High", who: 2, due: "Aug 12", comments: 3 },
  t6: { title: "Define analytics events", project: 2, priority: "Medium", who: 3, due: "Aug 8", comments: 1 },
};

const initialBoard = [["t1", "t2"], ["t3", "t4"], ["t5"], ["t6"]];

const COL_W = 207;
const COL_GAP = 16;
const CARD_H = 104;
const CARD_GAP = 10;
const COL_HEAD = 46;

function taskPosition(board: string[][], id: string) {
  const col = board.findIndex((c) => c.includes(id));
  const row = board[col].indexOf(id);
  return { col, x: col * (COL_W + COL_GAP) + 8, y: COL_HEAD + row * (CARD_H + CARD_GAP) };
}

function moveTask(board: string[][], id: string, to: number) {
  return board.map((ids, i) => {
    const rest = ids.filter((t) => t !== id);
    return i === to ? [...rest, id] : rest;
  });
}

export function BoardScene({ autoplay = true }: { autoplay?: boolean }) {
  const [board, setBoard] = useState(initialBoard);
  const [held, setHeld] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopScript = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setHeld(null);
    setCursor(null);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    const drag = (start: number, id: string, to: number, message: string) => {
      at(start, () => setCursor(id));
      at(start + 800, () => setHeld(id));
      at(start + 1150, () => setBoard((b) => moveTask(b, id, to)));
      at(start + 2000, () => { setHeld(null); setToast(message); });
    };
    drag(700, "t3", 2, "Invoice export to PDF moved to In Review");
    drag(3700, "t5", 3, "Portal wireframes v3 marked Done");
    at(6600, () => { setCursor(null); setToast(null); });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [autoplay]);

  function advance(id: string) {
    stopScript();
    const { col } = taskPosition(board, id);
    if (col >= columns.length - 1) return;
    setBoard((b) => moveTask(b, id, col + 1));
    setToast(`${boardTasks[id].title} moved to ${columns[col + 1].label}`);
  }

  const cursorPos = cursor ? taskPosition(board, cursor) : null;

  return (
    <div className="h-full w-full p-6">
      <SceneHeader title="Tasks" subtitle="Click any card to move it forward">
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-12 border border-tva-border/60 bg-white p-0.5 text-[11.5px] font-medium">
            <span className="flex items-center gap-1.5 rounded-[10px] bg-tva-red px-2.5 py-1.5 text-white"><LayoutGrid size={12} /> Board</span>
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-tva-ink-m"><List size={12} /> Table</span>
          </div>
          <span className="flex items-center gap-1.5 rounded-12 bg-tva-red px-3 py-2 text-[11.5px] font-semibold text-white">
            <Plus size={13} /> New task
          </span>
        </div>
      </SceneHeader>

      <div className="relative h-[486px]">
        {columns.map((col, i) => (
          <div
            key={col.label}
            className="absolute top-0 h-full rounded-16 border border-tva-border/40 bg-white/60"
            style={{ left: i * (COL_W + COL_GAP), width: COL_W }}
          >
            <div className="flex h-[46px] items-center justify-between px-3.5">
              <span className="flex items-center gap-2 text-[12px] font-semibold text-tva-ink">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.dot }} />
                {col.label}
              </span>
              <span className="rounded-full bg-tva-surface px-2 py-0.5 text-[10.5px] font-semibold text-tva-ink-m">{board[i].length}</span>
            </div>
          </div>
        ))}

        {Object.entries(boardTasks).map(([id, task]) => {
          const { x, y, col } = taskPosition(board, id);
          const isHeld = held === id;
          const project = projects[task.project];
          const done = col === columns.length - 1;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => advance(id)}
              aria-label={`Move ${task.title} forward`}
              initial={false}
              animate={{
                x, y,
                scale: isHeld ? 1.04 : 1,
                rotate: isHeld ? 2 : 0,
                boxShadow: isHeld ? "0 18px 36px rgba(32,26,26,.22)" : "0 1px 3px rgba(32,26,26,.08)",
              }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="absolute left-0 top-0 flex cursor-pointer flex-col justify-between rounded-12 border border-tva-border/60 bg-white p-3 text-left hover:border-tva-red/50"
              style={{ width: COL_W - 16, height: CARD_H, zIndex: isHeld ? 20 : 1 }}
            >
              <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-tva-ink-m">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                {project.emoji} {project.name}
              </span>
              <span className={cn("line-clamp-2 text-[12px] font-semibold leading-snug text-tva-ink", done && "text-tva-ink-m")}>
                {task.title}
              </span>
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {done ? (
                    <span className="flex items-center gap-1 rounded-full bg-tva-success-lt px-1.5 py-0.5 text-[9.5px] font-semibold text-tva-success">
                      <Check size={9} strokeWidth={3} /> Done
                    </span>
                  ) : (
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold", priorityClass[task.priority])}>{task.priority}</span>
                  )}
                  {task.comments > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-tva-ink-m"><MessageSquare size={10} /> {task.comments}</span>
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-tva-ink-m"><CalendarDays size={10} /> {task.due}</span>
                  <MiniAvatar name={people[task.who].name} color={people[task.who].color} size={20} />
                </span>
              </span>
            </motion.button>
          );
        })}

        <AnimatePresence>
          {cursorPos && (
            <motion.div
              key="cursor"
              className="pointer-events-none absolute left-0 top-0 z-30"
              initial={{ opacity: 0, x: 420, y: 420 }}
              animate={{ opacity: 1, x: cursorPos.x + 128, y: cursorPos.y + 58, scale: held ? 0.9 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                <path d="M2 2l6.5 18 2.8-7.2L19 10 2 2z" fill="#201a1a" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-3 left-3 z-30 flex items-center gap-2 rounded-12 bg-tva-ink px-3.5 py-2.5 text-[11.5px] font-medium text-white shadow-lg"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-tva-success"><Check size={10} strokeWidth={3} /></span>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────── Timeline ───────────────────────── */

const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const MONTH_W = 110;
const LABEL_W = 216;

const schedule = [
  { name: "Client Portal", emoji: "🏢", color: "#bc0004", start: 0, end: 4, progress: 72, milestones: [{ at: 1.5, label: "Design Handoff", done: true }, { at: 3, label: "Beta Launch", done: false }] },
  { name: "Mobile App v2.0", emoji: "📱", color: "#2563eb", start: 0, end: 2.5, progress: 48, milestones: [{ at: 2.1, label: "Store review", done: false }] },
  { name: "Website Refresh", emoji: "🌐", color: "#b45309", start: 1, end: 3.4, progress: 60, milestones: [] },
  { name: "Internal Dashboard", emoji: "📊", color: "#1da851", start: 2, end: 6, progress: 18, milestones: [{ at: 4.6, label: "Pilot", done: false }] },
  { name: "Billing Integration", emoji: "💳", color: "#7c3aed", start: 3.2, end: 5.6, progress: 0, milestones: [] },
];

const TODAY = 2.3;

export function TimelineScene() {
  return (
    <div className="h-full w-full p-6">
      <SceneHeader title="Timeline" subtitle="Project schedules and milestones">
        <div className="flex items-center gap-4 text-[11px] text-tva-ink-m">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rotate-45 bg-tva-ink" /> Milestone</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-tva-red" /> Today</span>
        </div>
      </SceneHeader>

      <div className={cn(card, "relative overflow-hidden")}>
        <div className="flex h-10 border-b border-tva-border/50 bg-[#fbf8f8] text-[11px] font-semibold text-tva-ink-m">
          <span className="flex items-center px-4" style={{ width: LABEL_W }}>Project</span>
          {months.map((m) => (
            <span key={m} className="flex items-center border-l border-tva-border/40 px-3" style={{ width: MONTH_W }}>{m}</span>
          ))}
        </div>

        {schedule.map((row, i) => (
          <div key={row.name} className="flex h-[76px] items-center border-b border-tva-border/30 last:border-b-0">
            <div className="flex items-center gap-2.5 px-4" style={{ width: LABEL_W }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-8 text-[15px]" style={{ backgroundColor: `${row.color}14` }}>{row.emoji}</span>
              <span>
                <span className="block text-[12px] font-semibold text-tva-ink">{row.name}</span>
                <span className="block text-[10.5px] text-tva-ink-m">{row.progress}% complete</span>
              </span>
            </div>
            <div className="relative h-full flex-1">
              {months.map((m, j) => (
                <span key={m} className="absolute top-0 h-full border-l border-tva-border/30" style={{ left: j * MONTH_W }} />
              ))}
              <motion.div
                className="absolute top-6 h-7 origin-left overflow-hidden rounded-full"
                style={{ left: row.start * MONTH_W + 4, width: (row.end - row.start) * MONTH_W - 8, backgroundColor: `${row.color}26` }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="block h-full rounded-full"
                  style={{ backgroundColor: row.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${row.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.9 + i * 0.14, ease: "easeOut" }}
                />
              </motion.div>
              {row.milestones.map((ms) => (
                <div key={ms.label} className="absolute top-1/2 z-10 -translate-x-1/2" style={{ left: ms.at * MONTH_W }}>
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + i * 0.14 }}
                  >
                    <span className={cn("-mt-[7px] h-3.5 w-3.5 rotate-45 border-2 border-white shadow-sm", ms.done ? "bg-tva-success" : "bg-tva-ink")} />
                    <span className="mt-2.5 whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[9.5px] font-semibold text-tva-ink shadow-sm">{ms.label}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <motion.div
          className="pointer-events-none absolute bottom-0 top-10 z-20 w-0.5 origin-top bg-tva-red"
          style={{ left: LABEL_W + TODAY * MONTH_W }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-tva-red px-1.5 py-0.5 text-[9px] font-semibold text-white">Today</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────── Reports ───────────────────────── */

const kpis = [
  { label: "Completion Rate", value: 78, suffix: "%", icon: CheckCircle2, tint: "bg-tva-success-lt text-tva-success" },
  { label: "Active Projects", value: 5, suffix: "", icon: FolderKanban, tint: "bg-tva-red-lt text-tva-red" },
  { label: "Team Members", value: 9, suffix: "", icon: Users, tint: "bg-tva-info-lt text-tva-info" },
  { label: "Overdue Tasks", value: 2, suffix: "", icon: AlertTriangle, tint: "bg-tva-error-lt text-tva-error" },
];

const byStatus = [
  { label: "Done", value: 49, color: "#1da851" },
  { label: "In Progress", value: 14, color: "#2563eb" },
  { label: "In Review", value: 8, color: "#f59e0b" },
  { label: "To Do", value: 11, color: "#6b4f4f" },
  { label: "Blocked", value: 4, color: "#e53935" },
];

const byPriority = [
  { label: "Critical", value: 9, color: "#e53935" },
  { label: "High", value: 24, color: "#f59e0b" },
  { label: "Medium", value: 35, color: "#2563eb" },
  { label: "Low", value: 18, color: "#ddc8c8" },
];

export function ReportsScene() {
  const maxStatus = Math.max(...byStatus.map((s) => s.value));
  return (
    <div className="h-full w-full p-6">
      <SceneHeader title="Reports" subtitle="Delivery health across every project" />

      <div className="grid grid-cols-4 gap-3.5">
        {kpis.map(({ label, value, suffix, icon: Icon, tint }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={cn(card, "flex items-center gap-3 p-4")}
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-12", tint)}><Icon size={19} /></span>
            <span className="flex flex-col">
              <span className="text-[24px] font-bold leading-tight text-tva-ink"><CountUp to={value} suffix={suffix} /></span>
              <span className="text-[11px] font-medium text-tva-ink-m">{label}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3.5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cn(card, "h-[190px] p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Tasks by Status</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {byStatus.map((s, i) => (
              <li key={s.label} className="flex items-center gap-3">
                <span className="w-[72px] text-[11px] text-tva-ink-m">{s.label}</span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-tva-surface">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / maxStatus) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  />
                </span>
                <span className="w-6 text-right text-[11px] font-semibold text-tva-ink">{s.value}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className={cn(card, "h-[190px] p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Tasks by Priority</p>
          <div className="mt-2 flex items-center gap-8 pl-4">
            <Donut segments={byPriority} size={128} stroke={18}>
              <span className="text-[22px] font-bold leading-none text-tva-ink">86</span>
              <span className="text-[10px] text-tva-ink-m">tasks</span>
            </Donut>
            <ul className="flex flex-col gap-2">
              {byPriority.map((p) => (
                <li key={p.label} className="flex items-center gap-2 text-[11.5px] text-tva-ink-m">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="w-14">{p.label}</span>
                  <span className="font-semibold text-tva-ink">{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} className={cn(card, "h-[176px] p-4")}>
          <p className="text-[12.5px] font-semibold text-tva-ink">Project Health</p>
          <ul className="mt-3 flex flex-col gap-3">
            {projects.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="text-[14px]">{p.emoji}</span>
                <span className="w-[128px] truncate text-[11.5px] font-semibold text-tva-ink">{p.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-tva-surface">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + i * 0.1, ease: "easeOut" }}
                  />
                </span>
                <span className="w-8 text-right text-[11px] font-semibold text-tva-ink">{p.progress}%</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }} className={cn(card, "h-[176px] p-4")}>
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-tva-ink">Team Performance</p>
            <span className="text-[10.5px] text-tva-ink-m">Tasks completed</span>
          </div>
          <div className="mt-3 flex h-[112px] items-end justify-around gap-4 px-2">
            {people.map((p, i) => {
              const done = [16, 13, 9, 11][i];
              return (
                <div key={p.name} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10.5px] font-semibold text-tva-ink">{done}</span>
                  <motion.span
                    className="w-full max-w-[44px] rounded-t-8"
                    style={{ backgroundColor: p.color }}
                    initial={{ height: 0 }}
                    animate={{ height: done * 4.6 }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                  />
                  <span className="text-[10px] text-tva-ink-m">{p.name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
