import { describe, expect, it } from 'vitest';
import { calculateGCD, simplify, getPrimeFactors, genSigned, checkInteger } from './_math';
import type { Problem } from '../types';

describe('calculateGCD', () => {
  it('computes gcd', () => {
    expect(calculateGCD(12, 18)).toBe(6);
    expect(calculateGCD(17, 5)).toBe(1);
    expect(calculateGCD(9, 0)).toBe(9);
  });
});

describe('simplify', () => {
  it('reduces a fraction to lowest terms', () => {
    expect(simplify(6, 8)).toEqual([3, 4]);
    expect(simplify(5, 10)).toEqual([1, 2]);
    expect(simplify(3, 7)).toEqual([3, 7]);
  });
});

describe('getPrimeFactors', () => {
  it('factorises', () => {
    expect(getPrimeFactors(1)).toEqual([]);
    expect(getPrimeFactors(12)).toEqual([2, 2, 3]);
    expect(getPrimeFactors(1764)).toEqual([2, 2, 3, 3, 7, 7]);
    expect(getPrimeFactors(13)).toEqual([13]);
  });
});

describe('genSigned', () => {
  it('stays within +/- (10^d - 1) and is never zero', () => {
    for (let i = 0; i < 500; i++) {
      const v = genSigned(2);
      expect(Math.abs(v)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(v)).toBeLessThanOrEqual(99);
    }
  });
});

describe('checkInteger', () => {
  const p = { answer: 42 } as Problem;
  it('pending until the typed length reaches the answer length', () => {
    expect(checkInteger(p, { num: '' })).toBe('pending');
    expect(checkInteger(p, { num: '4' })).toBe('pending');
  });
  it('correct on exact match', () => {
    expect(checkInteger(p, { num: '42' })).toBe('correct');
  });
  it('incorrect once a wrong answer reaches full length', () => {
    expect(checkInteger(p, { num: '99' })).toBe('incorrect');
  });
  it('handles negative answers', () => {
    const q = { answer: -7 } as Problem;
    expect(checkInteger(q, { num: '-' })).toBe('pending');
    expect(checkInteger(q, { num: '-7' })).toBe('correct');
    expect(checkInteger(q, { num: '-77' })).toBe('incorrect');
  });
});
