'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/services/api';
import ProductCard from './ProductCard';
import { ChevronRight } from 'lucide-react';
import { ProductSectionSkeleton } from '@/components/home/HomeSkeletons';
import { useRouter } from '@/i18n/routing';

interface Product {
  _id: string;
  title: { uz: string; ru: string };
  price: number;
  oldPrice?: number;
  rating?: number;
  reviewsCount?: number;
  thumbnail?: string;
  volume?: string;
  volumeOptions?: {
    volume: string;
    price: number;
    oldPrice?: number;
  }[];
}

export default function ProductSection({ locale, title, query }: { locale: string, title: string, query: string }) {
  const router = useRouter();
  const { data: products, isLoading } = useQuery<Product[]>({ 
    queryKey: ['products', query], 
    queryFn: () => fetchApi('/products?' + query) 
  });

  if (isLoading) {
    return <ProductSectionSkeleton />;
  }

  if (!products?.length) {
    return null;
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-4 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          onClick={() => router.push(`/search?${query}`)}
          className="text-sm font-semibold text-primary flex items-center gap-1"
        >
          Barchasi
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} locale={locale} />
        ))}
      </div>
    </div>
  );
}
