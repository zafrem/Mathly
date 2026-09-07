import { describe, expect, it } from 'vitest';
import { generateNotation, checkNotation } from './notation';

describe('generateNotation', () => {
  it('log_basic: num2**answer === num1, num2 in {2,3,5,10}, answer in 1..3', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateNotation('log_basic', 1);
      expect(p.family).toBe('notation');
      expect(p.num2 ** p.answer).toBe(p.num1);
      expect([2, 3, 5, 10]).toContain(p.num2);
      expect(p.answer).toBeGreaterThanOrEqual(1);
      expect(p.answer).toBeLessThanOrEqual(3);
    }
  });
  it('exp_neural: num1**num2 === answer, num1 in {2,3}, num2 in 0..4', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateNotation('exp_neural', 1);
      expect(p.num1 ** p.num2).toBe(p.answer);
      expect([2, 3]).toContain(p.num1);
      expect(p.num2).toBeGreaterThanOrEqual(0);
      expect(p.num2).toBeLessThanOrEqual(4);
    }
  });
});

describe('checkNotation', () => {
  it('integer compare', () => {
    const p = generateNotation('log_basic', 1);
    expect(checkNotation(p, { num: String(p.answer) })).toBe('correct');
    expect(checkNotation(p, { num: '' })).toBe('pending');
  });
});
