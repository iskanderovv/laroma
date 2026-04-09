'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Heart, ShoppingBag, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { fetchApi, getImageUrl } from '@/services/api';
import { useRouter } from '@/i18n/routing';
import ProductDetailSkeleton from '@/components/product/ProductDetailSkeleton';
import RelatedProductsSection from '@/components/product/RelatedProductsSection';
import { useProductActions } from '@/hooks/useProductActions';
import { useAppToast } from '@/components/ToastProvider';

interface MultilingualText {
  uz: string;
  ru: string;
}

interface LinkedEntity {
  _id: string;
  title: MultilingualText;
}

interface ProductDetail {
  _id: string;
  title: MultilingualText;
  description?: MultilingualText;
  price: number;
  oldPrice?: number;
  thumbnail?: string;
  images?: string[];
  volume?: string;
  volumes?: string[];
  stock?: number;
  categoryId?: LinkedEntity;
  brandId?: LinkedEntity;
  scents?: Array<{
    code: string;
    label: MultilingualText;
  }>;
  volumeOptions?: {
    volume: string;
    price: number;
    oldPrice?: number;
    stock?: number;
  }[];
}

interface ProductReview {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface RelatedProduct {
  _id: string;
  title: MultilingualText;
  price: number;
  oldPrice?: number;
  thumbnail?: string;
  volume?: string;
  brandId?: LinkedEntity;
  volumes?: string[];
  rating?: number;
  scents?: Array<{
    code: string;
    label: MultilingualText;
  }>;
  volumeOptions?: {
    volume: string;
    price: number;
    oldPrice?: number;
  }[];
}

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

const localeText = (value: MultilingualText | undefined, locale: string): string => {
  if (!value) return '';
  return locale === 'ru' ? value.ru : value.uz;
};

export default function ProductDetailView({
  locale,
  productId,
}: {
  locale: string;
  productId: string;
}) {
  const t = useTranslations('ProductDetail');
  const router = useRouter();
  const { showToast } = useAppToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedScentCode, setSelectedScentCode] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery<ProductDetail>({
    queryKey: ['product-detail', productId],
    queryFn: () => fetchApi(`/products/${productId}`),
  });

  const {
    data: reviews,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useQuery<ProductReview[]>({
    queryKey: ['product-reviews', productId],
    queryFn: () => fetchApi(`/products/${productId}/reviews`),
    enabled: !!productId,
  });

  const { data: relatedProducts, isLoading: relatedLoading } = useQuery<RelatedProduct[]>({
    queryKey: ['related-products', productId],
    queryFn: () => fetchApi(`/products/${productId}/related?limit=4`),
    enabled: !!productId,
  });

  const {
    isAuthenticated,
    isAuthLoading,
    isLiked,
    isWishlistPending,
    isCartPending,
    toggleWishlist,
    addToCart,
  } = useProductActions(productId);

  const images = useMemo(() => {
    if (!product) return [];
    const productImages = product.images?.filter(Boolean) || [];
    if (product.thumbnail) {
      return [product.thumbnail, ...productImages.filter((img) => img !== product.thumbnail)];
    }
    return productImages;
  }, [product]);

  const volumeOptions = useMemo(() => {
    if (!product) return [];

    const detailedVolumes = (product.volumeOptions || [])
      .filter((item) => item?.volume)
      .map((item) => item.volume.trim());

    if (detailedVolumes.length > 0) {
      return detailedVolumes;
    }

    const dynamicVolumes = (product.volumes || [])
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());

    if (dynamicVolumes.length > 0) {
      return dynamicVolumes;
    }

    if (product.volume) {
      return product.volume
        .split(/[,;|]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [];
  }, [product]);

  const scentOptions = product?.scents || [];

  const resolvedSelectedVolume =
    selectedVolume && volumeOptions.includes(selectedVolume)
      ? selectedVolume
      : volumeOptions[0] || '';

  const resolvedSelectedScentCode =
    selectedScentCode && scentOptions.some((item) => item.code === selectedScentCode)
      ? selectedScentCode
      : scentOptions[0]?.code || '';

  const selectedVolumeOption = useMemo(() => {
    if (!product?.volumeOptions?.length || !resolvedSelectedVolume) {
      return null;
    }

    return (
      product.volumeOptions.find((item) => item.volume === resolvedSelectedVolume) || null
    );
  }, [product, resolvedSelectedVolume]);

  const currentPrice = selectedVolumeOption?.price ?? product?.price ?? 0;
  const currentOldPrice = selectedVolumeOption?.oldPrice ?? product?.oldPrice;
  const currentStock = selectedVolumeOption?.stock ?? product?.stock ?? 0;

  const safeImageIndex =
    images.length > 0 && selectedImageIndex < images.length ? selectedImageIndex : 0;
  const selectedImage = images[safeImageIndex] || product?.thumbnail || '';
  const title = localeText(product?.title, locale);
  const description = localeText(product?.description, locale);
  const brand = localeText(product?.brandId?.title, locale);
  const reviewsCount = reviews?.length || 0;
  const averageRating =
    reviewsCount > 0
      ? Number((reviews!.reduce((sum, item) => sum + item.rating, 0) / reviewsCount).toFixed(1))
      : null;
  const discountPercent =
    currentOldPrice && currentOldPrice > currentPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : 0;
  const reviewsSectionVisible = reviewsLoading || reviewsError || reviewsCount > 0;

  const handleToggleWishlist = async () => {
    setStatusMessage(null);

    if (!isAuthenticated) {
      setStatusMessage({ type: 'error', text: t('auth_required') });
      return;
    }

    try {
      await toggleWishlist(productId);
      if (isLiked) {
        setStatusMessage({
          type: 'success',
          text: t('wishlist_removed'),
        });
      } else {
        showToast({
          title: t('wishlist_added'),
          actionLabel: t('go_to_favorites'),
          onAction: () => router.push('/favorites'),
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: t('action_error') });
    }
  };

  const handleAddToCart = async () => {
    setStatusMessage(null);

    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage({ type: 'error', text: t('auth_required') });
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        selectedVolume: resolvedSelectedVolume || undefined,
        selectedScentCode: resolvedSelectedScentCode || undefined,
      });
      showToast({
        title: t('added_to_cart_title', { name: title || t('product_fallback') }),
        actionLabel: t('go_to_cart'),
        onAction: () => router.push('/orders'),
      });
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : t('action_error');
      setStatusMessage({ type: 'error', text: message });
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
        <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 h-14 flex items-center bg-white border-b border-black/[0.03]">
          <button
            onClick={() => router.back()}
            className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2px]" />
          </button>
        </div>

        <div className="pt-24 px-4">
          <div className="bg-white rounded-2xl p-5 border border-red-100 text-red-600 text-sm">
            <p>{t('load_error')}</p>
            <button
              onClick={() => void refetch()}
              className="mt-3 text-sm font-semibold text-primary active:opacity-70 transition-opacity"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
      <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 h-14 flex items-center bg-white border-b border-black/[0.03]">
        <button
          onClick={() => router.back()}
          className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2px]" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-[17px] font-bold text-black tracking-tight max-w-[70%] truncate text-center">
            {title}
          </h1>
        </div>

        <div className="flex-1" />
      </div>

      <div className="pt-14 pb-28">
        <div className="px-4 pt-4">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
            <Image
              src={selectedImage ? getImageUrl(selectedImage) : '/placeholder.png'}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                    safeImageIndex === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${title} ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {brand && <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{brand}</p>}

            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 leading-tight flex-1">{title}</h2>

              <div className="flex items-center gap-2 flex-shrink-0">
                {averageRating !== null && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary">
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    <span className="text-xs font-semibold">{averageRating}</span>
                  </div>
                )}

                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-black">{currentPrice.toLocaleString()} so&apos;m</span>
              {currentOldPrice && currentOldPrice > currentPrice && (
                <span className="text-sm text-gray-400 line-through">{currentOldPrice.toLocaleString()} so&apos;m</span>
              )}
            </div>
          </div>

          {volumeOptions.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('select_volume')}</h3>

              <div className="flex flex-wrap gap-2">
                {volumeOptions.map((volume) => {
                  const isSelected = resolvedSelectedVolume === volume;

                  return (
                    <button
                      key={volume}
                      onClick={() => {
                        setSelectedVolume(volume);
                        setStatusMessage(null);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'
                      }`}
                    >
                      {volume}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {scentOptions.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('select_scent')}</h3>

              <div className="flex flex-wrap gap-2">
                {scentOptions.map((scent) => {
                  const label = localeText(scent.label, locale);
                  const isSelected = resolvedSelectedScentCode === scent.code;

                  return (
                    <button
                      key={scent.code}
                      onClick={() => {
                        setSelectedScentCode(scent.code);
                        setStatusMessage(null);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {description && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('description')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            </div>
          )}

          {reviewsSectionVisible && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">{t('reviews')}</h3>
                {reviewsCount > 0 && (
                  <span className="text-xs text-gray-500">
                    {reviewsCount} {t('reviews_count_suffix')}
                  </span>
                )}
              </div>

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((item) => (
                    <div key={item} className="rounded-xl border border-gray-100 p-3">
                      <div className="skeleton-shimmer h-3 w-28 rounded mb-2" />
                      <div className="skeleton-shimmer h-3 w-full rounded mb-2" />
                      <div className="skeleton-shimmer h-3 w-5/6 rounded" />
                    </div>
                  ))}
                </div>
              ) : reviewsCount > 0 ? (
                <div className="space-y-3">
                  {reviews!.slice(0, 3).map((review) => (
                    <div key={review._id} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-xs font-semibold text-gray-900">{review.userName}</p>
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                          <Star className="w-3 h-3 fill-primary" />
                          <span className="text-[11px] font-semibold">{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      {review.isVerifiedPurchase && (
                        <p className="text-[11px] text-green-700 mt-1.5">{t('verified_purchase')}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('no_reviews')}</p>
              )}
            </div>
          )}

          <RelatedProductsSection locale={locale} products={relatedProducts} isLoading={relatedLoading} />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg border-t border-black/[0.05] bg-white p-4 pb-safe">
        {statusMessage && statusMessage.type === 'error' && (
          <p
            className="mb-3 text-xs text-red-600"
          >
            {statusMessage.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => void handleToggleWishlist()}
            disabled={isWishlistPending || isAuthLoading}
            aria-pressed={isLiked}
            className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-colors ${
              isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-600'
            } disabled:opacity-50`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
          </button>

          <button
            onClick={() => void handleAddToCart()}
            disabled={currentStock <= 0 || isCartPending || isAuthLoading}
            className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 active:opacity-90 transition-opacity disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            {currentStock <= 0 ? t('out_of_stock') : isCartPending ? t('adding_to_cart') : t('add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
