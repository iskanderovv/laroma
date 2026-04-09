'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { fetchApi } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/catalog/CatalogSkeletons';

interface Category {
  _id: string;
  title: { uz: string; ru: string };
  icon?: string;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

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
  volumeOptions?: { volume: string; price: number; oldPrice?: number }[];
  rating?: number;
  scents?: Array<{ code: string; label: { uz: string; ru: string } }>;
}

const localeText = (value: { uz: string; ru: string } | undefined, locale: string) =>
  (locale === 'ru' ? value?.ru : value?.uz) || '';

export default function CategoryPage() {
  const locale = useLocale();
  const t = useTranslations('CategoryPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get('categoryId') || '';
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);

  useEffect(() => {
    setSelectedCategoryId(searchParams.get('categoryId') || '');
  }, [searchParams]);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => fetchApi('/categories'),
    staleTime: 60 * 1000,
  });

  const categories = categoriesData?.categories || [];

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['category-products', selectedCategoryId],
    queryFn: () =>
      fetchApi(
        selectedCategoryId ? `/products?categoryId=${selectedCategoryId}` : '/products?limit=8',
      ),
    staleTime: 30 * 1000,
  });

  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

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
        <button
          onClick={() => router.push('/search')}
          className="flex h-12 w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 text-left shadow-sm active:opacity-90"
        >
          <Search className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">{t('search_placeholder')}</span>
        </button>

        <div className="mt-5 rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {categoriesLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="skeleton-shimmer h-14 rounded-2xl" />
              ))}
            </div>
          ) : (
            categories.map((category, index) => {
              const isSelected = selectedCategoryId === category._id;

              return (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategoryId(category._id)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors ${
                    isSelected ? 'bg-primary/5' : 'bg-white active:bg-gray-50'
                  } ${index !== categories.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                      isSelected ? 'border-primary/20 bg-primary/10' : 'border-gray-100 bg-gray-50'
                    } text-2xl`}>
                      {category.icon || '🛍️'}
                    </div>
                    <span className={`truncate text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {localeText(category.title, locale)}
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-gray-300'}`} />
                </button>
              );
            })
          )}
        </div>

        {selectedCategoryId ? (
          <div className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="truncate text-base font-semibold text-gray-900">
                {selectedCategory ? localeText(selectedCategory.title, locale) : t('selected_products')}
              </h2>
              <div className="inline-flex flex-shrink-0 items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {products.length}
              </div>
            </div>

            {productsLoading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                <p className="text-sm font-semibold text-gray-900">{t('empty_title')}</p>
                <p className="mt-2 text-sm leading-6 text-gray-500">{t('empty_description')}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
