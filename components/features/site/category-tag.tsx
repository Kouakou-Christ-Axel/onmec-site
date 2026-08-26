import type { ActualiteTaxon } from "@/features/actualites/types/article";

/**
 * Les catégories sont créées librement en back-office : impossible de garder un
 * `Record<CategorieFermee, string>`. La teinte est dérivée du slug, donc stable dans le temps
 * pour une catégorie donnée, sans avoir à recenser les valeurs possibles.
 */
const TEINTES = [
  "bg-orange-100 text-orange-800",
  "bg-blue-100 text-blue-700",
  "bg-n-100 text-[#2b3646]",
  "bg-orange-50 text-orange-700",
];

function teintePourSlug(slug: string): string {
  let somme = 0;
  for (let i = 0; i < slug.length; i++) somme = (somme + slug.charCodeAt(i)) % 997;
  return TEINTES[somme % TEINTES.length];
}

export function CategoryTag({ categorie }: { categorie: ActualiteTaxon | null }) {
  if (!categorie) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${teintePourSlug(categorie.slug)}`}
    >
      {categorie.nom}
    </span>
  );
}
