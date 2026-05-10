'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Brain, Rocket, Sparkles, User, Trophy, Lock, 
  Calculator, Binary, Network, BarChart3, Grid3X3, FunctionSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

export default function LauncherPage() {
  const { t } = useLanguage();
  const [userName, setUserName] = useState('');
  const [scores, setScores] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const levels = [
    { 
      id: 1, 
      title: t.levels.l1.title, 
      subtitle: t.levels.l1.subtitle,
      description: t.levels.l1.description,
      icon: Calculator, 
      color: 'bg-blue-500',
      type: t.levels.l1.type,
      status: 'active'
    },
    { 
      id: 2, 
      title: t.levels.l2.title, 
      subtitle: t.levels.l2.subtitle,
      description: t.levels.l2.description,
      icon: Binary, 
      color: 'bg-indigo-500',
      type: t.levels.l2.type,
      status: 'active'
    },
    { 
      id: 3, 
      title: t.levels.l3.title, 
      subtitle: t.levels.l3.subtitle,
      description: t.levels.l3.description,
      icon: Network, 
      color: 'bg-emerald-500',
      type: t.levels.l3.type,
      status: 'locked'
    },
    { 
      id: 4, 
      title: t.levels.l4.title, 
      subtitle: t.levels.l4.subtitle,
      description: t.levels.l4.description,
      icon: BarChart3, 
      color: 'bg-orange-500',
      type: t.levels.l4.type,
      status: 'locked'
    },
    { 
      id: 5, 
      title: t.levels.l5.title, 
      subtitle: t.levels.l5.subtitle,
      description: t.levels.l5.description,
      icon: Grid3X3, 
      color: 'bg-rose-500',
      type: t.levels.l5.type,
      status: 'locked'
    },
    { 
      id: 6, 
      title: t.levels.l6.title, 
      subtitle: t.levels.l6.subtitle,
      description: t.levels.l6.description,
      icon: FunctionSquare, 
      color: 'bg-purple-500',
      type: t.levels.l6.type,
      status: 'locked'
    },
  ];

  useEffect(() => {
    setIsMounted(true);
    const savedName = localStorage.getItem('mathly-user') || '';
    setUserName(savedName);
    
    const savedScores = JSON.parse(localStorage.getItem('mathly-scores') || '[]');
    setScores(savedScores.sort((a: any, b: any) => b.score - a.score).slice(0, 5));
  }, []);

  const handleNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('mathly-user', name);
  };

  const isActive = userName.trim().length > 0;

  return (
    <div className="min-h-screen bg-white overflow-hidden pb-20 font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-24 -left-24 text-blue-50/30"><Brain size={400} /></motion.div>
        <motion.div animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 right-12 text-blue-50/50"><Rocket size={250} /></motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 relative">
        <header className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4">
            {t.launcher.tag}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-8xl font-black text-gray-900 mb-6 tracking-tight">
            Math<span className="text-blue-500">ly</span>
          </motion.h1>
          
          <div className="max-w-md mx-auto mb-4 relative group">
            <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isActive ? "text-blue-500" : "text-gray-400")} size={24} />
            <input 
              type="text" 
              placeholder={t.launcher.placeholder} 
              value={userName} 
              onChange={(e) => handleNameChange(e.target.value)} 
              className={cn("w-full pl-14 pr-6 py-4 rounded-2xl border-2 outline-none text-xl font-bold text-black transition-all shadow-inner", isActive ? "border-blue-400 bg-white shadow-lg" : "border-gray-100 bg-gray-50 focus:border-blue-200")} 
            />
          </div>
          <AnimatePresence>
            {isMounted && !isActive && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-blue-500 font-bold text-sm mb-12 animate-pulse">
                {t.launcher.unlockHint}
              </motion.p>
            )}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {levels.map((level, idx) => {
            const isLocked = level.status === 'locked' || !isActive;
            const Icon = level.icon;

            return (
              <motion.div key={level.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={!isLocked ? { y: -10 } : {}}>
                <Link href={!isLocked ? `/level/${level.id}` : '#'} className={cn("block h-full p-8 rounded-[2rem] border-2 transition-all relative overflow-hidden group", isLocked ? "bg-gray-50 border-transparent cursor-not-allowed opacity-75" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-2xl")}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-transform duration-500", isLocked ? "bg-gray-300" : level.color + " group-hover:rotate-12")}>
                      <Icon size={32} />
                    </div>
                    {!isLocked && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                        {level.type}
                      </div>
                    )}
                    {isLocked && <Lock className="text-gray-300" size={24} />}
                  </div>
                  <h3 className={cn("text-2xl font-black mb-2 transition-colors", isLocked ? "text-gray-400" : "text-gray-900 group-hover:text-blue-500")}>{level.title}</h3>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{level.subtitle}</p>
                  <p className={cn("text-sm leading-relaxed", isLocked ? "text-gray-300" : "text-gray-500")}>{level.description}</p>
                  {!isLocked && (
                    <div className="mt-8 flex items-center gap-2 text-blue-500 font-bold group-hover:translate-x-2 transition-transform">
                      <span>{t.launcher.startTraining}</span>
                      <Rocket size={18} />
                    </div>
                  )}
                  {!isLocked && (
                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <Icon size={150} />
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={160} /></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-10 flex items-center gap-4">
              <Trophy className="text-yellow-400" size={40} /> 
              {t.launcher.topTrainees}
            </h2>
            <div className="space-y-4">
              {scores.length > 0 ? scores.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-lg", i === 0 ? "bg-yellow-400 text-black" : "bg-white/10")}>{i + 1}</span>
                    <div>
                      <span className="font-bold text-xl block">{s.name}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-gray-400">
                        {s.type.replace('_', ' ')} &bull; {s.digits}d
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-400 block">{Math.floor(s.score).toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{t.launcher.points}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">{t.launcher.noRankings}</p>
                  <Rocket className="mx-auto text-gray-800 animate-bounce" size={48} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <footer className="mt-40 text-center">
          <p className="text-gray-400 font-medium">© 2026 Mathly - {t.launcher.footer}</p>
          <div className="flex justify-center gap-6 mt-6 opacity-30">
            <Zap size={20} /> <Brain size={20} /> <Rocket size={20} /> <Sparkles size={20} />
          </div>
        </footer>
      </div>
    </div>
  );
}
