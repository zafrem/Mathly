'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';
import type { AnswerState, CardProps, Problem, RawInput, TypeKey } from '../types';
import { checkInteger, genSigned } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateArithmetic(type: TypeKey, level: number): Problem {
  const min = Math.pow(10, Math.max(0, level - 1));
  const max = Math.pow(10, level) - 1;
  let num1 = rand(min, max);
  let num2 = rand(min, max);
  let operator = '';
  let answer = 0;

  switch (type) {
    case 'addition':
      operator = '+'; answer = num1 + num2; break;
    case 'subtraction':
      operator = '-';
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2; break;
    case 'multiplication':
      operator = '×';
      num2 = rand(1, Math.pow(10, Math.min(level, 2)) - 1);
      answer = num1 * num2; break;
    case 'division':
      operator = '÷';
      num2 = rand(2, 9);
      answer = rand(min, max);
      num1 = answer * num2; break;
    case 'integer_addition':
      num1 = genSigned(level); num2 = genSigned(level);
      operator = '+'; answer = num1 + num2; break;
    case 'integer_multiplication':
      num1 = genSigned(Math.min(level, 2)); num2 = genSigned(Math.min(level, 2));
      operator = '×'; answer = num1 * num2; break;
    default:
      throw new Error(`generateArithmetic: unsupported type ${type}`);
  }

  return { id: id(), family: 'arithmetic', type, num1, num2, operator, answer, digits: level };
}

export const checkArithmetic = (problem: Problem, raw: RawInput): AnswerState => checkInteger(problem, raw);

export const ArithmeticCard: React.FC<CardProps> = ({ problem, digits, onSuccess, onFailure, onShowSolution, onHideSolution }) => {
  const { t } = useLanguage();
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [carries, setCarries] = useState<string[]>(() => new Array(String(problem.answer).length).fill(''));
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showSolution, setShowSolution] = useState(false);
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    setUserAnswer('');
    setCarries(new Array(String(problem.answer).length).fill(''));
    setStatus('idle');
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^-?\d*$/.test(value)) return;
    setUserAnswer(value);
    const result = checkArithmetic(problem, { num: value });
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

  const handleCarryChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCarries = [...carries];
      newCarries[index] = value;
      setCarries(newCarries);
    }
  };

  const resetForProblem = () => {
    setUserAnswer('');
    setCarries(new Array(String(problem.answer).length).fill(''));
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

  const isFraction = problem.type.startsWith('fraction_');
  const isVertical = digits >= 2 && (problem.type === 'addition' || problem.type === 'subtraction');

  const hasSolution = !!(t.solutions as Record<string, string>)[problem.type];

  const maxLen = Math.max(problem.num1.toString().length, problem.num2.toString().length);
  const num1Str = problem.num1.toString().padStart(maxLen, ' ');
  const num2Str = problem.num2.toString().padStart(maxLen, ' ');

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

      {isVertical ? (
        <div className="flex flex-col items-end space-y-1 sm:space-y-2 mb-6 sm:mb-8 font-mono text-4xl sm:text-6xl font-black text-gray-800 dark:text-white tracking-widest relative">
          <div className="flex gap-1.5 sm:gap-2 mb-1 sm:mb-2 pr-1">{Array.from({ length: maxLen }).map((_, i) => (<input key={`carry-${i}`} type="text" maxLength={1} value={carries[i] || ''} onChange={(e) => handleCarryChange(i, e.target.value)} className="w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-xl text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-blue-400 dark:text-blue-300 focus:border-blue-300 outline-none transition-colors text-black dark:text-white bg-transparent" placeholder="0" />)).reverse()}</div>
          <div className="pr-1">{num1Str}</div>
          <div className="relative pr-1"><span className="absolute -left-12 sm:-left-16 text-blue-500 dark:text-blue-400 font-sans">{problem.operator}</span>{num2Str}</div>
          <div className="w-full h-1 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 sm:mt-4" />
        </div>
      ) : (
        <div className="text-right mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl font-black text-gray-800 dark:text-white tracking-tight">{problem.num1}</div>
          <div className="text-4xl sm:text-6xl font-black text-gray-800 dark:text-white tracking-tight flex items-center justify-end gap-3 sm:gap-4 mt-1 sm:mt-2"><span className="text-blue-500 dark:text-blue-400">{problem.operator}</span>{problem.num2}</div>
          <div className="h-1 sm:h-2 bg-gray-200 dark:bg-gray-700 mt-4 sm:mt-6 rounded-full" />
        </div>
      )}

      {!isFraction && (
        <div className="relative">
          <input ref={inputRef} type="text" value={userAnswer} onChange={handleInputChange} autoFocus className={cn("w-full text-3xl sm:text-6xl font-black text-right p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border-2 sm:border-4 transition-all duration-200 outline-none shadow-inner", status === 'idle' ? "border-gray-100 dark:border-gray-800 focus:border-blue-400 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" : status === 'correct' ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-shake")} placeholder="?" />
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2">
            <AnimatePresence>
              {status === 'correct' && (<motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-green-500 dark:text-green-400"><Check size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
              {status === 'incorrect' && (<motion.div initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }} className="text-red-500 dark:text-red-400"><X size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
            </AnimatePresence>
          </div>
        </div>
      )}

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
