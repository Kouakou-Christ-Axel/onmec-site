import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

/**
 * Un `loading.tsx` couvre son segment ET ses enfants : celui-ci sert donc les huit pages du
 * back-office. Les routes dont la mise en page est trop spécifique pour ce squelette neutre
 * posent le leur, qui prend le pas (voir `actualites/loading.tsx`).
 *
 * Volontairement neutre : les pages du shell alternent tables, cartes et tuiles de chiffres.
 * Un squelette qui imiterait une table ferait sauter la mise en page sur `statistiques` ou
 * `campagnes`.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Chargement en cours…">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-10 w-40 rounded-sm" />
        </div>
        <Skeleton className="h-[420px] w-full rounded-lg" />
      </div>
    </SkeletonScreen>
  );
}
