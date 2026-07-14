import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnline?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[9px] rounded",
  sm: "w-8 h-8 text-[11px] rounded-8",
  md: "w-9 h-9 text-[12px] rounded-12",
  lg: "w-12 h-12 text-base rounded-16",
  xl: "w-16 h-16 text-xl rounded-16",
};

const imgSizes = { xs: 24, sm: 32, md: 36, lg: 48, xl: 64 };

export function Avatar({ name, image, size = "md", className, showOnline }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div className={cn(
        "flex items-center justify-center bg-tva-red-lt text-tva-red font-bold select-none overflow-hidden",
        sizeClasses[size],
      )}>
        {image ? (
          <Image
            src={image}
            alt={name ?? ""}
            width={imgSizes[size]}
            height={imgSizes[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tva-online rounded-full border-2 border-white" />
      )}
    </div>
  );
}

export function AvatarGroup({ users, max = 3 }: { users: Array<{ name?: string | null; image?: string | null }>; max?: number }) {
  const visible = users.slice(0, max);
  const rest = users.length - max;
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} image={u.image} size="sm"
          className="border-2 border-white ring-0" />
      ))}
      {rest > 0 && (
        <div className="w-8 h-8 rounded-8 bg-tva-surface border-2 border-white flex items-center justify-center text-[10px] font-bold text-tva-ink-m">
          +{rest}
        </div>
      )}
    </div>
  );
}
