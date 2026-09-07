import { describe, expect, it } from 'vitest';
import { generateFraction, checkFraction } from './fraction';

const TYPES = ['fraction_addition', 'fraction_subtraction', 'fraction_multiplication', 'fraction_division'] as const;

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(Math.abs(b), Math.abs(a % b)); }
function lhs(p: { num1?: number; denom1?: number; num2?: number; denom2?: number }, type: string): number {
  const a = p.num1! / p.denom1!, b = p.num2! / p.denom2!;
  if (type === 'fraction_addition') return a + b;
  if (type === 'fraction_subtraction') return a - b;
  if (type === 'fraction_multiplication') return a * b;
  return a / b;
}

describe('generateFraction', () => {
  for (const type of TYPES) {
    it(`${type}: simplified answer, mathematically correct`, () => {
      for (let i = 0; i < 300; i++) {
        const p = generateFraction(type, 1);
        expect(p.family).toBe('fraction');
        expect(gcd(Math.abs(p.answer), Math.abs(p.answerDenom!))).toBe(1);
        expect(Math.abs(lhs(p, type) - p.answer / p.answerDenom!)).toBeLessThan(1e-9);
      }
    });
  }
});

describe('checkFraction', () => {
  const p = generateFraction('fraction_multiplication', 1);
  it('pending until both fields full', () => {
    expect(checkFraction(p, { num: String(p.answer), denom: '' })).toBe('pending');
  });
  it('correct only when numerator AND denominator match', () => {
    expect(checkFraction(p, { num: String(p.answer), denom: String(p.answerDenom) })).toBe('correct');
  });
  it('incorrect once both reach answer length but wrong', () => {
    const badNum = String(p.answer).replace(/\d/g, '9');
    const badDen = String(p.answerDenom).replace(/\d/g, '9');
    if (parseInt(badNum) !== p.answer || parseInt(badDen) !== p.answerDenom) {
      expect(checkFraction(p, { num: badNum, denom: badDen })).toBe('incorrect');
    }
  });
});
