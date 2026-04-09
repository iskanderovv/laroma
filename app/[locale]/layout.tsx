import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Laroma's Perfume",
  description: "Exclusive perfumes for you",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const isSupportedLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number],
  );
  
  if (!isSupportedLocale) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <ClientLayout messages={messages} locale={locale}>
      {children}
    </ClientLayout>
  );
}
