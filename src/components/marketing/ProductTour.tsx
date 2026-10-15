"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue,
  useMotionValueEvent, useReducedMotion, useTransform, type MotionValue,
} from "framer-motion";
import { BarChart3, CalendarRange, CheckSquare, LayoutDashboard, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppFrame, FRAME, ScaledStage, type DemoView } from "./demo/primitives";
import { BoardScene, DashboardScene, ReportsScene, TimelineScene } from "./demo/scenes";
import Reveal from "./Reveal";

const CHAPTER_MS = 8000;

const chapters: { view: DemoView; icon: typeof LayoutDashboard; title: string; body: string; Scene: React.ComponentType }[] = [
  {
    view: "dashboard",
    icon: LayoutDashboard,
    title: "Start with the whole picture",
    body: "Projects, open work, overdue tasks and team load, all on one dashboard the moment you sign in.",
    Scene: DashboardScene,
  },
  {
    view: "tasks",
    icon: CheckSquare,
    title: "Move work forward",
    body: "Drag tasks across the board from To Do to Done. Try it here: click any card to advance it.",
    Scene: BoardScene,
  },
  {
    view: "timeline",
    icon: CalendarRange,
    title: "See every deadline",
    body: "Schedules and milestones for every project sit on one timeline, so clashes show up early.",
    Scene: TimelineScene,
  },
  {
    view: "reports",
    icon: BarChart3,
    title: "Report without spreadsheets",
    body: "Completion rate, project health and team performance are always current. No exports to stitch together.",
    Scene: ReportsScene,
  },
];

const clock = (s: number) => `0:${String(s).padStart(2, "0")}`;

function Segment({ state, progress }: { state: "past" | "active" | "future"; progress: MotionValue<number> }) {
  return (
    <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
      {state === "active" ? (
        <motion.span className="block h-full origin-left rounded-full bg-white" style={{ scaleX: progress }} />
      ) : (
        <span className={cn("block h-full rounded-full bg-white", state === "future" && "opacity-0")} />
      )}
    </span>
  );
}

export default function ProductTour() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });
  const inView = useInView(ref, { amount: 0.25 });
  const reduceMotion = useReducedMotion();

  const [chapter, setChapter] = useState(0);
  const [paused, setPaused] = useState<boolean | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [hovering, setHovering] = useState(false);
  const chapterRef = useRef(0);
  const elapsed = useMotionValue(0);
  const progress = useTransform(elapsed, (v) => v / CHAPTER_MS);

  // Autoplay by default, unless the visitor prefers reduced motion.
  const playing = paused === null ? !reduceMotion : !paused;

  function goTo(index: number) {
    chapterRef.current = index;
    elapsed.set(0);
    setChapter(index);
  }

  useAnimationFrame((_, delta) => {
    // Hold the current chapter while the visitor is exploring the product window.
    if (!playing || !inView || hovering) return;
    const next = elapsed.get() + Math.min(delta, 100);
    if (next >= CHAPTER_MS) goTo((chapterRef.current + 1) % chapters.length);
    else elapsed.set(next);
  });

  useMotionValueEvent(elapsed, "change", (v) => {
    const s = Math.floor((chapterRef.current * CHAPTER_MS + v) / 1000);
    setSeconds((prev) => (prev === s ? prev : s));
  });

  const { Scene, view } = chapters[chapter];
  const total = (chapters.length * CHAPTER_MS) / 1000;

  return (
    <section id="tour" className="relative scroll-mt-20 overflow-hidden bg-tva-ink py-24 text-white sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(188,0,4,0.45),transparent)] blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#ff8f8a]">Product tour</p>
          <h2 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[52px]">
            Watch a project go from plan to shipped.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/65">
            Four chapters, thirty-two seconds. It plays on its own, or you can take over and click around.
          </p>
        </Reveal>

        <div ref={ref} className="mt-14 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <ol className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-2.5">
            {chapters.map((c, i) => {
              const active = i === chapter;
              return (
                <li key={c.view}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "relative w-full overflow-hidden rounded-16 border p-3.5 text-left transition-colors duration-300 lg:p-5",
                      active ? "border-white/20 bg-white/[0.08]" : "border-transparent hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] transition-colors duration-300",
                          active ? "bg-tva-red text-white" : "bg-white/10 text-white/60",
                        )}
                      >
                        <c.icon size={16} />
                      </span>
                      <span className={cn("text-[14px] font-semibold leading-tight lg:text-[16px]", active ? "text-white" : "text-white/60")}>
                        {c.title}
                      </span>
                    </span>
                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="hidden overflow-hidden lg:block"
                        >
                          <span className="block pt-3 text-[14px] leading-relaxed text-white/65">{c.body}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-tva-red"
                        style={{ scaleX: progress }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-[14px] border border-white/15 bg-[#161111] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] sm:rounded-[22px]">
              <div onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
                <ScaledStage width={FRAME.width} height={FRAME.height}>
                  <AppFrame view={view} onNavigate={(target) => goTo(chapters.findIndex((c) => c.view === target))}>
                    <AnimatePresence mode="wait">
                      {seen && (
                        <motion.div
                          key={chapter}
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <Scene />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AppFrame>
                </ScaledStage>
              </div>

              <div className="flex items-center gap-3 border-t border-white/10 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3.5">
                <button
                  type="button"
                  onClick={() => setPaused(playing)}
                  aria-label={playing ? "Pause tour" : "Play tour"}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-tva-ink transition-transform hover:scale-105"
                >
                  {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
                </button>
                <span className="w-[78px] flex-shrink-0 text-[12.5px] tabular-nums text-white/70">
                  {clock(seconds)} / {clock(total)}
                </span>
                <span className="flex flex-1 items-center gap-1.5" aria-hidden>
                  {chapters.map((c, i) => (
                    <Segment key={c.view} progress={progress} state={i < chapter ? "past" : i === chapter ? "active" : "future"} />
                  ))}
                </span>
                <button
                  type="button"
                  onClick={() => { goTo(0); setPaused(false); }}
                  aria-label="Restart tour"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-white/65 lg:hidden">{chapters[chapter].body}</p>
            <p className="mt-4 text-center text-[12.5px] text-white/40 lg:text-right">
              A live recreation of the product running on sample data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
