'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';
import { Problem, generateProblem, OperationType } from '@/lib/math-engine';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import { useLanguage } from '@/lib/i18n/language-context';

interface ProblemCardProps {
  type: OperationType;
  digits: number;
  onSuccess?: (timeMs: number) => void;
  onFailure?: () => void;
}

export default function ProblemCard({ type, digits, onSuccess, onFailure }: ProblemCardProps) {
  const { t } = useLanguage();
  const [problem, setProblem] = useState<Problem>(() => generateProblem(type, digits));
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [userDenom, setUserDenom] = useState<string>('');
  const [carries, setCarries] = useState<string[]>(() => new Array(problem.answer.toString().length).fill(''));
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const startTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startTime.current = performance.now();
  }, [problem.id]);

  const handleNext = () => {
    const p = generateProblem(type, digits);
    setProblem(p);
    setUserAnswer('');
    setUserDenom('');
    setCarries(new Array(p.answer.toString().length).fill(''));
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCheck = (num: string, den: string) => {
    const n = parseInt(num);
    const d = parseInt(den || '1');
    
    if (problem.type.startsWith('fraction_')) {
      if (n === problem.answer && d === (problem.answerDenom || 1)) {
        const time = performance.now() - startTime.current;
        setStatus('correct');
        mathlyAudio?.playSuccess();
        onSuccess?.(time);
        setTimeout(handleNext, 1000);
      } else if (num.length >= problem.answer.toString().length && (den.length >= (problem.answerDenom?.toString().length || 0))) {
        setStatus('incorrect');
        mathlyAudio?.playError();
        onFailure?.();
      }
    } else {
      if (n === problem.answer) {
        const time = performance.now() - startTime.current;
        setStatus('correct');
        mathlyAudio?.playSuccess();
        onSuccess?.(time);
        setTimeout(handleNext, 1000);
      } else if (num.length >= problem.answer.toString().length) {
        setStatus('incorrect');
        mathlyAudio?.playError();
        onFailure?.();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*$/.test(value)) {
      setUserAnswer(value);
      handleCheck(value, userDenom);
    }
  };

  const handleDenomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*$/.test(value)) {
      setUserDenom(value);
      handleCheck(userAnswer, value);
    }
  };

  const handleCarryChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCarries = [...carries];
      newCarries[index] = value;
      setCarries(newCarries);
    }
  };

  if (!problem) return null;

  const isVertical = digits >= 2 && (type === 'addition' || type === 'subtraction');
  const isFactorization = type === 'gcd' || type === 'lcm';
  const isFraction = type.startsWith('fraction_');
  const isExponent = type === 'exponent_basic';
  const isSquareRoot = type === 'square_root';
  const isEquation = !!problem.equationVar;
  
  const maxLen = Math.max(problem.num1.toString().length, problem.num2.toString().length);
  const num1Str = problem.num1.toString().padStart(maxLen, ' ');
  const num2Str = problem.num2.toString().padStart(maxLen, ' ');

  return (
    <motion.div key={problem.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-xl w-full mx-auto p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] bg-white shadow-[0_20px_48px_-12px_rgba(0,0,0,0.08)] sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100">
      {isFraction ? (
        <div className="flex flex-col items-center gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div className="flex items-center gap-4 sm:gap-8 text-3xl sm:text-5xl font-black text-gray-800">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="border-b-2 sm:border-b-4 border-gray-800 pb-0.5 sm:pb-1">{problem.num1}</span>
              <span>{problem.denom1}</span>
            </div>
            <span className="text-blue-500">{problem.operator}</span>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span className="border-b-2 sm:border-b-4 border-gray-800 pb-0.5 sm:pb-1">{problem.num2}</span>
              <span>{problem.denom2}</span>
            </div>
            <span className="text-gray-300">=</span>
          </div>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <input ref={inputRef} type="text" value={userAnswer} onChange={handleInputChange} autoFocus className={cn("w-24 sm:w-32 text-2xl sm:text-4xl font-black text-center p-3 sm:p-4 rounded-xl border-2 sm:border-4 outline-none transition-all", status === 'idle' ? "bg-gray-50 border-gray-100 focus:border-blue-400 text-black" : status === 'correct' ? "bg-green-50 border-green-400 text-green-600" : "bg-red-50 border-red-400 text-red-600 animate-shake")} placeholder={t.practice.numPlaceholder} />
            <div className="w-full h-1 sm:h-1.5 bg-gray-800 rounded-full" />
            <input type="text" value={userDenom} onChange={handleDenomChange} className={cn("w-24 sm:w-32 text-2xl sm:text-4xl font-black text-center p-3 sm:p-4 rounded-xl border-2 sm:border-4 outline-none transition-all", status === 'idle' ? "bg-gray-50 border-gray-100 focus:border-blue-400 text-black" : status === 'correct' ? "bg-green-50 border-green-400 text-green-600" : "bg-red-50 border-red-400 text-red-600 animate-shake")} placeholder={t.practice.denPlaceholder} />
          </div>
        </div>
      ) : isFactorization ? (
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-2xl sm:text-4xl font-black text-gray-800 w-16 sm:w-24 text-right">{problem.num1}</span>
              <div className="h-8 sm:h-10 w-px bg-gray-200" />
              <div className="flex flex-wrap gap-1.5 sm:gap-2">{problem.factors1?.map((f, i) => (<span key={i} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs sm:text-sm font-bold">{f}</span>))}</div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-2xl sm:text-4xl font-black text-gray-800 w-16 sm:w-24 text-right">{problem.num2}</span>
              <div className="h-8 sm:h-10 w-px bg-gray-200" />
              <div className="flex flex-wrap gap-1.5 sm:gap-2">{problem.factors2?.map((f, i) => (<span key={i} className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs sm:text-sm font-bold">{f}</span>))}</div>
            </div>
          </div>
        </div>
      ) : isExponent ? (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-10">
          <span className="text-5xl sm:text-7xl font-black text-gray-800">{problem.num1}</span>
          <span className="text-2xl sm:text-4xl font-black text-blue-500 mb-6 sm:mb-8">{problem.num2}</span>
          <span className="text-2xl sm:text-4xl font-black text-gray-300 ml-2 sm:ml-4">=</span>
        </div>
      ) : isSquareRoot ? (
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="flex items-start text-5xl sm:text-7xl font-black text-gray-800">
            <span className="text-blue-500 font-serif">√</span>
            <span className="border-t-4 sm:border-t-8 border-gray-800 mt-1 sm:mt-2 px-2 sm:px-4">{problem.num1}</span>
          </div>
          <span className="text-2xl sm:text-4xl font-black text-gray-300">=</span>
        </div>
      ) : isEquation ? (
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-6xl font-black text-gray-800 mb-8 sm:mb-10">
          <span className="text-blue-500">{problem.equationVar}</span>
          <span className="text-gray-400 font-normal">{problem.operator}</span>
          <span>{Math.abs(problem.num2)}</span>
          <span className="text-gray-300 font-normal">=</span>
          <span>{problem.num1}</span>
        </div>
      ) : isVertical ? (
        <div className="flex flex-col items-end space-y-1 sm:space-y-2 mb-6 sm:mb-8 font-mono text-4xl sm:text-6xl font-black text-gray-800 tracking-widest relative">
          <div className="flex gap-1.5 sm:gap-2 mb-1 sm:mb-2 pr-1">{Array.from({ length: maxLen }).map((_, i) => (<input key={`carry-${i}`} type="text" maxLength={1} value={carries[i] || ''} onChange={(e) => handleCarryChange(i, e.target.value)} className="w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-xl text-center border-2 border-dashed border-gray-200 rounded-lg text-blue-400 focus:border-blue-300 outline-none transition-colors text-black" placeholder="0" />)).reverse()}</div>
          <div className="pr-1">{num1Str}</div>
          <div className="relative pr-1"><span className="absolute -left-12 sm:-left-16 text-blue-500 font-sans">{problem.operator}</span>{num2Str}</div>
          <div className="w-full h-1 sm:h-2 bg-gray-200 rounded-full mt-2 sm:mt-4" />
        </div>
      ) : (
        <div className="text-right mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl font-black text-gray-800 tracking-tight">{problem.num1}</div>
          <div className="text-4xl sm:text-6xl font-black text-gray-800 tracking-tight flex items-center justify-end gap-3 sm:gap-4 mt-1 sm:mt-2"><span className="text-blue-500">{problem.operator}</span>{problem.num2}</div>
          <div className="h-1 sm:h-2 bg-gray-200 mt-4 sm:mt-6 rounded-full" />
        </div>
      )}

      {!isFraction && (
        <div className="relative">
          <input ref={inputRef} type="text" value={userAnswer} onChange={handleInputChange} autoFocus className={cn("w-full text-3xl sm:text-6xl font-black text-right p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border-2 sm:border-4 transition-all duration-200 outline-none shadow-inner", status === 'idle' ? "border-gray-100 focus:border-blue-400 bg-gray-50 text-black" : status === 'correct' ? "border-green-400 bg-green-50 text-green-600" : "border-red-400 bg-red-50 text-red-600 animate-shake")} placeholder="?" />
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2">
            <AnimatePresence>
              {status === 'correct' && (<motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-green-500"><Check size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
              {status === 'incorrect' && (<motion.div initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }} className="text-red-500"><X size={32} className="sm:w-[56px] sm:h-[56px]" strokeWidth={4} /></motion.div>)}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="mt-8 sm:mt-10 flex justify-center">
        <button onClick={handleNext} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95"><RefreshCw size={18} className="sm:w-6 sm:h-6" /> {t.practice.skip}</button>
      </div>
    </motion.div>
  );
}
