'use client';

import { useTheme } from '@/lib/theme-context';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg text-gray-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={20} className="sm:w-6 sm:h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: 45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={20} className="sm:w-6 sm:h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
