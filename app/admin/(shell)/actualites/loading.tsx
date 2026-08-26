import { Skeleton, SkeletonScreen, SkeletonTable } from "@/components/ui/skeleton";

const COLUMNS = "grid-cols-[minmax(0,1fr)_120px_156px_116px_140px_150px]";

/**
 * Prend le pas sur `(shell)/loading.tsx` : cette page attend réellement le réseau
 * (`await listActualitesAdmin()`), et sa table a une grille précise qu'on reprend à
 * l'identique depuis `actualites-admin-client.tsx` pour éviter tout saut au remplacement.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des actualités…">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-10 w-44 rounded-sm" />
        </div>
        <SkeletonTable columns={COLUMNS} columnCount={6} rows={6} />
      </div>
    </SkeletonScreen>
  );
}
