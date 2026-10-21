import {
  BarChart3, Building2, Cog, CreditCard, FileText, Folder, Globe, Lightbulb,
  Microscope, Palette, Rocket, ShoppingCart, Smartphone, Target, type LucideIcon,
} from "lucide-react";

/** Icons a project can use. The key is what's stored in `Project.emoji`. */
export const PROJECT_ICONS = {
  folder:     { label: "Folder",      icon: Folder },
  rocket:     { label: "Launch",      icon: Rocket },
  lightbulb:  { label: "Idea",        icon: Lightbulb },
  building:   { label: "Company",     icon: Building2 },
  smartphone: { label: "Mobile",      icon: Smartphone },
  cart:       { label: "Commerce",    icon: ShoppingCart },
  chart:      { label: "Analytics",   icon: BarChart3 },
  target:     { label: "Goal",        icon: Target },
  cog:        { label: "Operations",  icon: Cog },
  microscope: { label: "Research",    icon: Microscope },
  palette:    { label: "Design",      icon: Palette },
  document:   { label: "Docs",        icon: FileText },
  globe:      { label: "Web",         icon: Globe },
  payments:   { label: "Payments",    icon: CreditCard },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

export type ProjectIconKey = keyof typeof PROJECT_ICONS;

export const DEFAULT_PROJECT_ICON: ProjectIconKey = "folder";

export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICONS) as ProjectIconKey[];

// Projects created before icons replaced emojis still store an emoji.
const LEGACY_EMOJI: Record<string, ProjectIconKey> = {
  "📁": "folder", "🚀": "rocket", "💡": "lightbulb", "🏢": "building",
  "📱": "smartphone", "🛒": "cart", "📊": "chart", "🎯": "target",
  "⚙️": "cog", "⚙": "cog", "🔬": "microscope", "🎨": "palette",
  "📝": "document", "🌐": "globe", "💳": "payments",
};

export function resolveProjectIcon(value: string | null | undefined): ProjectIconKey {
  if (!value) return DEFAULT_PROJECT_ICON;
  if (value in PROJECT_ICONS) return value as ProjectIconKey;
  return LEGACY_EMOJI[value] ?? DEFAULT_PROJECT_ICON;
}
