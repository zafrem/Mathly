import { describe, expect, it } from 'vitest';
import { scoreAnswer } from './scoring';

describe('scoreAnswer', () => {
  it('matches the legacy formula for a fast first answer', () => {
    // coeff 1, digits 2, timeMs 800 -> speedFactor 1.5, nextCombo 1, mult 1.2 -> 3600
    expect(scoreAnswer({ coeff: 1, digits: 2, timeMs: 800, combo: 0 })).toEqual({ points: 3600, nextCombo: 1 });
  });

  it('caps the speed factor at 2', () => {
    // timeMs 0 -> 7.5 clamped to 2; coeff 4 digits 1 -> 1000*4*1*2*1.2 = 9600
    expect(scoreAnswer({ coeff: 4, digits: 1, timeMs: 0, combo: 0 })).toEqual({ points: 9600, nextCombo: 1 });
  });

  it('floors the speed factor at 0.1 and resets combo when slow', () => {
    // timeMs 100000 -> ~0.015 clamped to 0.1; timeMs >= 1500 -> nextCombo 0, mult 1 -> 100
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 100000, combo: 5 })).toEqual({ points: 100, nextCombo: 0 });
  });

  it('nextCombo flips exactly at timeMs === 1500', () => {
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 1499, combo: 2 }).nextCombo).toBe(3);
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 1500, combo: 2 }).nextCombo).toBe(0);
  });

  it('stacks the combo multiplier', () => {
    // coeff 1 digits 1 timeMs 500 -> speedFactor 1500/700 ~= 2.14 clamped to 2; combo 3 -> nextCombo 4, mult 1.8 -> 3600
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 500, combo: 3 })).toEqual({ points: 3600, nextCombo: 4 });
  });
});
