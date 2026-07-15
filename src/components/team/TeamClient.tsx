"use client";

import { useState } from "react";
import { MdAdd, MdGroup, MdEmail, MdWork, MdAssignment } from "react-icons/md";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

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

  const filtered = members.filter(
    (m) =>
      (m.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.jobTitle?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tva-ink">Team</h1>
          <p className="text-sm text-tva-ink-m mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-tva-border/60 rounded-full px-4 py-2.5 focus-within:border-tva-red focus-within:ring-2 focus-within:ring-tva-red/10 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tva-ink-m flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="bg-transparent text-sm text-tva-ink placeholder:text-tva-ink-m outline-none w-44"
            />
          </div>
          <Button className="gap-2">
            <MdAdd size={18} /> Invite Member
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MdGroup size={48} />}
          title="No members found"
          description="Invite your team members to collaborate."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  // Deduplicate projects
  const projects = Array.from(
    new Map(member.memberships.map((m) => [m.project.id, m.project])).values()
  ).slice(0, 3);

  const isOnline = Math.random() > 0.5; // demo — replace with real presence

  return (
    <div className="bg-white border border-tva-border/60 rounded-20 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col gap-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="relative inline-block">
          <Avatar name={member.name} image={member.image} size="xl" />
          <span className={cn(
            "absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
            isOnline ? "bg-tva-success" : "bg-gray-300",
          )} />
        </div>
        <div>
          <p className="text-sm font-semibold text-tva-ink">{member.name ?? "Unknown"}</p>
          {member.jobTitle && (
            <p className="text-xs text-tva-ink-m mt-1">{member.jobTitle}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-tva-surface/50 rounded-12 p-3 text-center">
          <p className="text-lg font-bold text-tva-ink">{member.memberships.length}</p>
          <p className="text-xs text-tva-ink-m">Projects</p>
        </div>
        <div className="bg-tva-surface/50 rounded-12 p-3 text-center">
          <p className="text-lg font-bold text-tva-ink">{member._count.assignedTasks}</p>
          <p className="text-xs text-tva-ink-m">Tasks</p>
        </div>
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="flex flex-col gap-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-tva-ink-m truncate">{p.name}</span>
            </div>
          ))}
          {member.memberships.length > 3 && (
            <p className="text-xs text-tva-ink-m">+{member.memberships.length - 3} more</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-tva-border/40 pt-4 flex justify-center gap-2">
        <button className="flex items-center gap-1.5 text-xs font-medium text-tva-ink-m hover:text-tva-red transition-colors px-3 py-2 rounded-8 hover:bg-tva-red-xlt">
          <MdEmail size={14} /> Message
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-tva-ink-m hover:text-tva-red transition-colors px-3 py-2 rounded-8 hover:bg-tva-red-xlt">
          <MdAssignment size={14} /> Tasks
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium text-tva-ink-m hover:text-tva-red transition-colors px-3 py-2 rounded-8 hover:bg-tva-red-xlt">
          <MdWork size={14} /> Profile
        </button>
      </div>
    </div>
  );
}
