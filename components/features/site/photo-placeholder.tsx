import { ImageOff } from "lucide-react";

type PhotoPlaceholderProps = {
  ratio?: string;
  label?: string;
  hint?: string;
  square?: boolean;
  duotone?: boolean;
  compact?: boolean;
  className?: string;
};

/** Bloc "photo à fournir" — remplace .mec-photo__ph du design system tant qu'aucun média réel n'existe. */
export function PhotoPlaceholder({
  ratio = "4/5",
  label = "Photo à fournir",
  hint,
  square = false,
  duotone = false,
  compact = false,
  className = "",
}: PhotoPlaceholderProps) {
  return (
    <div
      role={compact ? "img" : undefined}
      aria-label={compact ? label : undefined}
      className={`relative isolate overflow-hidden bg-repeat dark:brightness-[.86] dark:saturate-[.94] ${square ? "rounded-none" : "rounded-md"} ${className}`}
      style={{
        aspectRatio: ratio,
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--color-n-100) 0 10px, var(--color-n-50) 10px 20px)",
      }}
    >
      {duotone ? (
        <div className="absolute inset-0 bg-blue-500/25 mix-blend-multiply" aria-hidden />
      ) : null}
      {compact ? null : (
        <div className="absolute inset-0 grid place-items-center gap-3 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <ImageOff className="h-8 w-8 text-n-400" aria-hidden />
            <span className="text-xs font-semibold tracking-widest text-n-400 uppercase">
              {label}
            </span>
            {hint ? <span className="max-w-[24ch] text-sm text-text-muted">{hint}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}
