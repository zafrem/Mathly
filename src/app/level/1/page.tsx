'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Minus, X, Divide, Zap, Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import Link from 'next/link';

export default function Level1Page() {
  const router = useRouter();
  const { t } = useLanguage();
  const [digits, setDigits] = useState(2);
  const [timeLimit, setTimeLimit] = useState(60);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mathly-user');
      if (!saved) {
        router.push('/');
      } else {
        setUserName(saved);
      }
    }
  }, [router]);

  const col1 = [
    { id: 'addition', name: 'Addition', icon: Plus, color: 'bg-blue-500' },
    { id: 'subtraction', name: 'Subtraction', icon: Minus, color: 'bg-red-500' },
    { id: 'multiplication', name: 'Multiplication', icon: X, color: 'bg-green-500' },
    { id: 'division', name: 'Division', icon: Divide, color: 'bg-purple-500' },
  ];

  const col2 = [
    { id: 'gcd', name: 'GCD', icon: Brain, color: 'bg-indigo-500' },
    { id: 'lcm', name: 'LCM', icon: Sparkles, color: 'bg-orange-500' },
  ];

  const col3 = [
    { id: 'fraction_addition', name: 'Frac +', icon: Plus, color: 'bg-teal-500' },
    { id: 'fraction_subtraction', name: 'Frac -', icon: Minus, color: 'bg-cyan-500' },
    { id: 'fraction_multiplication', name: 'Frac ×', icon: X, color: 'bg-rose-500' },
    { id: 'fraction_division', name: 'Frac ÷', icon: Divide, color: 'bg-emerald-500' },
  ];

  const renderCategory = (cat: any) => (
    <motion.div key={cat.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link href={`/practice/${cat.id}?level=1&digits=${digits}&time=${timeLimit}&user=${encodeURIComponent(userName)}`} className="group flex items-center justify-between p-4 rounded-2xl transition-all border-2 mb-3 bg-gray-50 hover:bg-white hover:shadow-xl hover:border-blue-200 border-gray-100">
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
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-12 relative">
        <header className="mb-16">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-blue-500 font-bold transition-colors mb-8 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {t.selection.back}
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-sm">Level 1</span>
              <h1 className="text-5xl font-black text-gray-900 mt-2">{t.levels.l1.title.split(': ')[1]} <span className="text-gray-300">{t.selection.training}</span></h1>
              <p className="text-gray-500 mt-4 text-lg font-medium">{t.levels.l1.description}</p>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.selection.digits}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((d) => (
                    <button key={d} onClick={() => setDigits(d)} className={cn("w-10 h-10 rounded-lg font-bold text-sm transition-all", digits === d ? "bg-blue-500 text-white shadow-md" : "bg-white text-gray-400 hover:bg-gray-100")}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.selection.timer}</span>
                <div className="flex gap-1">
                  {[30, 60, 120, 0].map((tVal) => (
                    <button key={tVal} onClick={() => setTimeLimit(tVal)} className={cn("px-3 h-10 rounded-lg font-bold text-sm transition-all", timeLimit === tVal ? "bg-purple-500 text-white shadow-md" : "bg-white text-gray-400 hover:bg-gray-100")}>{tVal === 0 ? '∞' : `${tVal}s`}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Arithmetic
            </h2>
            {col1.map(renderCategory)}
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" /> Logic & Number
            </h2>
            {col2.map(renderCategory)}
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-teal-500" /> Fractions
            </h2>
            {col3.map(renderCategory)}
          </div>
        </div>
      </div>
    </div>
  );
}
