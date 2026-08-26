import { cn } from "@/components/ui/cn";

/**
 * Bloc de remplacement pendant un chargement. Le garde-fou `prefers-reduced-motion` de
 * globals.css fige déjà la pulsation, il n'y a rien à gérer ici.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xs bg-n-100", className)} aria-hidden />;
}

interface SkeletonTableProps {
  /** La classe `grid-cols-[...]` de la vraie table, pour que le contenu ne saute pas. */
  columns: string;
  /** Nombre de colonnes de la grille ci-dessus. */
  columnCount: number;
  rows?: number;
  className?: string;
}

/** Reprend la structure des tables du back-office : ligne d'en-tête grisée puis lignes. */
export function SkeletonTable({ columns, columnCount, rows = 6, className }: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border-subtle bg-surface-card",
        className,
      )}
    >
      <div
        className={cn("grid gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5", columns)}
      >
        {Array.from({ length: columnCount }).map((_, i) => (
          <Skeleton key={i} className="h-3" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className={cn(
            "grid items-center gap-3.5 border-b border-border-subtle px-4 py-3 last:border-b-0",
            columns,
          )}
        >
          {Array.from({ length: columnCount }).map((_, col) => (
            <Skeleton key={col} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Enveloppe commune : annonce le chargement aux lecteurs d'écran une seule fois. */
export function SkeletonScreen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
