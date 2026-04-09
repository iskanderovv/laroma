'use client';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <SkeletonBlock className="aspect-square w-full" />
          <div className="p-3 space-y-2">
            <SkeletonBlock className="h-2.5 w-16 rounded" />
            <SkeletonBlock className="h-3.5 w-full rounded" />
            <SkeletonBlock className="h-3.5 w-4/5 rounded" />
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <SkeletonBlock className="h-5 rounded-full" />
              <SkeletonBlock className="h-5 rounded-full" />
              <SkeletonBlock className="h-5 rounded-full" />
            </div>
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FilterChipsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} className="h-9 w-24 rounded-full flex-shrink-0" />
      ))}
    </div>
  );
}
