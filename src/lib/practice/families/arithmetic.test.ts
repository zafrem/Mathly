import { describe, expect, it } from 'vitest';
import type { Problem } from '../types';
import { generateArithmetic, checkArithmetic } from './arithmetic';

const TYPES = ['addition', 'subtraction', 'multiplication', 'division', 'integer_addition', 'integer_multiplication'] as const;

describe('generateArithmetic', () => {
  for (const type of TYPES) {
    for (const level of [1, 2, 3, 4]) {
      it(`${type} @ level ${level}: answer correct, family arithmetic`, () => {
        for (let i = 0; i < 200; i++) {
          const p = generateArithmetic(type, level);
          expect(p.family).toBe('arithmetic');
          expect(p.type).toBe(type);
          expect(Number.isInteger(p.answer)).toBe(true);
          if (type === 'addition' || type === 'integer_addition') expect(p.num1 + p.num2).toBe(p.answer);
          if (type === 'subtraction') { expect(p.num1 - p.num2).toBe(p.answer); expect(p.answer).toBeGreaterThanOrEqual(0); }
          if (type === 'multiplication' || type === 'integer_multiplication') expect(p.num1 * p.num2).toBe(p.answer);
          if (type === 'division') { expect(p.num1 / p.num2).toBe(p.answer); expect(Number.isInteger(p.num1 / p.num2)).toBe(true); }
        }
      });
    }
  }
});

describe('checkArithmetic', () => {
  it('pending → correct → incorrect for a positive answer', () => {
    const p = generateArithmetic('multiplication', 2);
    expect(checkArithmetic(p, { num: '' })).toBe('pending');
    expect(checkArithmetic(p, { num: String(p.answer) })).toBe('correct');
    const wrong = String(p.answer).replace(/./g, '9'); // same length, all 9s
    if (parseInt(wrong, 10) !== p.answer) expect(checkArithmetic(p, { num: wrong })).toBe('incorrect');
  });
  it('negatives: "-" alone is pending, exact is correct, over-long is incorrect', () => {
    const q = { ...generateArithmetic('integer_addition', 1), answer: -7 } as Problem;
    expect(checkArithmetic(q, { num: '-' })).toBe('pending');
    expect(checkArithmetic(q, { num: '-7' })).toBe('correct');
    expect(checkArithmetic(q, { num: '-77' })).toBe('incorrect');
  });
});
