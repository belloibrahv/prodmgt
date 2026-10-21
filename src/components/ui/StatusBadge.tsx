import { ChevronDown, ChevronsUp, ChevronUp, Equal } from "lucide-react";
import { cn, STATUS_COLORS, STATUS_DOTS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";

const pill = "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium";

/** Task or project status: a coloured dot plus its label. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn(pill, STATUS_COLORS[status] ?? "bg-muted text-muted-foreground", className)}>
      <span className={cn("size-1.5 rounded-full", STATUS_DOTS[status] ?? "bg-muted-foreground")} aria-hidden />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const PRIORITY_ICONS: Record<string, typeof ChevronUp> = {
  LOW: ChevronDown, MEDIUM: Equal, HIGH: ChevronUp, CRITICAL: ChevronsUp,
};

/** Priority with a direction icon, so it doesn't rely on colour alone. */
export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const Icon = PRIORITY_ICONS[priority] ?? Equal;
  return (
    <span className={cn(pill, PRIORITY_COLORS[priority] ?? "bg-muted text-muted-foreground", className)}>
      <Icon className="size-3.5" aria-hidden />
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
