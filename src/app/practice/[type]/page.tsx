'use client';

import { useState, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Zap, Target, Timer, RotateCcw } from 'lucide-react';
import ProblemCard from '@/components/practice/problem-card';
import { OperationType } from '@/lib/math-engine';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import confetti from 'canvas-confetti';

export default function PracticePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const digits = parseInt(searchParams.get('digits') || '2');
  const initialTime = parseInt(searchParams.get('time') || '60');
  
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
        if (countdown === 1) mathlyAudio?.playSuccess(); // Final beep
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (initialTime === 0 || countdown > 0) return;
    
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished, initialTime, countdown]);

  const handleSuccess = () => {
    if (isFinished) return;
    setStreak(s => s + 1);
    setSolved(s => s + 1);
    if ((solved + 1) % 10 === 0) {
      setShowCelebration(true);
      mathlyAudio?.playMilestone();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const handleFailure = () => {
    if (isFinished) return;
    setStreak(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-12 shadow-2xl text-center border border-gray-100"
        >
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy className="text-yellow-500" size={48} />
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Time's Up!</h1>
          <p className="text-gray-500 mb-12">Amazing sprint! Here's how you did:</p>
          
          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <span className="block text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Solved</span>
              <span className="text-3xl font-black text-gray-800">{solved}</span>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <span className="block text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Max Streak</span>
              <span className="text-3xl font-black text-gray-800">{streak}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <button
            onClick={() => router.push('/')}
            className="p-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex gap-4">
            {initialTime > 0 && countdown === 0 && (
              <div className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100",
                timeLeft < 10 ? "text-red-500 animate-pulse border-red-100" : "text-gray-700"
              )}>
                <Timer size={20} />
                <span className="font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
            {countdown === 0 && (
              <>
                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100">
                  <Zap className="text-yellow-500" size={20} />
                  <span className="font-bold text-gray-700">{streak} Streak</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100">
                  <Target className="text-blue-500" size={20} />
                  <span className="font-bold text-gray-700">{solved} Solved</span>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {countdown > 0 ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-50 py-20"
              >
                <motion.div
                  key={countdown}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[12rem] font-black text-blue-500 drop-shadow-2xl"
                >
                  {countdown}
                </motion.div>
                <p className="text-2xl font-bold text-gray-400 uppercase tracking-[0.5em]">Get Ready</p>
              </motion.div>
            ) : (
              <motion.div
                key="practice-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative">
                  <AnimatePresence>
                    {showCelebration && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: 1, scale: 1.2, y: -100 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 flex justify-center pointer-events-none z-10"
                      >
                        <div className="bg-white px-8 py-4 rounded-full shadow-2xl border-2 border-yellow-400 flex items-center gap-3">
                          <Trophy className="text-yellow-500" />
                          <span className="font-black text-2xl text-gray-800">10 IN A ROW!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-center mb-12">
                  <h1 className="text-3xl font-black text-gray-800 capitalize mb-2">
                    {type} Practice
                  </h1>
                  <p className="text-gray-500">
                    {digits} Digit Problems • {initialTime === 0 ? 'Unlimited Time' : `${initialTime}s Sprint`}
                  </p>
                </div>

                <ProblemCard
                  type={type as OperationType}
                  digits={digits}
                  onSuccess={handleSuccess}
                  onFailure={handleFailure}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
