import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "red" | "green" | "yellow" | "blue" | "grey";
}

const variantClasses: Record<string, string> = {
  default: "bg-muted text-muted-foreground border-border",
  red:     "bg-primary/10 text-primary border-primary-lt",
  green:   "bg-success/10 text-success border-tva-success-lt",
  yellow:  "bg-warning/10 text-warning border-tva-warn-lt",
  blue:    "bg-info/10 text-info border-tva-info-lt",
  grey:    "bg-gray-100 text-gray-500 border-gray-100",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap",
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}
