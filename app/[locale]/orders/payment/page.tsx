'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronLeft,
  Copy,
  CreditCard,
  ImagePlus,
  MapPin,
  PackageCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi, getImageUrl, uploadAuthenticatedFile } from '@/services/api';
import { apiService } from '@/lib/api/apiService';
import { resolveCartItemOldPrice, resolveCartItemPrice, useCart } from '@/hooks/useCart';

interface Address {
  _id: string;
  title: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

type PaymentMethod = 'cash' | 'card';

const MANUAL_PAYMENT_CARD_NUMBER = '9860 1234 5678 9012';

export default function OrdersPaymentPage() {
  const queryClient = useQueryClient();
  const t = useTranslations('OrdersPage');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const addressId = searchParams.get('addressId') || '';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [orderNote, setOrderNote] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [paymentReceiptPreview, setPaymentReceiptPreview] = useState('');
  const [paymentReceiptName, setPaymentReceiptName] = useState('');
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: cart, isLoading: cartLoading, subtotal } = useCart();

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

  const resolvedAddress = addresses.find((item) => item._id === addressId) || defaultAddress || null;
  const manualPaymentActive = paymentMethod === 'card';
  const subtotalBeforeDiscount =
    cart?.items.reduce((sum, item) => {
      const unitOldPrice = resolveCartItemOldPrice(item) ?? resolveCartItemPrice(item);
      return sum + unitOldPrice * item.quantity;
    }, 0) ?? 0;
  const discountTotal = Math.max(subtotalBeforeDiscount - subtotal, 0);
  const deliveryFee = subtotal > 0 ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: () => {
      if (!resolvedAddress) {
        throw new Error(t('address_required'));
      }

      if (manualPaymentActive) {
        if (!paymentReceiptUrl) {
          throw new Error(t('payment_receipt_required'));
        }
      }

      return fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify({
          deliveryDetails: {
            firstName: user?.firstName || t('customer_fallback'),
            lastName: user?.lastName || undefined,
            phone: resolvedAddress.phone,
            address: resolvedAddress.address,
            location:
              typeof resolvedAddress.latitude === 'number' &&
              typeof resolvedAddress.longitude === 'number'
                ? `${resolvedAddress.latitude}, ${resolvedAddress.longitude}`
                : undefined,
          },
          paymentMethod,
          paymentReceiptUrl: manualPaymentActive ? paymentReceiptUrl : undefined,
          notes: orderNote.trim() || undefined,
        }),
      });
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', text: t('order_success_pending') });
      setOrderNote('');
      setPaymentReceiptUrl('');
      setPaymentReceiptName('');
      if (paymentReceiptPreview.startsWith('blob:')) {
        URL.revokeObjectURL(paymentReceiptPreview);
      }
      setPaymentReceiptPreview('');
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : t('order_error');
      setFeedback({ type: 'error', text: message });
    },
  });

  useEffect(() => {
    if (!manualPaymentActive) {
      setPaymentReceiptUrl('');
      setPaymentReceiptName('');
      if (paymentReceiptPreview.startsWith('blob:')) {
        URL.revokeObjectURL(paymentReceiptPreview);
      }
      setPaymentReceiptPreview('');
      setFeedback(null);
      return;
    }
  }, [manualPaymentActive, paymentReceiptPreview]);

  useEffect(() => {
    return () => {
      if (paymentReceiptPreview.startsWith('blob:')) {
        URL.revokeObjectURL(paymentReceiptPreview);
      }
    };
  }, [paymentReceiptPreview]);

  const handleCopyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(MANUAL_PAYMENT_CARD_NUMBER.replace(/\s+/g, ''));
      setFeedback({ type: 'success', text: t('payment_card_copied') });
    } catch {
      setFeedback({ type: 'error', text: t('action_error') });
    }
  };

  const handleReceiptUpload = async (file?: File | null) => {
    if (!file) {
      return;
    }

    setFeedback(null);
    setIsReceiptUploading(true);

    const nextPreview = URL.createObjectURL(file);

    try {
      const response = await uploadAuthenticatedFile('/uploads/payment-receipt', file);

      if (paymentReceiptPreview.startsWith('blob:')) {
        URL.revokeObjectURL(paymentReceiptPreview);
      }

      setPaymentReceiptPreview(nextPreview);
      setPaymentReceiptName(file.name);
      setPaymentReceiptUrl(response.url);
    } catch (error) {
      URL.revokeObjectURL(nextPreview);
      const message = error instanceof Error ? error.message : t('action_error');
      setFeedback({ type: 'error', text: message });
    } finally {
      setIsReceiptUploading(false);
    }
  };

  const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
    { value: 'cash', label: t('payment_cash') },
    { value: 'card', label: t('payment_card') },
  ];

  const isBusy = createOrderMutation.isPending || isReceiptUploading;

  if (authLoading || cartLoading) {
    return <div className="min-h-screen bg-ios-bg" />;
  }

  if (!isAuthenticated) {
    router.replace('/orders');
    return null;
  }

  return (
    <div className="min-h-screen bg-ios-bg">
      <div className="ios-blur fixed top-0 left-1/2 z-50 flex h-14 w-full max-w-lg -translate-x-1/2 items-center border-b border-black/[0.03] bg-white px-4">
        <button
          onClick={() => router.push('/orders')}
          className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
        >
          <ChevronLeft className="h-7 w-7 stroke-[2px]" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="max-w-[70%] truncate text-center text-[17px] font-bold tracking-tight text-black">
            {t('payment_page_title')}
          </h1>
        </div>
      </div>

      <div className="px-4 pb-24 pt-20">
        {feedback && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-green-100 bg-green-50 text-green-700'
                : 'border-red-100 bg-red-50 text-red-600'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {!cart?.items?.length ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{t('empty_cart_title')}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{t('empty_cart_description')}</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-5 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              {t('back_to_cart')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('payment_address_title')}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {resolvedAddress ? resolvedAddress.title : t('address_required')}
                  </p>
                </div>
                <Link href="/orders" className="text-sm font-semibold text-primary">
                  {t('change')}
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {resolvedAddress ? resolvedAddress.title : t('address_required')}
                  </p>
                  <p className="text-xs leading-5 text-gray-500">
                    {resolvedAddress ? resolvedAddress.address : t('address_required')}
                  </p>
                </div>
              </div>

              {addressesLoading && <div className="skeleton-shimmer mt-4 h-12 rounded-2xl" />}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">{t('payment_method')}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {paymentOptions.map(({ value, label }) => {
                  const isSelected = paymentMethod === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                    >
                      <CreditCard className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                      <p className="mt-2 text-sm font-semibold text-gray-900">{label}</p>
                    </button>
                  );
                })}
              </div>

              {manualPaymentActive && (
                <div className="mt-4 rounded-3xl border border-primary/10 bg-primary/[0.04] p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('payment_manual_title')}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {t('payment_manual_description')}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        {t('payment_manual_owner_label')}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {t('payment_manual_owner_value')}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                          {t('payment_manual_card_label')}
                        </p>
                        <button
                          type="button"
                          onClick={() => void handleCopyCardNumber()}
                          className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 text-[11px] font-semibold text-primary active:opacity-70"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {t('payment_copy_card')}
                        </button>
                      </div>

                      <p className="mt-2 overflow-x-auto whitespace-nowrap text-sm font-bold tracking-[0.12em] text-gray-900 no-scrollbar">
                        {MANUAL_PAYMENT_CARD_NUMBER}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        {t('payment_manual_amount_label')}
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900">{total.toLocaleString()} so&apos;m</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-white px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ImagePlus className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{t('payment_receipt_title')}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {t('payment_receipt_description')}
                        </p>

                        <label className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-primary px-4 text-xs font-semibold text-white active:opacity-90">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              void handleReceiptUpload(file);
                              event.currentTarget.value = '';
                            }}
                          />
                          {isReceiptUploading ? t('payment_receipt_uploading') : t('payment_receipt_upload')}
                        </label>

                        {paymentReceiptUrl && (
                          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-green-50 px-3 py-2 text-xs text-green-700">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {paymentReceiptName || t('payment_receipt_uploaded')}
                            </span>
                          </div>
                        )}

                        {paymentReceiptPreview && (
                          <div className="mt-3 relative h-36 w-full overflow-hidden rounded-2xl bg-gray-100">
                            <Image
                              src={paymentReceiptPreview}
                              alt={t('payment_receipt_preview_alt')}
                              fill
                              sizes="(max-width: 640px) 100vw, 360px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-gray-900">{t('order_note')}</span>
                <textarea
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                  rows={3}
                  placeholder={t('order_note_placeholder')}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-primary focus:bg-white"
                />
              </label>

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
                onClick={() => void createOrderMutation.mutateAsync()}
                disabled={
                  !cart.items.length ||
                  !resolvedAddress ||
                  isBusy ||
                  (manualPaymentActive && !paymentReceiptUrl)
                }
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4" />
                {createOrderMutation.isPending ? t('placing_order') : t('place_order')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
