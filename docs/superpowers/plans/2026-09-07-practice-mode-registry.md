# Practice Mode Registry — Implementation Plan (part 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the 20 existing numeric drills onto a problem-kind registry with a type-agnostic session shell, so shape / L4–L8 drills can later be added as plugins.

**Architecture:** A `src/lib/practice/` package holds `types.ts` (shared types), `registry.ts` (`PROBLEM_TYPES: Record<TypeKey, ProblemKind>`), 5 `families/*.tsx` modules (each a pure `generate` + a pure `check` + a React `Card`, extracted verbatim from today's `math-engine.ts` switch cases and `problem-card.tsx` layout branches), plus `scoring.ts`. The current `practice-view.tsx` is preserved almost entirely, renamed `session-runner.tsx`, and edited in 5 spots to consume the registry instead of `ProblemCard` + the local `difficultyCoefficients` map. A new nested route `/practice/[mode]/[type]` runs in parallel with the old flat route until the last task swaps the old route for a client redirect and deletes the dead files.

**Tech Stack:** Next.js 16.2.2 (App Router, `output: 'export'`), React 19, TypeScript 5, Tailwind v4, Framer Motion, Vitest (added by Task 1).

**Spec:** `docs/superpowers/specs/2026-09-07-practice-mode-registry-design.md` — read it alongside this plan. This plan implements spec sections 1–6 and 8–10. Spec section 7 (iframe embed) is deferred to **part 2**, written after this plan lands.

## Global Constraints

- Next.js is `16.2.2` with `output: 'export'` — no `redirects`/`rewrites`/`headers`; every dynamic route needs `generateStaticParams`; any component using `useSearchParams` must be under `<Suspense>`.
- `basePath` is `/Mathly` only when `NODE_ENV === 'production'` (see `next.config.ts`) — never hardcode it in links; always use root-relative paths.
- Dark mode: every visual class added or moved must carry its `dark:` variant (the app is fully dark-aware post-merge).
- i18n: user-facing strings come from `useLanguage()`'s `t` object; do not hardcode English in components. New keys go in both `en` and `ko` blocks of `src/lib/i18n/translations.ts`.
- Every task ends green on `npm run lint` **and** `npm run build` **and** `npm test`.
- `math-engine.ts` and `problem-card.tsx` stay untouched and importable until Task 14. Tasks 2–13 must not modify or delete them.
- TDD: write the failing test first for every pure function (`generate*`, `check*`, `scoreAnswer`, registry invariants).
- Commit after every task with the message shown in its final step.

---

## File structure

**Created:**

| Path | Responsibility |
|---|---|
| `vitest.config.ts` | Vitest config (node env, include `src/**/*.test.ts`) |
| `src/lib/practice/types.ts` | `Mode`, `Family`, `TypeKey`, `AnswerState`, `Problem`, `ProblemKind`, `SessionResult`, `CardProps` |
| `src/lib/practice/scoring.ts` | `scoreAnswer({ coeff, digits, timeMs, combo })` — the extracted score formula |
| `src/lib/practice/scoring.test.ts` | golden-value tests for `scoreAnswer` |
| `src/lib/practice/families/_math.ts` | `calculateGCD`, `simplify`, `getPrimeFactors`, `genSigned` (moved from `math-engine.ts`) |
| `src/lib/practice/families/_math.test.ts` | tests for the 4 helpers |
| `src/lib/practice/families/arithmetic.tsx` | `generateArithmetic`, `checkArithmetic`, `ArithmeticCard` |
| `src/lib/practice/families/fraction.tsx` | `generateFraction`, `checkFraction`, `FractionCard` |
| `src/lib/practice/families/factor-hint.tsx` | `generateFactorHint`, `checkFactorHint`, `FactorHintCard` |
| `src/lib/practice/families/notation.tsx` | `generateNotation`, `checkNotation`, `NotationCard` |
| `src/lib/practice/families/equation.tsx` | `generateEquation`, `checkEquation`, `EquationCard` |
| `src/lib/practice/families/*.test.ts` | per-family `generate` + `check` tests |
| `src/lib/practice/families/index.ts` | `FAMILY_CARDS: Record<Family, ComponentType<CardProps>>` |
| `src/lib/practice/registry.ts` | `PROBLEM_TYPES`, `getKind`, `typesForMode`, `allTypeKeys` |
| `src/lib/practice/registry.test.ts` | registry completeness / consistency tests |
| `src/app/practice/[mode]/[type]/page.tsx` | new nested route (server component) |

**Modified:**

| Path | Change |
|---|---|
| `package.json` | add `vitest` devDep + `"test"` script |
| `.github/workflows/ci.yml` | add a test step before build |
| `src/components/practice/practice-view.tsx` | renamed to `session-runner.tsx`; 5 edits (Task 10); a 3-line re-export shim left at the old path until Task 14 |
| `src/app/practice/[type]/page.tsx` | Task 13: becomes a client redirect to `/practice/[mode]/[type]` |
| `src/app/page.tsx`, `src/app/level/1/page.tsx`, `.../2/page.tsx`, `.../3/page.tsx` | Task 12: `href` → `/practice/${mode}/${type}` |

**Deleted (Task 14):** `src/lib/math-engine.ts`, `src/components/practice/problem-card.tsx`, `src/components/practice/practice-view.tsx` (the shim).

---

## How to extract a family Card (Tasks 4–8)

Each `*Card` is a **verbatim lift** of one or more prompt branches from the
current `src/components/practice/problem-card.tsx`, which stays untouched
until Task 14. For each Card task:

1. `git show HEAD:src/components/practice/problem-card.tsx > /tmp/pc.tsx`
   and open it for reference.
2. Copy the named prompt branch(es) (`isFraction ? (...)`, the
   `isVertical` block, etc.) **with every Tailwind class string intact** —
   they already carry `dark:` variants and responsive `sm:` prefixes.
3. Copy the shared answer `<input>` block (the `!isFraction && (...)`
   wrapper in `problem-card.tsx`) for the single-integer families; the
   `fraction` family uses its branch's own `Num`/`Den` inputs instead.
4. Copy the outer `motion.div` card container and the solution-overlay
   `AnimatePresence` block (the `showSolution` region) — those are shared
   by every Card. `showSolution` / `toggleSolution` / `handleNext` local
   state stays in the Card; `handleNext` is replaced by the
   `[problem.id]` reset effect shown in Task 4 Step 4.
5. Delete the old internal `handleCheck` — replace its body with a call to
   this family's `check*` function; keep the `mathlyAudio` calls and the
   `onSuccess(performance.now() - startRef.current)` / `onFailure()`
   callbacks exactly as they fire today.
6. Map the old `type`-derived flags to `problem.type`
   (`isFactorization = problem.type === 'gcd' || problem.type === 'lcm'`,
   etc.).

The skeleton in Task 4 Step 4 is the template; Tasks 5–8 differ only in
which branch(es) get pasted and which `check*` is called.

---

## Task 1: Vitest setup

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Create: `vitest.config.ts`
- Create: `src/lib/practice/_smoke.test.ts`

**Interfaces:**
- Produces: an `npm test` script that runs `vitest run` over `src/**/*.test.ts`.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^3`
Expected: `vitest` appears under `devDependencies` in `package.json`.

- [ ] **Step 2: Add the test script**

In `package.json` `"scripts"`, add after `"lint": "eslint"`:

```json
    "test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
});
```

- [ ] **Step 4: Write a smoke test**

Create `src/lib/practice/_smoke.test.ts`:

```ts
import { expect, test } from 'vitest';

test('vitest runs', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 5: Run the smoke test**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 6: Add the CI step**

In `.github/workflows/ci.yml`, in the `build` job's `steps`, insert between the "Lint Check" step and the "Build and Export" step:

```yaml
      - name: Unit Tests
        run: npm test
```

- [ ] **Step 7: Verify lint + build still pass**

Run: `npm run lint && npm run build`
Expected: both succeed. (`vitest.config.ts` is ignored by `eslint` via its default `*.config.ts` handling; if lint flags it, add `vitest.config.ts` to `globalIgnores([...])` in `eslint.config.mjs`.)

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .github/workflows/ci.yml src/lib/practice/_smoke.test.ts
git commit -m "chore: add Vitest for the practice-registry refactor"
```

---

## Task 2: `types.ts` + `families/_math.ts`

**Files:**
- Create: `src/lib/practice/types.ts`
- Create: `src/lib/practice/families/_math.ts`
- Create: `src/lib/practice/families/_math.test.ts`
- Delete: `src/lib/practice/_smoke.test.ts`

**Interfaces:**
- Produces:
  - `type Mode = 'numbers'`
  - `type Family = 'arithmetic' | 'fraction' | 'factor-hint' | 'notation' | 'equation'`
  - `type TypeKey` — string union of all 20 legacy type keys (list below)
  - `type AnswerState = 'pending' | 'correct' | 'incorrect'`
  - `interface Problem` — superset of today's `math-engine.ts` `Problem` plus `family: Family` (see code)
  - `interface ProblemKind { mode: Mode; family: Family; difficulty: { label: string; options: number[] } | null; weight: number; generate(level: number): Problem; check(problem: Problem, raw: RawInput): AnswerState; validate(problem: Problem, raw: RawInput): AnswerState; manualCommit?: boolean }`
  - `type RawInput = { num: string; denom?: string }`
  - `interface CardProps { problem: Problem; digits: number; onSuccess(timeMs: number): void; onFailure(): void; onShowSolution?(): void; onHideSolution?(): void }`
  - `interface SessionResult { name: string; score: number; type: TypeKey; digits: number; mode: Mode; level: string; solved: number; maxStreak: number; durationMs: number; date: string }` — defined here for **part 2** (embed `postMessage` payload); nothing in part 1 constructs it. The Task 10 persist effect writes a plain object literal, not a typed `SessionResult`.
  - `_math.ts`: `calculateGCD(a: number, b: number): number`, `simplify(num: number, denom: number): [number, number]`, `getPrimeFactors(n: number): number[]`, `genSigned(d: number): number`

- [ ] **Step 1: Write `src/lib/practice/types.ts`**

```ts
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
```

- [ ] **Step 2: Write the failing test for `_math.ts`**

Create `src/lib/practice/families/_math.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateGCD, simplify, getPrimeFactors, genSigned } from './_math';

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
  it('stays within +/- 10^d and is never zero', () => {
    for (let i = 0; i < 500; i++) {
      const v = genSigned(2);
      expect(Math.abs(v)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(v)).toBeLessThanOrEqual(99);
    }
  });
});
```

- [ ] **Step 3: Run it, verify failure**

Run: `npm test -- _math`
Expected: FAIL — `Cannot find module './_math'`.

- [ ] **Step 4: Write `src/lib/practice/families/_math.ts`**

Copy the four helper implementations **verbatim** from `src/lib/math-engine.ts` — `calculateGCD` (lines 29–31), `simplify` (33–36), `getPrimeFactors` (38–52), and the inner `genSigned` (74–77) — and `export` each:

```ts
export const calculateGCD = (a: number, b: number): number => {
  return b === 0 ? a : calculateGCD(b, a % b);
};

export const simplify = (num: number, denom: number): [number, number] => {
  const common = calculateGCD(Math.abs(num), Math.abs(denom));
  return [num / common, denom / common];
};

export const getPrimeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  let temp = Math.abs(n);
  while (temp >= d * d) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d++;
    }
  }
  if (temp > 1) factors.push(temp);
  return factors;
};

export const genSigned = (d: number): number => {
  const val = Math.floor(Math.random() * (Math.pow(10, d) - 1)) + 1;
  return Math.random() > 0.5 ? val : -val;
};
```

- [ ] **Step 5: Run the test, verify pass**

Run: `npm test -- _math`
Expected: PASS.

- [ ] **Step 6: Delete the smoke test**

```bash
git rm src/lib/practice/_smoke.test.ts
```

- [ ] **Step 7: Verify lint + build + full test**

Run: `npm run lint && npm run build && npm test`
Expected: all pass. `types.ts` has no runtime code so it will not appear in the build output; that is fine.

- [ ] **Step 8: Commit**

```bash
git add src/lib/practice/types.ts src/lib/practice/families/_math.ts src/lib/practice/families/_math.test.ts
git commit -m "feat: practice registry types + shared math helpers"
```

---

## Task 3: `scoring.ts`

**Files:**
- Create: `src/lib/practice/scoring.ts`
- Create: `src/lib/practice/scoring.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `scoreAnswer(args: { coeff: number; digits: number; timeMs: number; combo: number }): { points: number; nextCombo: number }` — the exact formula currently inlined in `practice-view.tsx` `handleSuccess` (lines 160–169).

- [ ] **Step 1: Write the failing test**

Create `src/lib/practice/scoring.test.ts`. The expected numbers below are computed from the current inline formula `Math.floor(1000*coeff*digits * clamp(1500/(timeMs+200),0.1,2) * (1 + nextCombo*0.2))`:

```ts
import { describe, expect, it } from 'vitest';
import { scoreAnswer } from './scoring';

describe('scoreAnswer', () => {
  it('matches the legacy formula for a fast first answer', () => {
    // coeff 1, digits 2, timeMs 800 -> speedFactor = 1500/1000 = 1.5, combo 0 -> nextCombo 1, mult 1.2
    // 1000*1*2 * 1.5 * 1.2 = 3600
    expect(scoreAnswer({ coeff: 1, digits: 2, timeMs: 800, combo: 0 })).toEqual({ points: 3600, nextCombo: 1 });
  });

  it('caps the speed factor at 2', () => {
    // timeMs 0 -> 1500/200 = 7.5 -> clamped to 2; coeff 4, digits 1, combo 0 -> nextCombo 1, mult 1.2
    // 1000*4*1 * 2 * 1.2 = 9600
    expect(scoreAnswer({ coeff: 4, digits: 1, timeMs: 0, combo: 0 })).toEqual({ points: 9600, nextCombo: 1 });
  });

  it('floors the speed factor at 0.1 and resets combo when slow', () => {
    // timeMs 100000 -> ~0.015 -> clamped to 0.1; timeMs >= 1500 so nextCombo 0, mult 1
    // 1000*1*1 * 0.1 * 1 = 100
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 100000, combo: 5 })).toEqual({ points: 100, nextCombo: 0 });
  });

  it('nextCombo flips exactly at timeMs === 1500', () => {
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 1499, combo: 2 }).nextCombo).toBe(3);
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 1500, combo: 2 }).nextCombo).toBe(0);
  });

  it('stacks the combo multiplier', () => {
    // coeff 1, digits 1, timeMs 500 -> speedFactor = 1500/700 ~= 2.142 -> clamped to 2; combo 3 -> nextCombo 4, mult 1.8
    // 1000*1*1 * 2 * 1.8 = 3600
    expect(scoreAnswer({ coeff: 1, digits: 1, timeMs: 500, combo: 3 })).toEqual({ points: 3600, nextCombo: 4 });
  });
});
```

- [ ] **Step 2: Run it, verify failure**

Run: `npm test -- scoring`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/practice/scoring.ts`**

```ts
export function scoreAnswer(
  { coeff, digits, timeMs, combo }: { coeff: number; digits: number; timeMs: number; combo: number },
): { points: number; nextCombo: number } {
  const baseDifficultyScore = 1000 * coeff * digits;
  const speedFactor = Math.min(2, Math.max(0.1, 1500 / (timeMs + 200)));
  const nextCombo = timeMs < 1500 ? combo + 1 : 0;
  const multiplier = 1 + nextCombo * 0.2;
  const points = Math.floor(baseDifficultyScore * speedFactor * multiplier);
  return { points, nextCombo };
}
```

- [ ] **Step 4: Run the test, verify pass**

Run: `npm test -- scoring`
Expected: PASS, 5 tests. If any expected value is off, recompute by hand from Step 3's formula and fix the **test** (the implementation is the source of truth — it is a verbatim copy of the current inline math).

- [ ] **Step 5: Verify lint + build + full test**

Run: `npm run lint && npm run build && npm test`

- [ ] **Step 6: Commit**

```bash
git add src/lib/practice/scoring.ts src/lib/practice/scoring.test.ts
git commit -m "feat: extract scoreAnswer from practice-view handleSuccess"
```

---

## Task 4: `families/arithmetic.tsx`

**Files:**
- Create: `src/lib/practice/families/arithmetic.tsx`
- Create: `src/lib/practice/families/arithmetic.test.ts`
- Reference (do not modify): `src/lib/math-engine.ts:80-99,152-163,208-217`, `src/components/practice/problem-card.tsx` (the `isVertical` branch and the default branch, plus `handleCheck` / `handleInputChange` / `handleCarryChange`)

**Interfaces:**
- Consumes: `Problem`, `RawInput`, `AnswerState`, `CardProps`, `Family` from `../types`; `genSigned` from `./_math`.
- Produces:
  - `generateArithmetic(type: TypeKey, level: number): Problem` — handles `addition`, `subtraction`, `multiplication`, `division`, `integer_addition`, `integer_multiplication`.
  - `checkArithmetic(problem: Problem, raw: RawInput): AnswerState`
  - `ArithmeticCard: React.FC<CardProps>`

- [ ] **Step 1: Write the failing test**

Create `src/lib/practice/families/arithmetic.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateArithmetic, checkArithmetic } from './arithmetic';

const TYPES = ['addition', 'subtraction', 'multiplication', 'division', 'integer_addition', 'integer_multiplication'] as const;

describe('generateArithmetic', () => {
  for (const type of TYPES) {
    for (const level of [1, 2, 3, 4]) {
      it(`${type} @ level ${level}: answer is correct and family is arithmetic`, () => {
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
  const p = generateArithmetic('addition', 1);
  it('pending until the typed length reaches the answer length', () => {
    const short = String(p.answer).slice(0, -1);
    expect(checkArithmetic(p, { num: short === '' ? '' : short })).toBe('pending');
  });
  it('correct on exact match', () => {
    expect(checkArithmetic(p, { num: String(p.answer) })).toBe('correct');
  });
  it('incorrect once a wrong answer reaches full length', () => {
    const wrong = String(p.answer + 1).padStart(String(p.answer).length, '9');
    expect(checkArithmetic(p, { num: wrong })).toBe('incorrect');
  });
  it('handles negative answers: pending while just "-", incorrect when over-long', () => {
    const neg = generateArithmetic('integer_addition', 1);
    // force a known negative
    const q = { ...neg, answer: -7 };
    expect(checkArithmetic(q, { num: '-' })).toBe('pending');
    expect(checkArithmetic(q, { num: '-7' })).toBe('correct');
    expect(checkArithmetic(q, { num: '-77' })).toBe('incorrect');
  });
});
```

- [ ] **Step 2: Run it, verify failure**

Run: `npm test -- arithmetic`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `generateArithmetic` + `checkArithmetic`**

`generateArithmetic` reuses the operand math from `math-engine.ts` for each case, then returns a `Problem` with `family: 'arithmetic'`. `getPrimeFactors` is **not** needed here (arithmetic Cards never show factors) — omit `factors1/2`.

```tsx
import type { AnswerState, CardProps, Problem, RawInput, TypeKey } from '../types';
import { genSigned } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateArithmetic(type: TypeKey, level: number): Problem {
  const min = Math.pow(10, Math.max(0, level - 1));
  const max = Math.pow(10, level) - 1;
  let num1 = rand(min, max);
  let num2 = rand(min, max);
  let operator = '';
  let answer = 0;

  switch (type) {
    case 'addition':
      operator = '+'; answer = num1 + num2; break;
    case 'subtraction':
      operator = '-';
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2; break;
    case 'multiplication':
      operator = '×';
      num2 = rand(1, Math.pow(10, Math.min(level, 2)) - 1);
      answer = num1 * num2; break;
    case 'division':
      operator = '÷';
      num2 = rand(2, 9);
      answer = rand(min, max);
      num1 = answer * num2; break;
    case 'integer_addition':
      num1 = genSigned(level); num2 = genSigned(level);
      operator = '+'; answer = num1 + num2; break;
    case 'integer_multiplication':
      num1 = genSigned(Math.min(level, 2)); num2 = genSigned(Math.min(level, 2));
      operator = '×'; answer = num1 * num2; break;
    default:
      throw new Error(`generateArithmetic: unsupported type ${type}`);
  }

  return { id: id(), family: 'arithmetic', type, num1, num2, operator, answer, digits: level };
}

export function checkArithmetic(problem: Problem, raw: RawInput): AnswerState {
  const s = raw.num;
  const n = parseInt(s, 10);
  if (n === problem.answer) return 'correct';
  const answerLen = String(problem.answer).length;
  if (!s.startsWith('-') && s.length >= answerLen) return 'incorrect';
  if (s.startsWith('-') && s.length > answerLen) return 'incorrect';
  return 'pending';
}
```

(The `checkArithmetic` body is the non-fraction branch of `problem-card.tsx` `handleCheck`, lines ~78–92, refactored to take `RawInput` and return `AnswerState` instead of calling `setStatus` / `onSuccess` / `onFailure`.)

- [ ] **Step 4: Write `ArithmeticCard` in the same file**

The Card is a straight extraction of `problem-card.tsx`'s `isVertical` branch (2+-digit add/sub, with carry boxes) and the default horizontal branch, plus the shared answer `<input>` and the `onShowSolution`/`onHideSolution` solution overlay. Copy those JSX blocks **verbatim with all class strings intact** (they already carry `dark:` variants). Replace the internal `generateProblem`/`handleNext` remount logic with: local state `userAnswer`, `carries`, `status`; on input change call `checkArithmetic`; on `'correct'` → `mathlyAudio?.playSuccess()` then `onSuccess(performance.now() - startRef.current)`; on `'incorrect'` → `mathlyAudio?.playError()` then `onFailure()`; the shell (Task 10) owns advancing to the next problem by changing `problem.id`, which resets this Card's state via a `useEffect(..., [problem.id])`.

Skeleton (fill the two JSX branches from `problem-card.tsx`):

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mathlyAudio } from '@/lib/audio';
import type { CardProps } from '../types';
import { checkArithmetic } from './arithmetic';

export function ArithmeticCard({ problem, digits, onSuccess, onFailure }: CardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [carries, setCarries] = useState<string[]>(() => new Array(String(problem.answer).length).fill(''));
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startRef.current = performance.now();
    setUserAnswer('');
    setCarries(new Array(String(problem.answer).length).fill(''));
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [problem.id, problem.answer]);

  const onChange = (value: string) => {
    if (!/^-?\d*$/.test(value)) return;
    setUserAnswer(value);
    const result = checkArithmetic(problem, { num: value });
    if (result === 'correct') {
      setStatus('correct');
      mathlyAudio?.playSuccess();
      onSuccess(performance.now() - startRef.current);
    } else if (result === 'incorrect') {
      setStatus('incorrect');
      mathlyAudio?.playError();
      onFailure();
    }
  };

  const isVertical = digits >= 2 && (problem.type === 'addition' || problem.type === 'subtraction');
  const maxLen = Math.max(String(problem.num1).length, String(problem.num2).length);
  const num1Str = String(problem.num1).padStart(maxLen, ' ');
  const num2Str = String(problem.num2).padStart(maxLen, ' ');

  // <<< PASTE: the `isVertical ? (...) : (...)` prompt JSX from problem-card.tsx,
  //     and the shared answer <input> block, verbatim with class strings.
  //     Wire the <input> onChange to `onChange(e.target.value)`,
  //     value={userAnswer}, ref={inputRef}, and the status-based classes.
  //     The carry-box <input>s use the local `carries` / setCarries as today.
  return null; // replace with the pasted markup wrapped in the motion.div card container
}
```

- [ ] **Step 5: Run the tests, verify pass**

Run: `npm test -- arithmetic`
Expected: PASS.

- [ ] **Step 6: Verify lint + build + full test**

Run: `npm run lint && npm run build && npm test`
Expected: all pass. The Card is not yet rendered anywhere; the build only type-checks it.

- [ ] **Step 7: Commit**

```bash
git add src/lib/practice/families/arithmetic.tsx src/lib/practice/families/arithmetic.test.ts
git commit -m "feat: arithmetic family (generate/check/Card)"
```

---

## Task 5: `families/fraction.tsx`

**Files:**
- Create: `src/lib/practice/families/fraction.tsx`
- Create: `src/lib/practice/families/fraction.test.ts`
- Reference: `src/lib/math-engine.ts:66-71,129-149`; `problem-card.tsx` `isFraction` branch + the fraction branch of `handleCheck` (lines ~65–76).

**Interfaces:**
- Consumes: `simplify` from `./_math`; `Problem`, `RawInput`, `AnswerState`, `CardProps` from `../types`.
- Produces:
  - `generateFraction(type: TypeKey, level: number): Problem` — `fraction_addition | fraction_subtraction | fraction_multiplication | fraction_division`. Sets `num1/denom1/num2/denom2/operator/answer/answerDenom`, `family: 'fraction'`.
  - `checkFraction(problem: Problem, raw: RawInput): AnswerState` — needs `raw.num` **and** `raw.denom`.
  - `FractionCard: React.FC<CardProps>`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { generateFraction, checkFraction } from './fraction';

const TYPES = ['fraction_addition', 'fraction_subtraction', 'fraction_multiplication', 'fraction_division'] as const;

describe('generateFraction', () => {
  for (const type of TYPES) {
    it(`${type}: answer is in lowest terms and mathematically correct`, () => {
      for (let i = 0; i < 300; i++) {
        const p = generateFraction(type, 1);
        expect(p.family).toBe('fraction');
        const g = gcd(Math.abs(p.answer), Math.abs(p.answerDenom!));
        expect(g).toBe(1); // simplified
        const lhs = value(p.num1!, p.denom1!, p.operator, p.num2!, p.denom2!, type);
        expect(Math.abs(lhs - p.answer / p.answerDenom!)).toBeLessThan(1e-9);
      }
    });
  }
});

describe('checkFraction', () => {
  const p = generateFraction('fraction_multiplication', 1);
  it('pending until both fields are full', () => {
    expect(checkFraction(p, { num: String(p.answer), denom: '' })).toBe('pending');
  });
  it('correct only when numerator and denominator both match', () => {
    expect(checkFraction(p, { num: String(p.answer), denom: String(p.answerDenom) })).toBe('correct');
  });
  it('incorrect once both fields reach their answer lengths but are wrong', () => {
    const badNum = String(p.answer + 1).padStart(String(p.answer).length, '9');
    const badDen = String(p.answerDenom! + 1).padStart(String(p.answerDenom).length, '9');
    expect(checkFraction(p, { num: badNum, denom: badDen })).toBe('incorrect');
  });
});

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function value(n1: number, d1: number, op: string, n2: number, d2: number, type: string): number {
  if (type === 'fraction_addition') return n1 / d1 + n2 / d2;
  if (type === 'fraction_subtraction') return n1 / d1 - n2 / d2;
  if (type === 'fraction_multiplication') return (n1 / d1) * (n2 / d2);
  return (n1 / d1) / (n2 / d2);
}
```

- [ ] **Step 2: Run it, verify failure** — `npm test -- fraction` → FAIL (module not found).

- [ ] **Step 3: Write `generateFraction`**

Port `math-engine.ts` lines 66–71 (`genFrac`) and 129–149 (the four `fraction_*` cases) verbatim, returning `family: 'fraction'`:

```tsx
import type { AnswerState, Problem, RawInput, TypeKey } from '../types';
import { simplify } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);
const genFrac = (): [number, number] => {
  const d = Math.floor(Math.random() * 8) + 2;
  const n = Math.floor(Math.random() * (d - 1)) + 1;
  return [n, d];
};

export function generateFraction(type: TypeKey, level: number): Problem {
  let [num1, denom1] = genFrac();
  let [num2, denom2] = genFrac();
  let operator = '';
  let answer = 0;
  let answerDenom = 1;

  switch (type) {
    case 'fraction_addition':
      operator = '+';
      [answer, answerDenom] = simplify(num1 * denom2 + num2 * denom1, denom1 * denom2);
      break;
    case 'fraction_subtraction':
      operator = '-';
      if (num1 / denom1 < num2 / denom2) { [num1, num2] = [num2, num1]; [denom1, denom2] = [denom2, denom1]; }
      [answer, answerDenom] = simplify(num1 * denom2 - num2 * denom1, denom1 * denom2);
      break;
    case 'fraction_multiplication':
      operator = '×';
      [answer, answerDenom] = simplify(num1 * num2, denom1 * denom2);
      break;
    case 'fraction_division':
      operator = '÷';
      [answer, answerDenom] = simplify(num1 * denom2, denom1 * num2);
      break;
    default:
      throw new Error(`generateFraction: unsupported type ${type}`);
  }

  return { id: id(), family: 'fraction', type, num1, num2, denom1, denom2, operator, answer, answerDenom, digits: level };
}

export function checkFraction(problem: Problem, raw: RawInput): AnswerState {
  const num = raw.num;
  const den = raw.denom ?? '';
  const n = parseInt(num, 10);
  const d = parseInt(den || '1', 10);
  const answerDenom = problem.answerDenom ?? 1;
  if (n === problem.answer && d === answerDenom) return 'correct';
  const numFull = num.length >= String(problem.answer).length;
  const denFull = den.length >= String(answerDenom).length;
  if (numFull && denFull) return 'incorrect';
  return 'pending';
}
```

(`checkFraction` = the `fraction_` branch of `problem-card.tsx` `handleCheck`, lines ~65–76, made pure.)

- [ ] **Step 4: Write `FractionCard`** — paste `problem-card.tsx`'s `isFraction` JSX branch verbatim (the stacked `a/b op c/d =` prompt plus the `Num`/`Den` inputs). Local state `userAnswer`, `userDenom`, `status`; both `onChange` handlers build `{ num, denom }` and call `checkFraction`; success/failure wiring identical to Task 4 Step 4. Reset on `[problem.id]`.

- [ ] **Step 5: Run tests** — `npm test -- fraction` → PASS.
- [ ] **Step 6: Verify** — `npm run lint && npm run build && npm test`.
- [ ] **Step 7: Commit**

```bash
git add src/lib/practice/families/fraction.tsx src/lib/practice/families/fraction.test.ts
git commit -m "feat: fraction family (generate/check/Card)"
```

---

## Task 6: `families/factor-hint.tsx`

**Files:**
- Create: `src/lib/practice/families/factor-hint.tsx`
- Create: `src/lib/practice/families/factor-hint.test.ts`
- Reference: `math-engine.ts:100-127,173-183`; `problem-card.tsx` — the `isFactorization`, `isPower`, `isRoot`, `isExponent`, `isSquareRoot` prompt branches, and the whole `showsPowerSteps || showsRootSteps` helper panel (incl. the `H` keydown effect, `showHelp` state, `rootGroups` / `rootChunk` computation).

**Interfaces:**
- Consumes: `calculateGCD`, `getPrimeFactors` from `./_math`.
- Produces:
  - `generateFactorHint(type: TypeKey, level: number): Problem` — `gcd`, `lcm`, `power`, `root`, `square_root`, `exponent_basic`. Sets `factors1` (and `factors2` for gcd/lcm) via `getPrimeFactors`; `family: 'factor-hint'`.
  - `checkFactorHint(problem, raw): AnswerState` — identical logic to `checkArithmetic` (integer compare + length heuristic). Re-export or duplicate; do **not** import from `arithmetic.tsx` to keep families independent — duplicate the ~6 lines.
  - `FactorHintCard: React.FC<CardProps>` — owns `showHelp` + the `H` keydown listener internally (this is the only family that renders the helper).

- [ ] **Step 1: Write the failing test**

```ts
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
          if (['power', 'root', 'square_root', 'exponent_basic'].includes(type)) {
            expect(p.factors1!.reduce((a, b) => a * b, 1)).toBe(type === 'root' || type === 'square_root' ? p.num1 : p.num1);
          }
        }
      });
    }
  }
});

describe('checkFactorHint', () => {
  it('behaves like an integer compare with the length heuristic', () => {
    const p = generateFactorHint('gcd', 2);
    expect(checkFactorHint(p, { num: String(p.answer) })).toBe('correct');
    expect(checkFactorHint(p, { num: '' })).toBe('pending');
  });
});
```

- [ ] **Step 2: Run it, verify failure.**

- [ ] **Step 3: Write `generateFactorHint` + `checkFactorHint`**

Port `math-engine.ts` cases: `gcd` (100–103), `lcm` (104–111), `power` (113–119), `root` (120–127), `exponent_basic` (173–178), `square_root` (179–183). After computing operands, set `factors1 = getPrimeFactors(num1)` and, for `gcd`/`lcm`, `factors2 = getPrimeFactors(num2)`. Return `family: 'factor-hint'`.

```tsx
import type { AnswerState, Problem, RawInput, TypeKey } from '../types';
import { calculateGCD, getPrimeFactors } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateFactorHint(type: TypeKey, level: number): Problem {
  const min = Math.pow(10, Math.max(0, level - 1));
  const max = Math.pow(10, level) - 1;
  let num1 = rand(min, max);
  let num2 = rand(min, max);
  let operator = '';
  let answer = 0;

  switch (type) {
    case 'gcd':
      operator = 'GCD'; answer = calculateGCD(num1, num2); break;
    case 'lcm': {
      operator = 'LCM';
      const lMin = Math.pow(10, Math.max(0, level - 2));
      const lMax = Math.max(lMin + 5, Math.pow(10, Math.max(1, level - 1)) * 3);
      num1 = rand(lMin, lMax);
      num2 = rand(lMin, lMax);
      answer = (num1 * num2) / calculateGCD(num1, num2);
      break;
    }
    case 'power':
      operator = '^';
      num2 = level === 1 && Math.random() < 0.5 ? 3 : 2;
      answer = Math.pow(num1, num2);
      break;
    case 'root':
      num2 = level === 1 && Math.random() < 0.5 ? 3 : 2;
      operator = num2 === 3 ? '∛' : '√';
      answer = rand(min, max);
      num1 = Math.pow(answer, num2);
      break;
    case 'exponent_basic':
      num1 = rand(2, 13);
      num2 = rand(2, 4);
      operator = '^';
      answer = Math.pow(num1, num2);
      break;
    case 'square_root':
      answer = rand(2, 21);
      num1 = answer * answer;
      operator = '√';
      break;
    default:
      throw new Error(`generateFactorHint: unsupported type ${type}`);
  }

  const problem: Problem = { id: id(), family: 'factor-hint', type, num1, num2, operator, answer, digits: level, factors1: getPrimeFactors(num1) };
  if (type === 'gcd' || type === 'lcm') problem.factors2 = getPrimeFactors(num2);
  return problem;
}

export function checkFactorHint(problem: Problem, raw: RawInput): AnswerState {
  const s = raw.num;
  const n = parseInt(s, 10);
  if (n === problem.answer) return 'correct';
  const answerLen = String(problem.answer).length;
  if (!s.startsWith('-') && s.length >= answerLen) return 'incorrect';
  if (s.startsWith('-') && s.length > answerLen) return 'incorrect';
  return 'pending';
}
```

> Note the original `math-engine.ts` `exponent_basic` used `Math.floor(Math.random()*12)+2` (2–13) and `Math.floor(Math.random()*3)+2` (2–4); `rand(2,13)` / `rand(2,4)` are equivalent. `square_root` used `Math.floor(Math.random()*20)+2` (2–21); `rand(2,21)` is equivalent.

- [ ] **Step 4: Write `FactorHintCard`** — paste, verbatim, from `problem-card.tsx`: the `isFactorization` prompt branch, the `isPower` / `isRoot` / `isExponent` / `isSquareRoot` prompt branches, the shared answer `<input>`, and the entire `showHelp` helper panel + its `H` `keydown` `useEffect` + `showHelp` state + `showsPowerSteps` / `showsRootSteps` / `rootChunk` / `rootGroups` derivations. Map the old flags to `problem.type`: `isFactorization = type === 'gcd' || type === 'lcm'`, etc. Reset `showHelp` to `false` in the `[problem.id]` effect. Success/failure wiring via `checkFactorHint` as in Task 4.

- [ ] **Step 5: Run tests** — `npm test -- factor-hint` → PASS.
- [ ] **Step 6: Verify** — `npm run lint && npm run build && npm test`.
- [ ] **Step 7: Commit**

```bash
git add src/lib/practice/families/factor-hint.tsx src/lib/practice/families/factor-hint.test.ts
git commit -m "feat: factor-hint family (generate/check/Card + H helper)"
```

---

## Task 7: `families/notation.tsx`

**Files:**
- Create: `src/lib/practice/families/notation.tsx`
- Create: `src/lib/practice/families/notation.test.ts`
- Reference: `math-engine.ts:193-205` (`log_basic`, `exp_neural`); `problem-card.tsx` `isLog` branch (and there is no dedicated `exp_neural` prompt branch today — it falls through `isExponent` since `isExponent = type === 'exponent_basic' || type === 'exp_neural'`; preserve that by giving `NotationCard` an `exp`-style prompt mirroring the `isExponent` branch).

**Interfaces:**
- Produces:
  - `generateNotation(type: TypeKey, level: number): Problem` — `log_basic`, `exp_neural`. Sets `base` for `log_basic` (matches the unused `Problem.base` field). `family: 'notation'`.
  - `checkNotation(problem, raw): AnswerState` — integer compare + length heuristic (duplicate the 6 lines).
  - `NotationCard: React.FC<CardProps>`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { generateNotation, checkNotation } from './notation';

describe('generateNotation', () => {
  it('log_basic: base**answer === num1, num2 === base', () => {
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
```

- [ ] **Step 2: Run it, verify failure.**

- [ ] **Step 3: Write `generateNotation` + `checkNotation`**

```tsx
import type { AnswerState, Problem, RawInput, TypeKey } from '../types';

const id = () => Math.random().toString(36).substring(2, 9);

export function generateNotation(type: TypeKey, level: number): Problem {
  let num1 = 0, num2 = 0, answer = 0, operator = '';
  let base: number | undefined;

  if (type === 'log_basic') {
    base = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
    answer = Math.floor(Math.random() * 3) + 1;
    num1 = Math.pow(base, answer);
    num2 = base;
    operator = 'log';
  } else if (type === 'exp_neural') {
    num1 = [2, 3][Math.floor(Math.random() * 2)];
    num2 = Math.floor(Math.random() * 5);
    answer = Math.pow(num1, num2);
    operator = 'exp';
  } else {
    throw new Error(`generateNotation: unsupported type ${type}`);
  }

  return { id: id(), family: 'notation', type, num1, num2, operator, answer, digits: level, base };
}

export function checkNotation(problem: Problem, raw: RawInput): AnswerState {
  const s = raw.num;
  const n = parseInt(s, 10);
  if (n === problem.answer) return 'correct';
  const answerLen = String(problem.answer).length;
  if (!s.startsWith('-') && s.length >= answerLen) return 'incorrect';
  if (s.startsWith('-') && s.length > answerLen) return 'incorrect';
  return 'pending';
}
```

- [ ] **Step 4: Write `NotationCard`** — paste the `isLog` prompt branch from `problem-card.tsx` verbatim; for `exp_neural`, render the `isExponent` prompt branch markup (superscript `num1` `num2`). Shared answer `<input>` + success/failure wiring as Task 4.

- [ ] **Step 5: Run tests** — `npm test -- notation` → PASS.
- [ ] **Step 6: Verify** — `npm run lint && npm run build && npm test`.
- [ ] **Step 7: Commit**

```bash
git add src/lib/practice/families/notation.tsx src/lib/practice/families/notation.test.ts
git commit -m "feat: notation family (log / exp)"
```

---

## Task 8: `families/equation.tsx`

**Files:**
- Create: `src/lib/practice/families/equation.tsx`
- Create: `src/lib/practice/families/equation.test.ts`
- Reference: `math-engine.ts:164-172,186-192` (`equation_simple`, `quadratic_vertex`); `problem-card.tsx` `isEquation` + `isQuadratic` branches.

**Interfaces:**
- Produces:
  - `generateEquation(type: TypeKey, level: number): Problem` — sets `equationVar: 'x'` for `equation_simple`; `family: 'equation'`.
  - `checkEquation(problem, raw): AnswerState` — integer compare + length heuristic (duplicate the 6 lines).
  - `EquationCard: React.FC<CardProps>`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { generateEquation, checkEquation } from './equation';

describe('generateEquation', () => {
  it('equation_simple: num1 == answer (+|-) num2 matches operator', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateEquation('equation_simple', 2);
      expect(p.family).toBe('equation');
      expect(p.equationVar).toBe('x');
      const solved = p.operator === '+' ? p.num1 - p.num2 : p.num1 + p.num2;
      expect(solved).toBe(p.answer);
      expect(p.num2).toBeGreaterThan(0);
    }
  });
  it('quadratic_vertex: num1 === answer (the vertex h), num2 in 1..10', () => {
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
    const p = { ...generateEquation('equation_simple', 1), answer: -4 };
    expect(checkEquation(p, { num: '-' })).toBe('pending');
    expect(checkEquation(p, { num: '-4' })).toBe('correct');
    expect(checkEquation(p, { num: '-44' })).toBe('incorrect');
  });
});
```

- [ ] **Step 2: Run it, verify failure.**

- [ ] **Step 3: Write `generateEquation` + `checkEquation`**

```tsx
import type { AnswerState, Problem, RawInput, TypeKey } from '../types';
import { genSigned } from './_math';

const id = () => Math.random().toString(36).substring(2, 9);

export function generateEquation(type: TypeKey, level: number): Problem {
  let num1 = 0, num2 = 0, answer = 0, operator = '';
  let equationVar: string | undefined;

  if (type === 'equation_simple') {
    answer = genSigned(level);
    num2 = Math.floor(Math.random() * (Math.pow(10, level) - 1)) + 1;
    const isAdd = Math.random() > 0.5;
    operator = isAdd ? '+' : '-';
    num1 = isAdd ? answer + num2 : answer - num2;
    equationVar = 'x';
  } else if (type === 'quadratic_vertex') {
    answer = genSigned(1);
    num1 = answer;
    num2 = Math.floor(Math.random() * 10) + 1;
    operator = 'min';
  } else {
    throw new Error(`generateEquation: unsupported type ${type}`);
  }

  return { id: id(), family: 'equation', type, num1, num2, operator, answer, digits: level, equationVar };
}

export function checkEquation(problem: Problem, raw: RawInput): AnswerState {
  const s = raw.num;
  const n = parseInt(s, 10);
  if (n === problem.answer) return 'correct';
  const answerLen = String(problem.answer).length;
  if (!s.startsWith('-') && s.length >= answerLen) return 'incorrect';
  if (s.startsWith('-') && s.length > answerLen) return 'incorrect';
  return 'pending';
}
```

- [ ] **Step 4: Write `EquationCard`** — paste the `isEquation` and `isQuadratic` prompt branches from `problem-card.tsx` verbatim (they reference `problem.equationVar`, `problem.operator`, `problem.num1`, `problem.num2` and `t.practiceInstructions.quadratic_vertex`). Shared answer `<input>` + wiring as Task 4.

- [ ] **Step 5: Run tests** — `npm test -- equation` → PASS.
- [ ] **Step 6: Verify** — `npm run lint && npm run build && npm test`.
- [ ] **Step 7: Commit**

```bash
git add src/lib/practice/families/equation.tsx src/lib/practice/families/equation.test.ts
git commit -m "feat: equation family (linear / quadratic vertex)"
```

---

## Task 9: `families/index.ts` + `registry.ts`

**Files:**
- Create: `src/lib/practice/families/index.ts`
- Create: `src/lib/practice/registry.ts`
- Create: `src/lib/practice/registry.test.ts`

**Interfaces:**
- Consumes: every family's `generate*` / `check*` / `*Card`; `types.ts`.
- Produces:
  - `FAMILY_CARDS: Record<Family, React.ComponentType<CardProps>>`
  - `PROBLEM_TYPES: Record<TypeKey, ProblemKind>`
  - `getKind(type: string): ProblemKind` — throws on unknown
  - `typesForMode(mode: Mode): TypeKey[]`
  - `allTypeKeys(): TypeKey[]`

- [ ] **Step 1: Write `families/index.ts`**

```ts
import type { ComponentType } from 'react';
import type { CardProps, Family } from '../types';
import { ArithmeticCard } from './arithmetic';
import { FractionCard } from './fraction';
import { FactorHintCard } from './factor-hint';
import { NotationCard } from './notation';
import { EquationCard } from './equation';

export const FAMILY_CARDS: Record<Family, ComponentType<CardProps>> = {
  arithmetic: ArithmeticCard,
  fraction: FractionCard,
  'factor-hint': FactorHintCard,
  notation: NotationCard,
  equation: EquationCard,
};
```

- [ ] **Step 2: Write the failing registry test**

Create `src/lib/practice/registry.test.ts`:

```ts
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
```

- [ ] **Step 3: Run it, verify failure** — `npm test -- registry` → FAIL (module not found).

- [ ] **Step 4: Write `registry.ts`**

```ts
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
    generate: (level) => generateArithmetic(type, level),
    check: checkArithmetic,
    validate: checkArithmetic,
  };
}
function fraction(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'fraction', difficulty: DIGITS_1_4, weight,
    generate: (level) => generateFraction(type, level),
    check: checkFraction,
    validate: checkFraction,
  };
}
function factorHint(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'factor-hint', difficulty: DIGITS_1_4, weight,
    generate: (level) => generateFactorHint(type, level),
    check: checkFactorHint,
    validate: checkFactorHint,
  };
}
function notation(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'notation', difficulty: null, weight,
    generate: (level) => generateNotation(type, level),
    check: checkNotation,
    validate: checkNotation,
  };
}
function equation(type: TypeKey, weight: number): ProblemKind {
  return {
    mode: 'numbers', family: 'equation', difficulty: DIGITS_1_4, weight,
    generate: (level) => generateEquation(type, level),
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
```

- [ ] **Step 5: Run the test, verify pass** — `npm test -- registry` → PASS. If "validate round-trips" fails for `fraction_subtraction` because `generate` swapped operands, that is expected behavior — the swap keeps the answer positive, so `String(p.answer)` still round-trips; investigate only if a specific type fails.

- [ ] **Step 6: Verify** — `npm run lint && npm run build && npm test`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/practice/families/index.ts src/lib/practice/registry.ts src/lib/practice/registry.test.ts
git commit -m "feat: practice type registry + FAMILY_CARDS map"
```

---

## Task 10: `SessionRunner` (rename + 5 edits)

**Files:**
- Rename: `src/components/practice/practice-view.tsx` → `src/components/practice/session-runner.tsx` (use `git mv`)
- Create: `src/components/practice/practice-view.tsx` — 3-line re-export shim
- Reference: spec §4 (amended); `src/lib/practice/registry.ts`, `src/lib/practice/scoring.ts`, `src/lib/practice/families/index.ts`

**Interfaces:**
- Consumes: `getKind`, `FAMILY_CARDS`, `scoreAnswer`, `Problem`, `SessionResult`.
- Produces: `SessionRunner` — default export of `session-runner.tsx`. Same props object as today plus it will still accept `{ params }` for now (route change is Task 11); keep the `use(params)` call until Task 11 swaps it.

- [ ] **Step 1: `git mv` the file**

```bash
git mv src/components/practice/practice-view.tsx src/components/practice/session-runner.tsx
```

- [ ] **Step 2: Rename the component + add the shim**

In `session-runner.tsx` rename `export default function PracticeView` → `export default function SessionRunner`.

Create `src/components/practice/practice-view.tsx`:

```tsx
// Compatibility shim — remove in Task 14 once the old route is gone.
export { default } from './session-runner';
```

- [ ] **Step 3: Run build to confirm the rename is clean**

Run: `npm run build`
Expected: PASS — `src/app/practice/[type]/page.tsx` still imports `@/components/practice/practice-view` and resolves through the shim.

- [ ] **Step 4: Edit 1 — replace the local `difficultyCoefficients` map with the registry**

In `session-runner.tsx`, delete the `difficultyCoefficients` object literal (currently lines ~38–57) and the line `const coeff = difficultyCoefficients[type as keyof typeof difficultyCoefficients] || 1;`. Replace with:

```tsx
import { getKind } from '@/lib/practice/registry';
// ...
const coeff = getKind(type).weight;
```

- [ ] **Step 5: Edit 2 — use `scoreAnswer` inside `handleSuccess`**

Add to the import block at the top of `session-runner.tsx`:

```tsx
import { scoreAnswer } from '@/lib/practice/scoring';
```

Then in `handleSuccess`, replace the inline block (currently lines ~160–171):

```tsx
    const baseDifficultyScore = 1000 * coeff * digits;
    const speedFactor = Math.min(2, Math.max(0.1, 1500 / (timeMs + 200)));
    const isFast = timeMs < 1500;
    const newCombo = isFast ? combo + 1 : 0;
    setCombo(newCombo);
    const multiplier = 1 + (newCombo * 0.2);
    const finalPoints = Math.floor(baseDifficultyScore * speedFactor * multiplier);
    setScore(s => s + finalPoints);
```

with:

```tsx
    const { points: finalPoints, nextCombo: newCombo } = scoreAnswer({ coeff, digits, timeMs, combo });
    setCombo(newCombo);
    setScore(s => s + finalPoints);
```

(Keep `setStreak`, `setSolved`, the `streak === 4` milestone, the `(solved + 1) % 10` milestone, the time-bonus block, `confetti`, `mathlyAudio?.playScale(streak)` — all unchanged. `isFast` is no longer referenced; delete its `const` line.)

- [ ] **Step 6: Edit 3 — render `FAMILY_CARDS[...]` instead of `<ProblemCard>`**

At the top of `session-runner.tsx`:

```tsx
import { FAMILY_CARDS } from '@/lib/practice/families';
import type { Problem } from '@/lib/practice/types';
```

Remove `import ProblemCard from '@/components/practice/problem-card';` and `import { OperationType } from '@/lib/math-engine';`.

Add problem state near the other `useState` calls:

```tsx
const kind = getKind(type);
const [problem, setProblem] = useState<Problem>(() => kind.generate(digits));
const advance = () => setProblem(kind.generate(digits));
```

Replace the JSX block (currently lines ~369–377):

```tsx
                  <ProblemCard
                    key={`${type}-${digits}`}
                    type={type as OperationType}
                    digits={digits}
                    onSuccess={handleSuccess}
                    onFailure={handleFailure}
                    onShowSolution={() => setIsPaused(true)}
                    onHideSolution={() => setIsPaused(false)}
                  />
```

with:

```tsx
                  {(() => {
                    const Card = FAMILY_CARDS[problem.family];
                    return (
                      <Card
                        key={problem.id}
                        problem={problem}
                        digits={digits}
                        onSuccess={(timeMs) => { handleSuccess(timeMs); setTimeout(advance, 1000); }}
                        onFailure={handleFailure}
                        onShowSolution={() => setIsPaused(true)}
                        onHideSolution={() => setIsPaused(false)}
                      />
                    );
                  })()}
```

> The old `ProblemCard` advanced itself 1s after a correct answer (`setTimeout(handleNext, 1000)`). That responsibility now lives here in the `onSuccess` wrapper. The family Cards from Tasks 4–8 do **not** self-advance.

- [ ] **Step 7: Edit 4 — reset the score-persist effect to write `mode` + `level`**

In the `useEffect` that writes `mathly-scores` (currently lines ~130–136), change the `newEntry` object to:

```tsx
      const newEntry = {
        name: userName, score, type, digits,
        mode: 'numbers' as const,
        level,
        date: new Date().toISOString(),
      };
```

(Leave the read-side `ScoreEntry` interface in this file as-is; add `mode?: string; level?: string;` as optional fields to it so TypeScript accepts the new shape.)

- [ ] **Step 8: Edit 5 — leave `use(params)` alone for now**

No change — Task 11 replaces the `{ params }` prop with explicit props. `SessionRunner` still does `const { type } = use(params);` at this point.

- [ ] **Step 9: Verify lint + build + test + manual smoke**

Run: `npm run lint && npm run build && npm test`
Expected: all pass.
Manual: `npm run dev`, open `http://localhost:3000/practice/addition?digits=2&time=30&user=Test` (old route, via the shim) — countdown runs, typing the answer advances after ~1s, timer ends → summary, and a row is written to `localStorage['mathly-scores']` with `mode: "numbers"`.

- [ ] **Step 10: Commit**

```bash
git add src/components/practice/session-runner.tsx src/components/practice/practice-view.tsx
git commit -m "refactor: SessionRunner consumes the practice registry"
```

---

## Task 11: New nested route `/practice/[mode]/[type]`

**Files:**
- Create: `src/app/practice/[mode]/[type]/page.tsx`
- Modify: `src/components/practice/session-runner.tsx` — swap the `{ params }` / `use(params)` prop for explicit props.

**Interfaces:**
- Consumes: `allTypeKeys`, `getKind` from the registry.
- Produces: static routes `/practice/numbers/<type>` for all 20 types.

- [ ] **Step 1: Change `SessionRunner`'s props**

In `session-runner.tsx`, replace:

```tsx
export default function SessionRunner({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  // ...
  const digits = parseInt(searchParams.get('digits') || '2');
  const initialTime = parseInt(searchParams.get('time') || '60');
  const userName = searchParams.get('user') || 'Anonymous';
  const level = searchParams.get('level') || '';
```

with:

```tsx
export default function SessionRunner({
  type, digits, initialTime, userName, level,
}: {
  type: string;
  digits: number;
  initialTime: number;
  userName: string;
  level: string;
}) {
  const router = useRouter();
```

Remove the now-unused `use` import and `useSearchParams` import if nothing else uses them (the file still uses `useRouter`).

- [ ] **Step 2: Update the shim + old route to pass props**

The old `src/app/practice/[type]/page.tsx` currently renders `<PracticeView params={params} />` inside `<Suspense>`. Change its `PracticeView` usage to parse params itself. Replace the file body with:

```tsx
import { Suspense } from 'react';
import LegacySessionRoute from './legacy-route';

export function generateStaticParams() {
  return [
    'addition','subtraction','multiplication','division','gcd','lcm','power','root',
    'fraction_addition','fraction_subtraction','fraction_multiplication','fraction_division',
    'integer_addition','integer_multiplication','equation_simple','exponent_basic','square_root',
    'quadratic_vertex','log_basic','exp_neural',
  ].map((type) => ({ type }));
}

export default function Page({ params }: { params: Promise<{ type: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LegacySessionRoute params={params} />
    </Suspense>
  );
}
```

Create `src/app/practice/[type]/legacy-route.tsx`:

```tsx
'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import SessionRunner from '@/components/practice/session-runner';

export default function LegacySessionRoute({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const sp = useSearchParams();
  return (
    <SessionRunner
      type={type}
      digits={parseInt(sp.get('digits') || '2')}
      initialTime={parseInt(sp.get('time') || '60')}
      userName={sp.get('user') || 'Anonymous'}
      level={sp.get('level') || ''}
    />
  );
}
```

(Delete the old `src/components/practice/practice-view.tsx` shim now — nothing imports it anymore. If `git grep practice-view` finds other importers, update them to `session-runner` first.)

- [ ] **Step 3: Create the new nested route**

`src/app/practice/[mode]/[type]/page.tsx`:

```tsx
import { Suspense } from 'react';
import { allTypeKeys, getKind } from '@/lib/practice/registry';
import NestedSessionRoute from './nested-route';

export function generateStaticParams() {
  return allTypeKeys().map((type) => ({ mode: getKind(type).mode, type }));
}

export default function Page({ params }: { params: Promise<{ mode: string; type: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <NestedSessionRoute params={params} />
    </Suspense>
  );
}
```

`src/app/practice/[mode]/[type]/nested-route.tsx`:

```tsx
'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import SessionRunner from '@/components/practice/session-runner';

export default function NestedSessionRoute({ params }: { params: Promise<{ mode: string; type: string }> }) {
  const { type } = use(params);
  const sp = useSearchParams();
  return (
    <SessionRunner
      type={type}
      digits={parseInt(sp.get('digits') || '2')}
      initialTime={parseInt(sp.get('time') || '60')}
      userName={sp.get('user') || 'Anonymous'}
      level={sp.get('level') || ''}
    />
  );
}
```

- [ ] **Step 4: Verify build emits both route trees**

Run: `npm run build`
Expected: PASS; output lists `/practice/[type]` (20 legacy paths) **and** `/practice/[mode]/[type]` (20 `numbers/*` paths).

- [ ] **Step 5: Manual smoke both routes**

`npm run dev`:
- `http://localhost:3000/practice/numbers/gcd?digits=2&time=30&user=T` — works, `H` toggles the helper.
- `http://localhost:3000/practice/addition?digits=2&time=30&user=T` — still works (legacy route, not yet a redirect).

- [ ] **Step 6: Run lint + test**

Run: `npm run lint && npm test`

- [ ] **Step 7: Commit**

```bash
git add src/app/practice src/components/practice/session-runner.tsx
git rm src/components/practice/practice-view.tsx
git commit -m "feat: nested /practice/[mode]/[type] route alongside the legacy route"
```

---

## Task 12: Point launcher + level pages at the nested route

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/level/1/page.tsx`, `src/app/level/2/page.tsx`, `src/app/level/3/page.tsx`

**Interfaces:**
- Consumes: `getKind` from the registry (to resolve `mode` for each `href`).

- [ ] **Step 1: `src/app/page.tsx`**

If `page.tsx` still has a `categories` array with `/practice/${cat.id}?...` links (the merged `LauncherPage` links to `/level/N` instead — check first with `git grep "practice/" src/app/page.tsx`). If any `/practice/${id}` link exists, change it to:

```tsx
import { getKind } from '@/lib/practice/registry';
// href:
`/practice/${getKind(cat.id).mode}/${cat.id}?digits=${digits}&time=${timeLimit}&user=${encodeURIComponent(userName)}`
```

If `page.tsx` has no `/practice/` links, skip this step (note it in the commit).

- [ ] **Step 2: `src/app/level/1/page.tsx`**

Change the `Link href` (currently line 50):

```tsx
href={`/practice/${cat.id}?level=1&digits=${digits}&time=${timeLimit}&user=${encodeURIComponent(userName)}`}
```

to:

```tsx
href={`/practice/${getKind(cat.id).mode}/${cat.id}?level=1&digits=${digits}&time=${timeLimit}&user=${encodeURIComponent(userName)}`}
```

Add `import { getKind } from '@/lib/practice/registry';` at the top.

- [ ] **Step 3: `src/app/level/2/page.tsx` and `.../3/page.tsx`** — identical change (their `href`s are at lines ~48 and ~43, with `level=2` / `level=3`).

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build && npm test`
Manual: `npm run dev`, from `/level/1` click a drill → URL is `/practice/numbers/<type>?level=1&...` and the session runs.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/level
git commit -m "feat: launcher + level pages link to /practice/[mode]/[type]"
```

---

## Task 13: Legacy route → client redirect

**Files:**
- Modify: `src/app/practice/[type]/page.tsx`
- Replace: `src/app/practice/[type]/legacy-route.tsx` (redirect instead of rendering a session)

**Interfaces:**
- Consumes: `PROBLEM_TYPES` from the registry.

- [ ] **Step 1: Write the redirect component**

Replace `src/app/practice/[type]/legacy-route.tsx` with:

```tsx
'use client';
import { use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PROBLEM_TYPES } from '@/lib/practice/registry';
import type { TypeKey } from '@/lib/practice/types';

export default function LegacyRedirect({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const kind = PROBLEM_TYPES[type as TypeKey];
    const qs = sp.toString();
    router.replace(kind ? `/practice/${kind.mode}/${type}${qs ? `?${qs}` : ''}` : '/');
  }, [type, sp, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-2xl font-bold text-gray-400 dark:text-gray-600 animate-pulse">Loading…</div>
    </div>
  );
}
```

- [ ] **Step 2: Point the page at it**

In `src/app/practice/[type]/page.tsx` change the import and the rendered component name from `LegacySessionRoute` to `LegacyRedirect` (keep `generateStaticParams` — the 20 legacy paths still need static stubs to host the redirect).

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build && npm test`
Manual: `npm run dev`, open `http://localhost:3000/practice/gcd?digits=3&time=30&user=T` → URL becomes `/practice/numbers/gcd?digits=3&time=30&user=T` and the session loads. Open `http://localhost:3000/practice/bogus` → redirects to `/`.

- [ ] **Step 4: Commit**

```bash
git add src/app/practice/[type]
git commit -m "feat: legacy /practice/[type] client-redirects to the nested route"
```

---

## Task 14: Delete dead code

**Files:**
- Delete: `src/lib/math-engine.ts`
- Delete: `src/components/practice/problem-card.tsx`
- Check: `src/components/practice/concept-card.tsx` and anything else that imported either.

**Interfaces:** none produced; this task only removes.

- [ ] **Step 1: Find remaining importers**

Run: `git grep -n "math-engine\|problem-card\|practice-view"`
Expected: only `session-runner.tsx` may still import `OperationType` from `math-engine` for a stray type annotation — if so, replace it with `string` or `TypeKey` from `@/lib/practice/types`. `concept-card.tsx` imports nothing from these (it takes a `type: string` prop) — confirm.

- [ ] **Step 2: Delete**

```bash
git rm src/lib/math-engine.ts src/components/practice/problem-card.tsx
```

- [ ] **Step 3: Verify everything**

Run: `npm run lint && npm run build && npm test`
Expected: all pass, no unresolved imports. Build output shows `/`, `/_not-found`, `/level/1..3`, `/practice/[type]` (20 redirect stubs), `/practice/[mode]/[type]` (20 sessions).

- [ ] **Step 4: Full manual regression (spec §9 checklist)**

`npm run dev`:
1. `/practice/numbers/addition` — countdown, solve, auto-advance, timer end, summary, score row written with `mode: "numbers"`.
2. `/practice/addition` — redirects to `/practice/numbers/addition`, query preserved.
3. `/practice/numbers/gcd` — `H` helper toggles.
4. `/practice/numbers/power`, `/practice/numbers/square_root` — grouped-pairs helper renders.
5. `/practice/numbers/fraction_addition` — dual input, both-parts validation, `Num`/`Den` placeholders.
6. `/practice/numbers/integer_addition` — negative answers accepted; `-` alone is `pending`.
7. `/practice/numbers/equation_simple`, `/practice/numbers/quadratic_vertex`, `/practice/numbers/log_basic` — prompts render, answers validate.
8. Booster mode still triggers at streak 5; Rival Bot bar animates; Ghost bar shows when a personal best exists.
9. `ConceptCard` still pre-rolls for types that have a `t.concepts[type]` object.
10. Dark theme correct on every card.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: delete math-engine.ts and problem-card.tsx (superseded by the registry)"
```

- [ ] **Step 6: Push**

```bash
git push origin main
```

---

## Self-review notes (author)

- **Spec §1–3 (registry, contract):** Tasks 2, 9. `CardProps` in Task 2 matches the amended spec §3 (keeps `onSuccess(timeMs)`/`onFailure`/`onShow/HideSolution`).
- **Spec §4 (SessionRunner, amended):** Task 10 — 5 edits, all mechanics preserved. Task 11 finishes the props change.
- **Spec §5 (families + engine split):** Tasks 4–8, one per family; `_math.ts` in Task 2. All 20 types mapped; each family test asserts the invariants named in §9.
- **Spec §6 (routing / redirect):** Tasks 11 (nested route), 12 (link flip), 13 (client redirect — no `redirects` config, matches the `output: 'export'` constraint).
- **Spec §8 (scoring):** Task 3 (`scoreAnswer`) + Task 10 edits 1–2 (`coeff` from `getKind(type).weight`, formula unchanged). Task 9 asserts weights equal the old `difficultyCoefficients`.
- **Spec §9 (testing):** Task 1 (Vitest + CI), per-task tests, Task 14 Step 4 runs the full manual checklist.
- **Spec §10 (migration order):** Tasks 2→14 follow it; `math-engine.ts` / `problem-card.tsx` untouched until Task 14.
- **Spec §7 (embed):** intentionally **not** in this plan — part 2.
- **Type consistency:** `check*` (families) vs `validate` (registry delegates to the same fn); `weight: number` everywhere (Task 2, 9, 10); `RawInput = { num; denom? }` used by every `check*` and the Cards.
- **Known quirk preserved:** `Problem.base` is set by `generateNotation` for `log_basic` but the current UI never reads it — kept for parity, not wired to anything.
