'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ChevronLeft, MapPin, Phone, Home, Building2, Loader2, Map, X } from 'lucide-react';
import { apiService } from '@/lib/api/apiService';
import LocationMap from '@/components/ui/LocationMap';
import { useAppSelector } from '@/hooks/redux';

const formatPhoneFromUser = (phone?: string) => {
  if (!phone) return '+998 ';

  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  if (digits.length > 9) {
    digits = digits.slice(-9);
  }

  let formatted = '+998';
  if (digits.length > 0) {
    formatted += ` ${digits.slice(0, 2)}`;
  }
  if (digits.length > 2) {
    formatted += ` ${digits.slice(2, 5)}`;
  }
  if (digits.length > 5) {
    formatted += ` ${digits.slice(5, 7)}`;
  }
  if (digits.length > 7) {
    formatted += ` ${digits.slice(7, 9)}`;
  }

  return formatted;
};

export default function AddAddressPage() {
  const t = useTranslations('Address');
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapSelection, setMapSelection] = useState({
    latitude: 41.3111,
    longitude: 69.2797,
    address: ''
  });
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    phone: '+998 ',
    isDefault: false,
    latitude: 41.3111,
    longitude: 69.2797
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!user?.phone) return;

    setFormData((prev) => {
      const shouldPrefillPhone = !prev.phone || prev.phone === '+998' || prev.phone === '+998 ';
      if (!shouldPrefillPhone) {
        return prev;
      }

      return {
        ...prev,
        phone: formatPhoneFromUser(user.phone)
      };
    });
  }, [user?.phone]);

  useEffect(() => {
    if (!showMap) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showMap]);

  const addressTypes = [
    { id: 'home', label: t('address_types.home'), icon: Home },
    { id: 'work', label: t('address_types.work'), icon: Building2 },
    { id: 'other', label: t('address_types.other'), icon: MapPin }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t('validation.title_required');
    }
    
    // Address is now optional
    // if (!formData.address.trim()) {
    //   newErrors.address = 'To\'liq manzil kiritilishi shart';
    // }
    
    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.phone_required');
    } else if (!/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(formData.phone.replace(/\s+/g, ' '))) {
      // Allow both formatted and unformatted versions
      const cleanPhone = formData.phone.replace(/\s/g, '');
      if (!/^\+998[0-9]{9}$/.test(cleanPhone)) {
        newErrors.phone = t('validation.phone_invalid');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Clean phone number for API
      const cleanPhone = formData.phone.replace(/\s/g, '');
      const addressData = {
        ...formData,
        phone: cleanPhone
      };
      
      await apiService.createAddress(addressData);
      router.push('/profile/addresses');
    } catch (error: any) {
      console.error('Error saving address:', error);
      alert(error.message || 'Manzil saqlashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneInput = (value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If user tries to delete +998, restore it
    if (cleaned.length < 4 || !cleaned.startsWith('+998')) {
      setFormData({ ...formData, phone: '+998' });
      return;
    }
    
    // Limit to +998 + 9 digits
    const digits = cleaned.slice(4);
    if (digits.length <= 9) {
      // Format: +998 XX XXX XX XX
      let formatted = '+998';
      if (digits.length > 0) {
        formatted += ' ' + digits.slice(0, 2);
      }
      if (digits.length > 2) {
        formatted += ' ' + digits.slice(2, 5);
      }
      if (digits.length > 5) {
        formatted += ' ' + digits.slice(5, 7);
      }
      if (digits.length > 7) {
        formatted += ' ' + digits.slice(7, 9);
      }
      
      setFormData({ ...formData, phone: formatted });
    }
  };

  const openMapSelector = () => {
    setMapSelection({
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address
    });
    setShowMap(true);
  };

  const closeMapSelector = () => {
    setShowMap(false);
  };

  const handleMapToggle = (isEnabled: boolean) => {
    if (isEnabled) {
      openMapSelector();
      return;
    }

    closeMapSelector();
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setMapSelection({
      latitude: lat,
      longitude: lng,
      address: address
    });
  };

  const handleMapSave = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: mapSelection.latitude,
      longitude: mapSelection.longitude,
      address: mapSelection.address
    }));
    closeMapSelector();
  };

  const isFormValid = formData.title && formData.phone;

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
          <h1 className="text-[17px] font-bold text-black tracking-tight">{t('add_new')}</h1>
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || !isFormValid}
            className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 disabled:opacity-30 transition-opacity"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('save')}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pt-20 pb-6 space-y-6">
        {/* Address Type Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manzil turi</h3>
          <div className="grid grid-cols-3 gap-3">
            {addressTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFormData({ ...formData, title: type.label })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  formData.title === type.label 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 bg-white active:bg-gray-50'
                }`}
              >
                <type.icon className={`w-6 h-6 ${
                  formData.title === type.label ? 'text-primary' : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  formData.title === type.label ? 'text-primary' : 'text-gray-700'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Title Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Manzil nomi
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masalan: Uy, Ish, Do'stim uyi"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors ${
                  errors.title ? 'border-red-300' : 'border-gray-200 focus:border-primary'
                }`}
              />
              <Home className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
        </div>

        {/* Map Toggle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5 text-primary" />
              <div>
                <h4 className="font-semibold text-gray-900">Xaritadan tanlash</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Aniq joylashuvni xaritada belgilang
                </p>
              </div>
            </div>
            <div className="relative">
                <input
                  type="checkbox"
                  checked={showMap}
                  onChange={(e) => handleMapToggle(e.target.checked)}
                  className="sr-only"
                />
              <div className={`w-12 h-7 rounded-full transition-colors relative ${
                showMap ? 'bg-primary' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  showMap ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </label>

          {formData.address && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">Tanlangan manzil</p>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">{formData.address}</p>
            </div>
          )}
        </div>

        {/* Address Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            To'liq manzil <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
          </label>
          <div className="relative">
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Viloyat, tuman, ko'cha, uy raqami (agar kerak bo'lsa)"
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none resize-none transition-colors ${
                errors.address ? 'border-red-300' : 'border-gray-200 focus:border-primary'
              }`}
            />
            <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* Phone Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Telefon raqami
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneInput(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-colors ${
                errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-primary'
              }`}
            />
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Default Address Toggle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <h4 className="font-semibold text-gray-900">Asosiy manzil sifatida belgilash</h4>
              <p className="text-sm text-gray-500 mt-1">
                Buyurtmalar uchun standart manzil bo'ladi
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-12 h-7 rounded-full transition-colors relative ${
                formData.isDefault ? 'bg-primary' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  formData.isDefault ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </label>
        </div>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-[120] bg-white">
          <div className="ios-blur fixed top-0 inset-x-0 z-[121] px-4 h-14 flex items-center border-b border-black/[0.03]">
            <button
              onClick={closeMapSelector}
              className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
            >
              <X className="w-6 h-6 stroke-[2px]" />
            </button>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h2 className="text-[17px] font-bold text-black tracking-tight">Manzilni tanlang</h2>
            </div>

            <div className="flex-1 flex justify-end">
              <button
                onClick={handleMapSave}
                className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 transition-opacity"
              >
                Saqlash
              </button>
            </div>
          </div>

          <div className="h-full px-4 pt-16 pb-4">
            <div className="h-full min-h-0 flex flex-col gap-3">
              <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <LocationMap
                onLocationSelect={handleLocationSelect}
                initialLat={mapSelection.latitude}
                initialLng={mapSelection.longitude}
                className="w-full h-full"
              />
              </div>

              <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                <p className="text-xs font-medium text-gray-500">Hozirgi tanlov</p>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {mapSelection.address || 'Xaritada nuqtani tanlang'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
