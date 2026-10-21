import { cn } from "@/lib/utils";
import { PROJECT_ICONS, resolveProjectIcon } from "@/lib/project-icons";

const sizes = {
  xs: { box: "size-5 rounded-md",  icon: "size-3" },
  sm: { box: "size-7 rounded-lg",  icon: "size-3.5" },
  md: { box: "size-9 rounded-lg",  icon: "size-4" },
  lg: { box: "size-12 rounded-xl", icon: "size-6" },
};

interface Props {
  icon: string | null | undefined;
  color?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}

/** A project's icon on a tile tinted with the project colour. */
export function ProjectIcon({ icon, color, size = "md", className }: Props) {
  const key = resolveProjectIcon(icon);
  const { icon: Icon, label } = PROJECT_ICONS[key];
  const tint = color ?? "#bc0004";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", sizes[size].box, className)}
      style={{ backgroundColor: `color-mix(in srgb, ${tint} 12%, transparent)`, color: tint }}
      title={label}
    >
      <Icon className={sizes[size].icon} strokeWidth={2} aria-hidden />
    </span>
  );
}
