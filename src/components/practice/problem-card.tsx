'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';
import { Problem, generateProblem, OperationType } from '@/lib/math-engine';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';

interface ProblemCardProps {
  type: OperationType;
  digits: number;
  onSuccess?: (timeMs: number) => void;
  onFailure?: () => void;
}

export default function ProblemCard({ type, digits, onSuccess, onFailure }: ProblemCardProps) {
  const [problem, setProblem] = useState<Problem>(() => generateProblem(type, digits));
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [carries, setCarries] = useState<string[]>(() => new Array(problem.answer.toString().length).fill(''));
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStartTime(performance.now());
  }, [problem.id]);

  const handleNext = () => {
    const p = generateProblem(type, digits);
    setProblem(p);
    setUserAnswer('');
    setCarries(new Array(p.answer.toString().length).fill(''));
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setUserAnswer(value);
      
      if (problem && parseInt(value) === problem.answer) {
        const endTime = performance.now();
        setStatus('correct');
        mathlyAudio?.playSuccess();
        onSuccess?.(endTime - startTime);
        setTimeout(handleNext, 1000);
      } else if (problem && value.length >= problem.answer.toString().length) {
        setStatus('incorrect');
        mathlyAudio?.playError();
        onFailure?.();
      } else {
        setStatus('idle');
      }
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
  const maxLen = Math.max(problem.num1.toString().length, problem.num2.toString().length);
  const num1Str = problem.num1.toString().padStart(maxLen, ' ');
  const num2Str = problem.num2.toString().padStart(maxLen, ' ');

  return (
    <motion.div
      key={problem.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl w-full mx-auto p-12 rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100"
    >
      {isFactorization ? (
        <div className="mb-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-4xl font-black text-gray-800 w-24 text-right">{problem.num1}</span>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex flex-wrap gap-2">
                {problem.factors1?.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-bold">{f}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-4xl font-black text-gray-800 w-24 text-right">{problem.num2}</span>
              <div className="h-10 w-px bg-gray-200" />
              <div className="flex flex-wrap gap-2">
                {problem.factors2?.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-sm font-bold">{f}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-xl font-bold text-blue-500 uppercase tracking-widest">
            Find the {type.toUpperCase()}
          </div>
        </div>
      ) : isVertical ? (
        <div className="flex flex-col items-end space-y-2 mb-8 font-mono text-6xl font-black text-gray-800 tracking-widest relative">
          <div className="flex gap-2 mb-2 pr-1">
            {Array.from({ length: maxLen }).map((_, i) => (
              <input
                key={`carry-${i}`}
                type="text"
                maxLength={1}
                value={carries[i] || ''}
                onChange={(e) => handleCarryChange(i, e.target.value)}
                className="w-10 h-10 text-xl text-center border-2 border-dashed border-gray-200 rounded-lg text-blue-400 focus:border-blue-300 outline-none transition-colors"
                placeholder="0"
              />
            )).reverse()}
          </div>
          <div className="pr-1">{num1Str}</div>
          <div className="relative pr-1">
            <span className="absolute -left-16 text-blue-500 font-sans">{problem.operator}</span>
            {num2Str}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4" />
        </div>
      ) : (
        <div className="text-right mb-8">
          <div className="text-6xl font-black text-gray-800 tracking-tight">{problem.num1}</div>
          <div className="text-6xl font-black text-gray-800 tracking-tight flex items-center justify-end gap-4 mt-2">
            <span className="text-blue-500">{problem.operator}</span>
            {problem.num2}
          </div>
          <div className="h-2 bg-gray-200 mt-6 rounded-full" />
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={handleInputChange}
          autoFocus
          className={cn(
            "w-full text-6xl font-black text-right p-6 rounded-[1.5rem] border-4 transition-all duration-200 outline-none shadow-inner",
            status === 'idle' && "border-gray-100 focus:border-blue-400 bg-gray-50",
            status === 'correct' && "border-green-400 bg-green-50 text-green-600",
            status === 'incorrect' && "border-red-400 bg-red-50 text-red-600 animate-shake"
          )}
          placeholder="?"
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {status === 'correct' && (
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-green-500">
                <Check size={56} strokeWidth={4} />
              </motion.div>
            )}
            {status === 'incorrect' && (
              <motion.div initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }} className="text-red-500">
                <X size={56} strokeWidth={4} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-all hover:scale-105 active:scale-95">
          <RefreshCw size={24} />
          Skip Problem
        </button>
      </div>
    </motion.div>
  );
}
