import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminBrand from '@/components/admin/AdminBrand';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { ADMIN_COOKIE_NAME } from '@/lib/admin/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminLoginPage() {
  const cookieStore = await cookies();

  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--admin-bg)] px-4 py-12">
      <Card className="w-full max-w-md mx-auto bg-[var(--admin-surface)] shadow-lg border-primary/10">
        <CardHeader className='flex flex-col items-center text-center space-y-4'>
          <AdminBrand />
          <CardTitle className="text-2xl font-bold tracking-tight">Admin panelga kirish</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
