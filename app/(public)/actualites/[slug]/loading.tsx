import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement de l’article…">
      <main className="mx-auto max-w-[1280px] px-5 py-11 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
        <Skeleton className="h-4 w-40" />
        <div className="mx-auto mt-9 flex max-w-[760px] flex-col gap-4">
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-12 w-full sm:h-14" />
          <Skeleton className="h-5 w-full max-w-[620px]" />
        </div>
        <Skeleton className="mx-auto mt-9 aspect-video w-full max-w-[980px] rounded-md" />
        <div className="mx-auto mt-9 flex max-w-[760px] flex-col gap-3.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className={i % 4 === 3 ? "h-4 w-2/3" : "h-4 w-full"} />
          ))}
        </div>
      </main>
    </SkeletonScreen>
  );
}
