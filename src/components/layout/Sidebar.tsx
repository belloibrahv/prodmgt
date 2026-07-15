"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, CheckSquare, CalendarRange,
  FileText, Users, BarChart3, Settings, ChevronLeft,
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

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "flex flex-col bg-white border-r border-tva-border/60 transition-all duration-300 flex-shrink-0 z-40",
      collapsed ? "w-16" : "w-64",
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-tva-border/40 h-16 px-4 flex-shrink-0",
        collapsed ? "justify-center" : "justify-between",
      )}>
        {!collapsed && (
          <Image
            src="/TechVaults-Logo-b2.png"
            alt="TechVaults"
            width={130}
            height={34}
            className="object-contain"
            priority
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 rounded-12 text-tva-ink-m hover:bg-tva-red-xlt hover:text-tva-red transition-all duration-200 flex-shrink-0",
            collapsed && "rotate-180",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium relative transition-all duration-200 rounded-12",
                "hover:bg-tva-red-xlt hover:text-tva-red",
                active
                  ? "bg-tva-red text-white shadow-sm"
                  : "text-tva-ink-m",
                collapsed && "justify-center px-0 w-10 mx-auto",
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-tva-border/40 py-3 px-2">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-12 transition-all duration-200",
            "hover:bg-tva-red-xlt hover:text-tva-red",
            pathname === "/settings" ? "bg-tva-red text-white shadow-sm" : "text-tva-ink-m",
            collapsed && "justify-center px-0 w-10 mx-auto",
          )}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
