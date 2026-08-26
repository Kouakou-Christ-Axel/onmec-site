import type { ButtonHTMLAttributes, Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";

type IconButtonVariant = "ghost" | "outline" | "primary" | "deep" | "invert";
type IconButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent text-ink hover:bg-n-100",
  outline: "bg-transparent text-ink border border-ink/24 hover:border-ink hover:bg-n-100",
  primary: "bg-orange-500 text-white hover:bg-orange-600",
  deep: "bg-blue-500 text-white hover:bg-blue-600",
  invert: "bg-transparent text-white border border-white/24 hover:bg-white/14",
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid place-items-center rounded-sm transition-colors duration-150 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:pointer-events-none disabled:opacity-45",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      <Icon size={size === "lg" ? 20 : 16} />
    </button>
  );
}
