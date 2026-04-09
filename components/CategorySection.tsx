'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/services/api';
import { CategorySectionSkeleton } from '@/components/home/HomeSkeletons';
import { Link } from '@/i18n/routing';

interface Category {
  _id: string;
  title: { uz: string; ru: string };
  icon?: string;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export default function CategorySection({ locale }: { locale: string }) {
  const { data, isLoading } = useQuery<CategoriesResponse>({ 
    queryKey: ['categories'], 
    queryFn: () => fetchApi('/categories') 
  });

  const categories = data?.categories || [];

  if (isLoading) {
    return <CategorySectionSkeleton />;
  }

  if (!categories?.length) {
    return null;
  }

  return (
    <div className="px-4 py-2 flex flex-col gap-2">
      <h2 className="text-lg font-bold px-1">{locale === 'uz' ? 'Kategoriyalar' : 'Категории'}</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category?categoryId=${cat._id}`}
            className="flex flex-col items-center gap-1 min-w-[70px] active:opacity-80 transition-opacity"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100">
              {cat.icon || '🛍️'}
            </div>
            <span className="text-xs font-medium text-gray-600 text-center">
              {cat.title[locale as 'uz' | 'ru']}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
