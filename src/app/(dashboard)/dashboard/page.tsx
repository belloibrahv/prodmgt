import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock, Goal, ListTodo, NotebookPen, Scale } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardStats, getRecentActivity, getProjectStatusDistribution, getTaskCompletionTrend, getTeamWorkloadData } from "@/lib/actions/dashboard";
import { getProjects } from "@/lib/actions/projects";
import { getAllTasks } from "@/lib/actions/tasks";
import { getMeetings } from "@/lib/actions/meetings";
import { getMyOpenActionItems } from "@/lib/actions/action-items";
import { getDecisions } from "@/lib/actions/decisions";
import { getObjectives } from "@/lib/actions/goals";
import { getRecentStatusUpdates } from "@/lib/actions/status-updates";
import { Button } from "@/components/ui/Button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatTile, ToneBadge } from "@/components/business/primitives";
import { ActionList } from "@/components/business/ActionItems";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import TasksDue from "@/components/dashboard/TasksDue";
import TeamWorkload from "@/components/dashboard/TeamWorkload";
import ProjectStatusChart from "@/components/dashboard/ProjectStatusChart";
import TaskCompletionChart from "@/components/dashboard/TaskCompletionChart";
import PortfolioPulse from "@/components/dashboard/PortfolioPulse";
import { DECISION_STATUS, OPEN_DECISION_STATUSES, goalHealth, objectiveProgress, periodElapsed, MEETING_TYPES } from "@/lib/business";
import { cn, getDueLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const PULSE_WEEKS_MS = 8 * WEEK_MS;

export default async function DashboardPage() {
  const [session, stats, projects, tasks, activity, projectStatus, taskTrend, teamWorkload, meetings, myActions, decisions, objectives, updates] = await Promise.all([
    auth(),
    getDashboardStats(),
    getProjects(),
    getAllTasks(),
    getRecentActivity(12),
    getProjectStatusDistribution(),
    getTaskCompletionTrend(),
    getTeamWorkloadData(),
    getMeetings(),
    getMyOpenActionItems(),
    getDecisions(),
    getObjectives(),
    getRecentStatusUpdates(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const now = Date.now();
  const dueThisWeek = tasks.filter((t) => {
    if (t.status === "DONE" || !t.dueDate) return false;
    const due = new Date(t.dueDate).getTime();
    return due >= now && due - now <= WEEK_MS;
  }).length;

  const goals = objectives.map((o) => goalHealth(objectiveProgress(o.keyResults), periodElapsed(o.startDate, o.endDate)));
  const goalsOnPace = goals.filter((h) => h === "ON_TRACK" || h === "DONE").length;
  const awaiting = decisions.filter((d) => OPEN_DECISION_STATUSES.includes(d.status));
  const lateDecisions = awaiting.filter((d) => getDueLabel(d.decideBy).variant === "overdue");
  const lateActions = myActions.filter((a) => getDueLabel(a.dueDate).variant === "overdue");
  const nextMeeting = meetings
    .filter((m) => (m.status === "SCHEDULED" || m.status === "IN_PROGRESS") && new Date(m.scheduledAt).getTime() > now - 3 * 60 * 60 * 1000)
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))[0];

  const liveProjects = projects.filter((p) => p.status === "ACTIVE" || p.status === "PLANNING" || p.status === "ON_HOLD");
  const pulseUpdates = updates.filter((u) => now - new Date(u.createdAt).getTime() <= PULSE_WEEKS_MS);

  const summary = [
    `${dueThisWeek} ${dueThisWeek === 1 ? "task is" : "tasks are"} due this week`,
    myActions.length > 0 && `you own ${myActions.length} open ${myActions.length === 1 ? "action" : "actions"}`,
    awaiting.length > 0 && `${awaiting.length} ${awaiting.length === 1 ? "decision is" : "decisions are"} waiting`,
  ].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground">Across the company, {summary}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/goals" />} nativeButton={false}><Goal /> Goals</Button>
          <Button render={<Link href={nextMeeting ? `/meetings/${nextMeeting.id}` : "/meetings"} />} nativeButton={false}>
            <NotebookPen /> {nextMeeting ? "Open next meeting" : "Meetings"}
          </Button>
        </div>
      </header>

      {/* How the business is running */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/goals" className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
          <StatTile label="Goals on pace" value={objectives.length ? `${goalsOnPace}/${objectives.length}` : "—"}
            hint={objectives.length ? `${goals.filter((h) => h === "OFF_TRACK").length} off track` : "No objectives set yet"} icon={Goal}
            tone={!objectives.length ? undefined : goalsOnPace === objectives.length ? "success" : goals.includes("OFF_TRACK") ? "danger" : "warning"} />
        </Link>
        <Link href="/decisions" className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
          <StatTile label="Decisions awaiting" value={awaiting.length} hint={lateDecisions.length ? `${lateDecisions.length} past their deadline` : "None overdue"} icon={Scale} tone={lateDecisions.length ? "danger" : undefined} />
        </Link>
        <Link href="/meetings" className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
          <StatTile label="My open actions" value={myActions.length} hint={lateActions.length ? `${lateActions.length} overdue` : "None overdue"} icon={ListTodo} tone={lateActions.length ? "danger" : myActions.length ? undefined : "success"} />
        </Link>
        <Link href={nextMeeting ? `/meetings/${nextMeeting.id}` : "/meetings"} className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
          <StatTile label="Next meeting" value={nextMeeting ? format(new Date(nextMeeting.scheduledAt), "EEE HH:mm") : "—"}
            hint={nextMeeting ? `${MEETING_TYPES[nextMeeting.type].label} · ${format(new Date(nextMeeting.scheduledAt), "d MMM")}` : "Nothing scheduled"} icon={CalendarClock} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PortfolioPulse projects={liveProjects} updates={pulseUpdates} />
        </div>
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>My actions</CardTitle>
            <CardDescription>What you committed to in meetings and decisions</CardDescription>
            <CardAction><Button variant="link" size="sm" className="px-0" render={<Link href="/meetings" />} nativeButton={false}>Tracker</Button></CardAction>
          </CardHeader>
          <CardContent>
            <ActionList actions={myActions.slice(0, 8)} showSource showProject
              empty={<p className="text-sm text-muted-foreground">You have no open actions.</p>} />
          </CardContent>
        </Card>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><TaskCompletionChart data={taskTrend} /></div>
        <ProjectStatusChart data={projectStatus} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><TasksDue tasks={tasks} /></div>
        <TeamWorkload members={teamWorkload} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="shadow-xs lg:col-span-2">
          <CardHeader>
            <CardTitle>Decisions awaiting</CardTitle>
            <CardDescription>Soonest deadline first</CardDescription>
            <CardAction><Button variant="link" size="sm" className="px-0" render={<Link href="/decisions" />} nativeButton={false}>Register</Button></CardAction>
          </CardHeader>
          <CardContent>
            {awaiting.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decisions waiting.</p>
            ) : (
              <ul className="divide-y">
                {awaiting.slice(0, 6).map((d) => {
                  const late = getDueLabel(d.decideBy).variant === "overdue";
                  return (
                    <li key={d.id}>
                      <Link href={`/decisions?open=${d.id}`} className="flex flex-wrap items-center gap-3 py-2.5 hover:text-primary">
                        <Scale className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{d.title}</span>
                        <ToneBadge label={DECISION_STATUS[d.status].label} badge={DECISION_STATUS[d.status].badge} />
                        <span className={cn("w-24 text-right text-xs", late ? "font-medium text-destructive" : "text-muted-foreground")}>
                          {d.decideBy ? (late ? "Overdue" : getDueLabel(d.decideBy).label) : "No deadline"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <ActivityFeed activity={activity} />
      </div>
    </div>
  );
}
