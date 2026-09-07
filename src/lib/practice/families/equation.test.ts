import { describe, expect, it } from 'vitest';
import { generateEquation, checkEquation } from './equation';
import type { Problem } from '../types';

describe('generateEquation', () => {
  it('equation_simple: solving for x matches answer, operator consistent', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateEquation('equation_simple', 2);
      expect(p.family).toBe('equation');
      expect(p.equationVar).toBe('x');
      const solved = p.operator === '+' ? p.num1 - p.num2 : p.num1 + p.num2;
      expect(solved).toBe(p.answer);
      expect(p.num2).toBeGreaterThan(0);
    }
  });
  it('quadratic_vertex: num1 === answer (vertex h), num2 in 1..10', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateEquation('quadratic_vertex', 1);
      expect(p.num1).toBe(p.answer);
      expect(p.num2).toBeGreaterThanOrEqual(1);
      expect(p.num2).toBeLessThanOrEqual(10);
    }
  });
});

describe('checkEquation', () => {
  it('integer compare with negatives', () => {
    const p = { ...generateEquation('equation_simple', 1), answer: -4 } as Problem;
    expect(checkEquation(p, { num: '-' })).toBe('pending');
    expect(checkEquation(p, { num: '-4' })).toBe('correct');
    expect(checkEquation(p, { num: '-44' })).toBe('incorrect');
  });
});
