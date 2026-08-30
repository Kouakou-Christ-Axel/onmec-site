import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";

type TagTone = "neutral" | "orange" | "blue" | "solid" | "outline" | "invert";
type TagSize = "sm" | "md";

const TONE_CLASSES: Record<TagTone, string> = {
  neutral: "bg-n-100 text-text-body",
  orange: "bg-orange-100 text-orange-800",
  blue: "bg-blue-100 text-blue-700",
  solid: "bg-orange-500 text-white",
  outline: "bg-transparent text-text-body border border-ink/24",
  invert: "bg-white/16 text-white",
};

const SIZE_CLASSES: Record<TagSize, string> = {
  sm: "h-[22px] px-2.5 text-[0.6875rem]",
  md: "h-[26px] px-3 text-xs",
};

interface TagProps {
  tone?: TagTone;
  size?: TagSize;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Tag({
  tone = "neutral",
  size = "sm",
  active = false,
  icon: Icon,
  onClick,
  children,
  className = "",
}: TagProps) {
  const interactive = typeof onClick === "function";
  const Comp = interactive ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      aria-pressed={interactive ? active : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold tracking-[0.06em] uppercase",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        interactive &&
          "cursor-pointer transition-colors duration-150 ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        active && "border-ink bg-ink text-white",
        className,
      )}
    >
      {Icon ? <Icon size={12} /> : null}
      {children}
    </Comp>
  );
}
