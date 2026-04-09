'use client';

import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { getImageUrl } from '@/services/api';
import { useRouter } from '@/i18n/routing';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useProductActions } from '@/hooks/useProductActions';
import { useAppToast } from '@/components/ToastProvider';

interface Product {
  _id: string;
  title: { uz: string; ru: string };
  price: number;
  oldPrice?: number;
  reviewsCount?: number;
  thumbnail?: string;
  volume?: string;
  brandId?: {
    _id: string;
    title: { uz: string; ru: string };
  };
  volumes?: string[];
  volumeOptions?: {
    volume: string;
    price: number;
    oldPrice?: number;
  }[];
  rating?: number;
  scents?: Array<{
    code: string;
    label: { uz: string; ru: string };
  }>;
}

export default function ProductCard({ product, locale }: { product: Product; locale: string }) {
  const messages = useMessages() as {
    ProductCard?: {
      details?: string;
      reviews_meta?: string;
    };
  };
  const activeLocale = useLocale();
  const detailT = useTranslations('ProductDetail');
  const router = useRouter();
  const { showToast } = useAppToast();
  const {
    isAuthenticated,
    isLiked,
    isWishlistPending,
    toggleWishlist,
  } = useProductActions(product._id);
  const volumesFromOptions = (product.volumeOptions || [])
    .map((item) => item?.volume?.trim())
    .filter((item): item is string => Boolean(item));
  const formatVolumeLabel = (value: string) =>
    value
      .replace(/\s+(ml|l)$/i, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  const defaultVolumeOption =
    product.volumeOptions?.find((item) => item?.volume?.trim()) ?? undefined;
  const volumes =
    volumesFromOptions.length > 0
      ? volumesFromOptions
      : product.volumes && product.volumes.length > 0
        ? product.volumes
        : product.volume
          ? product.volume
              .split(/[,;|]+/)
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [];
  const displayVolumes = volumes.slice(0, 3);
  const displayPrice = defaultVolumeOption?.price ?? product.price;
  const displayRating =
    typeof product.rating === 'number' ? product.rating.toFixed(1) : '5.0';
  const displayReviewsCount = product.reviewsCount ?? 0;
  const detailsLabel =
    messages.ProductCard?.details ?? (activeLocale === 'ru' ? 'Подробнее' : 'Batafsil');
  const reviewsMetaTemplate =
    messages.ProductCard?.reviews_meta ??
    (activeLocale === 'ru' ? '({count} отзывов)' : '({count} sharhlar)');
  const reviewsMetaLabel = reviewsMetaTemplate.replace('{count}', String(displayReviewsCount));

  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      if (!isAuthenticated) {
        showToast({ title: detailT('auth_required') });
        return;
      }

      await toggleWishlist(product._id);
      showToast({
        title: isLiked ? detailT('wishlist_removed') : detailT('wishlist_added'),
        ...(isLiked
          ? {}
          : {
              actionLabel: detailT('go_to_favorites'),
              onAction: () => router.push('/favorites'),
            }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : detailT('action_error');
      if (message !== 'AUTH_REQUIRED') {
        showToast({ title: message });
      }
    }
  };

  const handleDetailsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/product/${product._id}`);
  };

  return (
    <div
      onClick={() => router.push(`/product/${product._id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer active:opacity-95 transition-opacity"
    >
      <div className="relative w-full pb-[100%]">
        <Image
          src={product.thumbnail ? getImageUrl(product.thumbnail) : '/placeholder.png'}
          alt={product.title[locale as 'uz' | 'ru']}
          fill
          sizes="(max-width: 640px) 50vw, 320px"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <button
          onClick={(e) => void handleWishlistClick(e)}
          disabled={isWishlistPending}
          aria-pressed={isLiked}
          className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-colors disabled:opacity-50 ${
            isLiked ? 'text-primary' : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Heart size={16} className={isLiked ? 'fill-primary' : ''} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {product.brandId && (
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                {product.brandId.title[locale as 'uz' | 'ru']}
              </p>
            )}
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
              {product.title[locale as 'uz' | 'ru']}
            </h3>
          </div>
        </div>

        {displayVolumes.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5">
            {displayVolumes.map((vol, idx) => (
              <span
                key={idx}
                className="whitespace-nowrap text-center text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full font-medium leading-none"
              >
                {formatVolumeLabel(vol)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <div className="mb-2 flex items-center gap-1 text-[11px] text-gray-500">
            <Star size={12} className="fill-primary text-primary" />
            <span className="font-semibold text-gray-800">{displayRating}</span>
            <span>{reviewsMetaLabel}</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-bold text-black">
              {displayPrice.toLocaleString()} so&apos;m
            </span>
          </div>
          
          <button
            onClick={(e) => handleDetailsClick(e)}
            className="w-full py-2 bg-primary text-white rounded-xl flex items-center justify-center text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {detailsLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
