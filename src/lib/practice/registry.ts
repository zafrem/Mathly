import type { Mode, ProblemKind, TypeKey } from './types';
import { generateArithmetic, checkArithmetic } from './families/arithmetic';
import { generateFraction, checkFraction } from './families/fraction';
import { generateFactorHint, checkFactorHint } from './families/factor-hint';
import { generateNotation, checkNotation } from './families/notation';
import { generateEquation, checkEquation } from './families/equation';

const DIGITS_1_4 = { label: 'Digits', options: [1, 2, 3, 4] };

function arithmetic(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'arithmetic', difficulty: DIGITS_1_4, weight,
    generate: (level: number) => generateArithmetic(type, level),
    check: checkArithmetic,
    validate: checkArithmetic,
  };
}
function fraction(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'fraction', difficulty: DIGITS_1_4, weight,
    generate: (level: number) => generateFraction(type, level),
    check: checkFraction,
    validate: checkFraction,
  };
}
function factorHint(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'factor-hint', difficulty: DIGITS_1_4, weight,
    generate: (level: number) => generateFactorHint(type, level),
    check: checkFactorHint,
    validate: checkFactorHint,
  };
}
function notation(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'notation', difficulty: null, weight,
    generate: (level: number) => generateNotation(type, level),
    check: checkNotation,
    validate: checkNotation,
  };
}
function equation(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'equation', difficulty: DIGITS_1_4, weight,
    generate: (level: number) => generateEquation(type, level),
    check: checkEquation,
    validate: checkEquation,
  };
}

export const PROBLEM_TYPES: Record<TypeKey, ProblemKind> = {
  addition: arithmetic('addition', 1),
  subtraction: arithmetic('subtraction', 1.2),
  multiplication: arithmetic('multiplication', 2.5),
  division: arithmetic('division', 2),
  integer_addition: arithmetic('integer_addition', 1.5),
  integer_multiplication: arithmetic('integer_multiplication', 2),

  fraction_addition: fraction('fraction_addition', 5),
  fraction_subtraction: fraction('fraction_subtraction', 5),
  fraction_multiplication: fraction('fraction_multiplication', 4),
  fraction_division: fraction('fraction_division', 4),

  gcd: factorHint('gcd', 4),
  lcm: factorHint('lcm', 4),
  power: factorHint('power', 2.5),
  root: factorHint('root', 2.5),
  square_root: factorHint('square_root', 2.5),
  exponent_basic: factorHint('exponent_basic', 2.5),

  log_basic: notation('log_basic', 3),
  exp_neural: notation('exp_neural', 3),

  equation_simple: equation('equation_simple', 3),
  quadratic_vertex: equation('quadratic_vertex', 3),
};

export function getKind(type: string): ProblemKind {
  const kind = PROBLEM_TYPES[type as TypeKey];
  if (!kind) throw new Error(`Unknown practice type: ${type}`);
  return kind;
}

export function allTypeKeys(): TypeKey[] {
  return Object.keys(PROBLEM_TYPES) as TypeKey[];
}

export function typesForMode(mode: Mode): TypeKey[] {
  return allTypeKeys().filter((t) => PROBLEM_TYPES[t].mode === mode);
}
