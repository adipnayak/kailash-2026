# Kailash Mansarovar Yatra 2026 - Product Requirements Doc

## TL;DR

A personal trip-planning and reference website built by Adip Nayak for a 13-day Hindu pilgrimage from Mumbai via Kathmandu to Mt Kailash and Lake Manasarovar in western Tibet (7-19 July 2026). Shared with a 23-yatri WhatsApp group on the eve of departure. The site adapts its display to three phases of the journey: before (countdown and prep checklist), during (live day tracking), and after (completion view). No server, no accounts. Everything is client-side: React 19 SPA, Tailwind v4, TypeScript, deployed to GitHub Pages. Analytics: Microsoft Clarity + GA4 (both installed; GA4 goes dark during the Tibet leg due to GFW).

---

## Audience + goals

**Primary audience:** the 23 yatris in the group. They use it before the trip to track preparation status and understand the itinerary; during the trip as a quick reference for each day's route, weather, altitude, and connectivity; and after as a record.

**Secondary audience:** any family member or friend who wants to follow the trip. The phase-aware UI gives them an accurate "where are they now" view without the yatris needing to post updates.

**Tertiary audience:** AI crawlers and LLMs. The static HTML fallback in `index.html#root` and `llms.txt` ensure these agents read accurate content without executing JavaScript.

**Success looks like:** a yatri can open the site on their phone in Kathmandu, see Day 2's schedule, confirm connectivity expectations, and check their prep status -- all within 5 seconds, without logging in, without a data plan for Google.

---

## Information architecture

Four tabs, always visible in the sticky top nav. OverviewTab is the default; the other three are lazy-loaded on first click.

- **Overview** -- Hero bento (countdown or live stats), AltitudeChart
- **Itinerary** -- ConnectivityRibbon, sticky 13-chip day nav (D# + temp + moon), 13 DayCards all open by default
- **Prepare** -- sticky 14-chip category nav, PreparationDashboard checklist, WeatherConfidence forecast
- **Reference** -- sticky 8-chip article nav, 8 reference articles

All three content tabs (Itinerary, Prepare, Reference) have sticky scrollspy chip strips under the top nav that highlight the current section and auto-scroll the active chip into view.

---

## Per-tab spec

### Overview

**What renders:**
- `Hero` component: phase-aware bento grid layout (2-3-4 columns at base/md/lg breakpoints)
  - Before phase: GSAP-animated countdown ("N days to Kailash") bento card with 45-degree diagonal stripe pattern, tappable (TAP FOR ITINERARY), navigates to Itinerary tab. 8 stat tiles (highest altitude, longest trek day, coldest expected, warmest expected, offline days, border crossings, yatra length, parikrama circuit). A tappable prep-summary card with the same diagonal stripe pattern (TAP TO PREP) that mirrors Prepare tab progress. The prep card progress bar reads item-level completion via `overallPrepProgress()` so any single item tap moves the bar. Navigates to the Prepare tab on tap. Dispatches and listens to `kailash-prep-updated` custom event so the bar re-syncs without polling or navigation.
  - During phase: current day number (1-13 of 13), location, altitude, connectivity status, tomorrow card, yatra progress bar, peak and offline stat tiles.
  - After phase: "Yatra Sampoorna" completion view, route summary, days-since-return, final stats.
- `AltitudeChart` (lazy-loaded): recharts area chart of all 15 points (D0 origins + D1-D13 + D14 return). Two series -- Walking (altitude_peak) and Sleeping (altitude_sleep). Segmented control toggles between them; preference persisted to `kailash_altitude_mode`. Dotted reference line at Dolma La (5,630 m, Day 8 red). Grey dotted markers at ACCLIM (D4), REST (D6), BUFFER (D12). Y-axis metres only, linear scale.

**Data sources:** `DAYS` from `trip-data.ts`, `computeJourneyState()` from `journey-state.ts`, `loadPrepStatus()` + `overallPrepProgress()` from `prep-data.ts`.

**Interactions:** tap countdown bento to jump to Itinerary tab; tap prep card to jump to Prepare tab; AltitudeChart segmented control (Walking/Sleeping toggle).

**Devotional budget:** `JAI_BHOLE_NATH` (from `lib/devotional.ts`) appears exactly once in the Hero before-phase card. `YATRA_SAMPOORNA` appears exactly once in the Hero after-phase card.

---

### Itinerary

**What renders:**
- `ConnectivityRibbon`: 13-day dot strip showing per-day connectivity (good/intermittent/offline). Three colours: emerald (WiFi + phone), sacred/gold (phone only), destructive/red (no signal). Phase-aware headline. Before: highlights the offline cluster D7-D9. During: today's dot gets a ring highlight. GFW note (D3-D10, VPN needed) always visible.
- Sticky day-chip nav below "Day by Day" heading. Each chip is a vertical stack: D# icon row, then temp range + moon phase icon (10 px font). 13 chips total. Today gets a clock icon; Dolma La (Day 8) gets a landscape icon in destructive. Active chip = the day section currently in the scrollspy zone (IntersectionObserver, top-biased rootMargin). Optimistic-active: tapping a chip marks it active immediately (no wait for scroll). Auto-scrolls the active chip to center of strip using `strip.scrollBy({ left: delta })` (not `scrollIntoView` -- iOS Safari mis-routes that). `overscrollBehaviorX: contain`. `touchAction: manipulation` + `WebkitTapHighlightColor` on every chip. Tapping a chip expands that DayCard and scrolls to it via `window.scrollTo({ top, behavior: 'smooth' })` with 300 ms defer post-expand.
- 13 `DayCard` components. All expanded on first tab visit (default state = Set of all day numbers).

**DayCard -- compressed view:** day badge, location, risk badge, 3 chips (altitude, trek distance/time, connectivity), timeline summary, expand button.

**DayCard -- expanded view:**
- Summary strip: wake time, walking hours, active trek hours, sleep target
- `ItineraryDayMap`: Leaflet map with CartoDB tiles. One map mounted at a time (IntersectionObserver lazy-mount -- was 13 simultaneous, now 1). Polylines per leg via `day-stops.ts` waypoints. Line style by transport mode: drive/walk are solid (OSRM road-snapped); flight is dashed great-circle; trek is dotted-dashed. Falls back to `day-routes.ts` start/end for days without DAY_STOPS entries.
- Day card timeline grid: each event row is CSS grid `grid-cols-[52px_24px_1fr] grid-rows-[1fr_auto_1fr]`. Time (left col) + dot (center col) + text (right col) on middle row; icon 12 px top padding above; duration 12 px bottom padding below. Spine bar spans all 3 rows in col 2, with half-hidden top/bottom caps on first/last events so the line runs continuously through the middle.
- Astro row: sunrise, sunset, moon phase icon + label + illumination (suncalc at each day's start coords)
- Weather chips: temp range, feels-like, rain %, wind, UV -- "forecast" vs "climatology" source tag
- Exposure + conditions chips
- Meals grid (breakfast/lunch/dinner/snacks/hydration)
- Facilities (bathroom type, water, shower)
- Spiritual focus block (holy/critical days only)
- Operational details nested section

**Route change (PR #165):** Day 5 and Day 10 now fly via Purang (south of Kailash) not Ali / NGQ. Drive from Purang to Darchen is ~1 hour vs 6 hours from NGQ. This is reflected in `day-stops.ts` and `trip-data.ts`.

**Parikrama waypoints (PR #147):** 9 intermediate trail waypoints on D7/D8/D9 so the trek polyline bends through real valley geometry on the map.

**Day 8 altitude correction (PR #156):** sleep altitude corrected from 4,670 m to 4,760 m (Zuthulphuk).

**Data sources:** `DAYS`, `getDayRoute()` from `day-routes.ts`, `getDayAstro()` from `astro.ts` via suncalc, `useWeather()` from `weather.ts` via Open-Meteo, `DAY_STOPS` from `day-stops.ts`.

**Interactions:** tap DayCard header to toggle expand/collapse; tap day chip to jump + expand. Expansion state is in-memory (ItineraryTab state), not persisted.

---

### Prepare

**What renders:**
- Header with "PRIVATE TO THIS BROWSER. NOTHING LEAVES YOUR DEVICE." sub-line.
- Sticky 14-chip category nav (same scrollspy + auto-center pattern as Itinerary). Categories:
  - 5 core: Passport, Flights, Medical (optional), Connectivity, Packing
  - 9 sub-categories split from the original "Things to Carry": Clothing (15 items), Footwear (4), Electronics (4), Health Kit (12), Sun Protection (4), Day Pack (3), Docs and Money (5), Personal Care (8), Spiritual (3, optional)
- `PreparationDashboard`: shows only in before phase (returns null during/after). ~75 items total across 14 categories. Two states per item: complete or action-needed. Tap row to toggle. Items stay in declared position (no auto-sort). Action-needed rows expand with blocking copy. GSAP stagger entrance animation on first render. State persisted to `kailash_prep_v2`. Dispatches `kailash-prep-updated` on save.
- `WeatherConfidence`: phase-aware weather widget. Before: confidence bar (0% at D2D >= 17, 100% at D2D <= 3, linear). Shows Open-Meteo forecast for Kathmandu, Lhasa, Mansarovar -- falls back to climatology if outside 16-day horizon. During: live today + tomorrow at 100% confidence. After: static trip summary. Weather fetches cached in-memory (1 hour TTL).

**Data sources:** `CATEGORIES` from `prep-data.ts` (14 categories, ~75 items), Open-Meteo daily API, `useJourneyState()` for phase.

**Interactions:** tap any checklist row to toggle. State persists immediately on each toggle.

**Item counting:** `overallPrepProgress()` counts all items including optional ones. Hero prep bar uses item-level pct so any single tap moves the needle.

---

### Reference

**What renders:**
- Header with intro text.
- Sticky 8-chip article nav (scrollspy via scroll-position math, not IntersectionObserver -- article lengths vary wildly so ratio-based detection was unreliable; plain `getBoundingClientRect().top <= 130` is robust). Auto-centers active chip via `strip.scrollBy()`.
- 8 `ArticleSection` components driven by `REFERENCE_ARTICLES` from `reference-data.ts`:
  1. Medicines and Diamox Protocol (icon: medication)
  2. Connectivity Playbook (icon: wifi)
  3. Bag Transitions (icon: backpack)
  4. Customs and Immigration (icon: verified_user)
  5. Acclimatisation Rules (icon: landscape)
  6. Visa and Permits (icon: description)
  7. Pre-trip Spiritual Practices (icon: favorite)
  8. FAQs (icon: help) -- added PR #172

Each article renders typed blocks: prose, heading, table, ordered-list, unordered-list, callout (tones: critical/warning/info). Callout borders use `--destructive` (critical), `--sacred` (warning), `--border` (info).

**Data sources:** static `REFERENCE_ARTICLES` array. No live data.

**Interactions:** tap chip to jump to article via `window.scrollTo` with explicit pixel offset.

---

## Cross-cutting features

- **Nav:** sticky top bar (z-50, backdrop-blur). Icon-only for inactive tabs; icon + label for active. ThemeToggle on right. Icons from Material Symbols Outlined via `<Icon name="..." />`.
- **ThemeToggle:** light/dark. Adds/removes `dark` class on `<html>`. Defaults to light. Persisted to `kailash_theme`. Also appears in Footer.
- **BackToTop:** `app/src/components/BackToTop.tsx`. Fixed bottom-right button, visible after scroll > 400 px. Smooth-scrolls to top. Rendered globally in `App.tsx`, so it appears on every tab.
- **Footer:** brand mark (landscape icon + name) + tagline + ThemeToggle row. Then 2-col grid of all 4 tab CTAs with icons (navigates + scrolls to top). Then 3-paragraph Kailash/Mansarovar/Parikrama story, first paragraph visible by default, remaining 2 behind "See more / See less" toggle.
- **Static HTML fallback:** `app/index.html` ships the full trip content inside `#root` as static HTML (day-by-day summary, key facts). JS-less crawlers and AI agents see meaningful content. React mounts over it.
- **JSON-LD:** `Event` schema in `<head>`. startDate 2026-07-07, endDate 2026-07-19, GeoCoordinates for Mt Kailash.
- **A11y:** sr-only `<h1>` always in DOM (single h1 on every tab). Global `:focus-visible` ring. ThemeToggle minimum 44 px tap target.
- **llms.txt:** `app/public/llms.txt` -- structured brief for LLMs covering trip overview, day summary, page structure, key facts (offline days, Dolma La, GFW, self-hosted fonts, CartoDB tiles).
- **Sitemap + robots:** `app/public/sitemap.xml` and `robots.txt` at Pages root.
- **Date override:** `?date=YYYY-MM-DD` query param overrides `new Date()` for `computeJourneyState()`. Use `?date=2026-07-14` to simulate Day 8.
- **Preconnect hints** in `<head>` for CartoDB, OSRM, Open-Meteo, clarity.ms, googletagmanager.com.

---

## Design system

### Typography

- **Sans:** Geist Variable (woff2, self-hosted from the `geist` npm package, copied to `app/public/fonts/`). Headings, body, stat values, nav label.
- **Mono:** Geist Mono Variable (woff2, self-hosted). Labels, badges, chip text, tracking-wider uppercase metadata, `JAI_BHOLE_NATH` devotional token.
- No Google Fonts, no external font CDN.

### Icons

`@aliimam/icons` is **removed**. The canonical icon system is now Material Symbols Outlined, self-hosted via the `material-symbols` npm package (no fonts.googleapis.com -- blocked in China). Thin wrapper component at `app/src/components/Icon.tsx`:

```tsx
<Icon name="dashboard" size={16} />
<Icon name="check_circle" size={20} filled />
```

Props: `name` (snake_case Material Symbol name), `size` (default 20), `filled` (FILL axis, default false), `className`. Renders a `<span>` with `fontVariationSettings` locking weight at 400. `aria-hidden` always set. `lucide-react` remains in `package.json` for potential edge-case fallback but is not actively used.

### Color tokens (CSS custom properties, OKLCH)

Light mode defaults. Dark mode activated by `.dark` on `<html>`.

| Token | Light | Dark | Purpose |
|---|---|---|---|
| --background | oklch(1 0 0) | oklch(0.145 0 0) | page background |
| --foreground | oklch(0.145 0 0) | oklch(0.985 0 0) | body text |
| --card | oklch(1 0 0) | oklch(0.205 0 0) | card/tile background |
| --muted-foreground | oklch(0.556 0 0) | oklch(0.708 0 0) | labels, secondary text |
| --border | oklch(0.922 0 0) | oklch(0.275 0 0) | dividers, outlines |
| --primary | oklch(0.205 0 0) | oklch(0.922 0 0) | active tab underline, active chip bg |
| --destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | critical alerts, Dolma La, offline dots |
| --sacred | oklch(0.65 0.13 75) | oklch(0.78 0.13 75) | devotional markers, intermittent connectivity, progress fill |
| --emerald | oklch(0.53 0.14 155) | oklch(0.7 0.14 155) | good connectivity, checkmarks, completion |

`--radius: 0` globally. No rounded corners anywhere. `rounded-none` on every interactive element.

### Diagonal stripe pattern

Used on the Hero countdown bento and Hero prep card. Implementation: `repeating-linear-gradient(45deg, ...)` at 4 px gap + 1 px line, `8% muted-foreground alpha`. Signals the tile is tappable.

### Spacing

8-multiple rule throughout: all padding, margin, gap values are multiples of 8 px. Exceptions for sub-pixel optical adjustments only.

### Sticky nav strip pattern (shared across Itinerary/Prepare/Reference)

All three content tabs use the same sticky chip strip below the top nav. Key implementation constraints:
- `position: sticky`, `top-12` (sits under the 48 px main nav)
- `z-40`, solid `bg-background` (no `backdrop-filter`/`backdrop-blur` -- iOS Safari breaks sticky + backdrop-filter when the address bar collapses)
- `overflow-x-auto`, `overscrollBehaviorX: contain`
- `touchAction: manipulation` + `WebkitTapHighlightColor: rgba(0,0,0,0.05)` on every chip button
- Active chip auto-centered via `strip.scrollBy({ left: delta, behavior: 'smooth' })` using `getBoundingClientRect()` math (not `scrollIntoView`)
- Jump navigation via `window.scrollTo({ top, behavior: 'smooth' })` with explicit pixel offset (not `el.scrollIntoView` -- iOS unreliable)

### Anti-AI rules

Zero em-dashes (--), en-dashes (-), smart quotes ("" ''), or emojis in any rendered string, JSX, or data file. Plain ASCII hyphens and straight quotes only. Enforced by convention; noted at the top of every source file.

---

## Data model + persistence

### trip-data.ts

The `DAYS` array is the master data structure. 13 entries. Each `TripDay` has:
- Identification: `day`, `date` (ISO), `weekday`, `location`, `day_type` ('normal'|'critical'|'holy'|'rest')
- Altitude: `altitude_peak` (metres, day high), `altitude_sleep` (overnight)
- Risk: `risk` ('easy'|'moderate'|'high')
- Connectivity: `conn_status` ('good'|'intermittent'|'offline'), `conn_label`, `next_signal`
- `headline`
- Nested: `weather` (WeatherData), `timeline` (TimelineEvent[]), `what_to_wear`, `food`, `bathroom`, `timing`, `spiritual_focus` (or null)

Also exported: `DEPART` ('2026-07-07'), `RETURN_DATE` ('2026-07-19'), `MILESTONES`, `WHAT_MATTERS`, `BEFORE_WHAT_MATTERS_BY_TWINDOW`.

### day-stops.ts

`DAY_STOPS`: day number -> `DayStop[]`. Each stop: `lat`, `lng`, `label`, optional `modeNext` (TransportMode: 'drive'|'walk'|'flight'|'trek'), optional `intermediate` flag. Intermediate stops bend the polyline without appearing in the UI. Days 5 and 10 route via Purang. Days 7/8/9 have 9 intermediate Parikrama waypoints for accurate trail geometry.

### day-routes.ts

High-level start/end coords per day. Fallback when DAY_STOPS has no entry.

### prep-data.ts

`CATEGORIES`: 14 categories, ~75 items total. Each `Category`: `id`, `label`, `optional` flag, `items: CheckItem[]`. Each `CheckItem`: `id`, `label`, `blocking` (copy shown on action-needed expand), `defaultStatus`. `ItemStatus` = 'complete' | 'action-needed'. Helpers: `loadPrepStatus()`, `savePrepStatus()`, `isCategoryComplete()`, `overallPrepProgress()`.

Note: the original single "Things to Carry" category was split into 9 sub-categories (Clothing, Footwear, Electronics, Health Kit, Sun Protection, Day Pack, Docs and Money, Personal Care, Spiritual) so each gets its own sticky-nav chip. Item IDs preserve the `carry-` prefix to survive the rename in localStorage.

### reference-data.ts

`REFERENCE_ARTICLES`: 8 static articles. Types: `RefBlock` (prose/heading/table/ordered-list/unordered-list/callout), `RefArticle` (id, title, icon, intro, blocks).

### localStorage keys

All keys scoped to `kailash_` prefix.

| Key | Written by | Read by | Contents |
|---|---|---|---|
| kailash_tab | useTabPersist | useTabPersist | active tab |
| kailash_prep_v2 | savePrepStatus | loadPrepStatus | JSON StatusMap (Record<itemId, ItemStatus>) |
| kailash_altitude_mode | AltitudeChart | AltitudeChart | 'walking' or 'sleeping' |
| kailash_theme | ThemeToggle | ThemeToggle | 'light' or 'dark' |
| kailash_route_v1_{day} | road-routing.ts | road-routing.ts | cached OSRM geometry per day |

Per-day DayCard expansion state is in-memory only (not persisted). Weather is cached in-memory per (date, lat, lng), 1 hour TTL.

---

## Tech stack + dependencies

| Layer | Library | Version |
|---|---|---|
| UI framework | React | 19.2.6 |
| Build tool | Vite | 8.0.12 |
| CSS | Tailwind CSS v4 | 4.3.1 |
| Types | TypeScript | ~6.0.2 |
| Maps | Leaflet | 1.9.4 |
| Chart | recharts | 3.8.1 |
| Icons | material-symbols (npm) | 0.45.2 |
| Animations | framer-motion | 12.40.0 |
| Animations (imperative) | gsap + @gsap/react | 3.15.0 / 2.1.2 |
| Astronomy | suncalc | 2.0.0 |
| Fonts | geist (npm) | 1.7.2 |
| Tailwind plugin | tailwindcss-animate | 1.0.7 |

**@aliimam/icons is gone.** It was a 5+ MB un-tree-shakeable barrel (all ~800 icons in one export block, no `__PURE__` annotations). Replaced with `material-symbols` + the `Icon.tsx` wrapper.

**External APIs (free, no key):**
- Open-Meteo: daily weather forecast, 16-day horizon. Graceful fallback to climatology.
- OSRM (router.project-osrm.org): road geometry for drive/walk legs. Fallback to straight-line when no route (thin Tibet coverage).

**Map tiles:** CartoDB Positron/DarkMatter (`{s}.basemaps.cartocdn.com`). Serves through the GFW.

**Vite manualChunks:** leaflet, recharts/d3, framer-motion+gsap, react-core each get their own stable vendor chunk for independent caching. The old `icons-vendor` chunk stub is still in `vite.config.ts` (targets `@aliimam/icons` -- now absent, so it never fires) but is harmless.

**Performance milestones (PR #164):**
- Main app chunk before: ~5,776 KB. After icon migration + chunk splitting: ~235 KB.
- 13 simultaneous Leaflet maps -> 1 mounted via IntersectionObserver lazy-mount.
- Preconnect hints for CartoDB, OSRM, Open-Meteo, Clarity, googletagmanager.

---

## Analytics

Both installed in `<head>`:

- **Microsoft Clarity** (project ID `xatdjoyvzo`): session replay + heatmaps. Loads async from `clarity.ms`. If the script fails (some China networks intermittently throttle `clarity.ms`), it no-ops without breaking the page.
- **GA4** (measurement ID `G-YV1YFK1V02`): page-level analytics via `googletagmanager.com`. `googletagmanager.com` is blocked in mainland China, so sessions during the Tibet leg (Days 3-10) will be missing. Page still works -- the async script fails silently.

There is no server-side analytics. These are client-side only.

---

## Deployment + ops

**Pipeline:** GitHub Actions at `.github/workflows/deploy-v4.yml`. Triggers on push to `main` (when `app/**` or the workflow file changes) and on pull requests to `main`. `workflow_dispatch` for manual deploys.

**Steps:** `npm ci` in `app/`, `npm run build` (`tsc -b && vite build`), uploads `app/dist/` as Pages artifact, deploys to GitHub Pages.

**Live URL:** `https://adipnayak.github.io/kailash-2026/`

**Vite base:** `/kailash-2026/`

**Local dev:** `cd app && npm run dev` -- Vite dev server on localhost:5173.

**Local preview:** `cd app && npm run build && npm run preview`

**Date testing:** `?date=2026-07-14` for Day 8 (Dolma La). `?date=2026-07-20` for after-phase.

---

## Worldwide reachability

The Tibet leg is Days 3-10. All decisions made to ensure usability behind the GFW:

- Self-hosted fonts (Geist woff2 in `app/public/fonts/`). No Google Fonts CDN.
- No Mapbox. Leaflet + CartoDB tiles only (CartoDB serves through the GFW).
- No Google APIs called at runtime (Maps, Firebase, etc.).
- No calls to any domain that reliably fails behind the GFW.
- Open-Meteo + OSRM: both accessible from China (verified at build). Fail gracefully.
- GA4 goes dark during Tibet leg (accepted tradeoff -- page still works). Clarity intermittently throttled (also accepted).
- Static HTML fallback: the full trip content is readable with zero JavaScript and zero external requests.

---

## Out-of-scope (intentional non-goals)

- User accounts or authentication.
- Real-time location tracking or cross-yatri sharing.
- Booking, payments, or checkout.
- Push notifications or background sync.
- Server-side rendering or a backend API.
- Multi-trip or multi-group support.
- Photo galleries or media uploads.
- Comments or social features.
- Native mobile app.
- Cross-device prep sync (localStorage is per-device per-browser; no sync mechanism).

---

## Known limitations

- **localStorage is per-device per-browser.** Prep progress on mobile does not sync to desktop.
- **OSRM coverage is thin in high-altitude Tibet.** Drive and trek legs in Days 5-10 often fall back to straight polylines. Map is still useful for geographic orientation.
- **React SPA requires JavaScript.** The static HTML fallback in `#root` covers the JS-less case for crawlers. It is a static summary, not interactive.
- **Open-Meteo 16-day horizon.** Forecasts beyond D+16 show climatology. WeatherConfidence displays a confidence bar (0% at D2D >= 17) to communicate this.
- **JourneyState does not auto-refresh.** `useJourneyState` computes once on mount. A tab left open across midnight shows stale phase until reload.
- **DayCard expansion state is in-memory.** Defaults to all-open. Collapsing cards does not persist across tab switches.
- **GA4 dark during Tibet.** Days 3-10 analytics will have a gap. Clarity is intermittent during the same window.
- **`vite.config.ts` has a dead `@aliimam/icons` manualChunks entry.** It never matches (package removed) but is harmless. Clean it up if it causes confusion.

---

## Roadmap (what's plausibly next)

### Locked-in (designed, not yet built)

These are committed design intent. They go to `/grill-me` before implementation; this section is the source of truth for what was agreed.

1. **FAQ accordion (Reference > FAQs)**. The 14 Q/A pairs currently render as alternating `heading` (question) + `prose` (answer) blocks, all open. Replace with an accordion so each question collapses, only the tapped one expands. Build with the shadcn watermelon variant:
   ```
   pnpm dlx shadcn@latest add https://registry.watermelon.sh/r/accordion-3.json
   ```
   Constraints:
   - Material Symbols Outlined for the chevron (no new icon dependency).
   - Anti-AI rules apply to all generated component code (zero em-dashes / en-dashes / smart quotes / emojis).
   - Each section group (Insurance / Kit / Medical / etc.) keeps its `heading` block above its own accordion; questions sit inside the accordion of their group.
   - First Q within each section open by default? Or all collapsed? Decide at /grill-me.
   - Accordion state is ephemeral (no localStorage); resets on each tab visit.

2. **Kailash facts between day cards (Itinerary tab)**. Insert one short fact card between every consecutive pair of `DayCard`s -- 12 facts total for 13 days. Examples:
   - "At 5,630 m, Dolma La pass is higher than Everest Base Camp (5,364 m)."
   - "Lake Manasarovar is one of the highest freshwater lakes in the world."
   - "Pilgrims have circumambulated Mt Kailash for over a thousand years."
   New data file `app/src/lib/kailash-facts.ts` exporting an ordered array indexed by day-pair (between D{n} and D{n+1}). Each fact has `title`, `body`, optional `source`. Rendered as a slim divider block: muted-foreground border-l-4 + small-caps eyebrow ("FACT") + 1-2 line body. Does NOT count as a day in the sticky chip strip. Does NOT enter the IntersectionObserver scrollspy.
   - Source of truth for facts: this PRD section plus the data file. New facts get reviewed before merge.
   - Anti-AI rules apply -- no flowery language, no em-dashes.

3. **City-progress tracker bento (Overview > Hero)**. Below the "X days to Kailash / JAI BHOLE NATH" countdown, render a vertical chain of the yatra route cities with the visitor's CURRENT location highlighted. The chain is fixed (per the itinerary):
   ```
   Mumbai  ->  Kathmandu  ->  Lhasa  ->  Shigatse  ->  Saga  ->  Mansarovar
       ->  Darchen  ->  Dirapuk  ->  Dolma La  ->  Zuthulphuk  ->  Darchen
       ->  Saga  ->  Shigatse  ->  Lhasa  ->  Kathmandu  ->  Mumbai
   ```
   Geolocation source: a free IP-geo API (e.g. ipapi.co/json or ip-api.com -- pick at /grill-me, considering: China reachability, rate limits, no API key). Match the API's `city` (or country fallback) to the nearest node in the chain; nothing matches -> show the chain without a highlight + a small "We could not detect your location" footer.
   Constraints:
   - Visual: vertical stack of pills, current city filled (`bg-primary text-primary-foreground`), next-up showing a subtle pulse, past cities `text-muted-foreground` with strike-through, future cities default.
   - Position: in the Hero bento, between the countdown card and the prep card. New BentoGridItem with `colSpan: 2`; diagonal stripe pattern only if the user can tap to expand details (decide at /grill-me).
   - Data fetching: client-side on mount, cache the geolocation in `sessionStorage` for 1 hour so a refresh doesn't re-hit the API. Fail silently if unreachable (covers China + privacy blockers).
   - Privacy note: this is the first feature that reads ANY data about the visitor. Surface that on the Hero card itself ("Approximate city detected from your IP; nothing is stored.") and also in the Prepare-tab privacy line if anyone clicks through.

### Plausibly later (not designed)

- Remove the dead `@aliimam/icons` manualChunks stub from `vite.config.ts`.
- Cross-device prep sync via shareable URL token or read-only export.
- Share-screenshot generator: one-tap export of the current day card as a shareable image.
- Day map carousel: swipe between day maps without opening each DayCard individually.
- Auto-refresh JourneyState across midnight.
- Offline-capable service worker so the full site loads with no network after first visit.

---

## Change log

- 2026-06-22 v1 -- initial PRD authored by Sonnet covering through PR #150.
- 2026-06-22 v2 -- locked-in rewrite covering through PR #182. Reflects icon-system migration, sticky chip strips on all 3 content tabs, Hero countdown tappable, Purang routing, prep-checklist binary states, 14 categories, FAQs article, Clarity + GA4, full perf pass.
- 2026-06-22 v2.1 -- locked-in next three roadmap items: shadcn watermelon FAQ accordion, per-day-pair Kailash facts between day cards, city-progress tracker bento driven by IP geolocation. Designs go to /grill-me before build.
