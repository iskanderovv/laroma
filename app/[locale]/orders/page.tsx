'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BadgePercent,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/services/api';
import { apiService } from '@/lib/api/apiService';
import {
  useCart,
  resolveCartItemOldPrice,
  resolveCartItemPrice,
  type CartItem,
} from '@/hooks/useCart';

interface Address {
  _id: string;
  title: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

const localeText = (
  value: { uz: string; ru: string } | undefined,
  locale: string,
) => (locale === 'ru' ? value?.ru : value?.uz) || '';

function CartItemCard({
  item,
  locale,
  busy,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  locale: string;
  busy: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations('OrdersPage');
  const title = localeText(item.productId?.title, locale);
  const selectedScentLabel =
    item.productId?.scents?.find((scent) => scent.code === item.selectedScentCode)?.label;
  const unitPrice = resolveCartItemPrice(item);
  const oldPrice = resolveCartItemOldPrice(item);
  const lineTotal = unitPrice * item.quantity;
  const oldLineTotal = oldPrice ? oldPrice * item.quantity : undefined;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={item.productId?.thumbnail ? getImageUrl(item.productId.thumbnail) : '/placeholder.png'}
            alt={title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">{title}</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.selectedVolume && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                    {t('selected_volume', { value: item.selectedVolume })}
                  </span>
                )}
                {selectedScentLabel && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                    {t('selected_scent', { value: localeText(selectedScentLabel, locale) })}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onRemove}
              disabled={busy}
              className="rounded-xl p-2 text-gray-400 active:opacity-60 disabled:opacity-40"
              aria-label={t('remove_item')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold text-black">{unitPrice.toLocaleString()} so&apos;m</p>
                {oldPrice && oldPrice > unitPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {oldPrice.toLocaleString()} so&apos;m
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {t('line_total')}: {lineTotal.toLocaleString()} so&apos;m
                {oldLineTotal && oldLineTotal > lineTotal
                  ? ` · ${t('discount_saved', {
                    amount: (oldLineTotal - lineTotal).toLocaleString(),
                  })}`
                  : ''}
              </p>
            </div>

            <div className="flex justify-end">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 px-3 py-2">
                <button
                  onClick={onDecrease}
                  disabled={busy}
                  className="text-gray-500 active:opacity-60 disabled:opacity-40"
                  aria-label={t('decrease')}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-5 text-center text-sm font-semibold text-gray-900">
                  {item.quantity}
                </span>
                <button
                  onClick={onIncrease}
                  disabled={busy}
                  className="text-gray-500 active:opacity-60 disabled:opacity-40"
                  aria-label={t('increase')}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = useTranslations('OrdersPage');
  const headerT = useTranslations('Header');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const {
    data: cart,
    isLoading: cartLoading,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    isUpdatingQuantity,
    isRemovingItem,
    isClearingCart,
  } = useCart();

  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => apiService.getAddresses<Address[]>(),
    enabled: isAuthenticated && !authLoading,
    staleTime: 30 * 1000,
  });

  const defaultAddress = useMemo(
    () => addresses.find((item) => item.isDefault) || addresses[0],
    [addresses],
  );

  const resolvedAddress =
    addresses.find((item) => item._id === selectedAddressId) || defaultAddress || null;

  const uniqueItemsCount = cart?.items.length ?? 0;
  const subtotalBeforeDiscount =
    cart?.items.reduce((sum, item) => {
      const unitOldPrice = resolveCartItemOldPrice(item) ?? resolveCartItemPrice(item);
      return sum + unitOldPrice * item.quantity;
    }, 0) ?? 0;
  const discountTotal = Math.max(subtotalBeforeDiscount - subtotal, 0);

  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;
  const checkoutReady = Boolean(cart?.items.length && resolvedAddress);

  const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
    setFeedback(null);

    try {
      if (nextQuantity <= 0) {
        await removeItem({
          productId: item.productId._id,
          selectedVolume: item.selectedVolume,
          selectedScentCode: item.selectedScentCode,
        });
        return;
      }

      await updateQuantity({
        productId: item.productId._id,
        quantity: nextQuantity,
        selectedVolume: item.selectedVolume,
        selectedScentCode: item.selectedScentCode,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('cart_action_error');
      setFeedback({ type: 'error', text: message });
    }
  };

  const handleRemove = async (item: CartItem) => {
    setFeedback(null);

    try {
      await removeItem({
        productId: item.productId._id,
        selectedVolume: item.selectedVolume,
        selectedScentCode: item.selectedScentCode,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('cart_action_error');
      setFeedback({ type: 'error', text: message });
    }
  };

  const handleClearCart = async () => {
    if (!cart?.items.length) {
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm(t('confirm_clear_cart'))) {
      return;
    }

    setFeedback(null);

    try {
      await clearCart();
      setFeedback({ type: 'success', text: t('cart_cleared') });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('cart_action_error');
      setFeedback({ type: 'error', text: message });
    }
  };

  const isBusy = isUpdatingQuantity || isRemovingItem || isClearingCart;

  if (authLoading) {
    return <div className="min-h-screen bg-ios-bg" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ios-bg px-4 py-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">{t('auth_title')}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{t('auth_description')}</p>
        </div>
      </div>
    );
  }

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
            {headerT('cart_label')}
          </h1>
        </div>
      </div>

      <div className="px-4 pb-24 pt-20">
        {feedback && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success'
              ? 'border-green-100 bg-green-50 text-green-700'
              : 'border-red-100 bg-red-50 text-red-600'
              }`}
          >
            {feedback.text}
          </div>
        )}

        {cartLoading ? (
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="skeleton-shimmer h-24 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : cart?.items?.length ? (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-primary/10 bg-gradient-to-br from-white via-primary/[0.03] to-primary/[0.08] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{t('cart_summary')}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('cart_items_count', { count: itemCount })} · {t('unique_items', { count: uniqueItemsCount })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {subtotal.toLocaleString()} so&apos;m
                  </span>
                  <button
                    onClick={() => void handleClearCart()}
                    disabled={isBusy}
                    className="text-xs font-semibold text-gray-500 transition-opacity active:opacity-60 disabled:opacity-40"
                  >
                    {isClearingCart ? t('clearing_cart') : t('clear_cart')}
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5">
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-600">{t('delivery_eta_label')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{t('delivery_eta_value')}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-600">{t('checkout_status')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {checkoutReady ? t('checkout_ready') : t('checkout_missing')}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5">
                  <div className="flex items-center gap-3">
                    <BadgePercent className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-600">{t('discount')}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {discountTotal > 0 ? `${discountTotal.toLocaleString()} so'm` : t('no_discount')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {cart.items.map((item, index) => (
                <CartItemCard
                  key={`${item.productId._id}-${item.selectedVolume || 'base'}-${item.selectedScentCode || 'scent'}-${index}`}
                  item={item}
                  locale={locale}
                  busy={isBusy}
                  onDecrease={() => void handleQuantityChange(item, item.quantity - 1)}
                  onIncrease={() => void handleQuantityChange(item, item.quantity + 1)}
                  onRemove={() => void handleRemove(item)}
                />
              ))}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('delivery_address')}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {resolvedAddress ? resolvedAddress.title : t('address_required')}
                  </p>
                </div>
                <Link
                  href="/profile/addresses"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  {t('change')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {resolvedAddress ? resolvedAddress.title : t('address_required')}
                  </p>
                </div>
              </div>

              {addressesLoading ? (
                <div className="mt-4 space-y-2">
                  <div className="skeleton-shimmer h-14 rounded-2xl" />
                  <div className="skeleton-shimmer h-14 rounded-2xl" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {addresses.map((address) => {
                    const isSelected = resolvedAddress?._id === address._id;
                    return (
                      <button
                        key={address._id}
                        onClick={() => setSelectedAddressId(address._id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{address.title}</p>
                            <p className="mt-1 text-xs leading-5 text-gray-500">{address.address}</p>
                          </div>
                          {address.isDefault && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                              {t('default_badge')}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-4 py-5">
                  <p className="text-sm text-gray-500">{t('no_addresses')}</p>
                  <Link
                    href="/profile/addresses/add"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    {t('add_address')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="space-y-3 text-sm">
                {discountTotal > 0 && (
                  <div className="flex items-center justify-between text-green-700">
                    <span>{t('discount')}</span>
                    <span>-{discountTotal.toLocaleString()} so&apos;m</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t('subtotal')}</span>
                  <span>{(discountTotal > 0 ? subtotalBeforeDiscount : subtotal).toLocaleString()} so&apos;m</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t('delivery_fee')}</span>
                  <span>{deliveryFee.toLocaleString()} so&apos;m</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                  <span>{t('total')}</span>
                  <span>{total.toLocaleString()} so&apos;m</span>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    resolvedAddress
                      ? `/orders/payment?addressId=${resolvedAddress._id}`
                      : '/orders/payment',
                  )
                }
                disabled={!cart.items.length || !resolvedAddress || isBusy}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
                {t('continue')}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">{t('continue_hint')}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-10 w-10 text-primary/60" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">{t('empty_cart_title')}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{t('empty_cart_description')}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-5 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              {t('go_shopping')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
