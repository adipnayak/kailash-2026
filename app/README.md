# Kailash 2026 yatra: v4 React + Vite

This is the v4 migration scaffold. The live site is still the root `index.html`
(v3.12 single-file build). v4 takes over once feature parity is reached.

## Migration scope

Foundation pass (this PR): scaffolding only.

Downstream Ralphs migrate one component at a time. The TODO list lives inside
each `src/components/*.tsx` file as a header comment.

Roadmap:
1. Hero variants (before / during / after)
2. SacredJourneyMap geographic SVG with origin rays
3. JourneyTimeline 13-day strip with connectivity underlay
4. AltitudeChart using reaviz AreaChart (21st.dev pattern)
5. DayCard with 21st.dev agent-plan inner timeline
6. ConnectivityRibbon detail
7. WeatherConfidence with Open Meteo
8. PreparationDashboard with localStorage checklist
9. GSAP delight animations
10. PRD section 0.15 and 0.16 locked behaviors

## Stack

- React 19 + TypeScript (strict)
- Vite for build and dev
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- GSAP for animation primitives
- framer-motion for component transitions
- lucide-react for icons (no emojis on rendered page)
- reaviz for the altitude area chart
- 21st.dev component patterns adapted to Maurten

## Maurten theme override pattern

CSS variables live in `:root` of `src/index.css`. The `@theme` block maps each
variable to a Tailwind v4 colour token, so utilities like `bg-bg`, `text-ink`,
`text-red`, `text-accent` resolve to the Maurten palette and not Tailwind's
default colours.

Why the indirection?
- Single source of truth for theme tokens.
- Allows a future dark mode by swapping `:root` variable values.
- Lets us reference the same tokens from inline SVG attributes
  (e.g. `fill="var(--ink)"`) where Tailwind utilities do not apply.

## GSAP convention

- One `gsap.context()` per component, scoped to the component's root ref.
- Prefer the `useGSAP` hook from `@gsap/react` when added.
- Keep ScrollTrigger registration in a single `src/lib/gsap-init.ts` once needed.
- No global animations. Every effect is owned by exactly one component.

## 21st.dev component sources

- `agent-plan` (vertical stepper) inspires the inner timeline inside DayCard.
- `detailed-normalized-incident-report` (reaviz AreaChart) is the basis for
  AltitudeChart. Use reaviz directly; we adopt the chart pattern, not the JSX.

## Anti-AI typography rule

In all JSX strings, the following characters are forbidden:
- em-dashes (the long dash character)
- en-dashes (the medium dash character)
- smart quotes (curly single and double)
- emojis on the rendered page

Use straight ASCII dashes, straight quotes, and lucide-react icons in place of
emojis. The rule is enforced at PR review. A future Ralph adds an ESLint rule
to fail CI if these characters appear in any JSX string literal.

## Devotional budget enforced at source

The locked counts (PRD v3.10) are:
- `Jai Bhole Nath` x 1
- `Yatra Sampoorna` x 1
- `Har Har Mahadev` x 0
- `Om Namah Shivaya` x 1 (Devanagari, footer)

Implementation: `src/lib/devotional.ts` exports each phrase as a constant
exactly once per its budget. `Har Har Mahadev` is intentionally NOT exported,
because its budget is 0. There is no runtime scrub function. Enforcement
happens at the import site.

If a future PRD changes the budget, update `src/lib/devotional.ts` in one
place. Do not paste phrases as inline string literals anywhere else.

## Local dev

```bash
npm install
npm run dev      # http://localhost:5173/kailash-2026/
npm run build    # outputs to dist/
npm run preview  # serves the production build
```

## Date override for testing phase variants

Append `?date=YYYY-MM-DD` to any URL to force `getReferenceDate()` to that
date. Example: `http://localhost:5173/kailash-2026/?date=2026-07-14` puts the
app in the during-phase Dolma La day.

## Live deploy

The v4 GitHub Actions workflow (`.github/workflows/deploy-v4.yml`) builds the
app but the deploy step is intentionally commented out until feature parity.
Until then the live site continues to be served from the root `index.html`.
