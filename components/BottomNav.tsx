'use client';

import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useWishlist } from '@/hooks/useWishlist';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const { items, isAuthenticated } = useWishlist();

  const navItems = [
    { icon: Home, label: t('home'), href: '/' },
    { icon: LayoutGrid, label: t('category'), href: '/category' },
    { icon: Heart, label: t('favorites'), href: '/favorites', badge: isAuthenticated ? items.length : 0 },
    { icon: ShoppingBag, label: t('orders'), href: '/user-orders' },
    { icon: User, label: t('profile'), href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/[0.05] pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.01)]">
      <div className="flex h-[72px] items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, href, badge }) => {
          const isActive = href === '/'
            ? pathname === '/uz' || pathname === '/ru' || pathname === '/'
            : pathname === href || pathname.endsWith(`${href}`);
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 min-w-[64px] transition-all duration-200 active:opacity-60",
                isActive ? "text-primary" : "text-black"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-[24px] h-[24px] stroke-[1.8px]", isActive ? "text-primary" : "text-black")} />
                {badge ? (
                  <span className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-4 text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </div>
              <span className={cn(
                "text-[10px] font-semibold tracking-tight",
                isActive ? "text-primary" : "text-black"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
