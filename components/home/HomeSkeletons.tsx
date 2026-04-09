'use client';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function BannerSectionSkeleton() {
  return (
    <div className="py-4">
      <div className="px-4">
        <SkeletonBlock className="h-44 w-full rounded-3xl" />
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <SkeletonBlock className="h-2 w-6 rounded-full" />
        <SkeletonBlock className="h-2 w-2 rounded-full" />
        <SkeletonBlock className="h-2 w-2 rounded-full" />
      </div>
    </div>
  );
}

export function CategorySectionSkeleton() {
  return (
    <div className="px-4 py-2 flex flex-col gap-3">
      <SkeletonBlock className="h-6 w-36 rounded" />

      <div className="flex gap-4 overflow-hidden pb-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex flex-col items-center gap-2 min-w-[70px]">
            <SkeletonBlock className="w-16 h-16 rounded-2xl" />
            <SkeletonBlock className="h-3 w-14 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      <SkeletonBlock className="w-full aspect-square" />

      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <SkeletonBlock className="h-2.5 w-20 rounded mb-2" />
            <SkeletonBlock className="h-3.5 w-full rounded mb-1.5" />
            <SkeletonBlock className="h-3.5 w-4/5 rounded" />
          </div>
          <SkeletonBlock className="h-5 w-10 rounded-lg" />
        </div>

        <div className="flex gap-1.5">
          <SkeletonBlock className="h-4 w-12 rounded-full" />
          <SkeletonBlock className="h-4 w-12 rounded-full" />
        </div>

        <div className="pt-2 space-y-2">
          <SkeletonBlock className="h-4 w-24 rounded" />
          <SkeletonBlock className="h-8 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductSectionSkeleton() {
  return (
    <div className="px-4 py-6 flex flex-col gap-4 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-32 rounded" />
        <SkeletonBlock className="h-4 w-20 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <ProductCardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
}
