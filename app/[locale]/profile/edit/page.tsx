'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { updateUser } from '@/store/slices/authSlice';
import { ChevronLeft, Check, Loader2, User } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { updateProfileAction } from '@/app/actions/auth';
import { useMutation } from '@tanstack/react-query';
import { EditProfilePageSkeleton } from '@/components/profile/ProfileSkeletons';

export default function EditProfile() {
  const t = useTranslations('EditProfile');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, isLoading: authLoading } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName || '');
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) => {
      if (!user?._id || !token) throw new Error('Missing user info');
      return updateProfileAction(user._id, token, data);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        dispatch(updateUser(result.data));
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.back();
        }, 1500);
      }
    },
  });

  const handleSave = () => {
    if (!user || mutation.isPending) return;
    mutation.mutate({ firstName, lastName });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  if (authLoading) {
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
            <h1 className="text-[17px] font-bold text-black tracking-tight">{t('title')}</h1>
          </div>
        </div>

        <div className="pt-14">
          <EditProfilePageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
      {/* iOS Style Header - Absolute Center Title */}
      <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 h-14 flex items-center border-b border-black/[0.03]">
        <button 
          onClick={() => router.back()} 
          className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2px]" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-[17px] font-bold text-black tracking-tight">{t('title')}</h1>
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={mutation.isPending || !firstName}
            className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 disabled:opacity-30 transition-opacity"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tayyor'}
          </button>
        </div>
      </div>

      <div className="pt-14 p-4 space-y-8">
        {/* Avatar Section */}
        <div className="flex justify-center py-4">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-[5px] border-white shadow-sm overflow-hidden">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-black/10" />
            )}
          </div>
        </div>

        {/* Inputs Group - Back to iOS List Style */}
        <div className="space-y-2">
          <p className="px-4 text-[13px] font-medium text-black/40">
            Shaxsiy ma&apos;lumotlar
          </p>
          <div className="bg-white rounded-[20px] overflow-hidden border border-black/[0.03] shadow-sm">
            <div className="px-5 py-4 border-b border-black/[0.02]">
              <div className="flex items-center gap-4">
                <span className="text-[15px] font-medium text-black/40 min-w-[90px]">Ism</span>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="flex-1 text-[15px] font-bold text-black outline-none bg-transparent"
                  placeholder="Kiritish"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-b border-black/[0.02]">
              <div className="flex items-center gap-4">
                <span className="text-[15px] font-medium text-black/40 min-w-[90px]">Familiya</span>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="flex-1 text-[15px] font-bold text-black outline-none bg-transparent"
                  placeholder="Kiritish"
                />
              </div>
            </div>
            <div className="px-5 py-4 bg-black/[0.01]">
              <div className="flex items-center gap-4 opacity-50">
                <span className="text-[15px] font-medium text-black/40 min-w-[90px]">Telefon</span>
                <span className="text-[15px] font-bold text-black">
                  {formatPhone(user?.phone)}
                </span>
              </div>
            </div>
          </div>
          <p className="px-5 pt-3 text-[12px] text-black/30 font-medium leading-relaxed">
            Sizning ismingiz va familiyangiz buyurtmalarni rasmiylashtirishda ishlatiladi.
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
              <Check className="w-8 h-8 text-white stroke-[3px]" />
            </div>
            <p className="text-lg font-bold text-black">Muvaffaqiyatli!</p>
          </div>
        </div>
      )}
    </div>
  );
}
