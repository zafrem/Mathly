'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Minus, X, Divide, Zap, Brain, Rocket, Sparkles, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'addition', name: 'Addition', icon: Plus, color: 'bg-blue-500' },
  { id: 'subtraction', name: 'Subtraction', icon: Minus, color: 'bg-red-500' },
  { id: 'multiplication', name: 'Multiplication', icon: X, color: 'bg-green-500' },
  { id: 'division', name: 'Division', icon: Divide, color: 'bg-purple-500' },
  { id: 'gcd', name: 'GCD', icon: Brain, color: 'bg-indigo-500' },
  { id: 'lcm', name: 'LCM', icon: Sparkles, color: 'bg-orange-500' },
];

interface ScoreEntry {
  name: string;
  score: number;
  type: string;
  date: string;
}

export default function LandingPage() {
  const [digits, setDigits] = useState(2);
  const [timeLimit, setTimeLimit] = useState(60);
  const [userName, setUserName] = useState('');
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('mathly-user');
    if (savedName) setUserName(savedName);

    const savedScores = JSON.parse(localStorage.getItem('mathly-scores') || '[]');
    setScores(savedScores.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score).slice(0, 5));
  }, []);

  const handleNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('mathly-user', name);
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden pb-20">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-24 -left-24 text-blue-50/50"><Brain size={300} /></motion.div>
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/4 right-12 text-yellow-50/50"><Zap size={150} /></motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 left-1/4 text-purple-50/50"><Sparkles size={200} /></motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 relative">
        <header className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold mb-6">
            <Rocket size={20} />
            <span>RANKING SYSTEM LIVE</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-7xl font-black text-gray-900 mb-6 tracking-tight">
            Math<span className="text-blue-500">ly</span>
          </motion.h1>

          <div className="max-w-md mx-auto mb-12 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <User size={24} />
            </div>
            <input
              type="text"
              placeholder="Enter your name to rank..."
              value={userName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-400 outline-none text-xl font-bold transition-all shadow-inner"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
              <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Difficulty</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((d) => (
                  <button key={d} onClick={() => setDigits(d)} className={cn("w-12 h-12 rounded-xl font-bold transition-all", digits === d ? "bg-blue-500 text-white shadow-lg scale-110" : "bg-white text-gray-400 hover:bg-gray-100")}>{d}</button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
              <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Time Limit</span>
              <div className="flex gap-2">
                {[30, 60, 120, 0].map((t) => (
                  <button key={t} onClick={() => setTimeLimit(t)} className={cn("px-4 h-12 rounded-xl font-bold transition-all", timeLimit === t ? "bg-purple-500 text-white shadow-lg scale-110" : "bg-white text-gray-400 hover:bg-gray-100")}>{t === 0 ? '∞' : `${t}s`}</button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {categories.map((cat, index) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Link
                href={userName ? `/practice/${cat.id}?digits=${digits}&time=${timeLimit}&user=${encodeURIComponent(userName)}` : '#'}
                onClick={() => !userName && alert('Please enter your name first!')}
                className={cn(
                  "group relative block p-8 rounded-3xl transition-all duration-300 border-2",
                  userName ? "bg-gray-50 hover:bg-white hover:shadow-2xl hover:border-gray-100" : "bg-gray-100 opacity-50 cursor-not-allowed"
                )}
              >
                <div className={`${cat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <cat.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm">Practice speed and accuracy.</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Scoreboard */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={120} /></div>
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <Trophy className="text-yellow-400" />
            Hall of Speed
          </h2>
          <div className="space-y-4">
            {scores.length > 0 ? scores.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={cn("w-8 h-8 rounded-full flex items-center justify-center font-black", i === 0 ? "bg-yellow-400 text-black" : "bg-white/10")}>{i + 1}</span>
                  <span className="font-bold text-lg">{s.name}</span>
                  <span className="text-xs uppercase px-2 py-1 rounded bg-white/10 text-gray-400">{s.type}</span>
                </div>
                <span className="text-2xl font-black text-blue-400">{Math.floor(s.score).toLocaleString()}</span>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-10 font-bold uppercase tracking-widest">No rankings yet. Start sprinting!</p>
            )}
          </div>
        </motion.div>

        <footer className="mt-32 text-center text-gray-400">
          <p>2026 zafrem - Computational Repetition Done Right</p>
        </footer>
      </div>
    </div>
  );
}
