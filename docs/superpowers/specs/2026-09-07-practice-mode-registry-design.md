# Practice mode registry — design

**Date:** 2026-09-07
**Status:** proposed
**Scope:** architecture only. Refactor the existing numeric drills onto a
problem-kind registry so a future "shapes" section (and the locked L4–L8
levels) can be added as plugins without reworking the session shell. **No
new drill content ships with this work.**

---

## 1. Problem statement

`src/components/practice/problem-card.tsx` is a single component with ~12
layout branches in one nested ternary plus a `handleCheck` that hard-codes
integer/fraction validation. Every new drill type widens that ternary.
Non-numeric drills (geometry, matrices, graph reading — the `type:
"concept" | "visual"` levels already described in `translations.ts`) cannot
fit it: they need different input widgets and different answer validation.

Separately, a practice session must become embeddable in an `<iframe>` on a
third-party page (e.g. an LMS), reporting results back to the host.

## 2. Decisions taken during brainstorming

| # | Decision |
|---|---|
| Scope | Architecture only. Migrate current numeric drills; no new content. |
| Granularity | Full problem-kind registry — every drill is a plugin behind one interface. |
| Interaction | Soft default: the shell owns the frictionless commit/react loop; a kind may opt into an explicit "Check" button (`manualCommit`). |
| Routing | Nested `/practice/[mode]/[type]`. Old `/practice/[type]` becomes a client redirect (`redirects` config is unavailable under `output: 'export'`). `mathly-scores` rows gain a `mode` field. |
| Numeric refactor | Group the 20 existing types into 5 families by input/layout shape. |
| Embed | `?embed=1` chromeless render, two-way `postMessage`, **no** `localStorage` in embed mode — the parent owns all state. |
| Difficulty | Keep the `?digits=` param as the difficulty knob; `?level=` stays the curriculum tier. |
| Scoring | Keep today's formula; `weight` (kind-supplied) replaces `digits`. One shared leaderboard. |
| Testing | Introduce Vitest for the pure layer; shell/route/postMessage stay on manual + build gate. |

## 3. Module layout

New directory `src/lib/practice/`:

| File | Responsibility |
|---|---|
| `types.ts` | `Mode`, `TypeKey`, `Family`, `Problem` (one interface, discriminated by `family`), `ProblemKind`, `AnswerState`, `SessionResult`, `CardProps` |
| `registry.ts` | `PROBLEM_TYPES: Record<TypeKey, ProblemKind>`; helpers `getKind(type)`, `typesForMode(mode)`, `allTypeKeys()` |
| `families/_math.ts` | shared numeric helpers: `getPrimeFactors`, `calculateGCD`, `simplify`, `genSigned` |
| `families/arithmetic.tsx` | `generateArithmetic(type, level)`, `ArithmeticCard`, `validateArithmetic` |
| `families/fraction.tsx` | `generateFraction`, `FractionCard`, `validateFraction` |
| `families/factor-hint.tsx` | `generateFactorHint`, `FactorHintCard`, `validateFactorHint` |
| `families/notation.tsx` | `generateNotation`, `NotationCard`, `validateNotation` |
| `families/equation.tsx` | `generateEquation`, `EquationCard`, `validateEquation` |
| `families/index.ts` | `FAMILY_CARDS: Record<Family, React.ComponentType<CardProps>>` |
| `scoring.ts` | `scoreAnswer({ timeMs, weight }): number` |
| `embed.ts` | `parseEmbedConfig(searchParams)`, `emit(event, payload, parentOrigin)` |

`src/lib/math-engine.ts` is **deleted** at the end of migration.

### Contract

```ts
type Mode = 'numbers'; // 'shapes' etc. added later
type Family = 'arithmetic' | 'fraction' | 'factor-hint' | 'notation' | 'equation';
type AnswerState = 'pending' | 'correct' | 'incorrect';

interface Problem {
  id: string;
  family: Family;
  type: TypeKey;
  // numeric payload — all optional, populated per family
  num1?: number; num2?: number;
  denom1?: number; denom2?: number;
  operator?: string;
  answer: number;
  answerDenom?: number;
  factors1?: number[]; factors2?: number[];
  equationVar?: string;
  level: number;
}

interface ProblemKind {
  mode: Mode;
  difficulty: { label: string; options: number[] } | null; // null → hide the selector
  generate(level: number): Problem;                          // stamps problem.family
  validate(problem: Problem, raw: unknown): AnswerState;     // delegates to the family `check`
  weight: number;                                            // per-type difficulty coefficient (old `difficultyCoefficients[type]`)
  manualCommit?: boolean;                                    // opt-in Check button (unused this phase)
}

interface CardProps {
  problem: Problem;
  digits: number;
  onSuccess(timeMs: number): void;   // kept verbatim from today's ProblemCard
  onFailure(): void;
  onShowSolution?(): void;
  onHideSolution?(): void;
}
```

**Card contract note (amended).** The 5 numeric family Cards are
near-verbatim extractions of the current `ProblemCard` layout branches.
Each keeps its own input handling, its own answer timing, and the existing
`onSuccess(timeMs)` / `onFailure` / `onShowSolution` / `onHideSolution`
callbacks — the shell passes these straight through. `FactorHintCard`
keeps the `H`-key helper state internally (it is the only consumer).
`ProblemKind.validate` and the per-family pure `check(problem, raw)`
helper still exist — the Cards call `check` internally, and it is the unit
under test — but the shell does **not** drive a `validate`/`onInput` loop
for numeric kinds. `manualCommit` / a shell-driven loop is reserved for
future shell-owned kinds (shapes).

Registry entries deduplicate by sharing family functions with a params
slice, e.g. `addition` and `multiplication` both use `generateArithmetic` /
`checkArithmetic` with a different operator.

The Card is **not** on `ProblemKind`. `generate` stamps `problem.family`,
and `SessionRunner` renders `FAMILY_CARDS[problem.family]`. A type whose
layout changes with level (2+-digit add/sub → carry columns) is expressed
by `generate` returning a different `family` at generation time.

## 4. Session shell — `SessionRunner` (amended)

`src/components/practice/practice-view.tsx` → `session-runner.tsx` (a
re-export shim keeps `practice-view` importable until migration step 5).

**The entire current 386-line `practice-view.tsx` is preserved as-is**,
including every mechanic that is already type-agnostic:

- 3→0 countdown, timer effect, streak / score / solved HUD, milestone
  confetti, the "Sprint Over" summary screen.
- **Rival Bot** (`botScore` ticks by `coeff` + `digits`; "beat the bot" on
  the summary).
- **Ghost pace bar** (progress vs. personal best, read from `mathly-scores`
  filtered by `type` + `digits`).
- **Booster mode** (streak ≥ 5 → slower timer, altered scoring/visuals).
- **Combo multiplier** (consecutive sub-1.5 s answers stack a score
  multiplier).
- **`ConceptCard` pre-roll** (`showConcept` when `t.concepts[type]` is an
  object; blocks the countdown until dismissed).
- **Time bonus** on correct answers; **pause** while a solution is shown.
- The full scoring formula in `handleSuccess`
  (`1000 * coeff * digits * speedFactor * comboMultiplier`) — unchanged.

**The only changes to this file:**

1. `type` (a `string`) still comes in, but as a prop, not from
   `use(params)` — `searchParams` parsing moves to the route page (§6) and
   the values arrive as props: `{ type, digits, timeLimit, level, user,
   embed, parentOrigin?, autostart?, persist }`.
2. `coeff` is no longer read from the local `difficultyCoefficients` map —
   it is `getKind(type).weight` (a constant); the local map is deleted.
   See §8.
3. `<ProblemCard type={type as OperationType} digits onSuccess onFailure
   onShowSolution onHideSolution />` becomes
   `const Card = FAMILY_CARDS[getKind(type).family];
   <Card problem={problem} digits onSuccess onFailure onShowSolution
   onHideSolution />`, where `problem = getKind(type).generate(digits)`
   is regenerated per advance (replacing the `key={\`${type}-${digits}\`}`
   remount trick with an explicit `problem.id` key).
4. The score-persist effect and the finished-state `emit(...)` calls go
   through the injected `persist` prop and `embed.ts#emit` (§5, §7); the
   direct `localStorage.setItem('mathly-scores', …)` is removed from the
   component.
5. `embed` prop: when true, hide the header back-arrow and the summary
   "Back to Selection" button, drop the outer wrapper padding, and (if
   `autostart === false`) hold at countdown for `mathly:start`.

`ConceptCard`, `useLanguage`, `useTheme`, `mathlyAudio`, all HUD markup,
Bot/Ghost/Booster/Combo state and effects — **untouched**.

## 5. Families & engine split

| `family` | Card renders | Input | Types |
|---|---|---|---|
| `arithmetic` | `a op b =` horizontal; stacked carry columns when `level ≥ 2` for + / − | 1 int | addition, subtraction, multiplication, division, integer_addition, integer_multiplication |
| `fraction` | stacked `a/b op c/d =` | 2 int (num, denom) | fraction_addition, fraction_subtraction, fraction_multiplication, fraction_division |
| `factor-hint` | prompt + factor/expansion helper (`H` toggle): two-operand chips for gcd/lcm, grouped-pairs for the rest | 1 int | gcd, lcm, power, root, square_root, exponent_basic |
| `notation` | `log_b n =`, neural `exp` prompt | 1 int | log_basic, exp_neural |
| `equation` | `x op a = b`, `f(x) = (x − h)² + k` | 1 int | equation_simple, quadratic_vertex |

6 + 4 + 6 + 2 + 2 = 20 types.

`math-engine.ts`'s `switch` body is redistributed verbatim into each
family's `generate(type, level)` (pure functions). `getPrimeFactors`,
`calculateGCD`, `simplify`, `genSigned` move to `families/_math.ts`.
`Problem` keeps one interface; family-specific fields stay optional.

Each family module also exports a pure `check(problem, raw): AnswerState`
(and `ProblemKind.validate` delegates to it). The **Card** calls `check`
internally on each input change — this is the exact logic lifted out of
today's `ProblemCard.handleCheck`:
- `arithmetic`, `notation`, `equation`, `factor-hint`: parse int, compare
  to `problem.answer`; `'incorrect'` once the typed length reaches the
  answer length (with the merged negative-answer handling:
  `!raw.startsWith('-')` for the fast path, and the extra branch for
  over-long negative input); else `'pending'`.
- `fraction`: parse both fields; `'correct'` when numerator ===
  `problem.answer` **and** denominator === `problem.answerDenom || 1`;
  `'incorrect'` once both fields reach their answer lengths; else
  `'pending'`.
- On `'correct'` the Card plays the sound and calls
  `onSuccess(performance.now() - startTime)`; on `'incorrect'`,
  `onFailure()`. (Identical to today.)
- No family sets `manualCommit` this phase.

## 6. Routing, static params, old-URL compatibility

**New route** `src/app/practice/[mode]/[type]/page.tsx` (server component):

```ts
export function generateStaticParams() {
  return allTypeKeys().map((t) => ({ mode: getKind(t).mode, type: t }));
}
```

Reads `params` + `searchParams` (`digits`, `time`, `level`, `user`,
`embed`, `parentOrigin`, `autostart`), renders
`<Suspense><SessionRunner …/></Suspense>` (Suspense still required for
`useSearchParams`). Build emits `/practice/numbers/<type>` for every
current type.

**Legacy redirect** — `src/app/practice/[type]/page.tsx` stays but becomes
a client component:

```tsx
'use client';
// generateStaticParams() → the legacy flat type keys
export default function LegacyRedirect() {
  const { type } = useParams();
  const sp = useSearchParams();
  useEffect(() => {
    const kind = PROBLEM_TYPES[type as string];
    router.replace(kind ? `/practice/${kind.mode}/${type}?${sp}` : '/');
  }, [type, sp]);
  return <LoadingCard />;
}
```

Query string is preserved; unknown legacy type → home.

**Launcher & level pages:** `src/app/page.tsx`, `src/app/level/1..3/page.tsx`
switch their `href`s from `/practice/${id}?…` to
`/practice/${mode}/${id}?…`. No structural change to those pages in this
phase.

**`mathly-scores` rows:** add `mode` and `level`. Readers treat a row with
no `mode` as `mode: 'numbers'`.

## 7. Embed mode & `postMessage` protocol

**Activation:** `?embed=1`. `embed.ts#parseEmbedConfig` →
`{ embed, parentOrigin?, autostart? }`.

**Chromeless:** when `embed`, the route wrapper drops outer
padding/background, `SessionRunner` hides the header back-arrow, and the
summary screen hides "Back to Home" (keeps "Try Again"). `layout.tsx`
untouched.

**Config in (parent → iframe), all optional:**

```
{ type: 'mathly:configure', payload: { user?: string, timeLimit?: number, level?: number } }
```

The drill stays in the URL. If `autostart=0`, the runner waits at
countdown for `{ type: 'mathly:start' }`. A `configure` arriving after
start is ignored.

**Events out (iframe → parent):**

| Event | Payload |
|---|---|
| `mathly:ready` | `{ type, mode, level, timeLimit }` |
| `mathly:answer` | `{ result: 'correct' \| 'incorrect', solved, streak, elapsedMs }` |
| `mathly:session-complete` | `SessionResult` = `{ type, mode, level, score, solved, maxStreak, durationMs }` |
| `mathly:resize` | `{ height }` — on mount + `ResizeObserver` on the card root |

**Target origin:** posted to `parentOrigin` when `?parentOrigin=<url>` is
present, else `'*'`. Framing itself cannot be restricted while hosted on
GitHub Pages (`headers` unavailable under `output: 'export'`) — documented
limitation; acceptable for score data.

**No persistence in embed:** the route passes `persist = () => {}`.
`mathly-user` is never read or written; the name-gate is skipped (`user`
from `configure`, else `'guest'`).

## 8. Difficulty & scoring

**Difficulty:** `?digits=` (1–4) remains the difficulty knob;
`SessionRunner` passes it to `kind.generate(digits)`.
`ProblemKind.difficulty` describes the selector for a page that renders one
(`arithmetic` → `{ label: 'Digits', options: [1,2,3,4] }`; others → own
tiers or `null`). This phase: each level page keeps its single shared digit
selector, clamped to the intersection of its listed types'
`difficulty.options` (`null` types are excluded from the intersection and
ignore the value). All 20 current numeric types use `[1,2,3,4]`, so the
shared selector is unchanged in practice; per-row selectors are deferred.
`?level=` (curriculum tier) is passed through and recorded, not fed to
`generate`.

**Scoring (amended — matches the merged shell).** The live formula stays
in `SessionRunner.handleSuccess` **exactly as written today**:

```ts
const baseDifficultyScore = 1000 * coeff * digits;
const speedFactor = Math.min(2, Math.max(0.1, 1500 / (timeMs + 200)));
const isFast = timeMs < 1500;
const newCombo = isFast ? combo + 1 : 0;
const multiplier = 1 + newCombo * 0.2;
const finalPoints = Math.floor(baseDifficultyScore * speedFactor * multiplier);
```

The **only** change is the source of `coeff`. Today it comes from a local
`difficultyCoefficients: Record<string, number>` map in `practice-view.tsx`
(`addition: 1`, `subtraction: 1.2`, `multiplication: 2.5`, `division: 2`,
`gcd: 4`, `lcm: 4`, `fraction_addition: 5`, `fraction_subtraction: 5`,
`fraction_multiplication: 4`, `fraction_division: 4`,
`integer_addition: 1.5`, `integer_multiplication: 2`, `equation_simple: 3`,
`exponent_basic: 2.5`, `square_root: 2.5`, `quadratic_vertex: 3`,
`log_basic: 3`, `exp_neural: 3`; default `1`). Plus `power`, `root` (added
this session, currently defaulting to `1`) — assign both `2.5` to match
`exponent_basic`/`square_root`.

`ProblemKind.weight: number` carries that per-type coefficient (a constant,
not a function — no `problem`/`digits` args). The shell does
`const coeff = getKind(type).weight;`. The local map is deleted.

`scoring.ts` extracts the formula so it is unit-testable:

```ts
export function scoreAnswer(
  { coeff, digits, timeMs, combo }: { coeff: number; digits: number; timeMs: number; combo: number },
): { points: number; nextCombo: number } {
  const base = 1000 * coeff * digits;
  const speedFactor = Math.min(2, Math.max(0.1, 1500 / (timeMs + 200)));
  const nextCombo = timeMs < 1500 ? combo + 1 : 0;
  const points = Math.floor(base * speedFactor * (1 + nextCombo * 0.2));
  return { points, nextCombo };
}
```

`handleSuccess` calls `scoreAnswer` instead of inlining the arithmetic; all
other behaviour in `handleSuccess` (time bonus, confetti, `playScale`,
milestone checks, `setStreak`/`setSolved`) is unchanged. The Bot-pace
formula also reads `coeff` — it now reads `getKind(type).weight` the same
way. Streak stays display-only. One shared `mathly-scores` leaderboard.

## 9. Testing

**Introduce Vitest** — new devDep, `"test": "vitest run"` script, a CI
step before `next build`.

| Target | Assertions |
|---|---|
| `families/<f>.generate(type, level)` | per type × level 1–4: `answer` correct for operands; required fields present; `family` stamped; invariants — division integer, subtraction non-negative, fractions simplified, perfect roots, `base ** exp === answer` |
| `families/<f>.check(problem, raw)` | `pending → correct` on exact match; `incorrect` once typed length ≥ answer length; fraction needs both parts; negative-answer branches |
| `scoring.scoreAnswer` | golden values captured from the current inline formula for a grid of `(coeff, digits, timeMs, combo)`; `nextCombo` flips at `timeMs === 1500` |
| `registry` | every legacy `TypeKey` has an entry; each entry's `generate` returns a `family` present in `FAMILY_CARDS`; `mode` set; `weight` matches the old `difficultyCoefficients` value |
| `embed.parseEmbedConfig` | flag / `parentOrigin` / `autostart` parsing |

`SessionRunner` loop, the client redirect, and `postMessage` stay on manual
verification + the `npm run build` gate (type-checks and static-renders
every route). Smoke checklist:

1. `/practice/numbers/addition` — countdown, solve, auto-advance, timer end, summary.
2. `/practice/addition` (legacy) — redirects to `/practice/numbers/addition` with query preserved.
3. `/practice/numbers/gcd` — `H` helper toggles.
4. `/practice/numbers/power` and `/practice/numbers/square_root` — grouped-pairs helper renders.
5. `/practice/numbers/fraction_addition` — dual input, both-parts validation.
6. `/practice/numbers/addition?embed=1` in a test iframe — no chrome; `mathly:ready`, `mathly:answer`, `mathly:session-complete`, `mathly:resize` observed; `mathly-scores` unchanged.
7. Dark theme intact on the migrated cards.

## 10. Migration order

Each step ends green on lint + build + test.

1. `types.ts`, `registry.ts` skeleton, `scoring.ts`, `embed.ts` + their tests.
2. Port families one at a time (`arithmetic` → `fraction` → `factor-hint` →
   `notation` → `equation`), each with `generate`/`validate` tests,
   **leaving `math-engine.ts` + `ProblemCard` untouched**.
3. Add `SessionRunner` + the nested `/practice/[mode]/[type]` route — runs
   in parallel with the old flat route.
4. Flip launcher + `level/1..3` links to nested URLs; convert
   `/practice/[type]` to the client redirect.
5. Delete `math-engine.ts`, `problem-card.tsx`, the `practice-view.tsx`
   shim.

## 11. Out of scope

- Any `shapes` (or other non-`numbers`) drill content or Card.
- L4–L8 level implementations.
- Launcher / level-page redesign beyond `href` changes.
- Per-row difficulty selectors.
- Per-mode leaderboards.
- Restricting which origins may frame the app (needs a host with header
  control).
