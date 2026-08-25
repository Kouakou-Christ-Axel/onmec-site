import Link from "next/link";
import type { Ressource } from "@/features/ressources/types/ressource";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { formatCount } from "@/features/ressources/lib/format-count";

export function RessourceCard({ ressource }: { ressource: Ressource }) {
  return (
    <Link href={`/ressources/${ressource.slug}`} className="group flex flex-col gap-4">
      <div className="relative">
        <PhotoPlaceholder ratio="3/4" label="Couverture à fournir" />
        <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-surface-card px-2.5 py-1 text-[10px] font-semibold tracking-wide text-text-muted uppercase">
          {ressource.format}
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-surface-page uppercase">
          {ressource.theme}
        </span>
      </div>
      <h3 className="text-h3 leading-snug font-semibold text-ink transition-colors group-hover:text-orange-700">
        {ressource.title}
      </h3>
      <p className="text-sm leading-relaxed text-text-muted">{ressource.excerpt}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span>{ressource.date}</span>
        <span>·</span>
        <span>{ressource.pages} p.</span>
        <span>—</span>
        <span>{formatCount(ressource.downloads)} téléch.</span>
      </div>
    </Link>
  );
}
