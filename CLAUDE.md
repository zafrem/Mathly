# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Before writing code

Per `AGENTS.md`, this repo pins a Next.js (16.2.2) whose APIs and conventions may differ from prior knowledge. Run `npm install` first, then read the relevant guide under `node_modules/next/dist/docs/` before touching framework code, and follow any deprecation notices there.

## Commands

```bash
npm run dev      # dev server — note it serves at http://localhost:3000/Mathly (basePath)
npm run build    # next build → static export into ./out (this is also the "export" step)
npm run lint     # eslint (flat config, auto-discovered)
npm start        # serve a prior production build
```

There is **no test framework** configured — no test script, no runner. CI (`.github/workflows/ci.yml`) runs `npm install` → `npm run lint` → `npm run build`, then deploys `./out` to GitHub Pages on push to `main`.

## Architecture

Single-page-ish math drill app. 100% client-side: no backend, no API routes, no auth. All persistence is `localStorage` (`mathly-user`, `mathly-scores`).

### Static-export constraints (`next.config.ts`)

- `output: 'export'` — no server runtime. Every dynamic route needs `generateStaticParams` (see `src/app/practice/[type]/page.tsx`, which enumerates all 10 operation types). `next/image` is `unoptimized`.
- `basePath: '/Mathly'` for GitHub Pages sub-path hosting. `<Link>`/router paths are written without the prefix; Next adds it. Dev and prod both live under `/Mathly`.
- Any component calling `useSearchParams` must sit under a `<Suspense>` boundary (that's why `page.tsx` wraps `PracticeView`).

### Request/state flow

1. `src/app/page.tsx` (landing, client) — collects `userName`, `digits` (1–4), `timeLimit` (30/60/120/0=∞). Builds a link to `/practice/{type}?digits=&time=&user=`. Also reads top-5 from `mathly-scores` for the "Hall of Speed" board.
2. `src/app/practice/[type]/page.tsx` (server) — `generateStaticParams` + `<Suspense>` wrapper only.
3. `src/components/practice/practice-view.tsx` (client) — owns the session: 3-2-1 countdown, the timer, `streak`/`solved`/`score`, `isFinished`. Writes a new entry to `mathly-scores` on finish (append-only; the list is only trimmed when *read* on the landing page). Every 10th solve fires confetti + `playMilestone`.
4. `src/components/practice/problem-card.tsx` (client) — owns the current `Problem`. **No submit button:** `handleCheck` runs on every keystroke; a correct answer plays a sound, calls `onSuccess(timeMs)`, and auto-advances after 1s; a wrong answer (detected once the typed length reaches the answer length) shakes + calls `onFailure`. Renders four layouts by `type`: fraction (numerator/denominator inputs), factorization (gcd/lcm — shows prime-factor chips as a hint; the actual answer still goes in the main input), vertical (2+-digit add/sub, with cosmetic carry boxes), and the default horizontal layout.

### `src/lib/`

- `math-engine.ts` — pure, framework-free. `generateProblem(type, digits)` → `Problem`. Guarantees: division builds the quotient first then multiplies (always integer); subtraction swaps operands to avoid negatives; multiplication caps the second operand at ≤2 digits; fraction results are always GCD-simplified, so the user must enter simplified form and `answer`/`answerDenom` are compared exactly. Adding an operation type = extend the `OperationType` union, add a `switch` case here, and add it to both `categories` in `page.tsx` and `generateStaticParams`.
- `audio.ts` — Web Audio synth (no asset files). `mathlyAudio` is a singleton, `null` on the server; call sites use `mathlyAudio?.play…()`.
- `utils.ts` — `cn()` = `clsx` + `tailwind-merge`.

### Styling

Tailwind CSS v4, CSS-first config — there is **no `tailwind.config.js`**. Theme tokens and the custom `animate-shake` keyframe live in `src/app/globals.css` under `@theme inline`. The `@media (prefers-color-scheme: dark)` block in `globals.css` is leftover from `create-next-app`; the components are hardcoded light-mode (`bg-white`, `text-gray-800`, …) so it has no effect.

### Conventions

- Path alias `@/*` → `./src/*`.
- ESLint uses the flat-config subpath imports from `eslint-config-next` (`eslint-config-next/core-web-vitals`, `.../typescript`).
- `babel-plugin-react-compiler` is a dependency but is **not** wired up in `next.config.ts`.
