import { AlertTriangle, CheckCircle2, FolderKanban, ListTodo, Users } from "lucide-react";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { DashboardStats as Stats } from "@/types";

interface Tile {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  footer: React.ReactNode;
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  const overdue = stats.overdueTasks > 0;

  const tiles: Tile[] = [
    {
      label: "Active projects",
      value: stats.activeProjects,
      icon: FolderKanban,
      footer: <>{stats.totalProjects} total · {stats.completedProjects} completed</>,
    },
    {
      label: "Open tasks",
      value: stats.openTasks,
      icon: ListTodo,
      footer: <>{stats.totalTasks} tasks across all projects</>,
    },
    {
      label: "Overdue tasks",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      footer: overdue ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
          <AlertTriangle className="size-3.5" /> Needs attention
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-medium text-success">
          <CheckCircle2 className="size-3.5" /> Nothing overdue
        </span>
      ),
    },
    {
      label: "Team members",
      value: stats.teamSize,
      icon: Users,
      footer: <>People with access to this workspace</>,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map(({ label, value, icon: Icon, footer }) => (
        <Card key={label} className="gap-3 pb-0 shadow-xs">
          <CardHeader>
            <CardDescription className="font-medium">{label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">{value}</CardTitle>
            <CardAction>
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                  label === "Overdue tasks" && overdue && "bg-destructive/10 text-destructive",
                )}
              >
                <Icon className="size-4.5" aria-hidden />
              </span>
            </CardAction>
          </CardHeader>
          <CardFooter className="border-t bg-muted/40 py-2.5 text-xs text-muted-foreground">
            {footer}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
