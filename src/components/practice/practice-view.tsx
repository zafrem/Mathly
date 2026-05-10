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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-3xl p-12 shadow-2xl text-center border border-gray-100">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8"><Trophy className="text-yellow-500" size={48} /></div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">{t.practice.sprintOver}</h1>
          <p className="text-gray-500 mb-8">{userName}, {t.practice.youScored}</p>
          <div className="text-6xl font-black text-blue-500 mb-4 tabular-nums">{score.toLocaleString()}</div>
          
          <div className="flex flex-col gap-3 mb-8">
            {score > personalBest && personalBest > 0 && <div className="text-orange-500 font-bold flex items-center justify-center gap-2"><Trophy size={16}/> {t.practice.newPersonalBest}</div>}
            {initialTime > 0 && (
              <div className={cn("font-bold flex items-center justify-center gap-2", beatBot ? "text-green-500" : "text-red-400")}>
                {beatBot ? <Zap size={16}/> : <Bot size={16}/>}
                {beatBot ? t.practice.beatBot : t.practice.lostToBot}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-gray-50 p-6 rounded-2xl"><span className="block text-gray-400 text-sm font-bold uppercase mb-1">{t.practice.solved}</span><span className="text-3xl font-black text-gray-800">{solved}</span></div>
            <div className="bg-gray-50 p-6 rounded-2xl"><span className="block text-gray-400 text-sm font-bold uppercase mb-1">{t.practice.maxStreak}</span><span className="text-3xl font-black text-gray-800">{streak}</span></div>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 flex items-center justify-center gap-2"><RotateCcw size={20} /> {t.practice.tryAgain}</button>
            <button onClick={() => router.push(backPath)} className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-200">{t.practice.backToSelection}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div animate={{ backgroundColor: combo > 2 ? categoryColor : '#f9fafb', x: isImpacting ? [0, -10, 10, -5, 5, 0] : 0 }} transition={{ duration: 0.1 }} className="min-h-screen py-12 px-4 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full z-50 flex flex-col">
        {personalBest > 0 && countdown === 0 && (
          <div className="h-1 bg-gray-200 w-full overflow-hidden">
            <motion.div className="h-full bg-blue-400" animate={{ width: `${Math.min((score / personalBest) * 100, 100)}%` }} />
          </div>
        )}
        {initialTime > 0 && countdown === 0 && (
          <div className="h-1 bg-gray-100 w-full overflow-hidden">
            <motion.div className="h-full bg-red-300" animate={{ width: `${Math.min((botScore / Math.max(score, personalBest, botScore, 1000)) * 100, 100)}%` }} />
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto relative">
        <header className="flex items-center justify-between mb-12">
          <button onClick={() => router.push(backPath)} className="p-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50"><ArrowLeft size={24} /></button>
          <div className="flex gap-4">
            {initialTime > 0 && countdown === 0 && (
              <div className={cn("flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100", timeLeft < 10 ? "text-red-500 animate-pulse border-red-100" : "text-gray-700")}>
                <Timer size={20} /><span className="font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
            {countdown === 0 && (
              <>
                <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100 relative overflow-hidden">
                  {combo > 1 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-orange-500 font-black"><Flame size={18} fill="currentColor" /> x{1 + (combo * 0.5)}</motion.div>}
                  <span className="font-black text-blue-500 tabular-nums">{score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100">
                  <Zap className="text-yellow-500" size={20} /><span className="font-bold text-gray-700">{streak}</span>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {countdown > 0 ? (
              <motion.div key="countdown" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 2 }} className="absolute inset-0 flex flex-col items-center justify-center z-50 py-20">
                <motion.div key={countdown} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[12rem] font-black text-blue-500 drop-shadow-2xl">{countdown}</motion.div>
                <p className="text-2xl font-bold text-gray-400 uppercase tracking-[0.5em]">{t.practice.getReady}</p>
              </motion.div>
            ) : (
              <motion.div key="practice-content">
                <div className="flex justify-between items-center mb-12 px-4">
                  <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest"><Ghost size={14}/> {t.practice.ghostPace}</div>
                  <div className="flex items-center gap-2 text-red-300 font-bold uppercase text-xs tracking-widest"><Bot size={14}/> {t.practice.rivalBot}</div>
                </div>
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-black text-gray-800 capitalize mb-2">{type.replace('_', ' ')}</h1>
                  <p className="text-gray-500">{userName} &bull; {digits} Digits</p>
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
