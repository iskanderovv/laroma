'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Search } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { fetchApi } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { FilterChipsSkeleton, ProductGridSkeleton } from '@/components/catalog/CatalogSkeletons';

interface Category {
  _id: string;
  title: { uz: string; ru: string };
}

interface Brand {
  _id: string;
  title: { uz: string; ru: string };
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
  brandId?: Brand;
  categoryId?: Category;
  volumes?: string[];
  volumeOptions?: { volume: string; price: number; oldPrice?: number }[];
  rating?: number;
  scents?: Array<{ code: string; label: { uz: string; ru: string } }>;
}

const localeText = (value: { uz: string; ru: string } | undefined, locale: string) =>
  (locale === 'ru' ? value?.ru : value?.uz) || '';

export default function SearchPage() {
  const locale = useLocale();
  const t = useTranslations('SearchPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategoryId = searchParams.get('categoryId') || 'all';
  const initialPreset = searchParams.get('preset') || 'all';
  const initialIsNew = searchParams.get('isNew') === 'true';
  const initialIsPopular = searchParams.get('isPopular') === 'true';

  const [searchValue, setSearchValue] = useState(initialQuery);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'best_selling'>('popular');

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => fetchApi('/categories'),
    staleTime: 60 * 1000,
  });

  const categories = categoriesData?.categories || [];

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (initialPreset === 'new' || initialIsNew) params.set('isNew', 'true');
    if (initialPreset === 'popular' || initialIsPopular) params.set('isPopular', 'true');
    if (initialCategoryId !== 'all' && initialCategoryId) params.set('categoryId', initialCategoryId);
    return params.toString();
  }, [initialCategoryId, initialIsNew, initialIsPopular, initialPreset]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['search-products', queryString],
    queryFn: () => fetchApi(`/products${queryString ? `?${queryString}` : ''}`),
    staleTime: 30 * 1000,
  });

  const brands = useMemo(() => {
    const map = new Map<string, Brand>();
    products.forEach((product) => {
      if (product.brandId?._id) {
        map.set(product.brandId._id, product.brandId);
      }
    });
    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchesSearch = !normalizedSearch
          || localeText(product.title, locale).toLowerCase().includes(normalizedSearch)
          || localeText(product.brandId?.title, locale).toLowerCase().includes(normalizedSearch);
        const matchesCategory = selectedCategoryId === 'all' || product.categoryId?._id === selectedCategoryId;
        const matchesBrand = selectedBrandId === 'all' || product.brandId?._id === selectedBrandId;
        const matchesPrice =
          priceRange === 'all'
          || (priceRange === 'budget' && product.price < 100000)
          || (priceRange === 'mid' && product.price >= 100000 && product.price < 250000)
          || (priceRange === 'premium' && product.price >= 250000);

        return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'best_selling') return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
        return (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
      });
  }, [locale, priceRange, products, searchValue, selectedBrandId, selectedCategoryId, sortBy]);

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
        <div className="sticky top-14 z-20 -mx-4 border-b border-black/[0.04] bg-ios-bg/95 px-4 pb-3 pt-1 backdrop-blur-sm">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {([
                ['popular', t('sort_popular')],
                ['best_selling', t('sort_best_selling')],
                ['price_asc', t('sort_price_asc')],
                ['price_desc', t('sort_price_desc')],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors flex-shrink-0 ${
                    sortBy === value ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <FilterChipsSkeleton count={4} />
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setSelectedCategoryId('all')}
                    className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors flex-shrink-0 ${
                      selectedCategoryId === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
                    }`}
                  >
                    {t('all_categories')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategoryId(category._id)}
                      className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors flex-shrink-0 ${
                        selectedCategoryId === category._id ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
                      }`}
                    >
                      {localeText(category.title, locale)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setSelectedBrandId('all')}
                    className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors flex-shrink-0 ${
                      selectedBrandId === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
                    }`}
                  >
                    {t('all_brands')}
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand._id}
                      onClick={() => setSelectedBrandId(brand._id)}
                      className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors flex-shrink-0 ${
                        selectedBrandId === brand._id ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
                      }`}
                    >
                      {localeText(brand.title, locale)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {([
                    ['all', t('price_all')],
                    ['budget', t('price_budget')],
                    ['mid', t('price_mid')],
                    ['premium', t('price_premium')],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setPriceRange(value)}
                      className={`h-9 rounded-full px-4 text-xs font-semibold transition-colors flex-shrink-0 ${
                        priceRange === value ? 'bg-primary text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">{t('results')}</h2>
          <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {filteredProducts.length}
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
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
      </div>
    </div>
  );
}
