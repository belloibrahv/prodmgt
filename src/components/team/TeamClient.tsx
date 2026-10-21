"use client";

import { useState } from "react";
import Link from "next/link";
import { MailIcon, PlusIcon, SearchIcon, SearchXIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/layout/PageHeader";
import InviteTeamMemberModal from "./InviteTeamMemberModal";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  jobTitle: string | null;
  memberships: Array<{
    role: string;
    project: { id: string; name: string; color: string };
  }>;
  _count: { assignedTasks: number };
}

export default function TeamClient({ members }: { members: TeamMember[] }) {
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const q = search.trim().toLowerCase();
  const filtered = members.filter(
    (m) =>
      !q ||
      (m.name?.toLowerCase().includes(q) ?? false) ||
      m.email.toLowerCase().includes(q) ||
      (m.jobTitle?.toLowerCase().includes(q) ?? false),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description={`${members.length} member${members.length !== 1 ? "s" : ""} in your workspace`}
        actions={
          <Button onClick={() => setShowInviteModal(true)}>
            <PlusIcon /> Invite member
          </Button>
        }
      />

      <InputGroup className="h-8 w-full bg-card sm:w-72">
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or role…"
          aria-label="Search members"
        />
      </InputGroup>

      {filtered.length === 0 ? (
        <Empty className="rounded-xl border border-dashed bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">{q ? <SearchXIcon /> : <UsersIcon />}</EmptyMedia>
            <EmptyTitle>{q ? "No matching members" : "No members yet"}</EmptyTitle>
            <EmptyDescription>{q ? "Try a different name, email or role." : "Invite your team to start collaborating."}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Member</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Projects</TableHead>
                <TableHead className="text-right">Assigned tasks</TableHead>
                <TableHead className="w-12 pr-4"><span className="sr-only">Contact</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                // A member can appear in a project more than once across roles.
                const projects = Array.from(new Map(m.memberships.map((x) => [x.project.id, x.project])).values());
                return (
                  <TableRow key={m.id}>
                    <TableCell className="pl-4">
                      <span className="flex items-center gap-3">
                        <Avatar name={m.name} image={m.image} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{m.name ?? "Unnamed"}</span>
                          <span className="block truncate text-xs text-muted-foreground">{m.email}</span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{m.jobTitle ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {projects.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1.5">
                          {projects.slice(0, 3).map((p) => (
                            <Link
                              key={p.id}
                              href={`/projects/${p.id}`}
                              className="inline-flex max-w-40 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs hover:bg-muted"
                            >
                              <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
                              <span className="truncate">{p.name}</span>
                            </Link>
                          ))}
                          {projects.length > 3 && (
                            <span className="px-1 text-xs text-muted-foreground">+{projects.length - 3}</span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{m._count.assignedTasks}</TableCell>
                    <TableCell className="pr-4">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground"
                              render={<a href={`mailto:${m.email}`} />}
                              nativeButton={false}
                              aria-label={`Email ${m.name ?? m.email}`}
                            />
                          }
                        >
                          <MailIcon />
                        </TooltipTrigger>
                        <TooltipContent>Email {m.name?.split(" ")[0] ?? m.email}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteTeamMemberModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  );
}
