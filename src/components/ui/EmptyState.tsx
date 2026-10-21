import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; className?: string };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-14 text-center gap-3", className)}>
      {icon && <div className="text-muted-foreground/40 mb-1">{icon}</div>}
      <p className="text-[15px] font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action && (
        <Button onClick={action.onClick} size="sm" className={cn("mt-2", action.className)}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
