import { cn, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
      STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500",
    )}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const dots: Record<string, string> = {
    LOW: "bg-tva-success", MEDIUM: "bg-tva-info", HIGH: "bg-tva-warn", CRITICAL: "bg-tva-error",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
      PRIORITY_COLORS[priority] ?? "bg-gray-100 text-gray-500",
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dots[priority])} />
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
