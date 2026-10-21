"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CommandMenu from "@/components/layout/CommandMenu";
import NewProjectModal from "@/components/projects/NewProjectModal";
import { ALL_NAV, isActivePath } from "@/components/layout/nav";

export default function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    // Cmd/Ctrl+K or "/" opens search from anywhere.
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const section = ALL_NAV.find((n) => isActivePath(pathname, n.href));
  const isDetail = section && pathname !== section.href;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/70 sm:px-6">
        <SidebarTrigger className="-ml-1.5 text-muted-foreground" />
        <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-center" />

        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            {section && isDetail ? (
              <>
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink render={<Link href={section.href} />}>{section.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Details</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{section?.label ?? "TechVaults"}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="h-8 w-9 justify-center px-0 text-muted-foreground md:w-64 md:justify-start md:px-2.5 lg:w-72"
            aria-label="Search"
          >
            <Search />
            <span className="hidden flex-1 text-left font-normal md:inline">Search projects, tasks, docs…</span>
            <KbdGroup className="hidden md:inline-flex">
              <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Button>
          <Button onClick={() => setShowNewProject(true)} className="h-8" aria-label="New project">
            <Plus />
            <span className="hidden sm:inline">New project</span>
          </Button>
        </div>
      </header>

      <CommandMenu
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNewProject={() => setShowNewProject(true)}
      />
      <NewProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />
    </>
  );
}
