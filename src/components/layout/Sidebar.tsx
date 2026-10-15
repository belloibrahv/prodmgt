"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, CheckSquare, CalendarRange,
  FileText, Users, BarChart3, Settings, ChevronLeft, X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/projects",   label: "Projects",   icon: FolderKanban },
  { href: "/tasks",      label: "Tasks",      icon: CheckSquare },
  { href: "/timeline",   label: "Timeline",   icon: CalendarRange },
  { href: "/documents",  label: "Documents",  icon: FileText },
  { href: "/team",       label: "Team",       icon: Users },
  { href: "/reports",    label: "Reports",    icon: BarChart3 },
];

const COLLAPSE_KEY = "tva-sidebar-collapsed";

interface Props {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Remember the collapsed state between visits.
  useEffect(() => {
    try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1"); } catch { /* storage unavailable */ }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1"); } catch { /* storage unavailable */ }
      return !c;
    });
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const link = (href: string, label: string, Icon: typeof Settings, compact: boolean) => (
    <Link
      key={href}
      href={href}
      title={compact ? label : undefined}
      aria-current={isActive(href) ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-12 transition-all duration-200",
        "hover:bg-tva-red-xlt hover:text-tva-red",
        isActive(href) ? "bg-tva-red text-white shadow-sm hover:bg-tva-red hover:text-white" : "text-tva-ink-m",
        compact && "justify-center px-0 w-10 mx-auto",
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!compact && <span>{label}</span>}
    </Link>
  );

  const body = (compact: boolean, mobile: boolean) => (
    <>
      <div className={cn(
        "flex items-center border-b border-tva-border/40 h-16 px-4 flex-shrink-0",
        compact ? "justify-center" : "justify-between",
      )}>
        {!compact && (
          <Link href="/dashboard" aria-label="Dashboard">
            <Image src="/TechVaults-Logo-b2.png" alt="TechVaults" width={130} height={34} className="h-auto w-[130px] object-contain" priority />
          </Link>
        )}
        <button
          onClick={mobile ? onMobileClose : toggleCollapsed}
          className={cn(
            "p-2 rounded-12 text-tva-ink-m hover:bg-tva-red-xlt hover:text-tva-red transition-all duration-200 flex-shrink-0",
            !mobile && compact && "rotate-180",
          )}
          aria-label={mobile ? "Close menu" : compact ? "Expand sidebar" : "Collapse sidebar"}
        >
          {mobile ? <X size={18} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-0.5" aria-label="Main">
        {navItems.map(({ href, label, icon }) => link(href, label, icon, compact))}
      </nav>

      <div className="border-t border-tva-border/40 py-3 px-2">
        {link("/settings", "Settings", Settings, compact)}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-white border-r border-tva-border/60 transition-all duration-300 flex-shrink-0 z-40",
        collapsed ? "w-16" : "w-64",
      )}>
        {body(collapsed, false)}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-tva-ink/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-lg transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        {body(false, true)}
      </aside>
    </>
  );
}
