"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar";
import NavUser from "@/components/layout/NavUser";
import { PRIMARY_NAV, SETTINGS_NAV, WORKSPACE_NAV, isActivePath, type NavItem } from "@/components/layout/nav";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function AppSidebar({ user }: Props) {
  const pathname = usePathname();

  const items = (list: NavItem[]) =>
    list.map(({ href, label, icon: Icon }) => (
      <SidebarMenuItem key={href}>
        <SidebarMenuButton
          isActive={isActivePath(pathname, href)}
          tooltip={label}
          render={<Link href={href} />}
        >
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" aria-label="TechVaults dashboard" />}>
              <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
                <Image src="/tab-icon-vaults.png" alt="" width={20} height={20} className="size-5 object-contain" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold text-foreground">TechVaults</span>
                <span className="truncate text-xs text-muted-foreground">Project Manager</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{items(PRIMARY_NAV)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{items(WORKSPACE_NAV)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>{items([SETTINGS_NAV])}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
