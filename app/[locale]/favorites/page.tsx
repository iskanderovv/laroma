'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductGridSkeleton } from '@/components/catalog/CatalogSkeletons';
import { useAppToast } from '@/components/ToastProvider';

export default function FavoritesPage() {
  const locale = useLocale();
  const t = useTranslations('FavoritesPage');
  const router = useRouter();
  const { showToast } = useAppToast();
  const {
    items,
    isLoading,
    isAuthenticated,
    isAuthLoading,
    moveAllToCart,
    clearWishlist,
    isMovingAllToCart,
    isClearingWishlist,
  } = useWishlist();

  const handleMoveAllToCart = async () => {
    try {
      await moveAllToCart();
      showToast({ title: t('moved_to_cart') });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('action_error');
      showToast({ title: message });
    }
  };

  const handleClearWishlist = async () => {
    if (typeof window !== 'undefined' && !window.confirm(t('confirm_clear'))) {
      return;
    }

    try {
      await clearWishlist();
      showToast({ title: t('cleared') });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('action_error');
      showToast({ title: message });
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen bg-ios-bg" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ios-bg px-4 py-6">
        <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
          <Heart className="mx-auto h-10 w-10 text-primary/70" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">{t('auth_title')}</h1>
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
        {isLoading ? (
          <div className="mt-5">
            <ProductGridSkeleton />
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => void handleMoveAllToCart()}
                disabled={isMovingAllToCart || isClearingWishlist}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-primary px-4 text-xs font-semibold text-white active:opacity-90 disabled:opacity-50 flex-shrink-0"
              >
                <ShoppingBag className="h-4 w-4" />
                {isMovingAllToCart ? t('moving') : t('move_all_to_cart')}
              </button>
              <button
                onClick={() => void handleClearWishlist()}
                disabled={isClearingWishlist || isMovingAllToCart}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-gray-100 px-4 text-xs font-semibold text-gray-700 active:opacity-80 disabled:opacity-50 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                {t('clear')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[28px] border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
            <Heart className="mx-auto h-12 w-12 text-primary/50" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">{t('empty_title')}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{t('empty_description')}</p>
            <button
              onClick={() => router.push('/category')}
              className="mt-5 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              {t('start_browsing')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
