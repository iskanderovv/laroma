'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';

const languages = [
  {
    code: 'uz',
    flag: '🇺🇿'
  },
  {
    code: 'ru', 
    flag: '🇷🇺'
  }
];

export default function LanguagePage() {
  const t = useTranslations('Language');
  const locale = useLocale();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(locale);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const handleSave = async () => {
    if (selectedLanguage === locale) return;
    
    try {
      // Save to localStorage
      localStorage.setItem('preferred-language', selectedLanguage);
      
      // URL'ni yangi til bilan almashtiramiz
      const newPath = `/${selectedLanguage}/profile`;
      
      // Tilni almashtirish
      window.location.href = newPath;
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
      {/* iOS Style Header - Same as Edit Profile */}
      <div className="ios-blur sticky top-0 z-50 px-4 h-14 flex items-center border-b border-black/[0.03]">
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
            disabled={selectedLanguage === locale}
            className="relative z-10 text-[17px] font-semibold text-primary active:opacity-40 disabled:opacity-30 transition-opacity"
          >
            Tayyor
          </button>
        </div>
      </div>

      {/* Language Options */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {languages.map((language, index) => {
            const isSelected = selectedLanguage === language.code;
            
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-5 py-5 active:bg-gray-50 transition-all duration-200 ${
                  index !== languages.length - 1 ? 'border-b border-gray-100' : ''
                } ${isSelected ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{language.flag}</span>
                  <div className="text-left">
                    <div className="text-[15px] font-semibold text-gray-900">
                      {language.code === 'uz' ? t('uzbek') : t('russian')}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {language.code === 'uz' ? t('uzbek_native') : t('russian_native')}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}