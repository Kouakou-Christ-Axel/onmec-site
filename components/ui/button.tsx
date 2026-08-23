import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "deep" | "invert" | "outline-invert";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
  secondary: "bg-transparent text-ink border border-ink/24 hover:bg-n-100 hover:border-ink",
  ghost: "bg-transparent text-ink hover:bg-n-100",
  deep: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
  invert: "bg-white text-ink hover:bg-n-100",
  "outline-invert": "bg-transparent text-white border border-white/24 hover:bg-white/12 hover:border-white",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-sm gap-2",
  md: "h-10 px-5 text-[0.9375rem] gap-2.5",
  lg: "h-12 px-7 text-base gap-2.5",
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 18 };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  full?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  full = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm font-semibold tracking-[-0.005em] transition-colors disabled:pointer-events-none disabled:opacity-45 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={ICON_SIZE[size]} /> : null}
      {children}
    </button>
  );
}
