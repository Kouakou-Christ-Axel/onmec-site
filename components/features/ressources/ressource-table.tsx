import Link from "next/link";
import type { Ressource } from "@/features/ressources/types/ressource";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { formatCount } from "@/features/ressources/lib/format-count";

export function RessourceTable({
  ressources,
  onPreview,
}: {
  ressources: Ressource[];
  onPreview: (slug: string) => void;
}) {
  return (
    <table className="hidden w-full border-collapse text-sm lg:table">
      <thead>
        <tr className="border-b border-ink/10 text-left text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          <th className="w-20 py-3 pr-4 font-semibold">Couverture</th>
          <th className="py-3 pr-4 font-semibold">Titre</th>
          <th className="py-3 pr-4 font-semibold">Thème</th>
          <th className="py-3 pr-4 font-semibold">Format</th>
          <th className="py-3 pr-4 font-semibold">Accès</th>
          <th className="py-3 pr-4 font-semibold">Téléchargements</th>
          <th className="py-3 pr-4 font-semibold">
            <span className="sr-only">Aperçu</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {ressources.map((ressource) => (
          <tr key={ressource.slug} className="border-b border-ink/10 align-middle">
            <td className="py-3 pr-4">
              <PhotoPlaceholder ratio="3/4" label="Couverture" className="w-14" />
            </td>
            <td className="py-3 pr-4">
              <Link
                href={`/ressources/${ressource.slug}`}
                className="font-semibold text-ink transition-colors hover:text-orange-700"
              >
                {ressource.title}
              </Link>
              <p className="mt-1 line-clamp-1 text-xs text-text-muted">{ressource.excerpt}</p>
            </td>
            <td className="py-3 pr-4 text-text-muted">{ressource.theme}</td>
            <td className="py-3 pr-4 text-text-muted">{ressource.format}</td>
            <td className="py-3 pr-4 text-text-muted">{ressource.acces}</td>
            <td className="py-3 pr-4 text-text-muted">{formatCount(ressource.downloads)}</td>
            <td className="py-3 pr-4 text-right">
              <button
                type="button"
                onClick={() => onPreview(ressource.slug)}
                className="inline-flex h-8 items-center rounded-sm border border-ink/24 px-3 text-xs font-semibold text-ink transition-colors hover:bg-n-100"
              >
                Aperçu
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
