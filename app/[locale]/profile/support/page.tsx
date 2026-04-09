'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Headset,
  Phone,
} from 'lucide-react';
import ProfileSubPageLayout from '@/components/profile/ProfileSubPageLayout';
import { ProfileContentPageSkeleton } from '@/components/profile/ProfileSkeletons';
import { useProfileContent } from '@/hooks/useProfileContent';
import { ProfileSocialLink } from '@/lib/api/apiService';
import { getLocaleText } from '@/lib/utils/localeText';

const getSocialIcon = (type: string) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes('telegram')) return Headset;
  if (normalizedType.includes('instagram')) return Headset;
  if (normalizedType.includes('facebook')) return Headset;

  return Headset;
};

export default function SupportPage() {
  const t = useTranslations('Profile');
  const locale = useLocale();
  const router = useRouter();
  const { content, isLoading, error } = useProfileContent('support');

  const title = content ? getLocaleText(content.title, locale) : t('support');
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
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>

          {content?.phone && (
            <a
              href={`tel:${content.phone}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between active:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefon</p>
                  <p className="text-sm font-semibold text-gray-900">{content.phone}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>
          )}

          {content?.socialLinks?.map((item: ProfileSocialLink) => {
            const Icon = getSocialIcon(item.type);

            return (
              <a
                key={`${item.type}-${item.label}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between active:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            );
          })}

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
