export type Mode = 'numbers';

export type Family = 'arithmetic' | 'fraction' | 'factor-hint' | 'notation' | 'equation';

export type TypeKey =
  | 'addition' | 'subtraction' | 'multiplication' | 'division'
  | 'gcd' | 'lcm' | 'power' | 'root'
  | 'fraction_addition' | 'fraction_subtraction' | 'fraction_multiplication' | 'fraction_division'
  | 'integer_addition' | 'integer_multiplication'
  | 'equation_simple' | 'exponent_basic' | 'square_root'
  | 'quadratic_vertex' | 'log_basic' | 'exp_neural';

export type AnswerState = 'pending' | 'correct' | 'incorrect';

export type RawInput = { num: string; denom?: string };

export interface Problem {
  id: string;
  family: Family;
  type: TypeKey;
  num1: number;
  num2: number;
  denom1?: number;
  denom2?: number;
  operator: string;
  answer: number;
  answerDenom?: number;
  digits: number;
  factors1?: number[];
  factors2?: number[];
  equationVar?: string;
  base?: number;
}

export interface ProblemKind {
  mode: Mode;
  family: Family;
  difficulty: { label: string; options: number[] } | null;
  weight: number;
  generate(level: number): Problem;
  check(problem: Problem, raw: RawInput): AnswerState;
  validate(problem: Problem, raw: RawInput): AnswerState;
  manualCommit?: boolean;
}

export interface CardProps {
  problem: Problem;
  digits: number;
  onSuccess(timeMs: number): void;
  onFailure(): void;
  onShowSolution?(): void;
  onHideSolution?(): void;
}

export interface SessionResult {
  name: string;
  score: number;
  type: TypeKey;
  digits: number;
  mode: Mode;
  level: string;
  solved: number;
  maxStreak: number;
  durationMs: number;
  date: string;
}
