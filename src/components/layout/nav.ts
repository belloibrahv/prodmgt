import {
  BarChart3, CalendarRange, FileText, FolderKanban, LayoutDashboard,
  ListChecks, Settings, Users, type LucideIcon,
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

export const WORKSPACE_NAV: NavItem[] = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/team",      label: "Team",      icon: Users },
  { href: "/reports",   label: "Reports",   icon: BarChart3 },
];

export const SETTINGS_NAV: NavItem = { href: "/settings", label: "Settings", icon: Settings };

export const ALL_NAV = [...PRIMARY_NAV, ...WORKSPACE_NAV, SETTINGS_NAV];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
