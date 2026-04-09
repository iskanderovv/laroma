'use client';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export default function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg h-14 px-4 border-b border-black/[0.03]" />

      <div className="pt-14 pb-28">
        <div className="px-4 pt-4">
          <SkeletonBlock className="w-full aspect-square rounded-3xl" />
        </div>

        <div className="px-4 mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SkeletonBlock className="h-3 w-24 rounded mb-3" />
            <SkeletonBlock className="h-6 w-3/4 rounded mb-2" />
            <SkeletonBlock className="h-6 w-1/2 rounded" />

            <div className="mt-4 flex items-center gap-3">
              <SkeletonBlock className="h-6 w-28 rounded" />
              <SkeletonBlock className="h-5 w-16 rounded" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-2">
            <SkeletonBlock className="h-4 w-28 rounded" />
            <SkeletonBlock className="h-3 w-full rounded" />
            <SkeletonBlock className="h-3 w-5/6 rounded" />
            <SkeletonBlock className="h-3 w-2/3 rounded" />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SkeletonBlock className="h-4 w-20 rounded mb-3" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full" />
              <SkeletonBlock className="h-7 w-24 rounded-full" />
              <SkeletonBlock className="h-7 w-16 rounded-full" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SkeletonBlock className="h-4 w-28 rounded mb-3" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full" />
              <SkeletonBlock className="h-7 w-24 rounded-full" />
              <SkeletonBlock className="h-7 w-16 rounded-full" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <SkeletonBlock className="h-4 w-24 rounded" />
            <div className="rounded-xl border border-gray-100 p-3 space-y-2">
              <SkeletonBlock className="h-3 w-28 rounded" />
              <SkeletonBlock className="h-3 w-full rounded" />
              <SkeletonBlock className="h-3 w-4/5 rounded" />
            </div>
            <div className="rounded-xl border border-gray-100 p-3 space-y-2">
              <SkeletonBlock className="h-3 w-24 rounded" />
              <SkeletonBlock className="h-3 w-full rounded" />
              <SkeletonBlock className="h-3 w-3/4 rounded" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SkeletonBlock className="h-4 w-36 rounded mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((item) => (
                <div key={item} className="rounded-xl border border-gray-100 p-2">
                  <SkeletonBlock className="aspect-square rounded-lg mb-2" />
                  <SkeletonBlock className="h-3 w-full rounded mb-1.5" />
                  <SkeletonBlock className="h-3 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg border-t border-black/[0.05] bg-white p-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-11 w-11 rounded-xl" />
          <SkeletonBlock className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
