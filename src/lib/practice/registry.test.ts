import { describe, expect, it } from 'vitest';
import { PROBLEM_TYPES, getKind, allTypeKeys, typesForMode } from './registry';
import { FAMILY_CARDS } from './families';

const LEGACY_TYPES = [
  'addition', 'subtraction', 'multiplication', 'division',
  'gcd', 'lcm', 'power', 'root',
  'fraction_addition', 'fraction_subtraction', 'fraction_multiplication', 'fraction_division',
  'integer_addition', 'integer_multiplication',
  'equation_simple', 'exponent_basic', 'square_root',
  'quadratic_vertex', 'log_basic', 'exp_neural',
];

const WEIGHTS: Record<string, number> = {
  addition: 1, subtraction: 1.2, multiplication: 2.5, division: 2, gcd: 4, lcm: 4,
  power: 2.5, root: 2.5,
  fraction_addition: 5, fraction_subtraction: 5, fraction_multiplication: 4, fraction_division: 4,
  integer_addition: 1.5, integer_multiplication: 2, equation_simple: 3,
  exponent_basic: 2.5, square_root: 2.5, quadratic_vertex: 3, log_basic: 3, exp_neural: 3,
};

describe('registry', () => {
  it('has an entry for every legacy type and nothing else', () => {
    expect(Object.keys(PROBLEM_TYPES).sort()).toEqual([...LEGACY_TYPES].sort());
  });

  it('each entry generates a problem whose family has a Card and matches the entry', () => {
    for (const type of LEGACY_TYPES) {
      const kind = getKind(type);
      expect(kind.mode).toBe('numbers');
      const p = kind.generate(2);
      expect(p.family).toBe(kind.family);
      expect(FAMILY_CARDS[kind.family]).toBeDefined();
    }
  });

  it('weights match the pre-refactor difficultyCoefficients map', () => {
    for (const type of LEGACY_TYPES) {
      expect(getKind(type).weight).toBe(WEIGHTS[type]);
    }
  });

  it('validate round-trips a correct answer for every type', () => {
    for (const type of LEGACY_TYPES) {
      const kind = getKind(type);
      const p = kind.generate(2);
      const raw = kind.family === 'fraction'
        ? { num: String(p.answer), denom: String(p.answerDenom) }
        : { num: String(p.answer) };
      expect(kind.validate(p, raw)).toBe('correct');
    }
  });

  it('getKind throws on unknown', () => {
    expect(() => getKind('nope')).toThrow();
  });

  it('typesForMode / allTypeKeys', () => {
    expect(allTypeKeys().sort()).toEqual([...LEGACY_TYPES].sort());
    expect(typesForMode('numbers').length).toBe(LEGACY_TYPES.length);
  });
});
