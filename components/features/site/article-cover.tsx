import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { cn } from "@/components/ui/cn";

interface ArticleCoverProps {
  /** URL absolue servie par l'API, ou null quand l'article n'a pas d'image. */
  src: string | null;
  alt: string;
  ratio?: string;
  duotone?: boolean;
  placeholderLabel?: string;
  className?: string;
}

/**
 * Couverture d'article : vraie image quand l'API en fournit une, repli sur le placeholder sinon.
 *
 * `<img>` natif plutôt que `next/image` : les images viennent du domaine de l'API, qui diffère
 * entre local et production, et aucun `images.remotePatterns` n'est déclaré dans next.config.ts.
 * Passer par l'optimiseur demanderait cette configuration — à faire séparément.
 */
export function ArticleCover({
  src,
  alt,
  ratio = "3/2",
  duotone = false,
  placeholderLabel,
  className,
}: ArticleCoverProps) {
  if (!src) {
    return (
      <PhotoPlaceholder
        ratio={ratio}
        duotone={duotone}
        label={placeholderLabel ?? "Photo à fournir"}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{ aspectRatio: ratio }}
      className={cn("w-full rounded-sm object-cover", className)}
    />
  );
}
