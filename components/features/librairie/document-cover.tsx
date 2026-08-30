import Image from "next/image";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { cn } from "@/components/ui/cn";

interface DocumentCoverProps {
  src: string | null;
  alt: string;
  ratio?: string;
  className?: string;
  compact?: boolean;
}

/** Couverture de document : vraie image R2 quand fournie, repli placeholder sinon. */
export function DocumentCover({
  src,
  alt,
  ratio = "3/4",
  className,
  compact = false,
}: DocumentCoverProps) {
  if (!src) {
    return (
      <PhotoPlaceholder
        ratio={ratio}        compact={compact}
        className={className}
      />
    );
  }

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={cn("relative w-full overflow-hidden rounded-sm", className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
