import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des actualités…">
      <main>
        <section className="border-b border-ink/10 bg-surface-card py-11 sm:py-14 lg:py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
            <div className="flex max-w-[760px] flex-col gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-14 w-full max-w-[680px] sm:h-16" />
              <Skeleton className="h-5 w-full max-w-[540px]" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-20 lg:px-16 lg:pb-24">
          <div className="mt-9 flex flex-wrap gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[26px] w-28 rounded-full" />
            ))}
          </div>

          {/* Article à la une : mêmes colonnes que news-filter.tsx */}
          <div className="mt-9 grid grid-cols-1 items-center gap-6 border-b border-ink/10 pb-9 lg:grid-cols-[3fr_5fr] lg:gap-12">
            <Skeleton className="aspect-video w-full rounded-md" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-9 w-full max-w-[520px]" />
              <Skeleton className="h-4 w-full max-w-[460px]" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[3/2] w-full rounded-sm" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full max-w-[90%]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </SkeletonScreen>
  );
}
