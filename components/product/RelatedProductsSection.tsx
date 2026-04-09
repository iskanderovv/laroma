'use client';

import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';

interface MultilingualText {
  uz: string;
  ru: string;
}

interface LinkedEntity {
  _id: string;
  title: MultilingualText;
}

interface RelatedProduct {
  _id: string;
  title: MultilingualText;
  price: number;
  oldPrice?: number;
  reviewsCount?: number;
  thumbnail?: string;
  volume?: string;
  brandId?: LinkedEntity;
  volumes?: string[];
  rating?: number;
  volumeOptions?: {
    volume: string;
    price: number;
    oldPrice?: number;
  }[];
  scents?: Array<{
    code: string;
    label: MultilingualText;
  }>;
}

export default function RelatedProductsSection({
  locale,
  products,
  isLoading,
}: {
  locale: string;
  products?: RelatedProduct[];
  isLoading: boolean;
}) {
  const t = useTranslations('ProductDetail');

  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl py-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('related_products')}</h3>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((item) => (
            <div key={item} className="rounded-xl border border-gray-100 p-2">
              <div className="skeleton-shimmer aspect-square rounded-lg mb-2" />
              <div className="skeleton-shimmer h-3 w-full rounded mb-1.5" />
              <div className="skeleton-shimmer h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products!.map((item) => (
            <ProductCard key={item._id} product={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
