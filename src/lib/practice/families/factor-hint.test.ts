import { describe, expect, it } from 'vitest';
import { generateFactorHint, checkFactorHint } from './factor-hint';
import { calculateGCD } from './_math';

const TYPES = ['gcd', 'lcm', 'power', 'root', 'square_root', 'exponent_basic'] as const;

describe('generateFactorHint', () => {
  for (const type of TYPES) {
    for (const level of [1, 2, 3, 4]) {
      it(`${type} @ level ${level}`, () => {
        for (let i = 0; i < 200; i++) {
          const p = generateFactorHint(type, level);
          expect(p.family).toBe('factor-hint');
          expect(Number.isInteger(p.answer)).toBe(true);
          if (type === 'gcd') expect(calculateGCD(p.num1, p.num2)).toBe(p.answer);
          if (type === 'lcm') expect((p.num1 * p.num2) / calculateGCD(p.num1, p.num2)).toBe(p.answer);
          if (type === 'power' || type === 'exponent_basic') expect(p.num1 ** p.num2).toBe(p.answer);
          if (type === 'root') expect(p.answer ** p.num2).toBe(p.num1);
          if (type === 'square_root') expect(p.answer * p.answer).toBe(p.num1);
          expect(p.factors1!.reduce((a, b) => a * b, 1)).toBe(p.num1);
          if (type === 'gcd' || type === 'lcm') expect(p.factors2!.reduce((a, b) => a * b, 1)).toBe(p.num2);
        }
      });
    }
  }
});

describe('checkFactorHint', () => {
  it('integer compare with the length heuristic', () => {
    const p = generateFactorHint('gcd', 2);
    expect(checkFactorHint(p, { num: String(p.answer) })).toBe('correct');
    expect(checkFactorHint(p, { num: '' })).toBe('pending');
  });
});
