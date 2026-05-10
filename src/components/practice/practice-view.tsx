'use client';

import { useState, use, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Zap, Timer, RotateCcw, Flame, Ghost, Bot } from 'lucide-react';
import ProblemCard from '@/components/practice/problem-card';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';
import { OperationType } from '@/lib/math-engine';
import confetti from 'canvas-confetti';

interface ScoreEntry {
  name: string;
  score: number;
  type: string;
  digits: number;
  date: string;
}

export default function PracticeView({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const digits = parseInt(searchParams.get('digits') || '2');
  const initialTime = parseInt(searchParams.get('time') || '60');
  const userName = searchParams.get('user') || 'Anonymous';
  const level = searchParams.get('level') || '';
  
  const backPath = level ? `/level/${level}` : '/';
  
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isImpacting, setIsImpacting] = useState(false);

  // Ghost Mode: Personal Best
  const personalBest = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const scoresData = localStorage.getItem('mathly-scores');
    const scores: ScoreEntry[] = scoresData ? JSON.parse(scoresData) : [];
    const relevant = scores.filter(s => s.type === type && s.digits === digits);
    return relevant.length > 0 ? Math.max(...relevant.map(s => s.score)) : 0;
  }, [type, digits]);

  // Bot Logic: Rival score increases over time
  useEffect(() => {
    if (countdown > 0 || isFinished || initialTime === 0) return;
    const botTimer = setInterval(() => {
      setBotScore(prev => prev + (250 * digits));
    }, 3000);
    return () => clearInterval(botTimer);
  }, [countdown, isFinished, digits, initialTime]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
        if (countdown === 1) mathlyAudio?.playSuccess();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (initialTime === 0 || countdown > 0 || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initialTime, countdown, isFinished]);

  useEffect(() => {
    if (isFinished && score > 0) {
      const savedScores = JSON.parse(localStorage.getItem('mathly-scores') || '[]');
      const newEntry = { name: userName, score, type, digits, date: new Date().toISOString() };
      localStorage.setItem('mathly-scores', JSON.stringify([...savedScores, newEntry]));
    }
  }, [isFinished, score, userName, type, digits]);

  const handleSuccess = (timeMs: number) => {
    if (isFinished) return;
    
    // Firecracker effect
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      scalar: 0.7,
      ticks: 50
    });

    setIsImpacting(true);
    setTimeout(() => setIsImpacting(false), 100);
    mathlyAudio?.playScale(streak);
    const isFast = timeMs < 1500;
    const newCombo = isFast ? combo + 1 : 0;
    setCombo(newCombo);
    const multiplier = 1 + (newCombo * 0.5);
    const basePoints = Math.max(1, Math.floor((10000 / Math.max(timeMs, 100)) * digits));
    const finalPoints = Math.floor(basePoints * multiplier);
    setScore(s => s + finalPoints);
    setStreak(s => s + 1);
    setSolved(s => s + 1);
    if ((solved + 1) % 10 === 0) {
      mathlyAudio?.playMilestone();
      confetti({
        particleCount: 150, spread: 70, origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });
    }
  };

  const handleFailure = () => {
    if (isFinished) return;
    setStreak(0);
    setCombo(0);
    mathlyAudio?.playError();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryColor = useMemo(() => {
    if (type.includes('addition')) return 'rgba(59, 130, 246, 0.1)';
    if (type.includes('subtraction')) return 'rgba(239, 68, 68, 0.1)';
    if (type.includes('multiplication')) return 'rgba(244, 63, 94, 0.1)';
    return 'rgba(16, 185, 129, 0.1)';
  }, [type]);

  if (isFinished) {
    const beatBot = score > botScore;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl text-center border border-gray-100">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8"><Trophy className="text-yellow-500" size={32} className="sm:w-12 sm:h-12" /></div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 mb-1 sm:mb-2">{t.practice.sprintOver}</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{userName}, {t.practice.youScored}</p>
          <div className="text-4xl sm:text-6xl font-black text-blue-500 mb-3 sm:mb-4 tabular-nums">{score.toLocaleString()}</div>
          
          <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8">
            {score > personalBest && personalBest > 0 && <div className="text-orange-500 font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base"><Trophy size={14} className="sm:w-4 sm:h-4"/> {t.practice.newPersonalBest}</div>}
            {initialTime > 0 && (
              <div className={cn("font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base", beatBot ? "text-green-500" : "text-red-400")}>
                {beatBot ? <Zap size={14} className="sm:w-4 sm:h-4"/> : <Bot size={14} className="sm:w-4 sm:h-4"/>}
                {beatBot ? t.practice.beatBot : t.practice.lostToBot}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl"><span className="block text-gray-400 text-[10px] sm:text-sm font-bold uppercase mb-0.5 sm:mb-1">{t.practice.solved}</span><span className="text-xl sm:text-3xl font-black text-gray-800">{solved}</span></div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl"><span className="block text-gray-400 text-[10px] sm:text-sm font-bold uppercase mb-0.5 sm:mb-1">{t.practice.maxStreak}</span><span className="text-xl sm:text-3xl font-black text-gray-800">{streak}</span></div>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <button onClick={() => window.location.reload()} className="w-full py-3 sm:py-4 bg-blue-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-600 flex items-center justify-center gap-2"><RotateCcw size={18} className="sm:w-5 sm:h-5" /> {t.practice.tryAgain}</button>
            <button onClick={() => router.push(backPath)} className="w-full py-3 sm:py-4 bg-gray-100 text-gray-600 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-200">{t.practice.backToSelection}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      animate={{ 
        backgroundColor: combo > 2 ? categoryColor : '#f9fafb',
        scale: isImpacting ? [1, 1.01, 1] : 1
      }}
      transition={{ duration: 0.1 }}
      className="min-h-screen py-6 sm:py-12 px-2 sm:px-4 relative overflow-hidden"
    >
      {/* Competitive Race Track */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white/50 backdrop-blur-sm border-b border-gray-100 py-1 sm:py-2">
        <div className="max-w-4xl mx-auto px-4 space-y-1.5 sm:space-y-3">
          {/* Ghost PB Bar */}
          {personalBest > 0 && (
            <div className="relative h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" 
                animate={{ width: `${Math.min((score / personalBest) * 100, 100)}%` }} 
              />
              <div className="absolute inset-y-0 left-0 w-full flex items-center px-2 pointer-events-none">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Ghost size={10} className="text-blue-600 sm:w-3.5 sm:h-3.5" fill="currentColor" />
                  <span className="text-[8px] sm:text-[10px] font-black text-blue-700 uppercase tracking-tighter sm:tracking-widest">{t.practice.ghostPace}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Rival Bot Bar */}
          {initialTime > 0 && (
            <div className="relative h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-red-400 rounded-full shadow-[0_0_12px_rgba(248,113,113,0.5)]" 
                animate={{ width: `${Math.min((botScore / Math.max(score, personalBest, botScore, 1000)) * 100, 100)}%` }} 
              />
              <div className="absolute inset-y-0 left-0 w-full flex items-center px-2 pointer-events-none">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Bot size={10} className="text-red-700 sm:w-3.5 sm:h-3.5" fill="currentColor" />
                  <span className="text-[8px] sm:text-[10px] font-black text-red-800 uppercase tracking-tighter sm:tracking-widest">{t.practice.rivalBot}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative mt-10 sm:mt-12">
        <header className="flex items-center justify-between mb-8 sm:mb-12">
          <button onClick={() => router.push(backPath)} className="p-2 sm:p-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50"><ArrowLeft size={20} className="sm:w-6 sm:h-6" /></button>
          <div className="flex gap-2 sm:gap-4">
            {initialTime > 0 && countdown === 0 && (
              <div className={cn("flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white shadow-sm border border-gray-100", timeLeft < 10 ? "text-red-500 animate-pulse border-red-100" : "text-gray-700")}>
                <Timer size={16} className="sm:w-5 sm:h-5" /><span className="font-bold text-sm sm:text-base">{formatTime(timeLeft)}</span>
              </div>
            )}
            {countdown === 0 && (
              <>
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white shadow-sm border border-gray-100 relative overflow-hidden">
                  {combo > 1 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-orange-500 font-black text-xs sm:text-base"><Flame size={14} className="sm:w-4.5 sm:h-4.5" fill="currentColor" /> x{1 + (combo * 0.5)}</motion.div>}
                  <span className="font-black text-blue-500 tabular-nums text-sm sm:text-base">{score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white shadow-sm border border-gray-100">
                  <Zap className="text-yellow-500" size={16} className="sm:w-5 sm:h-5" /><span className="font-bold text-gray-700 text-sm sm:text-base">{streak}</span>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {countdown > 0 ? (
              <motion.div key="countdown" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 2 }} className="absolute inset-0 flex flex-col items-center justify-center z-50 py-10 sm:py-20">
                <motion.div key={countdown} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[8rem] sm:text-[12rem] font-black text-blue-500 drop-shadow-2xl leading-none">{countdown}</motion.div>
                <p className="text-lg sm:text-2xl font-bold text-gray-400 uppercase tracking-[0.3em] sm:tracking-[0.5em] mt-4">{t.practice.getReady}</p>
              </motion.div>
            ) : (
              <motion.div key="practice-content">
                <div className="text-center mb-8 sm:mb-12 px-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-800 capitalize mb-1 sm:mb-2 leading-tight">
                    {t.practiceInstructions[type as keyof typeof t.practiceInstructions] || type.replace('_', ' ')}
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base">{userName} &bull; {digits} {t.selection.digits}</p>
                </div>
                <ProblemCard key={`${type}-${digits}`} type={type as OperationType} digits={digits} onSuccess={handleSuccess} onFailure={handleFailure} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
