import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    title: "Create a project",
    body: "Name it, set the dates and priority, and add the people who will work on it.",
  },
  {
    title: "Break it into tasks and milestones",
    body: "Assign owners and due dates. Keep the PRD, spec and meeting notes alongside.",
  },
  {
    title: "Track it to done",
    body: "Move cards across the board, watch the timeline, and let the reports write themselves.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-tva-red">How it works</p>
          <h2 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-tva-ink sm:text-[52px]">
            From kickoff to shipped in three steps.
          </h2>
        </Reveal>

        <ol className="relative mt-16 grid gap-6 md:grid-cols-3">
          <span aria-hidden className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-tva-border via-tva-red/50 to-tva-border md:block" />
          {steps.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.12} className="relative flex flex-col items-center text-center">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-tva-border bg-white text-[19px] font-semibold text-tva-red shadow-md">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.01em] text-tva-ink">{s.title}</h3>
                <p className="mt-2.5 max-w-xs text-[15.5px] leading-relaxed text-tva-ink-m">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "What is TechVaults Project Manager?",
    a: "A single workspace for running projects: tasks on a board or in a table, milestones, a timeline, project documents, team workload and reports.",
  },
  {
    q: "Which views are included?",
    a: "Dashboard, Projects, Tasks, Timeline, Documents, Team and Reports, plus settings for your profile and workspace. Every view is included from the start.",
  },
  {
    q: "How do I get access?",
    a: "Create an account with the Get started button. If your team already uses the workspace, sign in and ask a project owner to add you to their projects.",
  },
  {
    q: "How are people organised on a project?",
    a: "Each person added to a project is given one of four roles: Owner, Admin, Member or Viewer.",
  },
  {
    q: "What kinds of documents can I keep?",
    a: "Specs, PRDs, design notes, meeting notes and reports. Documents are written in Markdown and attached to the project they belong to.",
  },
  {
    q: "Is the tour on this page the real product?",
    a: "It is a recreation of the product screens running on sample data, so you can see how it behaves before you sign in. Names, projects and numbers in it are examples.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-tva-border/50 bg-white/50 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-tva-red">FAQ</p>
          <h2 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-tva-ink sm:text-[46px]">
            Questions, answered.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-[20px] border border-tva-border/70 bg-white px-6 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-semibold text-tva-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tva-red-xlt text-tva-red transition-transform duration-300 group-open:rotate-45">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="pb-6 pr-10 text-[16px] leading-relaxed text-tva-ink-m">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-3 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-tva-ink px-6 py-20 text-center text-white sm:px-12 sm:py-28">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -bottom-56 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(188,0,4,0.7),transparent)]" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(60% 70% at 50% 100%, black, transparent)",
                WebkitMaskImage: "radial-gradient(60% 70% at 50% 100%, black, transparent)",
              }}
            />
          </div>
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[64px]">
              Your next project starts here.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-white/70">
              Set up your first project in minutes and give the whole team one place to look.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-[16px] font-semibold text-tva-ink transition-transform duration-150 hover:scale-[1.03] sm:w-auto"
              >
                Get started
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="flex h-[54px] w-full items-center justify-center rounded-full border border-white/25 px-8 text-[16px] font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const footerLinks = [
  { href: "#tour", label: "Product tour" },
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "How it works" },
  { href: "#faq", label: "FAQ" },
  { href: "/login", label: "Sign in" },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-6 border-t border-tva-border/60 pt-8 md:flex-row">
        <Image src="/TechVaults-Logo-b2.png" alt="TechVaults" width={124} height={40} className="h-9 w-auto" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {footerLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-[14px] text-tva-ink-m transition-colors hover:text-tva-red">
              {l.label}
            </a>
          ))}
        </nav>
        <p className="text-[13px] text-tva-ink-m">© {new Date().getFullYear()} TechVaults Limited</p>
      </div>
    </footer>
  );
}
