# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Before writing code

Per `AGENTS.md`, this repo pins a Next.js (16.2.2) whose APIs and conventions may differ from prior knowledge. Run `npm install` first, then read the relevant guide under `node_modules/next/dist/docs/` before touching framework code, and follow any deprecation notices there.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000/  (NO /Mathly prefix — see basePath below)
npm run build    # next build → static export into ./out  (also the "export" step; ~40s)
npm test         # vitest run — the pure-layer unit tests under src/**/*.test.ts
npm run lint     # eslint (flat config, auto-discovered)
npm start        # serve a prior production build
```

CI (`.github/workflows/ci.yml`) on push to `main`/`master`: `npm install` → `npm run lint` → `npm test` → `npm run build` → deploy `./out` to GitHub Pages.

Run a single test file: `npm test -- registry` (substring match on the path).

## Architecture

Client-only math-drill app: no backend, no API routes, no auth. Persistence is `localStorage` — `mathly-user` (name) and `mathly-scores` (append-only score rows).

### Static-export constraints (`next.config.ts`)

- `output: 'export'` — no server runtime. Every dynamic route needs `generateStaticParams`. No `redirects`/`rewrites`/`headers` config (all client-side or unavailable). `next/image` is `unoptimized`.
- **`basePath` is `'/Mathly'` only when `NODE_ENV === 'production'`** (`isProd` gate). So `next dev` serves at `/` with no prefix, but `./out` (and the live GitHub Pages site) live under `/Mathly` and every `out/*.html` references `/Mathly/_next/…`. To preview `out/` locally you must serve it so that `/Mathly/` maps to `out/`.
- Any component calling `useSearchParams` must sit under a `<Suspense>` boundary (why every `page.tsx` under `src/app/practice/` wraps a `'use client'` route component).

### The problem-kind registry — `src/lib/practice/`

This is the core abstraction. Every drill "type" is an entry in a registry; the session shell is type-agnostic.

- `types.ts` — `Mode` (`'numbers'`), `Family` (`arithmetic | fraction | factor-hint | notation | equation`), `TypeKey` (the ~20-key string union of all drill types), `AnswerState` (`'pending' | 'correct' | 'incorrect'`), `RawInput` (`{ num: string; denom?: string }`), `Problem` (one interface, discriminated by `family`), `ProblemKind`, `CardProps`, `SessionResult`.
- `registry.ts` — `PROBLEM_TYPES: Record<TypeKey, ProblemKind>`, `getKind(type)` (throws on unknown), `allTypeKeys()`, `typesForMode(mode)`. A `ProblemKind` is `{ mode, family, difficulty: {label,options}|null, weight: number, generate(level): Problem, check(problem, raw): AnswerState, validate }`. `weight` is the per-type scoring coefficient (the old `difficultyCoefficients` values).
- `families/<family>.tsx` (arithmetic, fraction, factor-hint, notation, equation) — each exports:
  - `generate<Family>(type, level): Problem` — pure; the operand math, ported case-by-case from the old `math-engine.ts` switch. Guarantees preserved: division builds the quotient first (integer result), subtraction swaps operands to avoid negatives, multiplication caps operand 2 at ≤2 digits, fraction results are GCD-simplified (user must enter simplified form), roots/powers stay exact integers.
  - `check<Family>(problem, raw): AnswerState` — per-keystroke validation. All families except `fraction` delegate to `checkInteger` in `_math.ts`; `fraction` needs both `num` and `denom`.
  - `<Family>Card: React.FC<CardProps>` — the drill UI (layouts lifted from the deleted `problem-card.tsx`). `FactorHintCard` additionally owns the `H`-key "Steps" helper (grouped prime factors / repeated multiplication).
- `families/_math.ts` — shared `calculateGCD`, `simplify`, `getPrimeFactors`, `genSigned`, `id` (random id), `checkInteger`.
- `families/index.ts` — `FAMILY_CARDS: Record<Family, ComponentType<CardProps>>`.
- `scoring.ts` — `scoreAnswer({ coeff, digits, timeMs, combo }) → { points, nextCombo }`, extracted verbatim from the old inline `handleSuccess` formula.

### Request / state flow

1. `src/app/page.tsx` — landing (`LauncherPage`): collects `userName`, shows the 8-level grid, links to `/level/N`. Reads top-5 from `mathly-scores` for the "Top Trainees" board. i18n + theme.
2. `src/app/level/{1,2,3}/page.tsx` — per-level drill pickers with a shared digits (1–4) + time (30/60/120/0=∞) selector. Each drill links to `/practice/${getKind(id).mode}/${id}?level=N&digits=&time=&user=`. Levels 4–8 are `status: 'locked'` placeholders.
3. `src/app/practice/[mode]/[type]/page.tsx` (server) — `generateStaticParams` from `allTypeKeys()` → `{ mode: 'numbers', type }`; `<Suspense>` wraps `nested-route.tsx` (`'use client'`; reads `useSearchParams`; renders `<SessionRunner>` with explicit props).
4. `src/app/practice/[mode]/page.tsx` (server) — the **legacy redirect**. Its `[mode]` segment param actually carries a legacy *type* key (URLs were `/practice/addition`). `legacy-route.tsx` client-`router.replace`s to `/practice/<realmode>/<type>` preserving the query string; unknown type → `/`. This shape exists because Next App Router forbids sibling dynamic slugs (`[type]` next to `[mode]`), so `practice/` has exactly one dynamic child `[mode]`.
5. `src/components/practice/session-runner.tsx` (client) — the **type-agnostic session shell**. Owns: 3-2-1 countdown, timer, streak/solved/score/combo HUD, **Rival Bot** (`botScore`), **Ghost pace bar** (vs personal best from `mathly-scores`), **Booster mode** (streak ≥ 5 slows the timer), **ConceptCard pre-roll** (when `t.concepts[type]` is an object), time bonus, milestone confetti, "Sprint Over" summary. It does `const kind = getKind(type)`, holds `useState(() => kind.generate(digits))`, and renders `FAMILY_CARDS[problem.family]` with **`key={problem.id}`** (full remount on advance) and `onSuccess={(t) => { handleSuccess(t); setTimeout(advance, 1000); }}`. `advance` regenerates the problem. Scoring/bot `coeff` = `getKind(type).weight`. On finish, appends `{ name, score, type, digits, mode: 'numbers', level, date }` to `mathly-scores` (readers tolerate old rows without `mode`/`level`).
6. Family `<*Card>` (client) — owns the answer input(s) + `status`, and the solution overlay (`onShowSolution?`/`onHideSolution?` pause the shell; only `quadratic_vertex`/`log_basic`/`exp_neural` have a `t.solutions` entry so only they render the button). **No submit button** — `check<Family>` runs per keystroke: correct → sound + `onSuccess(timeMs)`; wrong (once typed length ≥ answer length) → shake + `onFailure()`. Cards **never advance themselves** — the footer **Skip** button and the shell's post-correct timer both call `onSkip` (= the shell's `advance`). Cards reset by remounting (the `key`), not via an effect.

### Adding a drill type

1. Add the key to the `TypeKey` union in `types.ts`.
2. Add a `case` to the matching `families/<family>.tsx` `generate<Family>` (and a rendering branch in `<Family>Card` if it needs a new layout).
3. Register it in `PROBLEM_TYPES` (`registry.ts`) with its `weight`.
4. Add it to a `src/app/level/N/page.tsx` picker list to make it user-reachable. `generateStaticParams` picks it up automatically via `allTypeKeys()`.

### `src/lib/` (non-registry)

- `audio.ts` — Web Audio synth singleton (`mathlyAudio`, `null` on the server); call sites use `mathlyAudio?.play…()`.
- `theme-context.tsx` (+ `src/components/theme-toggle.tsx`) — real persisted light/dark theme. Components carry `dark:` variants throughout.
- `i18n/language-context.tsx` + `i18n/translations.ts` — `useLanguage()` → `t`; **en + ko**. Notable keys: `t.concepts` (ConceptCard), `t.solutions` (Show-Answer overlay), `t.practiceInstructions`, `t.practice.*`. New user-facing strings go in **both** language blocks.
- `utils.ts` — `cn()` = `clsx` + `tailwind-merge`.

### Testing

**Vitest**, `node` env, `@` → `./src` alias (`vitest.config.ts`). Covers the pure layer only: `generate<Family>` (per type × level, invariants), `check<Family>` (state machine, negatives), `scoreAnswer` (golden values), `_math` helpers, and `registry.ts` consistency (all 20 types resolve; `weight`s match; `family` has a Card; `validate` round-trips). The Cards, `SessionRunner`, and routing are **not** unit-tested — `npm run build` (type-check + prerender of all 47 routes) plus a manual browser pass are the gate.

### Styling

Tailwind v4, CSS-first — **no `tailwind.config.js`**. Theme tokens and the `animate-shake` keyframe live in `src/app/globals.css` under `@theme inline`. The app is fully dark-mode-aware (see `theme-context.tsx`); components use explicit `dark:` variants.

### Conventions

- Path alias `@/*` → `./src/*`.
- ESLint flat config via `eslint-config-next` subpath imports (`.../core-web-vitals`, `.../typescript`).
- `babel-plugin-react-compiler` is a dependency but is **not** wired up in `next.config.ts`.
- `src/lib/math-engine.ts` and `src/components/practice/problem-card.tsx` were **deleted** — superseded by `src/lib/practice/`. Don't reference them.

### Design docs

The registry refactor's spec and plan are under `docs/superpowers/`. The spec's iframe/embed feature (§7) is a deferred "part 2" — not yet built.
