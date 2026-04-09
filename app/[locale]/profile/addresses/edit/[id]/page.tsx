'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ChevronLeft, MapPin, User, Phone, Home, Building2, Loader2, Map } from 'lucide-react';
import { apiService } from '@/lib/api/apiService';
import LocationMap from '@/components/ui/LocationMap';
import { AddressFormPageSkeleton } from '@/components/profile/ProfileSkeletons';

interface Props {
  params: {
    id: string;
  };
}

export default function EditAddressPage({ params }: Props) {
  const t = useTranslations('Profile');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    phone: '',
    latitude: 41.3111,
    longitude: 69.2797,
    isDefault: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const addressTypes = [
    { id: 'home', label: 'Uy', icon: Home },
    { id: 'work', label: 'Ish', icon: Building2 },
    { id: 'other', label: 'Boshqa', icon: MapPin }
  ];

  // Load address data
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const address = await apiService.getAddress(params.id);
        setFormData({
          title: address.title,
          address: address.address,
          phone: address.phone,
          latitude: address.latitude || 41.3111,
          longitude: address.longitude || 69.2797,
          isDefault: address.isDefault
        });
      } catch (error) {
        console.error('Error loading address:', error);
        alert('Manzilni yuklashda xatolik yuz berdi');
        router.push('/profile/addresses');
      } finally {
        setIsPageLoading(false);
      }
    };

    loadAddress();
  }, [params.id, router]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Manzil nomi kiritilishi shart';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'To\'liq manzil kiritilishi shart';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon raqami kiritilishi shart';
    } else if (!/^\+998[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'Telefon raqami noto\'g\'ri formatda';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await apiService.updateAddress(params.id, formData);
      router.push('/profile/addresses');
    } catch (error: any) {
      console.error('Error updating address:', error);
      alert(error.message || 'Manzil yangilashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneInput = (value: string) => {
    // Auto format phone number
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('998')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('8') && cleaned.length > 1) {
      cleaned = '+998' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+998') && cleaned.length > 0) {
      cleaned = '+998' + cleaned;
    }
    
    setFormData({ ...formData, phone: cleaned });
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: address
    });
  };

  const isFormValid = formData.title && formData.address && formData.phone;

  if (isPageLoading) {
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
            <h1 className="text-[17px] font-bold text-black tracking-tight">Manzilni tahrirlash</h1>
          </div>
        </div>

        <div className="pt-14">
          <AddressFormPageSkeleton />
        </div>
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
          <h1 className="text-[17px] font-bold text-black tracking-tight">Manzilni tahrirlash</h1>
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || !isFormValid}
            className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 disabled:opacity-30 transition-opacity"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Saqlash'}
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
                onChange={(e) => setShowMap(e.target.checked)}
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
        </div>

        {/* Map */}
        {showMap && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Xaritada manzilni belgilang
            </label>
            <LocationMap 
              onLocationSelect={handleLocationSelect}
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              className="w-full h-64 rounded-xl border border-gray-200"
            />
          </div>
        )}

        {/* Address Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            To'liq manzil
          </label>
          <div className="relative">
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Viloyat, tuman, ko'cha, uy raqami"
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
    </div>
  );
}
