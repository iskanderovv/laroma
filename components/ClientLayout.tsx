'use client';

import { NextIntlClientProvider } from 'next-intl';
import StoreProvider from '@/components/StoreProvider';
import TelegramAuthProvider from '@/components/TelegramAuthProvider';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ToastProvider from '@/components/ToastProvider';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
  messages,
  locale
}: {
  children: React.ReactNode;
  messages: any;
  locale: string;
}) {
  const pathname = usePathname();
  
  // Home page faqat / yoki /uz yoki /ru bo'lgan holatda header ko'rsatamiz
  const isHomePage = pathname === '/uz' || pathname === '/ru' || pathname === '/';
  
  const isSubPage = pathname.includes('/edit') || 
                    pathname.includes('/language') || 
                    pathname.includes('/addresses') || 
                    pathname.includes('/orders/payment') ||
                    pathname.includes('/search') ||
                    pathname.includes('/product/') ||
                    pathname.includes('/support') || 
                    pathname.includes('/delivery') || 
                    pathname.includes('/about');

  return (
    <StoreProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <TelegramAuthProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <ToastProvider>
                <div className="flex flex-col min-h-screen relative max-w-lg mx-auto w-full bg-white shadow-sm ring-1 ring-black/5">
                  {isHomePage && <Header />}
                  <main className="flex-1 overflow-y-auto">
                    {children}
                  </main>
                  {!isSubPage && <BottomNav />}
                </div>
              </ToastProvider>
            </NextIntlClientProvider>
          </TelegramAuthProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </StoreProvider>
  );
}
