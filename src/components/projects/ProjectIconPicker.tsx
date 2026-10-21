"use client";

import { cn } from "@/lib/utils";
import { PROJECT_ICONS, PROJECT_ICON_KEYS, resolveProjectIcon, type ProjectIconKey } from "@/lib/project-icons";

interface Props {
  value: string;
  color: string;
  onChange: (key: ProjectIconKey) => void;
}

/** Grid of project icons, shown in the project's colour. */
export function ProjectIconPicker({ value, color, onChange }: Props) {
  const selected = resolveProjectIcon(value);
  return (
    <div role="radiogroup" aria-label="Project icon" className="grid max-w-[232px] grid-cols-7 gap-1.5">
      {PROJECT_ICON_KEYS.map((key) => {
        const { icon: Icon, label } = PROJECT_ICONS[key];
        const active = key === selected;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(key)}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active ? "border-transparent ring-2 ring-current" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            style={active ? { color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` } : undefined}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
