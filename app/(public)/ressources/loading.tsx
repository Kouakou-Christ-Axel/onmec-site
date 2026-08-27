import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des ressources…">
      <main>
        <section className="py-11 sm:py-14 lg:py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div className="flex max-w-[760px] flex-col gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-14 w-full max-w-[620px] sm:h-16" />
                <Skeleton className="h-5 w-full max-w-[540px]" />
              </div>
              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
          {/* Barre d'outils : recherche, pastilles de thème, puis les trois sélecteurs. */}
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-full max-w-[285px] rounded-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[26px] w-28 rounded-full" />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-40 rounded-sm" />
            ))}
          </div>

          <div className="mt-9 flex flex-col">
            <div className="flex gap-4 border-b border-ink/10 py-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 flex-1" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-ink/10 py-4">
                <Skeleton className="h-16 w-14 rounded-xs" />
                <Skeleton className="h-4 flex-[3]" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-8 w-20 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </SkeletonScreen>
  );
}
