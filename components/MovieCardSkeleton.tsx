export default function MovieCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-line bg-surface">
      <div className="aspect-[2/3] bg-surface-2" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-surface-2" />
        <div className="h-3 w-1/2 rounded bg-surface-2" />
      </div>
    </div>
  );
}