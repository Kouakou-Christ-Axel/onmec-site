import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative block">
      <select
        className={`h-9 w-full appearance-none rounded-control border border-border-subtle bg-white pr-9 pl-3 font-sans text-sm text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors hover:border-border-strong focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(21,86,181,0.24)] ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-n-400" />
    </div>
  );
}
