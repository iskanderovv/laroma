'use client';

import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface ProfileSubPageLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

export default function ProfileSubPageLayout({
  title,
  onBack,
  children,
}: ProfileSubPageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-ios-bg font-sans">
      <div className="ios-blur fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 h-14 flex items-center border-b border-black/[0.03]">
        <button
          onClick={onBack}
          className="relative z-10 flex items-center text-black active:opacity-40 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2px]" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-[17px] font-bold text-black tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="px-4 pt-20 pb-6">{children}</div>
    </div>
  );
}
