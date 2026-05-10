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

interface ScoreEntry {
  name: string;
  score: number;
  type: string;
  digits: number;
  date: string;
}

export default function LauncherPage() {
  const { t } = useLanguage();
  const [userName, setUserName] = useState('');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
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
    const savedName = localStorage.getItem('mathly-user') || '';
    const savedScoresData = localStorage.getItem('mathly-scores');
    const savedScores: ScoreEntry[] = savedScoresData ? JSON.parse(savedScoresData) : [];
    
    /* eslint-disable react-hooks/set-state-in-effect */
    setUserName(savedName);
    setScores(savedScores.sort((a, b) => b.score - a.score).slice(0, 5));
    setIsMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('mathly-user', name);
  };

  const isActive = userName.trim().length > 0;

  return (
    <div className="min-h-screen bg-white overflow-hidden pb-10 sm:pb-20 font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-24 -left-24 text-blue-50/30"><Brain className="sm:w-[400px] sm:h-[400px] w-[300px] h-[300px]" /></motion.div>
        <motion.div animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 right-12 text-blue-50/50"><Rocket className="sm:w-[250px] sm:h-[250px] w-[150px] h-[150px]" /></motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-20 relative">
        <header className="text-center mb-10 sm:mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm mb-4">
            {t.launcher.tag}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl sm:text-8xl font-black text-gray-900 mb-6 tracking-tight">
            Math<span className="text-blue-500">ly</span>
          </motion.h1>
          
          <div className="max-w-md mx-auto mb-4 relative group px-2 sm:px-0">
            <User className={cn("absolute left-6 sm:left-4 top-1/2 -translate-y-1/2 transition-colors sm:w-6 sm:h-6 w-5 h-5", isActive ? "text-blue-500" : "text-gray-400")} />
            <input 
              type="text" 
              placeholder={t.launcher.placeholder} 
              value={userName} 
              onChange={(e) => handleNameChange(e.target.value)} 
              className={cn("w-full pl-12 sm:pl-14 pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 outline-none text-lg sm:text-xl font-bold text-black transition-all shadow-inner", isActive ? "border-blue-400 bg-white shadow-lg" : "border-gray-100 bg-gray-50 focus:border-blue-200")} 
            />
          </div>
          <AnimatePresence>
            {isMounted && !isActive && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-blue-500 font-bold text-xs sm:text-sm mb-8 sm:mb-12 animate-pulse">
                {t.launcher.unlockHint}
              </motion.p>
            )}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-16 sm:mb-24">
          {levels.map((level, idx) => {
            const isLocked = level.status === 'locked' || !isActive;
            const Icon = level.icon;

            return (
              <motion.div key={level.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={!isLocked ? { y: -5 } : {}}>
                <Link href={!isLocked ? `/level/${level.id}` : '#'} className={cn("block h-full p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 transition-all relative overflow-hidden group", isLocked ? "bg-gray-50 border-transparent cursor-not-allowed opacity-75" : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl")}>
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white transition-transform duration-500", isLocked ? "bg-gray-300" : level.color + " group-hover:rotate-12")}>
                      <Icon className="sm:w-8 sm:h-8 w-6 h-6" />
                    </div>
                    {!isLocked && (
                      <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-black text-[8px] sm:text-[10px] uppercase tracking-wider">
                        {level.type}
                      </div>
                    )}
                    {isLocked && <Lock className="sm:w-5 sm:h-5 w-4 h-4 text-gray-300" />}
                  </div>
                  <h3 className={cn("text-xl sm:text-2xl font-black mb-1 sm:mb-2 transition-colors", isLocked ? "text-gray-400" : "text-gray-900 group-hover:text-blue-500")}>{level.title}</h3>
                  <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4">{level.subtitle}</p>
                  <p className={cn("text-xs sm:text-sm leading-relaxed", isLocked ? "text-gray-300" : "text-gray-500")}>{level.description}</p>
                  {!isLocked && (
                    <div className="mt-6 sm:mt-8 flex items-center gap-2 text-blue-500 font-bold text-sm sm:text-base group-hover:translate-x-2 transition-transform">
                      <span>{t.launcher.startTraining}</span>
                      <Rocket className="sm:w-4 sm:h-4 w-3.5 h-3.5" />
                    </div>
                  )}
                  {!isLocked && (
                    <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <Icon className="sm:w-[150px] sm:h-[150px] w-[120px] h-[120px]" />
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto bg-gray-900 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10"><Trophy className="sm:w-[160px] sm:h-[160px] w-[100px] h-[100px]" /></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4">
              <Trophy className="text-yellow-400 sm:w-10 sm:h-10 w-6 h-6" /> 
              {t.launcher.topTrainees}
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {scores.length > 0 ? scores.map((s: ScoreEntry, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-lg", i === 0 ? "bg-yellow-400 text-black" : "bg-white/10")}>{i + 1}</span>
                    <div>
                      <span className="font-bold text-base sm:text-xl block">{s.name}</span>
                      <span className="text-[8px] sm:text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-gray-400">
                        {t.operations[s.type as keyof typeof t.operations] || s.type.replace('_', ' ')} &bull; {s.digits}d
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-3xl font-black text-blue-400 block">{Math.floor(s.score).toLocaleString()}</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">{t.launcher.points}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 sm:py-10">
                  <p className="text-gray-500 font-bold uppercase tracking-[0.2em] mb-4 text-xs sm:text-sm">{t.launcher.noRankings}</p>
                  <Rocket className="mx-auto text-gray-800 animate-bounce sm:w-12 sm:h-12 w-8 h-8" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <footer className="mt-20 sm:mt-40 text-center">
          <p className="text-gray-400 font-medium text-xs sm:text-base">© 2026 Mathly - {t.launcher.footer}</p>
          <div className="flex justify-center gap-4 sm:gap-6 mt-6 opacity-30">
            <Zap className="sm:w-5 sm:h-5 w-4 h-4" /> <Brain className="sm:w-5 sm:h-5 w-4 h-4" /> <Rocket className="sm:w-5 sm:h-5 w-4 h-4" /> <Sparkles className="sm:w-5 sm:h-5 w-4 h-4" />
          </div>
        </footer>
      </div>
    </div>
  );
}
