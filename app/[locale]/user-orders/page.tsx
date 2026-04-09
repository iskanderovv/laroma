'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, Clock3, PackageCheck, Truck } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/services/api';

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

interface UserOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  deliveryDetails: {
    address: string;
    phone: string;
  };
  items: Array<{
    title: { uz: string; ru: string };
    quantity: number;
    selectedVolume?: string;
    selectedScentLabel?: { uz: string; ru: string };
  }>;
}

const localeText = (value: { uz: string; ru: string } | undefined, locale: string) =>
  (locale === 'ru' ? value?.ru : value?.uz) || '';

export default function UserOrdersPage() {
  const locale = useLocale();
  const t = useTranslations('UserOrdersPage');
  const commonT = useTranslations('OrdersPage');
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<'active' | 'all'>('active');

  const { data: orders = [], isLoading } = useQuery<UserOrder[]>({
    queryKey: ['user-orders'],
    queryFn: () => fetchApi('/orders/my'),
    enabled: isAuthenticated && !authLoading,
    staleTime: 30 * 1000,
  });

  const filteredOrders = useMemo(() => {
    if (tab === 'all') return orders;
    return orders.filter((order) => ['pending', 'confirmed', 'shipping'].includes(order.status));
  }, [orders, tab]);

  const getStatusLabel = (status: OrderStatus) => commonT(`status_${status}` as never);

  const getStatusIcon = (status: OrderStatus) => {
    if (status === 'shipping') return <Truck className="h-4 w-4" />;
    if (status === 'delivered') return <PackageCheck className="h-4 w-4" />;
    return <Clock3 className="h-4 w-4" />;
  };

  if (authLoading) {
    return <div className="min-h-screen bg-ios-bg" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ios-bg px-4 py-6">
        <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">{t('auth_title')}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{t('auth_description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg">
      <div className="ios-blur fixed top-0 left-1/2 z-50 flex h-14 w-full max-w-lg -translate-x-1/2 items-center border-b border-black/[0.03] bg-white px-4">
        <button
          onClick={() => router.back()}
          className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
        >
          <ChevronLeft className="h-7 w-7 stroke-[2px]" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="max-w-[70%] truncate text-center text-[17px] font-bold tracking-tight text-black">
            {t('title')}
          </h1>
        </div>
      </div>

      <div className="px-4 pb-24 pt-20">
        <div className="flex gap-2 rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
          {([
            ['active', t('active_tab')],
            ['all', t('all_tab')],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === value ? 'bg-primary text-white' : 'text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {isLoading ? (
            [1, 2].map((item) => (
              <div key={item} className="skeleton-shimmer h-36 rounded-3xl" />
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ')}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item, index) => (
                    <div key={`${item.title.uz}-${index}`} className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <span className="font-medium text-gray-900">{localeText(item.title, locale)}</span>
                      {item.selectedVolume ? ` · ${item.selectedVolume}` : ''}
                      {item.selectedScentLabel ? ` · ${localeText(item.selectedScentLabel, locale)}` : ''}
                      {` · ${item.quantity}`}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('delivery_address')}</p>
                    <p className="mt-1 text-sm text-gray-700 leading-6">{order.deliveryDetails.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{t('total')}</p>
                    <p className="mt-1 text-base font-bold text-gray-900">{order.totalPrice.toLocaleString()} so'm</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{t('empty_title')}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{t('empty_description')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
