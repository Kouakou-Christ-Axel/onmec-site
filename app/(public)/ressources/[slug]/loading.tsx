import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement du guide…">
      <main className="mx-auto max-w-[1280px] px-5 py-11 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
        <Skeleton className="h-4 w-44" />
        <div className="mt-9 grid grid-cols-1 gap-10 lg:grid-cols-[350px_1fr] lg:gap-16">
          <Skeleton className="aspect-[3/4] w-full rounded-md" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-full max-w-[560px]" />
            <Skeleton className="h-5 w-full max-w-[480px]" />
            <div className="mt-4 grid grid-cols-2 gap-6 border-y border-ink/10 py-6 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-2 h-[54px] w-56 rounded-sm" />
            <Skeleton className="h-4 w-full max-w-[420px]" />
          </div>
        </div>
      </main>
    </SkeletonScreen>
  );
}
