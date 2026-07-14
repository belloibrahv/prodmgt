import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "red" | "green" | "yellow" | "blue" | "grey";
}

const variantClasses: Record<string, string> = {
  default: "bg-tva-surface text-tva-ink-m border-tva-border",
  red:     "bg-tva-red-lt text-tva-red border-tva-red-lt",
  green:   "bg-tva-success-lt text-tva-success border-tva-success-lt",
  yellow:  "bg-tva-warn-lt text-tva-warn border-tva-warn-lt",
  blue:    "bg-tva-info-lt text-tva-info border-tva-info-lt",
  grey:    "bg-gray-100 text-gray-500 border-gray-100",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap",
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}
