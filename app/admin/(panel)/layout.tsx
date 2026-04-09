import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClientProviders from '@/components/admin/AdminClientProviders';
import AdminShell from '@/components/admin/AdminShell';
import { ADMIN_COOKIE_NAME } from '@/lib/admin/auth';

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  if (!cookieStore.get(ADMIN_COOKIE_NAME)?.value) {
    redirect('/admin/login');
  }

  return (
    <AdminClientProviders>
      <AdminShell>{children}</AdminShell>
    </AdminClientProviders>
  );
}
