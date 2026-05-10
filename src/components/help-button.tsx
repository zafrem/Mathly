'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Ghost, Bot } from 'lucide-react';

export default function HelpButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 sm:p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-lg text-gray-400 hover:text-blue-500 transition-colors"
      >
        <HelpCircle size={18} className="sm:w-5 sm:h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="text-blue-500" />
                {t.help.title}
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Ghost size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t.help.ghostTitle}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t.help.ghostDesc}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                    <Bot size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t.help.botTitle}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t.help.botDesc}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
              >
                {t.help.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
