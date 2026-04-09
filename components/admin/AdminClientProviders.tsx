'use client';

import ReactQueryProvider from '@/components/ReactQueryProvider';

export default function AdminClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
