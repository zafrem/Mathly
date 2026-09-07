'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';
import type { AnswerState, CardProps, Problem, RawInput, TypeKey } from '../types';
import { calculateGCD, checkInteger, getPrimeFactors } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateFactorHint(type: TypeKey, level: number): Problem {
  const min = Math.pow(10, Math.max(0, level - 1));
  const max = Math.pow(10, level) - 1;
  let num1 = rand(min, max);
  let num2 = rand(min, max);
  let operator = '';
  let answer = 0;

  switch (type) {
    case 'gcd':
      operator = 'GCD'; answer = calculateGCD(num1, num2); break;
    case 'lcm': {
      operator = 'LCM';
      const lMin = Math.pow(10, Math.max(0, level - 2));
      const lMax = Math.max(lMin + 5, Math.pow(10, Math.max(1, level - 1)) * 3);
      num1 = rand(lMin, lMax);
      num2 = rand(lMin, lMax);
      answer = (num1 * num2) / calculateGCD(num1, num2);
      break;
    }
    case 'power':
      operator = '^';
      num2 = level === 1 && Math.random() < 0.5 ? 3 : 2;
      answer = Math.pow(num1, num2);
      break;
    case 'root':
      num2 = level === 1 && Math.random() < 0.5 ? 3 : 2;
      operator = num2 === 3 ? '∛' : '√';
      answer = rand(min, max);
      num1 = Math.pow(answer, num2);
      break;
    case 'exponent_basic':
      num1 = rand(2, 13);
      num2 = rand(2, 4);
      operator = '^';
      answer = Math.pow(num1, num2);
      break;
    case 'square_root':
      answer = rand(2, 21);
      num1 = answer * answer;
      operator = '√';
      break;
    default:
      throw new Error(`generateFactorHint: unsupported type ${type}`);
  }

  const problem: Problem = { id: id(), family: 'factor-hint', type, num1, num2, operator, answer, digits: level, factors1: getPrimeFactors(num1) };
  if (type === 'gcd' || type === 'lcm') problem.factors2 = getPrimeFactors(num2);
  return problem;
}

export const checkFactorHint = (problem: Problem, raw: RawInput): AnswerState => checkInteger(problem, raw);

export const FactorHintCard: React.FC<CardProps> = ({ problem, onSuccess, onFailure, onShowSolution, onHideSolution }) => {
  const { t } = useLanguage();
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showSolution, setShowSolution] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
  }, []);

  // `H` toggles the step-by-step helper for the power/root drills.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') setShowHelp((s) => !s);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^-?\d*$/.test(value)) return;
    setUserAnswer(value);
    const result = checkFactorHint(problem, { num: value });
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

  const isFactorization = problem.type === 'gcd' || problem.type === 'lcm';
  const isPower = problem.type === 'power';
  const isRoot = problem.type === 'root';
  const isExponent = problem.type === 'exponent_basic';
  const isSquareRoot = problem.type === 'square_root';

  // The step helper covers powers (power, exponent_basic) and perfect roots
  // (root, square_root).
  const showsPowerSteps = isPower || isExponent;
  const showsRootSteps = isRoot || isSquareRoot;
  // Root index: `num2` for the power/root drill, always 2 for square_root.
  const rootChunk = isRoot ? problem.num2 : 2;

  const hasSolution = !!(t.solutions as Record<string, string>)[problem.type];

  // Prime factors of the radicand, chunked into groups of `rootChunk`. Each
  // group is a set of identical primes; taking one member from every group
  // and multiplying them gives the root.
  const rootGroups: number[][] = [];
  if (showsRootSteps && problem.factors1) {
    for (let i = 0; i < problem.factors1.length; i += rootChunk) {
      rootGroups.push(problem.factors1.slice(i, i + rootChunk));
    }
  }

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

      {isFactorization ? (
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="text-2xl sm:text-4xl font-black text-gray-800 dark:text-gray-200 w-16 sm:w-24 text-right">{problem.num1}</span>
              <div className="h-8 sm:h-10 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-wrap gap-1.5 sm:gap-2">{problem.factors1?.map((f, i) => (<span key={i} className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs sm:text-sm font-bold">{f}</span>))}</div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="text-2xl sm:text-4xl font-black text-gray-800 dark:text-gray-200 w-16 sm:w-24 text-right">{problem.num2}</span>
              <div className="h-8 sm:h-10 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-wrap gap-1.5 sm:gap-2">{problem.factors2?.map((f, i) => (<span key={i} className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg text-xs sm:text-sm font-bold">{f}</span>))}</div>
            </div>
          </div>
        </div>
      ) : isExponent ? (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-10">
          <span className="text-5xl sm:text-7xl font-black text-gray-800 dark:text-white">{problem.num1}</span>
          <span className="text-2xl sm:text-4xl font-black text-blue-500 dark:text-blue-400 mb-6 sm:mb-8">{problem.num2}</span>
          <span className="text-2xl sm:text-4xl font-black text-gray-300 dark:text-gray-700 ml-2 sm:ml-4">=</span>
        </div>
      ) : isSquareRoot ? (
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="flex items-start text-5xl sm:text-7xl font-black text-gray-800 dark:text-white">
            <span className="text-blue-500 dark:text-blue-400 font-serif">√</span>
            <span className="border-t-4 sm:border-t-8 border-gray-800 dark:border-white mt-1 sm:mt-2 px-2 sm:px-4">{problem.num1}</span>
          </div>
          <span className="text-2xl sm:text-4xl font-black text-gray-300 dark:text-gray-700">=</span>
        </div>
      ) : isPower ? (
        <div className="text-right mb-8">
          <div className="text-6xl font-black text-gray-800 dark:text-white tracking-tight flex items-start justify-end">
            <span>{problem.num1}</span>
            <sup className="text-3xl text-blue-500 dark:text-blue-400 ml-1">{problem.num2}</sup>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 mt-6 rounded-full" />
        </div>
      ) : isRoot ? (
        <div className="text-right mb-8">
          <div className="text-6xl font-black text-gray-800 dark:text-white tracking-tight flex items-center justify-end gap-3">
            <span className="text-blue-500 dark:text-blue-400">{problem.operator}</span>
            <span className="border-t-4 border-gray-800 dark:border-white pt-2">{problem.num1}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 mt-6 rounded-full" />
        </div>
      ) : null}

      <div className="relative">
        <input ref={inputRef} type="text" value={userAnswer} onChange={handleInputChange} autoFocus className={cn("w-full text-3xl sm:text-6xl font-black text-right p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border-2 sm:border-4 transition-all duration-200 outline-none shadow-inner", status === 'idle' ? "border-gray-100 dark:border-gray-800 focus:border-blue-400 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" : status === 'correct' ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-shake")} placeholder="?" />
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {status === 'correct' && (<motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-green-500 dark:text-green-400"><Check size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
            {status === 'incorrect' && (<motion.div initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }} className="text-red-500 dark:text-red-400"><X size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
          </AnimatePresence>
        </div>
      </div>

      {(showsPowerSteps || showsRootSteps) && (
        <div className="mt-6 flex flex-col items-center">
          {showHelp ? (
            <div className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 text-center">
              <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t.practice.steps}</span>
              {showsPowerSteps ? (
                <div className="text-3xl font-black text-gray-700 dark:text-gray-200 tracking-wide">
                  {Array.from({ length: problem.num2 }).map((_, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-blue-400 dark:text-blue-500 mx-3">×</span>}
                      {problem.num1}
                    </span>
                  ))}
                </div>
              ) : rootGroups.length === 0 ? (
                <div className="text-3xl font-black text-gray-700 dark:text-gray-200">1</div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-black text-gray-700 dark:text-gray-200">
                  {rootGroups.map((g, gi) => (
                    <span key={gi} className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm">
                      {g.join(' · ')}
                    </span>
                  ))}
                  <span className="text-gray-300 dark:text-gray-600 mx-2">→</span>
                  <span>{rootGroups.map((g) => g[0]).join(' × ')}</span>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => setShowHelp(true)} className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {t.practice.pressForSteps}
            </button>
          )}
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
