'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Languages,
  UserCircle,
  Headset,
  MapPin,
  Truck,
  ChevronRight,
  Info
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ProfilePageSkeleton } from '@/components/profile/ProfileSkeletons';

export default function Profile() {
  const t = useTranslations('Profile');
  const { user, isLoading } = useAuth();

  const menuItems = [
    { id: 'edit', label: t('edit'), icon: UserCircle, href: '/profile/edit' },
    { id: 'language', label: t('language'), icon: Languages, href: '/profile/language' },
    { id: 'addresses', label: t('addresses'), icon: MapPin, href: '/profile/addresses' },
    { id: 'support', label: t('support'), icon: Headset, href: '/profile/support' },
    { id: 'delivery', label: t('delivery'), icon: Truck, href: '/profile/delivery' },
    { id: 'about', label: t('about'), icon: Info, href: '/profile/about' }
  ];

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return null;
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* User Header */}
      <div>
        <div className="bg-white rounded-b-3xl px-5 py-6 shadow-md border border-gray-100">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <User className="w-8 h-8 text-gray-400" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user ? `${user.firstName} ${user.lastName || ''}` : 'Mehmon'}
              </h2>
              {user && (
                <p className="text-sm text-gray-600 font-medium">
                  {user.phone ? formatPhone(user.phone) : (user.username ? `@${user.username}` : 'Laroma\'s xaridori')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 space-y-6 mt-6 pb-24">
        <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">
          {menuItems.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-5 py-4 active:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
            >
              <div className="flex items-center gap-4 text-gray-800">
                <div className="text-primary bg-primary/10 p-2.5 rounded-2xl">
                  <item.icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[15px] font-semibold">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
