"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { User, Bell, Shield, Palette, Globe, Sun, Moon, Monitor } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  updateProfile,
  updateNotificationPrefs,
  changePassword,
  updateAppearance,
} from "@/lib/actions/settings";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  jobTitle: string | null;
  notificationPrefs?: Record<string, boolean>;
  appearancePrefs?: Record<string, unknown>;
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
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your account and workspace preferences" />

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Section nav: a scrolling row on phones, a side list from md up */}
        <nav aria-label="Settings sections" className="-mx-4 flex shrink-0 gap-1 overflow-x-auto px-4 md:mx-0 md:w-52 md:flex-col md:px-0">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              aria-current={section === id ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors",
                section === id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
          {section === "notifications" && <NotificationsSection user={user} />}
          {section === "security"      && <SecuritySection />}
          {section === "appearance"    && <AppearanceSection user={user} />}
          {section === "workspace"     && <WorkspaceSection />}
        </div>
      </div>
    </div>
  );
}

/* ── Profile ─────────────────────────────────────────────── */
function ProfileSection({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email,
    jobTitle: user.jobTitle ?? "",
  });

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success("Profile updated!");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-[15px] font-semibold text-foreground">Profile Information</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Update your name, role, and profile picture</p>
      </div>
      <div className="p-6 flex flex-col gap-6">
        {/* Avatar section */}
        <div className="flex items-center gap-5">
          <Avatar name={user.name} image={user.image} size="xl" />
          <div>
            <Button variant="outline" size="sm">Change photo</Button>
            <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or GIF · Max 2MB</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="name"
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              name="jobTitle"
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
            disabled
          />
          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────── */
function NotificationsSection({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  
  const validateBool = (value: unknown, fallback: boolean): boolean => {
    return typeof value === "boolean" ? value : fallback;
  };
  
  const [prefs, setPrefs] = useState({
    taskAssigned:    validateBool(user.notificationPrefs?.taskAssigned, true),
    taskDue:         validateBool(user.notificationPrefs?.taskDue, true),
    projectUpdates:  validateBool(user.notificationPrefs?.projectUpdates, true),
    teamMessages:    validateBool(user.notificationPrefs?.teamMessages, false),
    weeklyDigest:    validateBool(user.notificationPrefs?.weeklyDigest, true),
    emailNotifs:     validateBool(user.notificationPrefs?.emailNotifs, true),
  });
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updateNotificationPrefs(formData);
      if (res.success) {
        toast.success("Notification preferences saved!");
      } else {
        toast.error(res.error);
      }
    });
  }

  const rows = [
    { key: "taskAssigned"   as const, label: "Task assigned to you",    desc: "Get notified when a task is assigned" },
    { key: "taskDue"        as const, label: "Task due reminders",       desc: "24h and 1h before a task is due" },
    { key: "projectUpdates" as const, label: "Project status changes",   desc: "When a project moves to a new status" },
    { key: "teamMessages"   as const, label: "Team comments",            desc: "When someone comments on your tasks" },
    { key: "weeklyDigest"   as const, label: "Weekly digest",            desc: "Summary of your week every Monday" },
    { key: "emailNotifs"    as const, label: "Email notifications",      desc: "Receive notifications via email" },
  ];

  return (
    <form onSubmit={handleSave} className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-[15px] font-semibold text-foreground">Notification Preferences</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Choose what you would like to be notified about</p>
      </div>
      <div className="divide-y divide-border">
        {rows.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <input
              type="hidden"
              name={key}
              value={prefs[key] ? "true" : ""}
            />
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-border flex justify-end">
        <Button type="submit" loading={isPending}>
          {isPending ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}

/* ── Security ────────────────────────────────────────────── */
function SecuritySection() {
  const [isPending, startTransition] = useTransition();

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await changePassword(formData);
      if (res.success) {
        toast.success("Password updated!");
        e.currentTarget.reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 flex flex-col gap-4">
          <Input name="currentPassword" label="Current password" type="password" placeholder="••••••••" />
          <Input name="newPassword" label="New password" type="password" placeholder="Min. 8 characters" />
          <Input name="confirmPassword" label="Confirm new password" type="password" placeholder="••••••••" />
          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>
              {isPending ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">Active Sessions</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Current session</p>
              <p className="text-xs text-muted-foreground mt-0.5">macOS · Chrome · Lagos, NG</p>
            </div>
            <span className="text-xs font-semibold text-success bg-card px-2.5 py-1 rounded-full">Active now</span>
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
function AppearanceSection({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  
  const validateTheme = (value: unknown): "light" | "dark" | "system" => {
    if (value === "light" || value === "dark" || value === "system") return value;
    return "light";
  };
  
  const validateAccentColor = (value: unknown): string => {
    if (typeof value === "string" && value.startsWith("#")) return value;
    return "#bc0004";
  };
  
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    validateTheme(user.appearancePrefs?.theme)
  );
  const [accentColor, setAccentColor] = useState<string>(
    validateAccentColor(user.appearancePrefs?.accentColor)
  );
  const colors = ["#bc0004", "#2563eb", "#1da851", "#8b5cf6", "#f59e0b", "#ec4899"];

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("theme", theme);
    formData.set("accentColor", accentColor);
    
    startTransition(async () => {
      const res = await updateAppearance(formData);
      if (res.success) {
        toast.success("Appearance saved!");
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-[15px] font-semibold text-foreground">Appearance</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customise the look of your workspace</p>
      </div>
      <div className="p-6 flex flex-col gap-6">
        {/* Theme */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Theme</p>
          <div className="flex gap-3">
            {[{ id: "light" as const, label: "Light", icon: Sun }, { id: "dark" as const, label: "Dark", icon: Moon }, { id: "system" as const, label: "System", icon: Monitor }].map(({ id, label, icon: ThemeIcon }) => (
              <button
                key={id}
                type="button"
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all",
                  theme === id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary",
                )}
                onClick={() => setTheme(id)}
              >
                <ThemeIcon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Accent colour</p>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "w-8 h-8 rounded-full transition-transform hover:scale-110",
                  accentColor === c && "ring-2 ring-offset-2 ring-foreground scale-110",
                )}
                aria-label={`Accent color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ── Workspace ───────────────────────────────────────────── */
function WorkspaceSection() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-[15px] font-semibold text-foreground">Workspace Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure your TechVaults workspace</p>
      </div>
      <div className="p-6 flex flex-col gap-4">
        <Input label="Workspace name" defaultValue="TechVaults Limited" />
        <Input label="Default timezone" defaultValue="Africa/Lagos (WAT, UTC+1)" />
        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Workspace settings saved!")}>Save changes</Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mx-6 mb-6 border border-destructive/30 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-destructive/10 border-b border-destructive/20">
          <p className="text-sm font-semibold text-destructive">Danger Zone</p>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Delete workspace</p>
            <p className="text-xs text-muted-foreground mt-0.5">This action is irreversible. All data will be permanently deleted.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => toast.error("Contact your admin to delete the workspace")}>
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
        "relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform duration-200",
        checked && "translate-x-4",
      )} />
    </button>
  );
}
