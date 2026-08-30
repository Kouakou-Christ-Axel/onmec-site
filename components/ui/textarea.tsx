import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  rows = 3,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={`min-h-[76px] w-full resize-y rounded-control border border-border-subtle bg-white px-3 py-2 font-sans text-sm text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors placeholder:text-n-400 hover:border-border-strong focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(21,86,181,0.24)] ${className}`}
      {...props}
    />
  );
}
