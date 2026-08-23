import type { InputHTMLAttributes } from "react";

type InputSize = "default" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
}

export function Input({ size = "default", className = "", ...props }: InputProps) {
  const sizeClasses = size === "lg" ? "h-11 px-4 text-base" : "h-9 px-3 text-sm";
  return (
    <input
      className={`w-full rounded-control border border-border-subtle bg-white font-sans text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors placeholder:text-n-400 hover:border-border-strong focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(21,86,181,0.24)] disabled:cursor-not-allowed disabled:bg-n-50 disabled:opacity-50 ${sizeClasses} ${className}`}
      {...props}
    />
  );
}
