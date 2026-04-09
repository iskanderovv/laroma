'use client';

import { useQuery } from '@tanstack/react-query';
import AdminDataTable, { type AdminTableColumn } from '@/components/admin/AdminDataTable';
import { adminApi } from '@/lib/admin/api';
import type { AdminUser } from '@/lib/admin/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(date?: string) {
  if (!date) {
    return 'Noma’lum';
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

const userColumns: AdminTableColumn<AdminUser>[] = [
  {
    key: 'user',
    header: 'Foydalanuvchi',
    render: (row) => (
      <div>
        <p className="font-medium text-[#211f1f]">
          {[row.firstName, row.lastName].filter(Boolean).join(' ') || 'Ism kiritilmagan'}
        </p>
        <p className="mt-1 text-xs text-[#6b6261]">ID: {row._id}</p>
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Telefon',
    render: (row) => row.phone,
  },
  {
    key: 'username',
    header: 'Username',
    render: (row) => (row.username ? `@${row.username}` : 'Kiritilmagan'),
  },
  {
    key: 'language',
    header: 'Til',
    render: (row) => (row.languageCode || 'uz').toUpperCase(),
  },
  {
    key: 'role',
    header: 'Rol',
    render: (row) => <Badge variant="secondary">{row.role}</Badge>,
  },
  {
    key: 'createdAt',
    header: 'Qo‘shilgan sana',
    render: (row) => formatDate(row.createdAt),
  },
];

export default function AdminUsersView() {
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
  });

  if (usersQuery.isLoading) {
    return <Skeleton className="h-[420px] rounded-lg" />;
  }

  if (usersQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Foydalanuvchilar ro‘yxatini yuklab bo‘lmadi</CardTitle>
          <CardDescription>
            Admin token, backend yoki `GET /users` endpointini tekshiring.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const users = usersQuery.data?.users || [];

  return (
    <Card className="bg-[var(--admin-surface)]">
      <CardHeader className="flex-row items-end justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Foydalanuvchilar ro‘yxati</CardTitle>
          <CardDescription>Ro‘yxatdan o‘tgan mijozlar va ularning asosiy ma’lumotlari</CardDescription>
        </div>
        <Badge>{users.length} ta foydalanuvchi</Badge>
      </CardHeader>
      <CardContent>
      <AdminDataTable
        columns={userColumns}
        rows={users}
        getRowKey={(row) => row._id}
        emptyTitle="Foydalanuvchilar topilmadi"
        emptyDescription="Ma’lumotlar bazasida hali foydalanuvchilar yo‘q."
      />
      </CardContent>
    </Card>
  );
}
