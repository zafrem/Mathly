'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Zap, ArrowLeft, 
  TrendingUp, Hash, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import Link from 'next/link';

export default function Level3Page() {
  const router = useRouter();
  const { t } = useLanguage();
  const [digits, setDigits] = useState(1);
  const [timeLimit, setTimeLimit] = useState(60);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('mathly-user');
    if (!saved) {
      router.push('/');
    } else {
      /* eslint-disable react-hooks/set-state-in-effect */
      setUserName(saved);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [router]);

  const col1 = [
    { id: 'log_basic', name: t.operations.log_basic, icon: Hash, color: 'bg-emerald-600' },
    { id: 'exp_neural', name: t.operations.exp_neural, icon: Activity, color: 'bg-teal-600' },
  ];

  const col2 = [
    { id: 'quadratic_vertex', name: t.operations.quadratic_vertex, icon: TrendingUp, color: 'bg-indigo-600' },
  ];

  const renderCategory = (cat: { id: string; name: string; icon: React.ElementType; color: string }) => (
    <motion.div key={cat.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link href={`/practice/${cat.id}?level=3&digits=${digits}&time=${timeLimit}&user=${encodeURIComponent(userName)}`} className="group flex items-center justify-between p-4 rounded-2xl transition-all border-2 mb-3 bg-gray-50 hover:bg-white hover:shadow-xl hover:border-blue-200 border-gray-100">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110", cat.color)}>
            <cat.icon size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
        </div>
        <Zap size={18} className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white pb-10 sm:pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 relative">
        <header className="mb-10 sm:mb-16">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-blue-500 font-bold transition-colors mb-6 sm:mb-8 group text-sm sm:text-base">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform sm:w-5 sm:h-5" />
            {t.selection.back}
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div>
              <span className="text-emerald-500 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm">Level 3</span>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mt-1 sm:mt-2">{t.levels.l3.title.split(': ')[1]} <span className="text-gray-300">{t.selection.training}</span></h1>
              <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-lg font-medium max-w-2xl">{t.levels.l3.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex-1 sm:flex-none">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.selection.complexity}</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((d) => (
                    <button key={d} onClick={() => setDigits(d)} className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-xs sm:text-sm transition-all", digits === d ? "bg-emerald-500 text-white shadow-md" : "bg-white text-gray-400 hover:bg-gray-100")}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex-1 sm:flex-none">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.selection.timer}</span>
                <div className="flex gap-1">
                  {[30, 60, 120, 0].map((tVal) => (
                    <button key={tVal} onClick={() => setTimeLimit(tVal)} className={cn("px-2.5 sm:px-3 h-9 sm:h-10 rounded-lg font-bold text-xs sm:text-sm transition-all", timeLimit === tVal ? "bg-emerald-500 text-white shadow-md" : "bg-white text-gray-400 hover:bg-gray-100")}>{tVal === 0 ? '∞' : `${tVal}s`}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 px-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" /> {t.selection.catFunctions}
            </h2>
            {col1.map(renderCategory)}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 px-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500" /> {t.selection.catOptimization}
            </h2>
            {col2.map(renderCategory)}
          </div>
        </div>
      </div>
    </div>
  );
}
