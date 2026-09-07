'use client';

import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, BookOpen } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

interface ConceptCardProps {
  type: string;
  onStart: () => void;
}

export default function ConceptCard({ type, onStart }: ConceptCardProps) {
  const { t } = useLanguage();
  const concept = (t.concepts as unknown as Record<string, { formula: string; points: string[] }>)[type];

  if (!concept || typeof concept === 'string') return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 -z-0">
            <BookOpen size={160} className="text-gray-900 dark:text-white" />
        </div>

        <header className="mb-8 text-center relative z-10">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6">
            <Lightbulb size={32} fill="currentColor" />
          </div>
          <h2 className="text-sm font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-2">{t.concepts.title}</h2>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t.operations[type as keyof typeof t.operations]}</h1>
        </header>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 mb-8 text-center border border-gray-100 dark:border-gray-800 relative z-10">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Key Formula</p>
          <code className="text-2xl sm:text-3xl font-mono font-black text-gray-800 dark:text-white">{concept.formula}</code>
        </div>

        <div className="space-y-4 mb-10 relative z-10">
          {concept.points.map((point: string, idx: number) => (
            <div key={idx} className="flex gap-4 items-start text-left">
              <div className="mt-1 text-green-500 dark:text-green-400 shrink-0"><CheckCircle2 size={20} /></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl relative z-10"
        >
          {t.concepts.start}
        </button>
      </motion.div>
    </div>
  );
}
