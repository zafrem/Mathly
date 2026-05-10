'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-6 right-6 z-[100]">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-1 rounded-2xl shadow-xl flex items-center gap-1">
        <div className="p-2 text-gray-400">
          <Languages size={18} />
        </div>
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            language === 'en' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ko')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
