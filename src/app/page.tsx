'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Minus, X, Divide, Zap, Brain, Rocket, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'addition', name: 'Addition', icon: Plus, color: 'bg-blue-500' },
  { id: 'subtraction', name: 'Subtraction', icon: Minus, color: 'bg-red-500' },
  { id: 'multiplication', name: 'Multiplication', icon: X, color: 'bg-green-500' },
  { id: 'division', name: 'Division', icon: Divide, color: 'bg-purple-500' },
];

export default function LandingPage() {
  const [digits, setDigits] = useState(2);
  const [timeLimit, setTimeLimit] = useState(60);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Decorations ... same as before ... */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 text-blue-50/50"
        >
          <Brain size={300} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 right-12 text-yellow-50/50"
        >
          <Zap size={150} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 left-1/4 text-purple-50/50"
        >
          <Sparkles size={200} />
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 relative">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-bold mb-6"
          >
            <Rocket size={20} />
            <span>FAST & LIVELY</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Math<span className="text-blue-500">ly</span>
          </motion.h1>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12 mb-16">
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
              <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Difficulty</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDigits(d)}
                    className={cn(
                      "w-12 h-12 rounded-xl font-bold transition-all",
                      digits === d 
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-200 scale-110" 
                        : "bg-white text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 font-medium">{digits} Digit Problems</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
              <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Time Limit</span>
              <div className="flex gap-2">
                {[30, 60, 120, 0].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeLimit(t)}
                    className={cn(
                      "px-4 h-12 rounded-xl font-bold transition-all",
                      timeLimit === t 
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-200 scale-110" 
                        : "bg-white text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    {t === 0 ? '∞' : `${t}s`}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 font-medium">{timeLimit === 0 ? 'No time limit' : `${timeLimit} second sprint`}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Link
                href={`/practice/${cat.id}?digits=${digits}&time=${timeLimit}`}
                className="group relative block p-8 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gray-100"
              >
                <div className={`${cat.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <cat.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{cat.name}</h3>
                <p className="text-gray-500">Practice speed and accuracy in {cat.name.toLowerCase()}.</p>
                <div className="mt-6 flex items-center gap-2 text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Now <Rocket size={16} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <footer className="mt-32 text-center text-gray-400">
          <p>© 2024 Mathly - Computational Repetition Done Right.</p>
        </footer>
      </div>
    </div>
  );
}
