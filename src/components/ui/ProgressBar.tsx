import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  color?: "red" | "green" | "yellow";
  showLabel?: boolean;
}

const colorClasses = {
  red:    "bg-tva-red",
  green:  "bg-tva-success",
  yellow: "bg-tva-warn",
};

export function ProgressBar({ value, className, color = "red", showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const c = pct === 100 ? "green" : pct >= 60 ? "yellow" : color;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-tva-border rounded-full overflow-hidden">
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
        <span className="text-[11px] font-semibold text-tva-ink-m w-8 text-right">{pct}%</span>
      )}
    </div>
  );
}
