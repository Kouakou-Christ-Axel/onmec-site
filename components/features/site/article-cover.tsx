import Image from "next/image";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { cn } from "@/components/ui/cn";

interface ArticleCoverProps {
  /** URL absolue servie par l'API, ou null quand l'article n'a pas d'image. */
  src: string | null;
  alt: string;
  ratio?: string;
  duotone?: boolean;
  /** Largeur rendue selon le point de rupture — sert au choix de la variante par l'optimiseur. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Couverture d'article : vraie image quand l'API en fournit une, repli sur le placeholder sinon.
 *
 * `next/image` avec `fill` plutôt que des dimensions fixes : les ratios varient d'un emplacement à
 * l'autre (3/2 en carte, 16/9 à la une, 21/9 en tête d'article) et l'API ne renvoie pas les
 * dimensions de l'image. Le conteneur porte donc le ratio.
 *
 * L'optimisation passe par `/_next/image`, branché sur le binding Cloudflare Images
 * (`imagesOptimizer()` dans vite.config.ts) : redimensionnement et AVIF/WebP à l'edge. L'hôte de
 * l'API doit être listé dans `images.remotePatterns` (next.config.ts), sinon l'optimisation échoue.
 */
export function ArticleCover({
  src,
  alt,
  ratio = "3/2",
  duotone = false,
  sizes = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className,
}: ArticleCoverProps) {
  if (!src) {
    return (
      <PhotoPlaceholder ratio={ratio} duotone={duotone} className={className} />
    );
  }

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={cn("relative w-full overflow-hidden rounded-sm", className)}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
