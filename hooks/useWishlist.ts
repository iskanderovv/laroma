'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/services/api';

export interface WishlistProduct {
  _id: string;
  title: { uz: string; ru: string };
  price: number;
  oldPrice?: number;
  thumbnail?: string;
  volume?: string;
  volumes?: string[];
  volumeOptions?: Array<{
    volume: string;
    price: number;
    oldPrice?: number;
  }>;
  brandId?: {
    _id: string;
    title: { uz: string; ru: string };
  };
  rating?: number;
  reviewsCount?: number;
  scents?: Array<{
    code: string;
    label: { uz: string; ru: string };
  }>;
}

export interface WishlistResponse {
  _id: string;
  productIds: WishlistProduct[];
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const wishlistQuery = useQuery<WishlistResponse>({
    queryKey: ['wishlist'],
    queryFn: () => fetchApi('/wishlist'),
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30 * 1000,
  });

  const moveAllToCartMutation = useMutation({
    mutationFn: () => fetchApi('/wishlist/move-to-cart', { method: 'POST' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
        queryClient.invalidateQueries({ queryKey: ['cart'] }),
      ]);
    },
  });

  const clearWishlistMutation = useMutation({
    mutationFn: () => fetchApi('/wishlist/clear', { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  return {
    ...wishlistQuery,
    isAuthenticated,
    isAuthLoading,
    items: wishlistQuery.data?.productIds || [],
    moveAllToCart: moveAllToCartMutation.mutateAsync,
    clearWishlist: clearWishlistMutation.mutateAsync,
    isMovingAllToCart: moveAllToCartMutation.isPending,
    isClearingWishlist: clearWishlistMutation.isPending,
  };
}
