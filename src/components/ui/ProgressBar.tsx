import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  color?: "red" | "green" | "yellow";
  showLabel?: boolean;
}

const colorClasses = {
  red:    "bg-primary",
  green:  "bg-success",
  yellow: "bg-warning",
};

export function ProgressBar({ value, className, color = "red", showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const c = pct === 100 ? "green" : pct >= 60 ? "yellow" : color;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClasses[c])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{pct}%</span>
      )}
    </div>
  );
}
