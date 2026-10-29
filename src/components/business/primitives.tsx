import type { Health } from "@prisma/client";
import { cn } from "@/lib/utils";
import { HEALTH, HEALTH_ORDER } from "@/lib/business";

const pill = "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium";

export function HealthBadge({ health, className }: { health: Health | null | undefined; className?: string }) {
  if (!health) return <span className={cn(pill, "bg-muted text-muted-foreground", className)}>No status</span>;
  const tone = HEALTH[health];
  return (
    <span className={cn(pill, tone.badge, className)}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: tone.color }} aria-hidden />
      {tone.label}
    </span>
  );
}

/** Small pill for any label/tint pair from lib/business. */
export function ToneBadge({ label, badge, className }: { label: string; badge: string; className?: string }) {
  return <span className={cn(pill, badge, className)}>{label}</span>;
}

/** One bar split by health, so a meeting or portfolio reads at a glance. */
export function HealthBar({
  values, className, showLegend = false,
}: { values: (Health | null)[]; className?: string; showLegend?: boolean }) {
  const counts = HEALTH_ORDER
    .map((h) => ({ h, n: values.filter((v) => v === h).length }))
    .filter((c) => c.n > 0);
  const total = values.filter(Boolean).length;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted" role="img"
        aria-label={counts.map((c) => `${c.n} ${HEALTH[c.h].label.toLowerCase()}`).join(", ") || "No status yet"}>
        {counts.map(({ h, n }) => (
          <span key={h} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(n / total) * 100}%`, backgroundColor: HEALTH[h].color }} />
        ))}
      </div>
      {showLegend && counts.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {counts.map(({ h, n }) => (
            <li key={h} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: HEALTH[h].color }} aria-hidden />
              {HEALTH[h].label} <span className="font-medium text-foreground tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Circular progress with an optional tick showing where progress should be by now,
 * so "behind pace" is visible without reading numbers.
 */
export function ProgressRing({
  value, expected, color = "var(--primary)", size = 64, stroke = 6, children, className,
}: {
  value: number;
  expected?: number;
  color?: string;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value));
  const tick = expected === undefined ? null : Math.min(1, Math.max(0, expected));
  const angle = tick === null ? 0 : tick * 2 * Math.PI - Math.PI / 2;
  const cx = size / 2;

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {tick !== null && (
        <svg width={size} height={size} className="absolute inset-0" aria-hidden>
          <line
            x1={cx + (r - stroke) * Math.cos(angle)} y1={cx + (r - stroke) * Math.sin(angle)}
            x2={cx + (r + stroke) * Math.cos(angle)} y2={cx + (r + stroke) * Math.sin(angle)}
            stroke="var(--foreground)" strokeWidth={2} strokeLinecap="round" opacity={0.55}
          />
        </svg>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Tiny trend line from check-in values. */
export function Sparkline({ values, color = "var(--primary)", className }: { values: number[]; color?: string; className?: string }) {
  if (values.length < 2) return <span className={cn("block h-6 w-20", className)} aria-hidden />;
  const w = 80, h = 24;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / span) * (h - 4)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-6 w-20 overflow-visible", className)} aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={points.split(" ").pop()!.split(",")[1]} r={2.25} fill={color} />
    </svg>
  );
}

/** Stat tile used on the business pages' summary rows. */
export function StatTile({
  label, value, hint, icon: Icon, tone,
}: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: "danger" | "success" | "warning" }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4.5",
        tone === "danger" && "bg-destructive/10 text-destructive",
        tone === "success" && "bg-success/10 text-success",
        tone === "warning" && "bg-warning/10 text-warning",
      )}>
        <Icon aria-hidden />
      </span>
    </div>
  );
}
