'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminApi, AdminApiError } from '@/lib/admin/api';
import { setAdminSession } from '@/lib/admin/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email kiriting')
    .email('Email formati noto‘g‘ri'),
  password: z
    .string()
    .min(1, 'Parol kiriting')
    .min(6, 'Parol kamida 6 ta belgidan iborat bo‘lsin'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginValues) => {
    try {
      const response = await adminApi.login(values);
      setAdminSession(response.access_token);
      router.replace('/admin');
      router.refresh();
    } catch (error) {
      const message =
        error instanceof AdminApiError
          ? error.message
          : "Kirishda xatolik yuz berdi. Qayta urinib ko‘ring.";

      setError('root', {
        message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#211f1f]">Email</span>
        <Input
          type="email"
          placeholder="laroma@gmail.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email?.message ? (
          <span className="text-sm text-primary">{errors.email.message}</span>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#211f1f]">Parol</span>
        <Input
          type="password"
          placeholder="Parolingizni kiriting"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password?.message ? (
          <span className="text-sm text-primary">{errors.password.message}</span>
        ) : null}
      </label>

      {errors.root?.message ? (
        <div className="rounded-md border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
          {errors.root.message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Kirilmoqda...' : 'Tizimga kirish'}
      </Button>
    </form>
  );
}
