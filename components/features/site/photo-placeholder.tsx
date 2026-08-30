import { ImageOff } from "lucide-react";

type PhotoPlaceholderProps = {
  ratio?: string;
  square?: boolean;
  duotone?: boolean;
  /** Vignette trop petite pour l'icône — ne rend que la trame. */
  compact?: boolean;
  className?: string;
};

/**
 * Trame affichée à la place d'un média tant qu'aucune image réelle n'est disponible.
 *
 * Purement décoratif : ne rend aucun texte et reste `aria-hidden`. Une version antérieure affichait
 * un libellé (« Photo à fournir », « Portrait à fournir »...) qui partait dans le HTML rendu — donc
 * visible par les visiteurs et indexable par les moteurs (audit SEO §4.1). Le cas le plus exposé
 * était `article-cover.tsx` : le libellé s'affichait sur chaque article sans couverture, en page
 * d'accueil comme dans la liste des actualités.
 *
 * Une image absente ne se raconte pas à l'utilisateur. Pour signaler un média manquant à l'équipe,
 * l'endroit juste est le back-office, pas la page publique.
 */
export function PhotoPlaceholder({
  ratio = "4/5",
  square = false,
  duotone = false,
  compact = false,
  className = "",
}: PhotoPlaceholderProps) {
  return (
    <div
      aria-hidden
      className={`relative isolate overflow-hidden bg-repeat dark:brightness-[.86] dark:saturate-[.94] ${square ? "rounded-none" : "rounded-md"} ${className}`}
      style={{
        aspectRatio: ratio,
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--color-n-100) 0 10px, var(--color-n-50) 10px 20px)",
      }}
    >
      {duotone ? <div className="absolute inset-0 bg-blue-500/25 mix-blend-multiply" /> : null}
      {compact ? null : (
        <div className="absolute inset-0 grid place-items-center p-6">
          <ImageOff className="h-8 w-8 text-n-400" />
        </div>
      )}
    </div>
  );
}
