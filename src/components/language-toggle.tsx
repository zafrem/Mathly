'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100]">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-0.5 sm:gap-1">
        <div className="p-1.5 sm:p-2 text-gray-400">
          <Languages size={14} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
            language === 'en' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ko')}
          className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
            language === 'ko' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          KO
        </button>
      </div>
    </div>
  );
}
