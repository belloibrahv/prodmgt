"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, CheckSquare, CalendarRange,
  FileText, Users, BarChart3, Search, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample workspace used across the marketing visuals. None of it is live data.
export const people = [
  { name: "Akin Adeyemi", role: "Lead Engineer", color: "#bc0004" },
  { name: "Fatima Bello", role: "Frontend Developer", color: "#2563eb" },
  { name: "Chidi Okafor", role: "UI/UX Designer", color: "#1da851" },
  { name: "Ngozi Eze", role: "Product Manager", color: "#b45309" },
];

export const projects = [
  { name: "Client Portal", emoji: "building", color: "#bc0004", progress: 72, status: "Active", due: "Sep 30" },
  { name: "Mobile App v2.0", emoji: "smartphone", color: "#2563eb", progress: 48, status: "Active", due: "Aug 15" },
  { name: "Internal Dashboard", emoji: "chart", color: "#1da851", progress: 18, status: "Planning", due: "Nov 30" },
];

/**
 * Renders children on a fixed-size canvas and scales it to the container
 * width, so product scenes keep their exact proportions at any size.
 */
export function ScaledStage({
  width, height, children, className,
}: { width: number; height: number; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left transition-opacity duration-300"
        style={{ width, height, transform: `scale(${scale ?? 1})`, opacity: scale === null ? 0 : 1 }}
      >
        {children}
      </div>
    </div>
  );
}

export function MiniAvatar({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, to, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [to, suffix]);
  return <span ref={ref}>{`${to}${suffix}`}</span>;
}

export function Donut({
  segments, size = 120, stroke = 16, children,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f7f2f2" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dashoffset = -offset;
          offset += len;
          return (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDashoffset={dashoffset}
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: `${Math.max(len - 2, 0)} ${c}` }}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.15, ease: "easeOut" }}
            />
          );
        })}
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
    </div>
  );
}

export type DemoView = "dashboard" | "tasks" | "timeline" | "reports";

const navItems: { label: string; icon: typeof LayoutDashboard; view?: DemoView }[] = [
  { label: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
  { label: "Projects", icon: FolderKanban },
  { label: "Tasks", icon: CheckSquare, view: "tasks" },
  { label: "Timeline", icon: CalendarRange, view: "timeline" },
  { label: "Documents", icon: FileText },
  { label: "Team", icon: Users },
  { label: "Reports", icon: BarChart3, view: "reports" },
];

export const FRAME = { width: 1120, height: 700 };
export const SCENE = { width: 924, height: 608 };

/** The product window: title bar, sidebar and top bar around a 924×608 scene. */
export function AppFrame({
  view, onNavigate, children,
}: { view: DemoView; onNavigate?: (view: DemoView) => void; children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="relative flex h-10 flex-shrink-0 items-center border-b border-tva-border/50 bg-[#fbf8f8] px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e9d5d5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e9d5d5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e9d5d5]" />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-medium text-tva-ink-m">
          TechVaults Project Manager
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[196px] flex-shrink-0 flex-col border-r border-tva-border/50 bg-white">
          <div className="flex h-[52px] items-center border-b border-tva-border/40 px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/TechVaults-Logo-b2.png" alt="" className="h-7 w-auto" />
          </div>
          <nav className="flex flex-col gap-0.5 p-2">
            {navItems.map(({ label, icon: Icon, view: target }) => {
              const active = target === view;
              const clickable = Boolean(target && onNavigate);
              return (
                <button
                  key={label}
                  type="button"
                  tabIndex={clickable ? 0 : -1}
                  onClick={() => target && onNavigate?.(target)}
                  className={cn(
                    "flex items-center gap-3 rounded-12 px-3 py-2 text-left text-[13px] font-medium transition-colors duration-200",
                    active ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m",
                    clickable && !active && "hover:bg-tva-red-xlt hover:text-tva-red",
                    !clickable && "cursor-default",
                  )}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-tva-surface">
          <div className="flex h-[52px] flex-shrink-0 items-center justify-between border-b border-tva-border/40 bg-white px-6">
            <div className="flex h-8 w-[280px] items-center gap-2 rounded-full border border-tva-border/60 bg-tva-surface px-3 text-[12px] text-tva-ink-m">
              <Search size={13} />
              Search projects, tasks…
            </div>
            <div className="flex items-center gap-4">
              <span className="relative text-tva-ink-m">
                <Bell size={16} />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-tva-red ring-2 ring-white" />
              </span>
              <MiniAvatar name={people[0].name} color={people[0].color} size={28} />
            </div>
          </div>
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
