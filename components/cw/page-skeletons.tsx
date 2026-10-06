import { Skeleton } from "@/components/ui/skeleton";

// Route-level skeletons that mirror each view's real layout.

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8" role="status" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-6 flex gap-3 border-b pb-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-5 w-24" />
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <Frame>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Skeleton className="m-4 h-6 w-40" />
        <div className="grid grid-cols-7 border-t">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="h-24 border-r border-b p-2 [&:nth-child(7n)]:border-r-0">
              <Skeleton className="size-5 rounded-full" />
              {i % 4 === 1 && <Skeleton className="mt-2 h-5 w-full rounded-md" />}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function TimelineSkeleton() {
  return (
    <Frame>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Skeleton className="h-9 rounded-none" />
        {[40, 55, 70].map((left, i) => (
          <div key={i} className="flex h-16 items-center border-t">
            <div className="w-56 shrink-0 border-r px-4">
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 rounded-lg" style={{ marginLeft: `${left / 3}%`, width: `${100 - left}%` }} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function TasksSkeleton() {
  return (
    <Frame>
      <div className="flex flex-col gap-4">
        {[5, 3, 4].map((rows, g) => (
          <div key={g} className="rounded-2xl border bg-card p-4">
            <Skeleton className="mb-3 h-4 w-28" />
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 flex-1" style={{ maxWidth: `${70 - i * 7}%` }} />
                <Skeleton className="h-5 w-6 rounded-md" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function MissionSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-56 rounded-none sm:h-72" />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pt-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
        <Skeleton className="h-20 rounded-2xl sm:col-span-2 lg:col-span-4" />
        <Skeleton className="h-80 rounded-2xl sm:col-span-2 lg:col-span-3" />
        <Skeleton className="hidden h-80 rounded-2xl lg:block" />
      </div>
    </div>
  );
}
