'use client';

import { useState, use, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Zap, Timer, RotateCcw, Flame, Ghost, Bot } from 'lucide-react';
import ProblemCard from '@/components/practice/problem-card';
import ConceptCard from '@/components/practice/concept-card';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';
import { OperationType } from '@/lib/math-engine';
import { useTheme } from '@/lib/theme-context';
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
  const { theme } = useTheme();
  
  const digits = parseInt(searchParams.get('digits') || '2');
  const initialTime = parseInt(searchParams.get('time') || '60');
  const userName = searchParams.get('user') || 'Anonymous';
  const level = searchParams.get('level') || '';
  
  const backPath = level ? `/level/${level}` : '/';
  
  const difficultyCoefficients: Record<string, number> = {
    addition: 1,
    subtraction: 1.2,
    multiplication: 2.5,
    division: 2,
    gcd: 4,
    lcm: 4,
    fraction_addition: 5,
    fraction_subtraction: 5,
    fraction_multiplication: 4,
    fraction_division: 4,
    integer_addition: 1.5,
    integer_multiplication: 2,
    equation_simple: 3,
    exponent_basic: 2.5,
    square_root: 2.5,
    quadratic_vertex: 3,
    log_basic: 3,
    exp_neural: 3,
  };

  const coeff = difficultyCoefficients[type as keyof typeof difficultyCoefficients] || 1;

  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isError, setIsError] = useState(false);
  const [showConcept, setShowConcept] = useState(() => {
    const concept = (t.concepts as unknown as Record<string, unknown>)[type];
    return !!concept && typeof concept !== 'string';
  });
  const [bonusAdded, setBonusAdded] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Booster Mode: Triggered at 5 streak
  const isBooster = streak >= 5;

  // Ghost Mode: Personal Best
  const personalBest = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const scoresData = localStorage.getItem('mathly-scores');
    const scores: ScoreEntry[] = scoresData ? JSON.parse(scoresData) : [];
    const relevant = scores.filter(s => s.type === type && s.digits === digits);
    return relevant.length > 0 ? Math.max(...relevant.map(s => s.score)) : 0;
  }, [type, digits]);

  // Bot Logic: Rival score increases based on difficulty
  useEffect(() => {
    if (showConcept || countdown > 0 || isFinished || initialTime === 0 || isPaused) return;
    const botTimer = setInterval(() => {
      // Adjusted Bot Pace: Lowered significantly for better balance
      // C / T > B / 3 check: bot base points lowered from 400 to 180
      const multiplier = isBooster ? 0.5 : 1.0;
      const botPace = Math.floor((multiplier * 180 * coeff * (1 + (digits - 1) * 0.25)) / 3);
      setBotScore(prev => prev + botPace);
    }, 1000); 
    return () => clearInterval(botTimer);
  }, [showConcept, countdown, isFinished, digits, initialTime, coeff, isBooster, isPaused]);

  // Countdown Logic
  useEffect(() => {
    if (showConcept) return;
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
        if (countdown === 1) mathlyAudio?.playSuccess();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showConcept, countdown]);

  // Timer Logic
  useEffect(() => {
    if (initialTime === 0 || showConcept || countdown > 0 || isFinished || isPaused) return;
    const interval = isBooster ? 2000 : 1000;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [initialTime, showConcept, countdown, isFinished, isBooster, isPaused]);

  useEffect(() => {
    if (isFinished && score > 0) {
      const savedScores = JSON.parse(localStorage.getItem('mathly-scores') || '[]');
      const newEntry = { name: userName, score, type, digits, date: new Date().toISOString() };
      localStorage.setItem('mathly-scores', JSON.stringify([...savedScores, newEntry]));
    }
  }, [isFinished, score, userName, type, digits]);

  const handleSuccess = (timeMs: number) => {
    if (isFinished) return;
    
    if (initialTime > 0) {
      const bonus = Math.floor(1 + (coeff * (1 + (digits - 1) * 0.3)));
      setTimeLeft(prev => prev + bonus);
      setBonusAdded(bonus);
      setTimeout(() => setBonusAdded(0), 1000);
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: isBooster ? ['#F59E0B', '#FCD34D', '#FFFBEB'] : ['#3B82F6', '#10B981', '#F59E0B'],
      scalar: 0.7,
      ticks: 50
    });

    mathlyAudio?.playScale(streak);
    
    // Improved Scoring Logic:
    const baseDifficultyScore = 1000 * coeff * digits;
    // Forgiving speed factor for complex problems
    const speedFactor = Math.min(2, Math.max(0.1, 1500 / (timeMs + 200)));
    
    const isFast = timeMs < 1500;
    const newCombo = isFast ? combo + 1 : 0;
    setCombo(newCombo);
    
    const multiplier = 1 + (newCombo * 0.2); 
    const finalPoints = Math.floor(baseDifficultyScore * speedFactor * multiplier);
    
    setScore(s => s + finalPoints);
    setStreak(s => s + 1);
    setSolved(s => s + 1);

    if (streak === 4) { // Will become 5
      mathlyAudio?.playMilestone();
      confetti({ particleCount: 100, spread: 100, colors: ['#F59E0B'] });
    }

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
    setIsError(true);
    setTimeout(() => setIsError(false), 400);
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
    if (isBooster) return 'rgba(245, 158, 11, 0.15)'; 
    if (type.includes('addition')) return theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    if (type.includes('subtraction')) return theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    if (type.includes('multiplication')) return theme === 'dark' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)';
    return theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)';
  }, [type, isBooster, theme]);

  if (isFinished) {
    const beatBot = score > botScore;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-2 sm:p-4 transition-colors duration-300">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl text-center border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8"><Trophy className="text-yellow-500 sm:w-12 sm:h-12 w-8 h-8" /></div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-800 dark:text-white mb-1 sm:mb-2">{t.practice.sprintOver}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">{userName}, {t.practice.youScored}</p>
          <div className="text-4xl sm:text-6xl font-black text-blue-500 dark:text-blue-400 mb-3 sm:mb-4 tabular-nums">{score.toLocaleString()}</div>
          
          <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8">
            {score > personalBest && personalBest > 0 && <div className="text-orange-500 dark:text-orange-400 font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base"><Trophy className="sm:w-4 sm:h-4 w-3.5 h-3.5"/> {t.practice.newPersonalBest}</div>}
            {initialTime > 0 && (
              <div className={cn("font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-base", beatBot ? "text-green-500 dark:text-green-400" : "text-red-400 dark:text-red-400")}>
                {beatBot ? <Zap className="sm:w-4 sm:h-4 w-3.5 h-3.5"/> : <Bot className="sm:w-4 sm:h-4 w-3.5 h-3.5"/>}
                {beatBot ? t.practice.beatBot : t.practice.lostToBot}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl"><span className="block text-gray-400 dark:text-gray-500 text-[10px] sm:text-sm font-bold uppercase mb-0.5 sm:mb-1">{t.practice.solved}</span><span className="text-xl sm:text-3xl font-black text-gray-800 dark:text-white">{solved}</span></div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl"><span className="block text-gray-400 dark:text-gray-500 text-[10px] sm:text-sm font-bold uppercase mb-0.5 sm:mb-1">{t.practice.maxStreak}</span><span className="text-xl sm:text-3xl font-black text-gray-800 dark:text-white">{streak}</span></div>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <button onClick={() => window.location.reload()} className="w-full py-3 sm:py-4 bg-blue-500 dark:bg-blue-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"><RotateCcw className="sm:w-5 sm:h-5 w-4.5 h-4.5" /> {t.practice.tryAgain}</button>
            <button onClick={() => router.push(backPath)} className="w-full py-3 sm:py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t.practice.backToSelection}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      animate={{ 
        backgroundColor: theme === 'dark' ? '#030712' : categoryColor,
      }}
      className="min-h-screen py-6 sm:py-12 px-2 sm:px-4 relative overflow-hidden transition-colors duration-500"
    >
      <AnimatePresence>
        {showConcept && <ConceptCard type={type} onStart={() => setShowConcept(false)} />}
      </AnimatePresence>

      <motion.div
        animate={isError ? { x: [0, -10, 10, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="fixed top-0 left-0 w-full z-50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 py-1 sm:py-2">
          <div className="max-w-4xl mx-auto px-4 space-y-1.5 sm:space-y-3">
            {personalBest > 0 && (
              <div className="relative h-2 sm:h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" 
                  animate={{ width: `${Math.min((score / personalBest) * 100, 100)}%` }} 
                />
                <div className="absolute inset-y-0 left-0 w-full flex items-center px-2 pointer-events-none">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Ghost className="text-blue-600 dark:text-blue-400 sm:w-3.5 sm:h-3.5 w-2.5 h-2.5" fill="currentColor" />
                    <span className="text-[8px] sm:text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-tighter sm:tracking-widest">{t.practice.ghostPace}</span>
                  </div>
                </div>
              </div>
            )}
            
            {initialTime > 0 && (
              <div className="relative h-2 sm:h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-red-400 rounded-full shadow-[0_0_12px_rgba(248,113,113,0.5)]" 
                  animate={{ width: `${Math.min((botScore / Math.max(score, personalBest, botScore, 1000)) * 100, 100)}%` }} 
                />
                <div className="absolute inset-y-0 left-0 w-full flex items-center px-2 pointer-events-none">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Bot className="text-red-700 dark:text-red-400 sm:w-3.5 sm:h-3.5 w-2.5 h-2.5" fill="currentColor" />
                    <span className="text-[8px] sm:text-[10px] font-black text-red-800 dark:text-red-300 uppercase tracking-tighter sm:tracking-widest">{t.practice.rivalBot}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto relative mt-10 sm:mt-12">
          <header className="flex items-center justify-between mb-8 sm:mb-12">
            <button onClick={() => router.push(backPath)} className="p-2 sm:p-3 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"><ArrowLeft className="sm:w-6 sm:h-6 w-5 h-5" /></button>
            <div className="flex gap-2 sm:gap-4 items-center">
              {initialTime > 0 && countdown === 0 && (
                <div className="relative">
                  <div className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full border transition-all",
                    isPaused ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-black shadow-lg" : isBooster ? "bg-amber-400 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm",
                    timeLeft < 10 && !isBooster && !isPaused ? "text-red-500 dark:text-red-400 animate-pulse border-red-100 dark:border-red-900/30" : ""
                  )}>
                    <Timer className="sm:w-5 sm:h-5 w-4 h-4" /><span className="font-bold text-sm sm:text-base">{formatTime(timeLeft)}</span>
                    {isPaused && <span className="ml-2 text-[10px] font-black uppercase tracking-widest">PAUSED</span>}
                    {isBooster && !isPaused && <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="ml-1 text-[8px] sm:text-[10px] font-black uppercase">{t.practice.timeSlow}</motion.div>}
                  </div>
                  <AnimatePresence>
                    {bonusAdded > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -30 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center text-green-500 dark:text-green-400 font-black text-sm pointer-events-none"
                      >
                        +{bonusAdded}s
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {countdown === 0 && (
                <>
                  <div className={cn(
                    "flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full border transition-all relative overflow-hidden",
                    isBooster ? "bg-amber-500 border-amber-600 text-white shadow-lg" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm"
                  )}>
                    {isBooster ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-white"><Zap className="sm:w-4.5 sm:h-4.5 w-3.5 h-3.5" fill="currentColor" /></motion.div> : combo > 1 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-orange-500 font-black text-xs sm:text-base"><Flame className="sm:w-4.5 sm:h-4.5 w-3.5 h-3.5" fill="currentColor" /> x{1 + (combo * 0.5)}</motion.div>}
                    <span className={cn("font-black tabular-nums text-sm sm:text-base", isBooster ? "text-white" : "text-blue-500 dark:text-blue-400")}>{score.toLocaleString()}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full border transition-all",
                    isBooster ? "bg-white border-amber-400 text-amber-600 shadow-sm" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                  )}>
                    <Zap className={cn(isBooster ? "text-amber-500" : "text-yellow-500", "sm:w-5 sm:h-5 w-4 h-4")} />
                    <span className="font-bold text-sm sm:text-base">{streak}</span>
                  </div>
                </>
              )}
            </div>
          </header>

          <main className="relative">
            <AnimatePresence mode="wait">
              {countdown > 0 ? (
                <motion.div key="countdown" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 2 }} className="absolute inset-0 flex flex-col items-center justify-center z-50 py-10 sm:py-20">
                  <motion.div key={countdown} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[8rem] sm:text-[12rem] font-black text-blue-500 dark:text-blue-400 drop-shadow-2xl leading-none">{countdown}</motion.div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] sm:tracking-[0.5em] mt-4">{t.practice.getReady}</p>
                </motion.div>
              ) : (
                <motion.div key="practice-content">
                  <div className="text-center mb-8 sm:mb-12 px-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white capitalize mb-1 sm:mb-2 leading-tight">
                      {t.practiceInstructions[type as keyof typeof t.practiceInstructions] || type.replace('_', ' ')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{userName} &bull; {digits} {t.selection.digits}</p>
                    {isBooster && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                      >
                        <Zap size={14} fill="currentColor" className="animate-pulse" />
                        <span className="font-black text-xs uppercase tracking-widest">{t.practice.booster} ACTIVE</span>
                      </motion.div>
                    )}
                  </div>
                  <ProblemCard 
                    key={`${type}-${digits}`} 
                    type={type as OperationType} 
                    digits={digits} 
                    onSuccess={handleSuccess} 
                    onFailure={handleFailure}
                    onShowSolution={() => setIsPaused(true)}
                    onHideSolution={() => setIsPaused(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </motion.div>
    </motion.div>
  );
}
