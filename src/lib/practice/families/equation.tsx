'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';
import type { AnswerState, CardProps, Problem, RawInput, TypeKey } from '../types';
import { checkInteger, genSigned, id } from './_math';

export function generateEquation(type: TypeKey, level: number): Problem {
  let num1 = 0, num2 = 0, answer = 0, operator = '';
  let equationVar: string | undefined;

  if (type === 'equation_simple') {
    answer = genSigned(level);
    num2 = Math.floor(Math.random() * (Math.pow(10, level) - 1)) + 1;
    const isAdd = Math.random() > 0.5;
    operator = isAdd ? '+' : '-';
    num1 = isAdd ? answer + num2 : answer - num2;
    equationVar = 'x';
  } else if (type === 'quadratic_vertex') {
    answer = genSigned(1);
    num1 = answer;
    num2 = Math.floor(Math.random() * 10) + 1;
    operator = 'min';
  } else {
    throw new Error(`generateEquation: unsupported type ${type}`);
  }

  return { id: id(), family: 'equation', type, num1, num2, operator, answer, digits: level, equationVar };
}

export const checkEquation = (problem: Problem, raw: RawInput): AnswerState => checkInteger(problem, raw);

export const EquationCard: React.FC<CardProps> = ({ problem, onSuccess, onFailure, onShowSolution, onHideSolution, onSkip }) => {
  const { t } = useLanguage();
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showSolution, setShowSolution] = useState(false);
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'correct') return;
    const value = e.target.value;
    if (!/^-?\d*$/.test(value)) return;
    setUserAnswer(value);
    const result = checkEquation(problem, { num: value });
    if (result === 'correct') {
      setStatus('correct');
      mathlyAudio?.playSuccess();
      onSuccess(performance.now() - startRef.current);
    } else if (result === 'incorrect') {
      setStatus('incorrect');
      mathlyAudio?.playError();
      onFailure();
    }
  };

  const openSolution = () => {
    setShowSolution(true);
    onShowSolution?.();
  };
  const dismissSolution = () => {
    setShowSolution(false);
    onHideSolution?.();
    onSkip?.();            // advance to a fresh problem — peeking forfeits the current one
  };

  const isQuadratic = problem.type === 'quadratic_vertex';

  const hasSolution = !!(t.solutions as Record<string, string>)[problem.type];

  return (
    <motion.div
      key={problem.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl w-full mx-auto p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.08)] sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-black/20 border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors duration-300"
    >
      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 z-50 bg-white dark:bg-gray-900 p-8 sm:p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 mb-6">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-sm font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mb-2">{t.practice.solution}</h2>
            <div className="text-5xl font-black text-gray-900 dark:text-white mb-6 tabular-nums">
              {problem.answer}
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-xs mb-10">
              {(t.solutions as Record<string, string>)[problem.type]}
            </p>
            <button
              onClick={dismissSolution}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              <span>{t.practice.gotIt}</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isQuadratic ? (
        <div className="flex flex-col items-center justify-center gap-6 mb-8 sm:mb-10">
          <div className="text-3xl sm:text-5xl font-black text-gray-800 dark:text-white tracking-tight text-center leading-tight">
            f(x) = (x {problem.num1 >= 0 ? '-' : '+'} <span className="text-blue-500 dark:text-blue-400">?</span>)² + {problem.num2}
          </div>
          <p className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] sm:text-xs tracking-widest">{t.practiceInstructions.quadratic_vertex}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-6xl font-black text-gray-800 dark:text-white mb-8 sm:mb-10">
          <span className="text-blue-500 dark:text-blue-400">{problem.equationVar}</span>
          <span className="text-gray-400 dark:text-gray-600 font-normal">{problem.operator}</span>
          <span>{Math.abs(problem.num2)}</span>
          <span className="text-gray-300 dark:text-gray-700 font-normal">=</span>
          <span>{problem.num1}</span>
        </div>
      )}

      <div className="relative">
        <input ref={inputRef} type="text" value={userAnswer} onChange={handleInputChange} autoFocus className={cn("w-full text-3xl sm:text-6xl font-black text-right p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border-2 sm:border-4 transition-all duration-200 outline-none shadow-inner", status === 'idle' ? "border-gray-100 dark:border-gray-800 focus:border-blue-400 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" : status === 'correct' ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-shake")} placeholder="?" />
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {status === 'correct' && (<motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-green-500 dark:text-green-400"><Check size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
            {status === 'incorrect' && (<motion.div initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }} className="text-red-500 dark:text-red-400"><X size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        {hasSolution && (
          <button
            onClick={openSolution}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          >
            <HelpCircle size={18} className="sm:w-6 sm:h-6" /> {t.practice.showAnswer}
          </button>
        )}
        <button
          onClick={() => onSkip?.()}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
        >
          <RefreshCw size={18} className="sm:w-6 sm:h-6" /> {t.practice.skip}
        </button>
      </div>
    </motion.div>
  );
};
