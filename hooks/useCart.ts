'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface MultilingualText {
  uz: string;
  ru: string;
}

interface ProductInCart {
  _id: string;
  title: MultilingualText;
  price: number;
  oldPrice?: number;
  thumbnail?: string;
  scents?: Array<{
    code: string;
    label: MultilingualText;
  }>;
  volumeOptions?: Array<{
    volume: string;
    price: number;
    oldPrice?: number;
  }>;
}

export interface CartItem {
  productId: ProductInCart;
  quantity: number;
  selectedVolume?: string;
  selectedScentCode?: string;
}

export interface CartResponse {
  _id: string;
  items: CartItem[];
}

interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
  selectedVolume?: string;
  selectedScentCode?: string;
}

interface RemoveCartItemPayload {
  productId: string;
  selectedVolume?: string;
  selectedScentCode?: string;
}

const matchesCartItem = (
  item: CartItem,
  payload: {
    productId: string;
    selectedVolume?: string;
    selectedScentCode?: string;
  },
) =>
  item.productId._id === payload.productId &&
  (item.selectedVolume || '') === (payload.selectedVolume || '') &&
  (item.selectedScentCode || '') === (payload.selectedScentCode || '');

export const resolveCartItemPrice = (item: CartItem) => {
  const selectedVolume = item.selectedVolume?.trim().toLowerCase();
  const matchedVolume = item.productId?.volumeOptions?.find(
    (option) => option.volume.trim().toLowerCase() === selectedVolume,
  );

  return matchedVolume?.price ?? item.productId?.price ?? 0;
};

export const resolveCartItemOldPrice = (item: CartItem) => {
  const selectedVolume = item.selectedVolume?.trim().toLowerCase();
  const matchedVolume = item.productId?.volumeOptions?.find(
    (option) => option.volume.trim().toLowerCase() === selectedVolume,
  );

  return matchedVolume?.oldPrice ?? item.productId?.oldPrice;
};

const buildRemoveUrl = (payload: RemoveCartItemPayload) => {
  const query = new URLSearchParams();

  if (payload.selectedVolume) {
    query.set('selectedVolume', payload.selectedVolume);
  }

  if (payload.selectedScentCode) {
    query.set('selectedScentCode', payload.selectedScentCode);
  }

  const suffix = query.toString();
  return `/cart/remove/${payload.productId}${suffix ? `?${suffix}` : ''}`;
};

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const cartQuery = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: () => fetchApi('/cart'),
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 15 * 1000,
  });

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ['cart'] });
  const setOptimisticCart = (
    updater: (current: CartResponse | undefined) => CartResponse | undefined,
  ) => queryClient.setQueryData<CartResponse | undefined>(['cart'], updater);

  const updateQuantityMutation = useMutation({
    mutationFn: (payload: UpdateCartItemPayload) =>
      fetchApi('/cart/quantity', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartResponse | undefined>(['cart']);

      setOptimisticCart((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.map((item) =>
            matchesCartItem(item, payload)
              ? {
                  ...item,
                  quantity: payload.quantity,
                }
              : item,
          ),
        };
      });

      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(['cart'], context?.previousCart);
    },
    onSettled: invalidateCart,
  });

  const removeItemMutation = useMutation({
    mutationFn: (payload: RemoveCartItemPayload) =>
      fetchApi(buildRemoveUrl(payload), {
        method: 'DELETE',
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartResponse | undefined>(['cart']);

      setOptimisticCart((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.filter((item) => !matchesCartItem(item, payload)),
        };
      });

      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(['cart'], context?.previousCart);
    },
    onSettled: invalidateCart,
  });

  const clearCartMutation = useMutation({
    mutationFn: () =>
      fetchApi('/cart/clear', {
        method: 'DELETE',
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartResponse | undefined>(['cart']);

      setOptimisticCart((current) =>
        current
          ? {
              ...current,
              items: [],
            }
          : current,
      );

      return { previousCart };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(['cart'], context?.previousCart);
    },
    onSettled: invalidateCart,
  });

  const itemCount =
    cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const subtotal =
    cartQuery.data?.items.reduce((sum, item) => {
      const unitPrice = resolveCartItemPrice(item);
      return sum + unitPrice * item.quantity;
    }, 0) ?? 0;

  return {
    ...cartQuery,
    isAuthenticated,
    isAuthLoading,
    itemCount,
    subtotal,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
