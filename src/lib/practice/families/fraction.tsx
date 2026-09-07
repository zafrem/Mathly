'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';
import type { AnswerState, CardProps, Problem, RawInput, TypeKey } from '../types';
import { simplify } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);

const genFrac = (): [number, number] => {
  const d = Math.floor(Math.random() * 8) + 2;
  const n = Math.floor(Math.random() * (d - 1)) + 1;
  return [n, d];
};

export function generateFraction(type: TypeKey, level: number): Problem {
  let [num1, denom1] = genFrac();
  let [num2, denom2] = genFrac();
  let operator = '';
  let answer = 0;
  let answerDenom = 1;

  switch (type) {
    case 'fraction_addition':
      operator = '+';
      [answer, answerDenom] = simplify(num1 * denom2 + num2 * denom1, denom1 * denom2);
      break;
    case 'fraction_subtraction':
      operator = '-';
      if (num1 / denom1 < num2 / denom2) {
        [num1, num2] = [num2, num1];
        [denom1, denom2] = [denom2, denom1];
      }
      [answer, answerDenom] = simplify(num1 * denom2 - num2 * denom1, denom1 * denom2);
      break;
    case 'fraction_multiplication':
      operator = '×';
      [answer, answerDenom] = simplify(num1 * num2, denom1 * denom2);
      break;
    case 'fraction_division':
      operator = '÷';
      [answer, answerDenom] = simplify(num1 * denom2, denom1 * num2);
      break;
    default:
      throw new Error(`generateFraction: unsupported type ${type}`);
  }

  return { id: id(), family: 'fraction', type, num1, num2, denom1, denom2, operator, answer, answerDenom, digits: level };
}

export function checkFraction(problem: Problem, raw: RawInput): AnswerState {
  const num = raw.num;
  const den = raw.denom ?? '';
  const n = parseInt(num, 10);
  const d = parseInt(den || '1', 10);
  const answerDenom = problem.answerDenom ?? 1;
  if (n === problem.answer && d === answerDenom) return 'correct';
  const numFull = num.length >= String(problem.answer).length;
  const denFull = den.length >= String(answerDenom).length;
  if (numFull && denFull) return 'incorrect';
  return 'pending';
}

export const FractionCard: React.FC<CardProps> = ({ problem, onSuccess, onFailure, onShowSolution, onHideSolution }) => {
  const { t } = useLanguage();
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [userDenom, setUserDenom] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showSolution, setShowSolution] = useState(false);
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    // Reset the form when the problem changes (parent keeps this Card mounted).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserAnswer('');
    setUserDenom('');
    setStatus('idle');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
  }, [problem.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^-?\d*$/.test(value)) return;
    setUserAnswer(value);
    const result = checkFraction(problem, { num: value, denom: userDenom });
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

  const handleDenomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^-?\d*$/.test(value)) return;
    setUserDenom(value);
    const result = checkFraction(problem, { num: userAnswer, denom: value });
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

  const resetForProblem = () => {
    setUserAnswer('');
    setUserDenom('');
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const toggleSolution = () => {
    if (!showSolution) {
      setShowSolution(true);
      onShowSolution?.();
    } else {
      setShowSolution(false);
      onHideSolution?.();
      resetForProblem();
    }
  };

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
              {problem.type.startsWith('fraction_') ? `${problem.answer}/${problem.answerDenom}` : problem.answer}
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-xs mb-10">
              {(t.solutions as Record<string, string>)[problem.type]}
            </p>
            <button
              onClick={toggleSolution}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              <span>{t.practice.gotIt}</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
        <div className="flex items-center gap-4 sm:gap-8 text-3xl sm:text-5xl font-black text-gray-800 dark:text-gray-200">
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <span className="border-b-2 sm:border-b-4 border-gray-800 dark:border-gray-200 pb-0.5 sm:pb-1">{problem.num1}</span>
            <span>{problem.denom1}</span>
          </div>
          <span className="text-blue-500 dark:text-blue-400">{problem.operator}</span>
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <span className="border-b-2 sm:border-b-4 border-gray-800 dark:border-gray-200 pb-0.5 sm:pb-1">{problem.num2}</span>
            <span>{problem.denom2}</span>
          </div>
          <span className="text-gray-300 dark:text-gray-700">=</span>
        </div>
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <input ref={inputRef} type="text" value={userAnswer} onChange={handleInputChange} autoFocus className={cn("w-24 sm:w-32 text-2xl sm:text-4xl font-black text-center p-3 sm:p-4 rounded-xl border-2 sm:border-4 outline-none transition-all", status === 'idle' ? "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 focus:border-blue-400 text-black dark:text-white" : status === 'correct' ? "bg-green-50 dark:bg-green-900/20 border-green-400 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400 animate-shake")} placeholder={t.practice.numPlaceholder} />
          <div className="w-full h-1 sm:h-1.5 bg-gray-800 dark:bg-gray-200 rounded-full" />
          <input type="text" value={userDenom} onChange={handleDenomChange} className={cn("w-24 sm:w-32 text-2xl sm:text-4xl font-black text-center p-3 sm:p-4 rounded-xl border-2 sm:border-4 outline-none transition-all", status === 'idle' ? "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 focus:border-blue-400 text-black dark:text-white" : status === 'correct' ? "bg-green-50 dark:bg-green-900/20 border-green-400 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400 animate-shake")} placeholder={t.practice.denPlaceholder} />
        </div>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        {hasSolution && (
          <button
            onClick={toggleSolution}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
          >
            <HelpCircle size={18} className="sm:w-6 sm:h-6" /> {t.practice.showAnswer}
          </button>
        )}
      </div>
    </motion.div>
  );
};
