'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, MapPin, Trash2, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { apiService } from '@/lib/api/apiService';
import { useAppSelector } from '@/hooks/redux';
import { AddressesPageSkeleton } from '@/components/profile/ProfileSkeletons';

interface Address {
  _id: string;
  title: string;
  address: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AddressesPage() {
  const t = useTranslations('Profile');
  const router = useRouter();
  const { token, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAddresses<Address[]>();
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Show empty state instead of fallback data
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined'
      ? localStorage.getItem('token') ||
        localStorage.getItem('auth-token') ||
        localStorage.getItem('access_token')
      : null;

    const authToken = token || storedToken;

    if (authLoading && !authToken) {
      return;
    }

    if (!authToken) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    loadAddresses();
  }, [authLoading, token, loadAddresses]);

  const handleSetDefault = async (id: string) => {
    try {
      // Optimistically update UI
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === id
      })));
      
      await apiService.setDefaultAddress(id);
    } catch (error) {
      console.error('Error setting default address:', error);
      // Revert optimistic update
      loadAddresses();
      alert('Asosiy manzil belgilashda xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    if (addresses.length <= 1) {
      alert('Kamida bitta manzil bo\'lishi kerak!');
      return;
    }

    if (confirm('Manzilni o\'chirmoqchimisiz?')) {
      try {
        // Optimistically update UI
        setAddresses(addresses.filter(addr => addr._id !== id));
        
        await apiService.deleteAddress(id);
      } catch (error) {
        console.error('Error deleting address:', error);
        // Revert optimistic update
        loadAddresses();
        alert('Manzilni o\'chirishda xatolik yuz berdi');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
        <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 h-14 flex items-center border-b border-black/[0.03]">
          <button 
            onClick={() => router.back()} 
            className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2px]" />
          </button>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-[17px] font-bold text-black tracking-tight">{t('addresses')}</h1>
          </div>
          <div className="flex-1 flex justify-end">
            <Link 
              href="/profile/addresses/add"
              className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 transition-opacity"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </div>
        </div>
        
        <AddressesPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
      {/* iOS Style Header */}
      <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 h-14 flex items-center border-b border-black/[0.03]">
        <button 
          onClick={() => router.back()} 
          className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2px]" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-[17px] font-bold text-black tracking-tight">{t('addresses')}</h1>
        </div>

        <div className="flex-1 flex justify-end">
          <Link 
            href="/profile/addresses/add"
            className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 transition-opacity"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Addresses List */}
      <div className="px-4 pt-20 pb-6 space-y-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manzillar yo&apos;q</h3>
            <p className="text-sm text-gray-500 text-center mb-6 px-8">
              Buyurtmalaringizni yetkazib berish uchun manzil qo&apos;shing
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative"
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Asosiy
                  </span>
                </div>
              )}

              {/* Address Info */}
              <div className="pr-16">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">{address.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{address.address}</p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">{address.phone}</p>

                      <button
                        onClick={() => handleDelete(address._id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-red-600 bg-red-50 active:opacity-70 transition-opacity"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">O&apos;chirish</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {!address.isDefault && (
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="text-sm text-primary font-semibold active:opacity-60 transition-opacity"
                  >
                    Asosiy qilish
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
