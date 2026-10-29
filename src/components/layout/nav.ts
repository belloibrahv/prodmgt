import {
  BarChart3, CalendarRange, FileText, FolderKanban, Goal, LayoutDashboard,
  ListChecks, NotebookPen, Scale, Settings, Users, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects",  label: "Projects",  icon: FolderKanban },
  { href: "/tasks",     label: "Tasks",     icon: ListChecks },
  { href: "/timeline",  label: "Timeline",  icon: CalendarRange },
];

/** How the company runs: goals it commits to, the meetings that review them, the decisions made. */
export const OPERATE_NAV: NavItem[] = [
  { href: "/goals",     label: "Goals",     icon: Goal },
  { href: "/meetings",  label: "Meetings",  icon: NotebookPen },
  { href: "/decisions", label: "Decisions", icon: Scale },
];

export const WORKSPACE_NAV: NavItem[] = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/team",      label: "Team",      icon: Users },
  { href: "/reports",   label: "Reports",   icon: BarChart3 },
];

export const SETTINGS_NAV: NavItem = { href: "/settings", label: "Settings", icon: Settings };

export const ALL_NAV = [...PRIMARY_NAV, ...OPERATE_NAV, ...WORKSPACE_NAV, SETTINGS_NAV];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
