"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { User, Bell, Shield, Palette, Globe } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  jobTitle: string | null;
}

const SECTIONS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "appearance",    label: "Appearance",     icon: Palette },
  { id: "workspace",     label: "Workspace",      icon: Globe },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsClient({ user }: { user: UserData }) {
  const [section, setSection] = useState<SectionId>("profile");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-tva-ink">Settings</h1>
        <p className="text-sm text-tva-ink-m mt-0.5">Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <nav className="w-48 flex-shrink-0 flex flex-col gap-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-12 text-[13px] font-medium transition-colors text-left",
                section === id
                  ? "bg-tva-red-lt text-tva-red font-semibold"
                  : "text-tva-ink-m hover:bg-tva-surface hover:text-tva-ink",
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 animate-fade-in">
          {section === "profile"       && <ProfileSection user={user} />}
          {section === "notifications" && <NotificationsSection />}
          {section === "security"      && <SecuritySection />}
          {section === "appearance"    && <AppearanceSection />}
          {section === "workspace"     && <WorkspaceSection />}
        </div>
      </div>
    </div>
  );
}

/* ── Profile ─────────────────────────────────────────────── */
function ProfileSection({ user }: { user: UserData }) {
  const [, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email,
    jobTitle: user.jobTitle ?? "",
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      // Server action would go here
      toast.success("Profile updated!");
    });
  }

  return (
    <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-tva-border">
        <h2 className="text-[15px] font-semibold text-tva-ink">Profile Information</h2>
        <p className="text-[12px] text-tva-ink-m mt-0.5">Update your name, role, and profile picture</p>
      </div>
      <div className="p-6 flex flex-col gap-6">
        {/* Avatar section */}
        <div className="flex items-center gap-5">
          <Avatar name={user.name} image={user.image} size="xl" />
          <div>
            <Button variant="outline" size="sm">Change photo</Button>
            <p className="text-[11px] text-tva-ink-m mt-1.5">JPG, PNG or GIF · Max 2MB</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Job title"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              placeholder="e.g. Product Manager"
            />
          </div>
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────── */
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    taskAssigned:    true,
    taskDue:         true,
    projectUpdates:  true,
    teamMessages:    false,
    weeklyDigest:    true,
    emailNotifs:     true,
  });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const rows = [
    { key: "taskAssigned"   as const, label: "Task assigned to you",    desc: "Get notified when a task is assigned" },
    { key: "taskDue"        as const, label: "Task due reminders",       desc: "24h and 1h before a task is due" },
    { key: "projectUpdates" as const, label: "Project status changes",   desc: "When a project moves to a new status" },
    { key: "teamMessages"   as const, label: "Team comments",            desc: "When someone comments on your tasks" },
    { key: "weeklyDigest"   as const, label: "Weekly digest",            desc: "Summary of your week every Monday" },
    { key: "emailNotifs"    as const, label: "Email notifications",      desc: "Receive notifications via email" },
  ];

  return (
    <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-tva-border">
        <h2 className="text-[15px] font-semibold text-tva-ink">Notification Preferences</h2>
        <p className="text-[12px] text-tva-ink-m mt-0.5">Choose what you&apos;d like to be notified about</p>
      </div>
      <div className="divide-y divide-tva-border/60">
        {rows.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-[13px] font-medium text-tva-ink">{label}</p>
              <p className="text-[12px] text-tva-ink-m mt-0.5">{desc}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-tva-border flex justify-end">
        <Button onClick={() => toast.success("Notification preferences saved!")}>Save preferences</Button>
      </div>
    </div>
  );
}

/* ── Security ────────────────────────────────────────────── */
function SecuritySection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-tva-border">
          <h2 className="text-[15px] font-semibold text-tva-ink">Change Password</h2>
        </div>
        <form className="p-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Password updated!"); }}>
          <Input label="Current password" type="password" placeholder="••••••••" />
          <Input label="New password" type="password" placeholder="Min. 8 characters" />
          <Input label="Confirm new password" type="password" placeholder="••••••••" />
          <div className="flex justify-end">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-tva-border">
          <h2 className="text-[15px] font-semibold text-tva-ink">Active Sessions</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-tva-success-lt rounded-12 mb-3">
            <div>
              <p className="text-[13px] font-semibold text-tva-ink">Current session</p>
              <p className="text-[12px] text-tva-ink-m mt-0.5">macOS · Chrome · Lagos, NG</p>
            </div>
            <span className="text-[11px] font-semibold text-tva-success bg-white px-2.5 py-1 rounded-full">Active now</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast("All other sessions signed out")}>
            Sign out all other sessions
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Appearance ──────────────────────────────────────────── */
function AppearanceSection() {
  const [accentColor, setAccentColor] = useState("#bc0004");
  const colors = ["#bc0004", "#2563eb", "#1da851", "#8b5cf6", "#f59e0b", "#ec4899"];

  return (
    <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-tva-border">
        <h2 className="text-[15px] font-semibold text-tva-ink">Appearance</h2>
        <p className="text-[12px] text-tva-ink-m mt-0.5">Customise the look of your workspace</p>
      </div>
      <div className="p-6 flex flex-col gap-6">
        {/* Theme */}
        <div>
          <p className="text-[13px] font-semibold text-tva-ink mb-3">Theme</p>
          <div className="flex gap-3">
            {[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "system", label: "System" }].map(({ id, label }) => (
              <button
                key={id}
                className={cn(
                  "flex-1 py-3 rounded-12 border text-[13px] font-medium transition-all",
                  id === "light" ? "border-tva-red bg-tva-red-lt text-tva-red" : "border-tva-border text-tva-ink-m hover:border-tva-red hover:text-tva-red",
                )}
                onClick={() => toast(`${label} theme — coming soon`)}
              >
                {id === "light" ? "☀️" : id === "dark" ? "🌙" : "💻"} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="text-[13px] font-semibold text-tva-ink mb-3">Accent colour</p>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "w-8 h-8 rounded-full transition-transform hover:scale-110",
                  accentColor === c && "ring-2 ring-offset-2 ring-tva-ink scale-110",
                )}
                aria-label={`Accent color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Appearance saved!")}>Save</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Workspace ───────────────────────────────────────────── */
function WorkspaceSection() {
  return (
    <div className="bg-white border border-tva-border rounded-16 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-tva-border">
        <h2 className="text-[15px] font-semibold text-tva-ink">Workspace Settings</h2>
        <p className="text-[12px] text-tva-ink-m mt-0.5">Configure your TechVaults workspace</p>
      </div>
      <div className="p-6 flex flex-col gap-4">
        <Input label="Workspace name" defaultValue="TechVaults Limited" />
        <Input label="Default timezone" defaultValue="Africa/Lagos (WAT, UTC+1)" />
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Workspace settings saved!")}>Save changes</Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mx-6 mb-6 border border-tva-error/30 rounded-16 overflow-hidden">
        <div className="px-5 py-3 bg-tva-error-lt border-b border-tva-error/20">
          <p className="text-[13px] font-semibold text-tva-error">Danger Zone</p>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-tva-ink">Delete workspace</p>
            <p className="text-[12px] text-tva-ink-m mt-0.5">This action is irreversible. All data will be permanently deleted.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => toast.error("Contact your admin to delete the workspace")}>
            Delete workspace
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Toggle component ────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-tva-red",
        checked ? "bg-tva-red" : "bg-tva-border",
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
        checked && "translate-x-4",
      )} />
    </button>
  );
}
