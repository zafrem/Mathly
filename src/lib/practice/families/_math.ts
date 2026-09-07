import type { AnswerState, Problem, RawInput } from '../types';

export const id = () => Math.random().toString(36).substring(2, 9);

export const calculateGCD = (a: number, b: number): number => {
  return b === 0 ? a : calculateGCD(b, a % b);
};

export const simplify = (num: number, denom: number): [number, number] => {
  const common = calculateGCD(Math.abs(num), Math.abs(denom));
  return [num / common, denom / common];
};

export const getPrimeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  let temp = Math.abs(n);
  while (temp >= d * d) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d++;
    }
  }
  if (temp > 1) factors.push(temp);
  return factors;
};

export const genSigned = (d: number): number => {
  const val = Math.floor(Math.random() * (Math.pow(10, d) - 1)) + 1;
  return Math.random() > 0.5 ? val : -val;
};

// Shared single-integer answer check — lifted from the legacy problem-card handleCheck (since removed).
// (the non-fraction branch). Used by the arithmetic / factor-hint / notation /
// equation families.
export function checkInteger(problem: Problem, raw: RawInput): AnswerState {
  const s = raw.num;
  const n = parseInt(s, 10);
  if (n === problem.answer) return 'correct';
  const answerLen = String(problem.answer).length;
  if (!s.startsWith('-') && s.length >= answerLen) return 'incorrect';
  if (s.startsWith('-') && s.length > answerLen) return 'incorrect';
  return 'pending';
}
