'use client';

import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const t = useTranslations('Header');
  const router = useRouter();
  const { itemCount, subtotal } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full ios-blur bg-white border-b border-separator/10">
      <div className="flex h-16 items-center justify-between px-5 max-w-lg mx-auto">
        <div className="flex flex-col">
          <h1 className="text-xl font-serif font-bold text-black italic tracking-tight leading-none">
            Laroma&apos;s
          </h1>
          <span className="text-[9px] font-medium text-ios-gray uppercase tracking-[0.2em] mt-1">
            Parfumes oil
          </span>
        </div>

        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-3 active:opacity-60 transition-opacity"
        >
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[12px] font-medium text-black">
              {t('cart_label')}
            </span>
            <span className="text-[13px] font-bold text-primary">
              {itemCount > 0 ? `${subtotal.toLocaleString()} so'm` : t('cart_empty')}
            </span>
          </div>
          <div className="relative rounded-full bg-primary/5 p-2">
            <ShoppingCart className="w-5 h-5 text-primary stroke-[2px]" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
