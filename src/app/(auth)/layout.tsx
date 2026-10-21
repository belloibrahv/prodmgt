import Image from "next/image";
import Link from "next/link";
import { CalendarRange, FolderKanban, ListChecks, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: FolderKanban, text: "Plan projects with milestones, owners and dates" },
  { icon: ListChecks, text: "Move work across a board everyone can see" },
  { icon: CalendarRange, text: "Spot slipping deadlines on one timeline" },
  { icon: Users, text: "Balance workload across the team" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-[1fr_minmax(0,640px)]">
      {/* Brand panel, large screens only */}
      <aside className="relative hidden overflow-hidden bg-[#1c0d0d] p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden className="absolute -top-40 -left-40 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(188,0,4,0.55),transparent)] blur-2xl" />
        <div aria-hidden className="absolute -right-32 -bottom-48 size-[440px] rounded-full bg-[radial-gradient(closest-side,rgba(188,0,4,0.35),transparent)] blur-2xl" />

        <Link href="/" className="relative flex items-center gap-2.5" aria-label="TechVaults home">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white">
            <Image src="/tab-icon-vaults.png" alt="" width={22} height={22} className="size-[22px] object-contain" />
          </span>
          <span className="text-lg font-semibold tracking-tight">TechVaults</span>
        </Link>

        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-balance">
            Every project, task and deadline in one place.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-12 text-xs text-white/50">© {new Date().getFullYear()} TechVaults Limited</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm animate-fade-in">
          <Link href="/" className="mb-10 flex justify-center lg:hidden" aria-label="TechVaults home">
            <Image src="/TechVaults-Logo-b2.png" alt="TechVaults" width={150} height={40} className="object-contain" priority />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
