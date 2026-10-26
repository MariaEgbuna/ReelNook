export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 h-5 w-16 animate-pulse rounded bg-surface-2" />

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="aspect-[2/3] w-full shrink-0 animate-pulse rounded-lg bg-surface-2 md:w-72" />

        <div className="w-full space-y-3">
          <div className="h-9 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="flex gap-2">
            <div className="h-7 w-20 animate-pulse rounded-full bg-surface-2" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-surface-2" />
          </div>
          <div className="h-10 w-44 animate-pulse rounded-lg bg-surface-2" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      </div>
    </main>
  );
}