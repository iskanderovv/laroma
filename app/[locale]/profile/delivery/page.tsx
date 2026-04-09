'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import ProfileSubPageLayout from '@/components/profile/ProfileSubPageLayout';
import { useProfileContent } from '@/hooks/useProfileContent';
import { getLocaleText } from '@/lib/utils/localeText';
import { ProfileContentPageSkeleton } from '@/components/profile/ProfileSkeletons';

export default function DeliveryPage() {
  const t = useTranslations('Profile');
  const locale = useLocale();
  const router = useRouter();
  const { content, isLoading, error } = useProfileContent('delivery');

  const title = content ? getLocaleText(content.title, locale) : t('delivery');
  const description = content ? getLocaleText(content.description, locale) : '';

  return (
    <ProfileSubPageLayout title={title} onBack={() => router.back()}>
      {isLoading ? (
        <ProfileContentPageSkeleton />
      ) : error ? (
        <div className="bg-white rounded-2xl p-5 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>

          {content?.sections?.map((section, index) => (
            <div key={`${section.title.uz}-${index}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {getLocaleText(section.title, locale)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {getLocaleText(section.description, locale)}
              </p>
            </div>
          ))}
        </div>
      )}
    </ProfileSubPageLayout>
  );
}
