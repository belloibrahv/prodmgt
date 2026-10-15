"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Flag, Play } from "lucide-react";
import { AppFrame, FRAME, MiniAvatar, ScaledStage, people } from "./demo/primitives";
import { DashboardScene } from "./demo/scenes";

const ease = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

const capabilities = [
  "Projects", "Kanban board", "Task table", "Milestones", "Timeline", "Documents",
  "Team workload", "Reports", "Roles", "Global search", "Activity feed", "Invitations",
];

export default function Hero() {
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 520], [11, 0]);
  const scale = useTransform(scrollY, [0, 520], [0.955, 1]);
  const glow = useTransform(scrollY, [0, 520], [0.55, 1]);

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40">
      {/* Backdrop: warm glow and a faint grid that fades out towards the edges */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(188,0,4,0.13),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(188,0,4,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(188,0,4,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(60% 50% at 50% 20%, black, transparent)",
            WebkitMaskImage: "radial-gradient(60% 50% at 50% 20%, black, transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
        <motion.div {...rise(0)} className="flex justify-center">
          <a
            href="#tour"
            className="group inline-flex items-center gap-2 rounded-full border border-tva-border/80 bg-white/80 py-1.5 pl-2 pr-3.5 text-[13px] font-medium text-tva-ink shadow-sm backdrop-blur transition-colors hover:border-tva-red/40"
          >
            <span className="rounded-full bg-tva-red px-2 py-0.5 text-[11px] font-semibold text-white">Tour</span>
            See the whole product in 32 seconds
            <ArrowRight size={13} className="text-tva-ink-m transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        <motion.h1
          {...rise(0.08)}
          className="mx-auto mt-7 max-w-4xl text-balance text-[42px] font-semibold leading-[1.03] tracking-[-0.035em] text-tva-ink sm:text-[64px] lg:text-[80px]"
        >
          Run every project from{" "}
          <span className="bg-gradient-to-br from-[#e3262a] via-tva-red to-[#7d0003] bg-clip-text text-transparent">
            one clear workspace.
          </span>
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-relaxed text-tva-ink-m sm:text-[19px]"
        >
          TechVaults Project Manager brings projects, tasks, milestones, documents and reporting together,
          so your whole team works from the same up-to-date picture.
        </motion.p>

        <motion.div {...rise(0.24)} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-tva-red px-7 text-[16px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(188,0,4,0.6)] transition-all duration-150 hover:scale-[1.03] hover:bg-tva-red-dk focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-tva-red sm:w-auto"
          >
            Get started
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#tour"
            className="group flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-tva-border bg-white pl-2.5 pr-6 text-[16px] font-semibold text-tva-ink transition-colors hover:border-tva-red/50 sm:w-auto"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tva-ink text-white transition-colors group-hover:bg-tva-red">
              <Play size={14} fill="currentColor" className="ml-0.5" />
            </span>
            Watch the product tour
          </a>
        </motion.div>

        <motion.ul
          {...rise(0.32)}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] text-tva-ink-m"
        >
          {["Board and table views", "Timeline with milestones", "Built-in reports"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check size={14} className="text-tva-red" strokeWidth={3} />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Product window */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease }}
        className="relative mx-auto mt-14 max-w-[1180px] px-3 sm:mt-20 sm:px-8"
        style={{ perspective: 2400 }}
      >
        <motion.div
          aria-hidden
          style={{ opacity: glow }}
          className="absolute inset-x-[8%] top-[12%] h-[70%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(188,0,4,0.35),transparent)] blur-3xl"
        />

        <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }} className="relative">
          <div className="overflow-hidden rounded-[14px] border border-tva-border/80 bg-white shadow-[0_50px_120px_-30px_rgba(32,26,26,0.45),0_0_0_6px_rgba(255,255,255,0.5)] sm:rounded-[22px]">
            <ScaledStage width={FRAME.width} height={FRAME.height}>
              <AppFrame view="dashboard">
                <DashboardScene />
              </AppFrame>
            </ScaledStage>
          </div>

          <motion.div
            aria-hidden
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 bottom-[18%] hidden items-center gap-3 rounded-16 border border-tva-border/70 bg-white p-3.5 pr-5 shadow-lg lg:flex"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-12 bg-tva-success-lt text-tva-success">
              <Flag size={18} />
            </span>
            <span className="text-left">
              <span className="block text-[13px] font-semibold text-tva-ink">Milestone reached</span>
              <span className="block text-[12px] text-tva-ink-m">Design Handoff · Client Portal</span>
            </span>
          </motion.div>

          <motion.div
            aria-hidden
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-5 top-[22%] hidden items-center gap-3 rounded-16 border border-tva-border/70 bg-white p-3.5 pr-5 shadow-lg lg:flex"
          >
            <MiniAvatar name={people[1].name} color={people[1].color} size={38} />
            <span className="text-left">
              <span className="block text-[13px] font-semibold text-tva-ink">Fatima moved a task</span>
              <span className="block text-[12px] text-tva-ink-m">
                Invoice export <span className="text-tva-red">→ In Review</span>
              </span>
            </span>
          </motion.div>
        </motion.div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-tva-surface to-transparent" />
      </motion.div>

      {/* Capability ticker */}
      <div className="relative mt-6 border-y border-tva-border/50 bg-white/60 py-5">
        <div
          className="flex overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <motion.ul
            aria-label="What is included"
            className="flex flex-shrink-0 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          >
            {[...capabilities, ...capabilities].map((c, i) => (
              <li
                key={i}
                aria-hidden={i >= capabilities.length}
                className="flex items-center whitespace-nowrap text-[15px] font-medium text-tva-ink-m"
              >
                <span className="px-6">{c}</span>
                <span className="h-1 w-1 rounded-full bg-tva-red/60" />
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
