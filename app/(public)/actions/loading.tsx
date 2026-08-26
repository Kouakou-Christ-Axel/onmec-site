import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des actions…">
      <main>
        {/* Hero sombre à motif : on garde le fond réel, seul le texte est en attente. */}
        <section
          className="overflow-hidden bg-brand-flat py-14 text-white sm:py-18 lg:py-24"
          style={{ backgroundImage: "var(--pattern-stripes)" }}
        >
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-8 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-16">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-3 w-28 bg-white/25" />
              <Skeleton className="h-14 w-full max-w-[620px] bg-white/25 sm:h-16" />
              <Skeleton className="h-5 w-full max-w-[520px] bg-white/25" />
            </div>
            <div className="grid grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full bg-white/25" />
                  <Skeleton className="h-3 w-full bg-white/25" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3.5 rounded-lg border border-ink/10 p-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-full max-w-[220px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>

            <div className="mt-16 flex flex-col gap-6">
              <Skeleton className="h-8 w-64" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 border-b border-ink/10 pb-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full max-w-[420px]" />
                  <Skeleton className="h-4 w-full max-w-[560px]" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SkeletonScreen>
  );
}
