'use client';

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="bg-white rounded-b-3xl px-5 py-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <SkeletonBlock className="h-5 w-44 rounded mb-3" />
            <SkeletonBlock className="h-4 w-32 rounded" />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 mt-6 pb-24">
        <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className={`flex items-center justify-between px-5 py-4 ${
                item !== 6 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <SkeletonBlock className="w-10 h-10 rounded-2xl" />
                <SkeletonBlock className="h-4 w-40 rounded" />
              </div>
              <SkeletonBlock className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddressesPageSkeleton() {
  return (
    <div className="px-4 pt-20 pb-6 space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <SkeletonBlock className="w-5 h-5 mt-1 rounded flex-shrink-0" />
            <div className="flex-1">
              <SkeletonBlock className="h-4 w-24 rounded mb-2" />
              <SkeletonBlock className="h-3 w-full rounded mb-2" />
              <SkeletonBlock className="h-3 w-4/5 rounded mb-3" />
              <div className="flex items-center justify-between gap-3">
                <SkeletonBlock className="h-3 w-28 rounded" />
                <SkeletonBlock className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <SkeletonBlock className="h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileContentPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <SkeletonBlock className="h-4 w-full rounded mb-2" />
        <SkeletonBlock className="h-4 w-5/6 rounded" />
      </div>

      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SkeletonBlock className="h-4 w-40 rounded mb-3" />
          <SkeletonBlock className="h-3 w-full rounded mb-2" />
          <SkeletonBlock className="h-3 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function EditProfilePageSkeleton() {
  return (
    <div className="p-4 space-y-8">
      <div className="flex justify-center py-4">
        <SkeletonBlock className="w-24 h-24 rounded-full" />
      </div>

      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-32 rounded mx-4" />
        <div className="bg-white rounded-[20px] overflow-hidden border border-black/[0.03] shadow-sm">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`px-5 py-4 ${item !== 3 ? 'border-b border-black/[0.02]' : ''}`}
            >
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-4 w-20 rounded" />
                <SkeletonBlock className="h-4 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddressFormPageSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <SkeletonBlock className="h-6 w-28 rounded mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((item) => (
            <SkeletonBlock key={item} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>

      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SkeletonBlock className="h-4 w-28 rounded mb-3" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
