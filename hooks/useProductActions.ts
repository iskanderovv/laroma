'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/services/api';
import { useWishlist } from '@/hooks/useWishlist';

interface AddToCartPayload {
  productId: string;
  quantity?: number;
  selectedVolume?: string;
  selectedScentCode?: string;
}

const getWishlistProductIds = (wishlist?: { productIds: Array<string | { _id?: string }> }) =>
  new Set(
    (wishlist?.productIds ?? [])
      .map((item) => (typeof item === 'string' ? item : item?._id))
      .filter((item): item is string => Boolean(item)),
  );

const notifyTelegram = async (type: 'success' | 'error') => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const WebAppSDK = await import('@twa-dev/sdk');
    WebAppSDK.default.HapticFeedback?.notificationOccurred(type);
  } catch {}
};

export function useProductActions(productId?: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const wishlistQuery = useWishlist();

  const toggleWishlistMutation = useMutation({
    mutationFn: async (nextProductId: string) => {
      if (!isAuthenticated) {
        throw new Error('AUTH_REQUIRED');
      }

      return fetchApi('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: nextProductId }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void notifyTelegram('success');
    },
    onError: () => {
      void notifyTelegram('error');
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      if (!isAuthenticated) {
        throw new Error('AUTH_REQUIRED');
      }

      return fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      void notifyTelegram('success');
    },
    onError: () => {
      void notifyTelegram('error');
    },
  });

  const wishlistProductIds = getWishlistProductIds(wishlistQuery.data);

  return {
    isAuthenticated,
    isAuthLoading,
    isLiked: productId ? wishlistProductIds.has(productId) : false,
    isWishlistPending: toggleWishlistMutation.isPending,
    isCartPending: addToCartMutation.isPending,
    toggleWishlist: toggleWishlistMutation.mutateAsync,
    addToCart: addToCartMutation.mutateAsync,
  };
}
