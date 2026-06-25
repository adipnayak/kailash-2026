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
- `CityTracker` (embedded in the countdown bento, NOT a separate tile): horizontal scrolling pill strip rendered INSIDE the countdown card beneath `JAI BHOLE NATH`. 14-node round trip for IN cohort (Mumbai -> KTM -> Lhasa -> Purang -> Mansarovar -> Darchen -> Dirapuk -> Dolma La -> Zuthulphuk -> Darchen -> Purang -> Lhasa -> KTM -> Mumbai); 16 nodes for AE/MU/US cohorts (cohort origin pill prepended + appended); 12-node tail-clipped chain (Kathmandu start/end) when IP geo fails. Color states: done = `bg-emerald`, current = `bg-emerald` + `ring-2 ring-foreground/40` + `aria-current="step"`, upcoming = `bg-foreground text-background`, sacred entry-point (only on geo-fail Kathmandu) = `bg-sacred`. Strip is `w-full min-w-0` so it clips inside the bento with horizontal `overflow-x-auto` internal scroll (per PR #197 fit fix). `arrow_forward` connectors between pills. iOS hardening: `touchAction: manipulation`, `WebkitTapHighlightColor`, `overscrollBehaviorX: contain`. Auto-scrolls current pill via `strip.scrollBy({ left: delta })`. Optional "Watching from <city>, <country>" label appears above the strip ONLY for non-cohort visitors (cohort = OTHER) when geo succeeded. Cohort logic in `app/src/lib/city-cohort.ts` (pure function). Persistence: localStorage `kailash_route_v1` stores `{ startCity, startCountry, endCity, endCountry, source: 'ip' | 'fallback' }` once after the first successful or failed fetch; sessionStorage `kailash_geo_v1` 1h TTL wraps the raw ipapi.co fetch. Privacy footer line removed entirely.

**Data sources:** `DAYS` from `trip-data.ts`, `computeJourneyState()` from `journey-state.ts`, `loadPrepStatus()` + `overallPrepProgress()` from `prep-data.ts`.

**Interactions:** tap countdown bento to jump to Itinerary tab; tap prep card to jump to Prepare tab; AltitudeChart segmented control (Walking/Sleeping toggle).

**Devotional budget:** `JAI_BHOLE_NATH` (from `lib/devotional.ts`) appears exactly once in the Hero before-phase card. `YATRA_SAMPOORNA` appears exactly once in the Hero after-phase card.

---

### Itinerary

**What renders:**
- `ConnectivityRibbon`: 13-day dot strip showing per-day connectivity (good/intermittent/offline). Three colours: emerald (WiFi + phone), sacred/gold (phone only), destructive/red (no signal). Phase-aware headline. Before: highlights the offline cluster D7-D9. During: today's dot gets a ring highlight. GFW note (D3-D10, VPN needed) always visible.
- Sticky day-chip nav below "Day by Day" heading. Each chip is a vertical stack: D# icon row, then temp range + moon phase icon (10 px font). 13 chips total. Today gets a clock icon; Dolma La (Day 8) gets a landscape icon in destructive. Active chip = the day section currently in the scrollspy zone (IntersectionObserver, top-biased rootMargin). Optimistic-active: tapping a chip marks it active immediately (no wait for scroll). Auto-scrolls the active chip to center of strip using `strip.scrollBy({ left: delta })` (not `scrollIntoView` -- iOS Safari mis-routes that). `overscrollBehaviorX: contain`. `touchAction: manipulation` + `WebkitTapHighlightColor` on every chip. Tapping a chip expands that DayCard and scrolls to it via `window.scrollTo({ top, behavior: 'smooth' })` with 300 ms defer post-expand.
- 13 `DayCard` components. All expanded on first tab visit (default state = Set of all day numbers).
- **Kailash facts between day cards**: 12 facts from `app/src/lib/kailash-facts.ts` rendered one-per-pair between consecutive DayCards. Slim `border-l-4 border-sacred bg-card px-4 py-3 my-2` block. "FACT" eyebrow `font-mono uppercase tracking-widest text-sacred text-[10px]`. Body `text-sm text-foreground leading-snug`. Optional muted source line below. Static (no icon, no tap). NOT counted in the sticky day chip strip (chip count stays 13), NOT observed by the IntersectionObserver scrollspy (each fact div has no `id="day-N"`). Mix mode: contextual where the upcoming day has strong material (Mansarovar D6, Dolma La D8, Dirapuk D7, parikrama closing D9), general Kailash trivia for transit days.

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

Each article renders typed blocks: prose, heading, table, ordered-list, unordered-list, callout (tones: critical/warning/info), accordion. Callout borders use `--destructive` (critical), `--sacred` (warning), `--border` (info).

**FAQ accordion (FAQs article only)**: the 6 Q/A section groups (Insurance / Kit Provided / Medical Support / Porters and Horses / Accommodation / Cash) plus the China Group Visa and Operator Contacts sections use the new `accordion` RefBlock variant: `{ type: 'accordion', items: Array<{ question: string, answer: string }> }`. Rendered with shadcn watermelon-style `<Accordion type="multiple" defaultValue={['q-0']}>` so the first question in each section is open by default and opening additional questions doesn't close prior ones. State ephemeral (no localStorage). Chevron uses Material Symbols `expand_more`, rotates 180deg via the modern `rotate` CSS property (Tailwind v4) on `data-state=open`. Animations `accordion-down` / `accordion-up` defined as `@keyframes` in `app/src/index.css` (tailwindcss-animate does not ship them). Built on `@radix-ui/react-accordion` (the shadcn CLI is interactive-only, so the component was authored from the watermelon registry JSON, not generated). Other reference articles continue to render heading + prose unchanged.

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
- **Preconnect hints** in `<head>` for CartoDB, OSRM, Open-Meteo, ipapi.co, clarity.ms, googletagmanager.com.

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

`REFERENCE_ARTICLES`: 8 static articles. Types: `RefBlock` (prose/heading/table/ordered-list/unordered-list/callout/accordion), `RefArticle` (id, title, icon, intro, blocks).

### kailash-facts.ts

`KAILASH_FACTS: KailashFact[]` -- 12 facts indexed by day-pair (index `i` = fact rendered BETWEEN day i+1 and day i+2). Each fact: `{ title?, body, source? }`. Plain text only, no JSX. Anti-AI rules apply to the copy itself.

### city-cohort.ts

`getCohortChain(countryCode: string | null, countryName?: string): CohortRoute` -- pure function. Maps an IP country code to a `CohortKey` (`'IN' | 'AE' | 'MU' | 'US' | 'OTHER' | 'FALLBACK'`) plus the rendered chain and start/end city + country. `null` triggers FALLBACK (12-node tail-clipped Kathmandu chain). Side-effect free, fully unit-testable.

### origin.ts

Yatri cohort auto-detect from IANA timezone (originally PRD v3.10 section 0.14.3). `detectOriginFromTz(tz)` returns `OriginId = 'mumbai' | 'uae' | 'mauritius' | 'us' | 'all'`. localStorage `kailash_origin` override wins over auto-detect (used for manual cohort switching in case the visitor is travelling). The newer `city-cohort.ts` flow is the city tracker's source of truth; `origin.ts` continues to drive any per-cohort copy outside the tracker.

### timezone.ts

Dual-mode timezone helpers. `TzMode = 'local' | 'trip'`. In `'trip'` mode, the displayed timezone follows the itinerary: Asia/Kathmandu for Days 1-2 and 11-13, Asia/Shanghai for Days 3-10. localStorage keys: `kailash_tz_pref` (the user's chosen IANA zone), `kailash_tz_mode` (`'local'` vs `'trip'`).

### localStorage keys

All keys scoped to `kailash_` prefix.

| Key | Written by | Read by | Contents |
|---|---|---|---|
| kailash_tab | useTabPersist | useTabPersist | active tab |
| kailash_prep_v2 | savePrepStatus | loadPrepStatus | JSON StatusMap (Record<itemId, ItemStatus>) |
| kailash_altitude_mode | AltitudeChart | AltitudeChart | 'walking' or 'sleeping' |
| kailash_theme | ThemeToggle | ThemeToggle | 'light' or 'dark' |
| kailash_route_v1_{day} | road-routing.ts | road-routing.ts | cached OSRM geometry per day |
| kailash_route_v1 | CityTracker | CityTracker | JSON `{ startCity, startCountry, endCity, endCountry, source: 'ip' \| 'fallback' }`, resolved cohort route from ipapi.co (city tracker) |
| kailash_origin | origin.ts | origin.ts, Hero | `OriginId` override for yatri cohort. Values: `'mumbai' \| 'uae' \| 'mauritius' \| 'us' \| 'all' \| 'auto'` |
| kailash_tz_pref | timezone.ts | timezone.ts | user's chosen IANA timezone string |
| kailash_tz_mode | timezone.ts | timezone.ts | `'local' \| 'trip'` |

**sessionStorage keys:**

| Key | Written by | Read by | Contents |
|---|---|---|---|
| kailash_geo_v1 | CityTracker | CityTracker | JSON `{ countryCode, countryName, city, fetchedAt }` raw ipapi.co fetch, 1h TTL |

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
| Accordion primitives | @radix-ui/react-accordion | latest | Powers the FAQ accordion (shadcn watermelon-style) |

**@aliimam/icons is gone.** It was a 5+ MB un-tree-shakeable barrel (all ~800 icons in one export block, no `__PURE__` annotations). Replaced with `material-symbols` + the `Icon.tsx` wrapper.

**External APIs (free, no key):**
- Open-Meteo: daily weather forecast, 16-day horizon. Graceful fallback to climatology.
- OSRM (router.project-osrm.org): road geometry for drive/walk legs. Fallback to straight-line when no route (thin Tibet coverage).
- ipapi.co (`/json/`): visitor IP geolocation for the city tracker. HTTPS, no key, 1k req/day per IP, Cloudflare-hosted (China-reachable). Fail-silent. Result cached 1h in sessionStorage; resolved cohort persisted in localStorage so subsequent loads skip the fetch.

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

### Recently shipped (now documented in per-tab specs above)

- FAQ accordion in Reference > FAQs (PR #189). Spec lives under "Reference".
- Kailash facts between day cards in Itinerary (PR #191). Spec lives under "Itinerary".
- City-progress tracker embedded in the countdown bento, v2.4 with full round trip + cohort + sacred fallback + localStorage persistence (PRs #190, #196, #197). Spec lives under "Overview".

### Locked-in (designed, ready to build)

1. **Reference article #9: "Apps and Connectivity in Tibet / China"** -- a yatri-facing field guide to which apps work behind the GFW, which require a VPN, and which Chinese alternatives to install before departure. Distinct from the existing "Connectivity Playbook" article (which covers hardware: SIMs, satellite phones, hotel WiFi). The new article covers SOFTWARE: install-before-you-leave checklist, app-by-app compatibility tables, VPN guidance, payment-app caveats.

   **Position in `REFERENCE_ARTICLES`**: between "Connectivity Playbook" (id `connectivity-playbook`) and "Bag Transitions" (id `bag-transitions`). Article id `apps-in-china`. Sticky article-nav chip count goes from 8 to 9.

   **Icon**: Material Symbols `smartphone` (or `apps` -- decide at build time; both already covered by the icon-font subset).

   **Intro copy**:
   > China's Great Firewall blocks most Google, Meta, Twitter, and many Western services. Install and log in to everything BEFORE entering China. Many SMS verifications and first-time activations fail inside Tibet. Once you're past the GFW, you cannot easily install new apps or sign in to old ones without a VPN that already works.

   **Blocks** (in order, all rendered via the existing `RefBlock` typed system):

   1. `callout` (tone: critical) -- "Install and log in to everything before arriving in China. Many verification SMS messages and app activations do not work reliably once you are inside Tibet."

   2. `heading` "Communication apps"

   3. `table` (4 columns: App, Works in China, Notes, Chinese alternative):

      | App | Works in China | Notes | Chinese alternative |
      |---|---|---|---|
      | WhatsApp | Blocked | VPN required | WeChat |
      | Facebook Messenger | Blocked | VPN required | WeChat |
      | Instagram | Blocked | VPN required | Xiaohongshu (RED) |
      | Facebook | Blocked | VPN required | Weibo |
      | X (Twitter) | Blocked | VPN required | Weibo |
      | Telegram | Unreliable | VPN often required | WeChat |
      | Gmail | Blocked | VPN required | Outlook |
      | Google Meet | Blocked | VPN required | Zoom |
      | Zoom | Usually works | Most reliable Western option | -- |
      | Microsoft Teams | Usually works | Generally accessible | -- |
      | WeChat | Works | China's primary comms app -- install and verify before you go | -- |

   4. `heading` "Maps and navigation"

   5. `table`:

      | App | Works | Notes |
      |---|---|---|
      | Google Maps | Limited / blocked | Not reliable |
      | Apple Maps | Generally works | Default for iOS users |
      | Maps.me | Excellent offline | Download Tibet region before departure |
      | Organic Maps | Excellent offline | Open-source alternative to Maps.me |
      | Amap (Gaode) | Works | China's local map app |
      | Baidu Maps | Works | China's other local map app |

   6. `callout` (tone: warning) -- "For this yatra, you will not need navigation much (the operator handles all routing). But offline maps are still useful for orientation. Download Tibet region in Maps.me or Organic Maps before departure."

   7. `heading` "Email"

   8. `table`:

      | App | Works | Notes |
      |---|---|---|
      | Gmail | VPN required | Both web + app blocked |
      | Outlook | Generally works | Recommended for the trip |
      | Yahoo Mail | Variable | Inconsistent reachability |
      | Apple Mail | Works for non-Gmail accounts | iCloud Mail works; Gmail accounts via Apple Mail still need VPN |

   9. `heading` "Cloud storage"

   10. `table`:

       | App | Works | Notes |
       |---|---|---|
       | Google Drive | VPN required | |
       | Google Photos | VPN required | |
       | Dropbox | Inconsistent | Sometimes works, sometimes not |
       | OneDrive | Usually works | |
       | iCloud | Usually works | |

   11. `callout` (tone: warning) -- "Keep offline copies on your device of: passport, visa, insurance, flight tickets. Do not rely on cloud retrieval from inside Tibet."

   12. `heading` "Search and translation"

   13. `table`:

       | App | Works | Notes |
       |---|---|---|
       | Google Search | Blocked | Use Bing or DuckDuckGo |
       | Google Translate | Blocked | Use Microsoft Translator or Apple Translate |
       | Microsoft Translator | Works | Download offline English-Chinese pack before departure |
       | Apple Translate | Works | Download offline packs before departure |
       | Pleco | Works | Best Chinese-English dictionary; offline-capable |

   14. `callout` (tone: warning) -- "Download offline language packs BEFORE you leave: English <-> Chinese for navigation, Hindi <-> English for the group, plus Tibetan if you want signage support."

   15. `heading` "VPNs"

   16. `prose` -- "Many international services require a VPN to work behind the GFW. Common options that have historically worked: ExpressVPN, NordVPN, Surfshark, Astrill (used widely by long-term China residents). VPN reliability is a moving target -- what worked last month may fail today."

   17. `callout` (tone: critical) -- "Install AND test your VPN before entering China. Downloading or activating VPN services from inside China is difficult -- the VPN app stores themselves are throttled. The day you arrive is the worst day to discover your VPN does not work."

   18. `heading` "Payment apps"

   19. `table`:

       | App | Works | Notes |
       |---|---|---|
       | Visa / Mastercard | Limited | Accepted at major hotels and airports; not at smaller shops |
       | Google Pay | Blocked | |
       | Apple Pay | Limited | Some merchants only |
       | WeChat Pay | Limited for foreign visitors | Requires Chinese bank linkage or temporary tourist mode (recently rolled out for international cards) |
       | Alipay | Limited for foreign visitors | Same as WeChat Pay; tourist mode available |
       | Cash (CNY) | Always works | Carry enough for incidentals, tips, food not covered by the operator |

   20. `callout` (tone: warning) -- "Carry CNY cash in small denominations for personal expenses and emergencies. The operator covers meals and accommodation, but you will want cash for snacks, water, souvenirs, and tips."

   21. `heading` "Best setup for this yatra (pre-departure checklist)"

   22. `unordered-list`:
       - WhatsApp installed and logged in
       - VPN installed and tested (not just installed -- actually connect to a foreign server once before you fly)
       - Offline maps downloaded (Tibet region in Maps.me or Organic Maps)
       - Passport scan saved offline on phone
       - Visa scan saved offline on phone
       - Insurance documents saved offline on phone
       - Emergency contacts saved offline (not just in the cloud address book)
       - Important PDFs downloaded to device storage
       - Offline language packs downloaded (Microsoft Translator or Apple Translate, English <-> Chinese)
       - WeChat installed, verified, and a small balance loaded if you want to try paying with it
       - This site saved as a home-screen icon so it behaves like a native app during the trip

   23. `heading` "Connectivity expectations during the journey"

   24. `table`:

       | Location | Days | Connectivity |
       |---|---|---|
       | Kathmandu | D1, D2, D11, D12 | Excellent |
       | Lhasa | D3, D4, D10 | Good |
       | Purang | D5, D10 | Moderate |
       | Mansarovar | D5, D6 | Limited (phone only at hotel) |
       | Darchen | D7, D9 | Limited |
       | Dirapuk | D7 | Very limited |
       | Dolma La | D8 | None |
       | Zuthulphuk | D8 | Very limited |

   25. `callout` (tone: info) -- "Family members: during the parikrama (Days 7-9), delayed communication is normal and expected. A 24-48 hour silence is not a cause for concern."

   26. `heading` "Add the site to your home screen"

   27. `prose` -- "On iPhone: open the site in Safari, tap the share icon, scroll to 'Add to Home Screen'. On Android: open the site in Chrome, tap the three-dot menu, select 'Install app' or 'Add to home screen'. The site then behaves like a native app -- launches without browser chrome, loads instantly from cache, and works during the trip even when the rest of the internet is unreachable."

   **Acceptance criteria**:
   - [ ] `apps-in-china` article inserted in `REFERENCE_ARTICLES` between `connectivity-playbook` and `bag-transitions`
   - [ ] Article-nav sticky chip strip shows 9 chips (was 8); scrollspy continues to work
   - [ ] All `table` blocks render with the existing table renderer (no new block type needed)
   - [ ] All `callout` blocks use the correct tone (critical / warning / info)
   - [ ] Anti-AI rules followed throughout (zero em-dashes, en-dashes, smart quotes, emojis)
   - [ ] Build clean
   - [ ] Mirror to `/private/tmp/ralph-v4-verify-89196/kailash-2026/`

2. **Per-day bag state + airline weight allowances**. Surface "where are my bags today" inside the Itinerary tab DayCards, plus an explicit airline-weight-allowance table in Reference > Bag Transitions. Operator-sourced (existing 4-bag system in the Bag Transitions article is trusted; Adip to verify specific weight numbers with YPO before packing day).

   **Data model** -- new `bagState: BagState` field on each `TripDay` in `app/src/lib/trip-data.ts`:

   ```ts
   type BagId = 'main' | 'duffle' | 'daypack-personal' | 'daypack-ypo';
   type BagStateTag = 'with-you' | 'stowed' | 'stowed-locked' | 'with-porters' | 'in-transit' | 'not-yet';

   interface BagLocationRow {
     location: string;        // 'With you' | 'KTM Marriott' | 'Lhasa storage' | 'With porters'
     bags: BagId[];           // multiple bags can share a location
     state: BagStateTag;
     note?: string;           // '4-6 kg target', 'locked, 5 nights'
   }

   interface BagState {
     rows: BagLocationRow[];  // typically 2 rows; 3 on parikrama (D7-D9) and handoff (D5, D10)
     flight?: {
       leg: string;           // 'BOM -> KTM' | 'LXA -> Purang'
       flightNo?: string;     // '6E-1157'
       checkKg: string;       // '30' or '10-20'
       cabinKg: string;       // '7' or '5'
     };
   }
   ```

   **DayCard `BAGS TODAY` block** -- renders in the EXPANDED DayCard, between the summary strip (wake/walking/sleep) and the timeline. Stacked rows, each row = `[icon] LOCATION  -  bags listed  -  [state badge + optional note]`. Block sits between the summary strip and the timeline. Flight days get an inline sub-row at the bottom: `FLIGHT ALLOWANCE: <leg> · <flightNo?> · Check <checkKg> kg + Cabin <cabinKg> kg`.

   State badge colors (re-using existing tokens):
   - `with-you` -> `bg-emerald text-background`
   - `with-porters` -> `bg-sacred text-sacred-foreground`
   - `stowed-locked` -> `bg-muted text-muted-foreground` + Material Symbols `lock` icon
   - `stowed` -> `bg-muted text-muted-foreground`
   - `in-transit` -> `bg-sacred/30 text-foreground`
   - `not-yet` -> `bg-muted/30 text-muted-foreground` (italic)

   **Per-day bagState (working draft, verify with YPO before packing day)**:

   | Day | Rows | Flight |
   |---|---|---|
   | D1 KTM | (with-you: Personal daypack) (stowed: KTM Marriott - Main suitcase) (not-yet: YPO duffle, YPO daypack) | BOM→KTM 6E-1157 30/7 |
   | D2 KTM | (with-you: Personal daypack, YPO daypack [PM]) (stowed: Marriott - Main suitcase, YPO duffle [PM]) | -- |
   | D3 KTM→Lhasa | (with-you: Cabin - Personal daypack) (in-transit: Checked - Main, YPO duffle) | KTM→LXA 20/5-7 |
   | D4 Lhasa | (with-you: Personal daypack) (stowed: St Regis room - Main, YPO duffle) | -- |
   | D5 HANDOFF | (with-you: Cabin - Personal daypack) (stowed-locked: Lhasa St Regis storage - Main suitcase, locked 5 nights) (in-transit: With group - YPO duffle) | LXA→Purang 10-20/5 |
   | D6 Mansarovar | (with-you: Personal daypack) (stowed: Hotel - YPO duffle) (stowed-locked: Lhasa storage - Main) | -- |
   | D7 Dirapuk | (with-you: Personal daypack, 4-6 kg target) (with-porters: YPO duffle) (stowed-locked: Lhasa storage - Main) | -- |
   | D8 Dolma La | same as D7 | -- |
   | D9 Zuthulphuk→Darchen | same as D7 | -- |
   | D10 REUNION | (with-you: Cabin - Personal daypack) (in-transit: With group - YPO duffle) (with-you: REUNION at St Regis - Main suitcase, just retrieved) | Purang→LXA 10-20/5 |
   | D11 Lhasa→KTM | (with-you: Cabin - Personal daypack) (in-transit: Checked - Main, YPO duffle) | LXA→KTM 20/5-7 |
   | D12 KTM | (with-you: Personal daypack) (stowed: Marriott - Main, YPO duffle) | -- |
   | D13 KTM→Mumbai | (with-you: Cabin - Personal daypack) (in-transit: Checked - Main, YPO duffle) | KTM→BOM RA-201 30/7 |

   **Reference > Bag Transitions article additions**:
   - New `heading` block "Airline weight allowances" at the bottom of the article (after the existing 5 critical rules)
   - `callout` (tone: warning) immediately under the heading: "Numbers below are typical for these routes. Verify with YPO before packing day. The LXA-Purang leg is the binding constraint for Days 5-10 packing."
   - `table` block, columns: `Leg / Flight / Check (kg) / Cabin (kg) / Notes`:

     | Leg | Flight | Check (kg) | Cabin (kg) | Notes |
     |---|---|---|---|---|
     | BOM -> KTM (Day 1) | IndiGo 6E-1157 | 30 | 7 | Standard international economy |
     | KTM -> LXA (Day 3) | Air China / Tibet Airlines | 20 | 5 to 7 | High-altitude route, lower limits common |
     | LXA -> Purang (Day 5) | Tibet Airlines small aircraft | 10 to 20 | 5 | Small plane, strict limits, LiPo over 100 Wh restricted, no drones |
     | Purang -> LXA (Day 10) | Tibet Airlines small aircraft | 10 to 20 | 5 | Same as Day 5 |
     | LXA -> KTM (Day 11) | Air China / Tibet Airlines | 20 | 5 to 7 | Same as Day 3 reverse |
     | KTM -> BOM (Day 13) | Nepal Airlines RA-201 | 30 | 7 | Standard international economy |

   - Existing 10-phase routing table stays as-is in the article (redundant with the new DayCard block, but no harm; could be flagged for future cleanup once the DayCard block proves the per-day surfacing works).

   **Anti-AI rules** apply.

3. **Day-wise Diamox regime**. Surface Adip's prescribed Diamox (acetazolamide) regime as the canonical Mumbai-cohort example, day-wise, INCLUDING days outside the 13-day itinerary (T-9 test dose 28 Jun, T-1 start 6 Jul, post-descent buffer 20-21 Jul). Each yatri compares against their own doctor's Rx.

   **Data shape** -- new file `app/src/lib/diamox-regime.ts`:

   ```ts
   export type DiamoxDoseType = 'test' | 'start' | 'maintenance' | 'buffer';

   export interface DiamoxDose {
     dateISO: string;            // '2026-06-28'
     dayLabel: string;           // 'Sun 28 Jun' (rendered)
     phaseLabel: string;         // 'T-9' | 'T-1' | 'D1' | 'D8' | 'D14' (buffer)
     type: DiamoxDoseType;
     doses: number;              // 1 or 2
     mg: number;                 // 125
     tabs: string;               // 'half' or '1' (250 mg tablets, plain English, no fractions glyph)
     schedule: 'morning' | 'evening' | 'twice-daily';
     use: string;                // human-readable purpose
   }

   export const DIAMOX_REGIME: DiamoxDose[];
   export const DIAMOX_REGIME_BY_DATE: Record<string, DiamoxDose>;  // derived map for O(1) date lookups
   ```

   **Canonical 24-day regime (Mumbai cohort)**:

   | Date | Phase | Type | Doses | mg each | Tabs (250 mg) | Use |
   |---|---|---|---|---|---|---|
   | Sun 28 Jun 2026 | T-9 | test | 1 evening | 125 | half | Test dose (sulfa allergy + tolerance check) |
   | Mon 6 Jul 2026 | T-1 | start | 1 evening | 125 | half | Prophylactic start, evening before first altitude exposure (D3 Lhasa) |
   | Tue 7 Jul | D1 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Wed 8 Jul | D2 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Thu 9 Jul | D3 | maintenance | 2 twice-daily | 125 | 1 | Maintenance (first altitude jump to Lhasa) |
   | Fri 10 Jul | D4 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Sat 11 Jul | D5 | maintenance | 2 twice-daily | 125 | 1 | Maintenance (Lhasa to Mansarovar) |
   | Sun 12 Jul | D6 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Mon 13 Jul | D7 | maintenance | 2 twice-daily | 125 | 1 | Maintenance (parikrama starts) |
   | Tue 14 Jul | D8 | maintenance | 2 twice-daily | 125 | 1 | Maintenance (Dolma La 5,630 m) |
   | Wed 15 Jul | D9 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Thu 16 Jul | D10 | maintenance | 2 twice-daily | 125 | 1 | Maintenance (return to Lhasa) |
   | Fri 17 Jul | D11 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Sat 18 Jul | D12 | maintenance | 2 twice-daily | 125 | 1 | Maintenance |
   | Sun 19 Jul | D13 | maintenance | 2 twice-daily | 125 | 1 | Maintenance (return to Mumbai) |
   | Mon 20 Jul | D14 | buffer | 2 twice-daily | 125 | 1 | Post-descent buffer (do not stop abruptly) |
   | Tue 21 Jul | D15 | buffer | 2 twice-daily | 125 | 1 | Post-descent buffer |
   | **Total** | | | **32 doses** | | **16 tabs** | |

   **DayCard DIAMOX TODAY block**:
   - Slim single-line block, `border-l-4 border-sacred bg-card px-4 py-2`, sits ABOVE the BAGS TODAY block in the expanded DayCard.
   - Format on a maintenance day: `[pill icon] DIAMOX TODAY  -  125 mg morning + 125 mg evening (twice daily)`.
   - On the test day (28 Jun, NOT a TripDay) and start day (6 Jul, NOT a TripDay), there is no DayCard to render into -- those bookend dates are surfaced only in the Reference calendar.
   - Renders only when `DIAMOX_REGIME_BY_DATE[day.date]` is defined.
   - Anti-AI: "twice daily" spelled out; do not surface "BID" jargon to yatris.

   **Reference > Medicines article additions** -- inserted AFTER the existing "DIAMOX (ACETAZOLAMIDE) PROTOCOL" Q&A table, BEFORE "DIAMOX COMMON SIDE EFFECTS":

   1. `heading` "DIAMOX REGIME CALENDAR"

   2. `callout` (tone: info): "Canonical regime for the Mumbai cohort (28 Jun to 21 Jul). If your return-home is later than 19 Jul (Dubai, Mauritius, New York cohorts), continue twice daily through YOUR return-home day plus 1 to 2 day buffer. Your doctor confirms exact dose and timing for your medical profile."

   3. `table` columns `Date / Phase / Use / Dose / mg / Tabs` with all 17 rows from the regime table above (test + start + 13 maintenance + 2 buffer). Rendering layer adds `ring-2 ring-sacred` + a `TODAY` chip on the row matching `journeyState.todayISO` if today falls anywhere in the regime window (covers bookends too, not just trip days).

   4. `heading` "WHY WE DO NOT STOP ABRUPTLY"

   5. `prose`: "After Diamox prophylaxis, do not stop abruptly. Continue twice daily for 1 to 2 days after you reach your final return-home destination, so the body's compensatory respiratory drive (increased ventilation that the drug induced) tapers smoothly as the drug clears. Diamox elimination half-life is roughly 4 to 9 hours; full physiological reset takes about 24 to 48 hours. The buffer also provides safety margin against unexpected re-ascent (delayed flight, missed connection, layover at altitude). For most adults at 125 mg twice daily, no formal taper is needed; the 1 to 2 day continuation IS the taper."

   6. `callout` (tone: warning): "If you have onward travel from Mumbai (Dubai, Mauritius, New York, etc.), continue twice daily through your return-home day plus 1 to 2 day buffer. Your buffer dates shift later than 20 to 21 Jul. Your doctor confirms."

   **Existing protocol Q&A row update** -- change the `Duration` row in the existing DIAMOX PROTOCOL table:
   - Current: `["Duration", "Continue through the high-altitude leg. Stop on Day 10 evening at Lhasa.", "Doctor confirms."]`
   - New: `["Duration", "Continue twice daily through your return-home day. Add a 1 to 2 day post-descent buffer. Do not stop abruptly. See the regime calendar below for exact dates.", "Doctor confirms exact dose, end date, and taper."]`

   **Anti-AI rules** apply. Never write "BID" in user-facing copy -- always spell out "twice daily" or "morning + evening". The Latin abbreviation is medical jargon; the audience is 23 yatris, not clinicians.

4. **LIVE location pin on the city tracker current pill**. Small visual addition to the city tracker (`CityTracker` component) to make the "you are here" semantic explicit and real-time. Layers on top of the existing `current` pill rules from PRD v2.4-final; adds nothing to the cohort detection / fallback / chain logic.

   **Where**: inline INSIDE the current pill, BEFORE the city name. Pill content goes from `Mumbai` to `[my_location] Mumbai`.

   **Icon**: Material Symbols `my_location` (concentric circles, Google Maps live-GPS dot). Size `12px` to match the pill's `text-xs`. `aria-hidden="true"` -- city name + `aria-current="step"` already convey the "current" semantic to AT.

   **Color**: inherits via `currentColor` from the pill's text. On the emerald `current` state that means `text-background` (light on emerald). No new color token.

   **Stacking with the existing ring**: pin and ring COEXIST. Ring continues to mark "current in chain order" (structural cursor); pin adds the "LIVE -- this is YOU" semantic. No conflict.

   **Animation** -- subtle pulse on the pin only:
   - Opacity `1 -> 0.6 -> 1` over `2s`, `ease-in-out`, `infinite`.
   - New keyframe `@keyframes pulse-live` in `app/src/index.css`. Utility class `animate-pulse-live` registered via `@theme` (matches the accordion-down/up pattern already in the file).
   - Wrapped in `@media (prefers-reduced-motion: no-preference)` so it pauses for users who've opted out.

   **When the pin renders** (follows the existing `current` pill rules, NOT a new state machine):
   - **before** phase + cohort matched (IN/AE/MU/US): pin on the cohort start pill (visitor's home city)
   - **before** phase + cohort OTHER: no current pill exists -> no pin (consistent with current ring behavior)
   - **during** phase: pin on the chain index mapped from `JourneyState.tripDayIndex`
   - **after** phase: pin on the END pill (rightmost)
   - **Geo-fail fallback (sacred Kathmandu pill)**: NO pin. The sacred marker means "we don't know where you are" -- a LIVE pin would be misleading. Sacred state visually stays as-is. This is the only "current-like" state that does NOT get the pin.

   **Implementation locus**: edit `app/src/components/CityTracker.tsx` (add the pin element inside the current pill JSX) + `app/src/index.css` (add the `pulse-live` keyframe + theme registration). That's it. No data model changes. No new RefBlock variant. No new exported types.

   **Anti-AI rules** apply.

5. **v2.9 bundle: step count chip + Diamox bookend cards + 17-chip strip + live weather everywhere + precip type (rain / snow / hail)**. Four logically separate adds bundled into one PR because of heavy file overlap (DayCard.tsx + ItineraryTab.tsx + weather.ts shared across multiple changes). One Sonnet ralph loop, sequential.

   **5a. Step count chip on the existing walk/trek chip (DayCard)**:
   - Extend the existing walk chip in `DayCard.tsx` chips builder (around the `directions_walk` icon block) to append derived step count
   - Computation: `const totalSteps = Math.round((day.timing.walk_h * 5500 + day.timing.active_trek_h * 4500) / 500) * 500;`
   - Constants: `5500 steps/hour` for `walk_h` (KTM/Lhasa sightseeing pace), `4500 steps/hour` for `active_trek_h` (altitude + uneven terrain + daypack slows the pace)
   - Display format: `8h trek - ~36,000 steps` / `2h walk - ~11,000 steps`. Comma-grouped via `toLocaleString('en-US')`. `~` prefix to signal approximation. Plain ASCII hyphen separator (or middle dot `·` if it's already used in the file).
   - No new data, no new types, no new field on TripDay. Pure derivation from existing `timing` fields.

   **5b. Diamox bookend mini-cards (Itinerary)**:
   - New `app/src/components/DiamoxBookendCard.tsx` component. Props: `{ dose: DiamoxDose }`. Renders a compact card with:
     - Header: date (e.g. "Sun 28 Jun 2026") + uppercase badge (`PRE-TRIP - TEST DOSE`, `PRE-TRIP - START TONIGHT`, `POST-TRIP - BUFFER`, `POST-TRIP - FINAL DOSE`)
     - Body: the same DIAMOX TODAY block already used in DayCard (sacred-ochre left border, "DIAMOX TODAY" eyebrow, the `describeDose(dose)` line)
     - Footer: 1-line context note per dose type (see context lines in the table below)
     - NO bagState, weather, timeline, map, spiritual focus, walking chips. This is a Diamox-only card.
     - Anchor `id="diamox-{dateISO}"` (e.g. `id="diamox-2026-06-28"`) for scrollspy + jump-to.
   - 4 instances rendered in `ItineraryTab`:
     - 2 PRE-trip cards rendered ABOVE the D1 card (28 Jun first, 6 Jul second)
     - 2 POST-trip cards rendered BELOW the D13 card (20 Jul first, 21 Jul second)
   - Context-note copy per dose (verbatim):

     | Date | Type | Badge | Context line |
     |---|---|---|---|
     | Sun 28 Jun 2026 | test | `PRE-TRIP - TEST DOSE` | "Test dose at home. Watch for sulfa allergy reaction within 1 hour." |
     | Mon 6 Jul 2026 | start | `PRE-TRIP - START TONIGHT` | "Start prophylaxis tonight. From tomorrow take twice daily through 21 Jul." |
     | Mon 20 Jul 2026 | buffer | `POST-TRIP - BUFFER` | "Continue twice daily at home. Do not stop yet, the buffer prevents rebound." |
     | Tue 21 Jul 2026 | buffer | `POST-TRIP - FINAL DOSE` | "Final twice-daily dose today. Tomorrow you can stop." |

   **5c. 17-chip sticky day strip (Itinerary)**:
   - Sticky day chip strip grows from 13 to 17 chips. Order (left to right): `28 JUN`, `6 JUL`, `D1`, `D2`, ..., `D13`, `20 JUL`, `21 JUL`.
   - Bookend chips render with a different visual treatment:
     - Smaller font (text-[10px] instead of text-xs)
     - `border-sacred bg-card text-sacred` (sacred ochre border + text, vs the existing chip’s border-border / bg-card / text-muted-foreground)
     - Label: date only (`28 JUN`) + small `PRE` or `POST` badge underneath (font-mono uppercase tracking-widest text-[9px])
     - NO temp/moon row (these are not trip days; no weather data exists for them)
   - Scrollspy + jump-to behavior matches the existing trip chips. The scrollspy logic queries `id="day-N"` for trip days and `id="diamox-{dateISO}"` for bookends; the active chip is set per the section whose top has crossed the threshold.
   - Auto-scroll-active-chip via `strip.scrollBy({ left: delta })` continues to work; the strip just has 4 more chips to scroll through.

   **5d. Live weather everywhere (cross-cutting)**:
   - New shared hook `useLiveDayWeather(day: TripDay): { temp_low: number; temp_high: number; precip_pct: number; precip_type: 'rain' | 'snow' | 'storm'; wind_kmh: number; uv: number; source: 'live' | 'climatology' }` in `app/src/lib/weather.ts`. Wraps the existing `useLiveWeather` and fills the same shape regardless of live or fallback source.
   - All 5 currently-static temperature surfaces switch to it:
     - `DayCard` compressed-view header temp (`{low}-{high}C`)
     - `DayCard` chips row temp chip
     - `DayCard` summary header (B1)
     - `ItineraryTab` day-chip strip per-chip temp (the `{d.weather.temp_low}-{d.weather.temp_high}C` line under each `D#`)
     - `Hero` `coldest expected` / `warmest expected` stat tiles (re-derive `min`/`max` across all 13 days from the live hook results)
   - Fallback: when `useLiveWeather` returns null (outside 16-day window, fetch fails, no route coords), return `day.weather` mapped into the same shape with `source: 'climatology'`.
   - Cache: existing in-memory 1-hour TTL in `weather.ts` continues to deduplicate location fetches (~3 API calls total per page load).
   - NO per-number visual marker. The Prepare > WeatherConfidence widget remains the single confidence-explanation surface.
   - Hero stat tiles re-derive every render. As days enter the 16-day window the displayed `min`/`max` shift toward the live forecast.

   **5e. Precip type (rain / snow / hail) (cross-cutting with 5d)**:
   - Extend `weather.ts` Open-Meteo parser to additionally read `weather_code`, `snowfall_sum`, `precipitation_probability_max` from the daily API response.
   - Derive `precip_type: 'rain' | 'snow' | 'storm'` from the WMO `weather_code`:
     - WMO 51-67 OR 80-82 OR 95 (without 96/99) -> `rain`
     - WMO 71-77 OR 85-86 -> `snow`
     - WMO 95 with snow context OR 96 OR 99 (thunder + hail) -> `storm`
     - Default (no precip) -> `rain` (chip won’t render dramatically; 0% reads as dry)
   - Climatology fallback heuristic: if `day.altitude_peak >= 4500 && (day.weather.temp_high <= 0 || day.weather.temp_low <= -5)` -> `snow`. Else -> `rain`.
   - Replace the existing `rainy` chip in `DayCard.tsx` chips builder with a single PRECIP chip whose ICON swaps by type:
     - `rain` -> `<Icon name="rainy" .../>` label `Rain N%`
     - `snow` -> `<Icon name="ac_unit" .../>` label `Snow N%`
     - `storm` -> `<Icon name="thunderstorm" .../>` label `Storm N%`
   - Same chip slot, same row footprint, no row crowding.

   **Files touched in v2.9 bundle**:
   - **New**: `app/src/components/DiamoxBookendCard.tsx`
   - **Edit**: `app/src/lib/weather.ts` (shared hook + precip type extension)
   - **Edit**: `app/src/components/DayCard.tsx` (step count chip + live-weather wiring + precip chip swap)
   - **Edit**: `app/src/components/tabs/ItineraryTab.tsx` (4 bookend card inserts + 17-chip strip + live-weather wiring on chip strip)
   - **Edit**: `app/src/components/Hero.tsx` (re-derive coldest/warmest from live hook)

   Heavy file overlap across the 4 sub-changes prevents safe parallelization; one Sonnet sequential.

   **Anti-AI rules** apply throughout. Zero em-dashes, en-dashes, smart quotes, emojis. User-facing copy spells out "twice daily" everywhere; the BID Latin abbreviation never reaches yatris.

6. **Offline-capable PWA**. Make the entire site work without internet after the first visit. Critical for the Tibet leg (parikrama days D7-D9 are mostly offline; cell coverage in Mansarovar / Darchen / Dirapuk is limited). Yatris install the site as a PWA at home on WiFi and have full coverage during the trip.

   **Library**: `vite-plugin-pwa` (Workbox under the hood). Battle-tested for React + Vite + GitHub Pages. Configured in `app/vite.config.ts` with `registerType: 'autoUpdate'` and `injectRegister: 'auto'`. Silent SW updates on next page load (`skipWaiting: true`, `clientsClaim: true`).

   **Web manifest** (auto-generated as `app/dist/manifest.webmanifest` at build time):
   - `name`: `Kailash Mansarovar Yatra 2026`
   - `short_name`: `Kailash 2026`
   - `description`: `13-day Hindu pilgrimage tracker for the yatra to Mt Kailash and Lake Manasarovar (7 to 19 July 2026).`
   - `theme_color`: `#c69347` (sacred ochre, hex resolved from `oklch(0.65 0.13 75)`)
   - `background_color`: `#ffffff`
   - `display`: `'standalone'`
   - `start_url`: `/kailash-2026/`
   - `scope`: `/kailash-2026/`
   - Icons: `icon-192.png` (192x192), `icon-512.png` (512x512), `icon-512-maskable.png` (512x512, `purpose: 'maskable'`). Placeholder artwork: Material Symbols `landscape` glyph on a sacred-ochre square background. Sonnet generates the PNGs at build time (e.g. via a small Node script using `canvas` or by hand-authoring SVG and rasterizing). Adip can swap with custom artwork later.

   **Workbox cache strategy** (in `VitePWA({ workbox: {...} })`):

   Pre-cached at install time (`globPatterns`): `**/*.{html,js,css,woff2,svg,png,jpg,jpeg,gif,webp}` -- everything in `dist/` except map tiles + API responses. Total ~500 KB-1 MB app shell.

   Runtime caching rules:

   | URL pattern | Strategy | TTL | Max entries |
   |---|---|---|---|
   | `basemaps.cartocdn.com/.*` | CacheFirst | 30 days | 500 |
   | `api.open-meteo.com/.*` | NetworkFirst (3s timeout, fallback to cache) | 24 hours | 50 |
   | `ipapi.co/.*` | NetworkFirst (2s timeout, fallback to cache) | 1 hour | 5 |
   | `router.project-osrm.org/.*` | CacheFirst | 30 days | 100 |

   **Map tile pre-warming**: on SW `activate` event, fetch a curated list of CartoDB tile URLs covering all 13 day routes at relevant zoom levels (probably z=10 + z=13 + z=15). Total ~5-10 MB, ~200-400 tiles. Background fetch, doesn't block page load. List lives in `app/src/lib/precache-tiles.ts` (new file) generated from `day-routes.ts` + `day-stops.ts` bounding boxes.

   **Offline badge**: new `app/src/components/OfflineBadge.tsx`. Reads `navigator.onLine` + subscribes to `online`/`offline` events. Fixed position top-right, BELOW the main nav (e.g. `top-14 right-4`, z-index just below nav at `z-30`). Visual: `bg-destructive text-destructive-foreground font-mono uppercase tracking-widest text-[10px] px-2 py-1 rounded-none border border-destructive`. Label: `OFFLINE`. `aria-live="polite"` so screen readers announce when it appears. Mounted globally in `App.tsx` next to `BackToTop`. Hidden (returns `null`) when `navigator.onLine === true`.

   **Existing static HTML fallback in `#root`**: continues to work alongside the SW. SW intercepts navigation requests for users who have the app installed; for JS-less crawlers (which don't register the SW), the static fallback is what they see. No changes needed.

   **Tech stack dependencies added**:
   - `vite-plugin-pwa` (devDependency, ~latest)
   - `workbox-window` (runtime dependency, ~3 KB gzipped, exposes SW registration helpers)

   **Out-of-scope for this PR**:
   - Push notifications (still in PRD non-goals)
   - Background sync (no writes anyway, so nothing to sync)
   - Periodic sync (no need)
   - Web Share API integration
   - Storage estimation UI ("you've cached X MB")
   - Custom install-prompt component (browser native A2HS is sufficient; the existing "Apps in China" article already explains how)

   **Files touched**:
   - **New**: `app/src/components/OfflineBadge.tsx`, `app/src/lib/precache-tiles.ts`, `app/public/icon-192.png`, `app/public/icon-512.png`, `app/public/icon-512-maskable.png`
   - **Edit**: `app/vite.config.ts` (add `VitePWA(...)` plugin), `app/package.json` + `app/package-lock.json` (add deps), `app/src/App.tsx` (mount `<OfflineBadge />`)

   **Verification approach**: build + serve locally + Chrome DevTools > Application > Service Workers + Lighthouse PWA audit. Manual offline test: install via "Add to Home Screen", disable network, navigate. All previously-visited content should work; new day cards should at least show the chrome + climatology fallback weather.

   **Anti-AI rules** apply.

7. **v2.11 bundle: weather timestamp + suggested packing items + new Ayurvedic Medicines category + Reference master meds list extension**. Three logically separable clusters with disjoint file overlap, parallelizable across 3 worktree-isolated agents.

   **Cluster A: weather timestamp** (`weather.ts` + `WeatherConfidence.tsx`):
   - `weather.ts`: expose the existing fetch's `fetchedAt` timestamp + the `TTL_MS` constant via the existing in-memory cache. Add `getWeatherFreshness(date, lat, lng): { fetchedAt: number; nextRefreshAt: number; source: 'live' | 'climatology' | 'none' } | null`.
   - `WeatherConfidence.tsx`: render one new line at the bottom of the widget: `LAST UPDATED 10:25 IST  -  NEXT UPDATE IN 47 MIN`. Style `font-mono uppercase tracking-widest text-[10px] text-muted-foreground`. Timezone follows the existing TzMode (local by default). The "in X min" countdown re-renders via a `setInterval` every 30 s. Hidden when `source === 'climatology'` (no live update happened) or `null` (no fetch yet).

   **Cluster B: prep changes** (`prep-data.ts` + `PreparationDashboard.tsx`):
   - New `CheckItem.suggested?: boolean` field (default false). Backward-compatible.
   - Add 7 SUGGESTED items to existing categories:

     | Item label | Brand/spec | Category id |
     |---|---|---|
     | Vaseline Lip Care | Original Lip Balm Stick, 4.8g | sun |
     | Body cleansing wet wipes | CIR Soft Body Cleansing Wet Bed Bath Wipes, XL, 80 pack | personal-care |
     | Saline nasal gel | Ayr Saline Nasal Gel with aloe, 0.5 oz | health-kit |
     | 3L hydration bladder | BPA-free leakproof foldable with straw | day-pack |
     | Electrolyte salt capsules | Unived Salt Capsules, 30 caps | health-kit |
     | Protein bars | Phab Protein Bars chocolate brownie, 21g protein | day-pack |
     | Dry fruits mix | Paper Boat Mega Omega (almonds + walnuts + cranberry + pumpkin seeds) | day-pack |

   - Each gets `suggested: true`, a unique stable id with prefix `sg-`, an empty `blocking` copy (or short note like "Yatri-recommended"), `defaultStatus: 'action-needed'`.
   - New category `ayurvedic-medicines` inserted RIGHT AFTER `health-kit`:
     ```ts
     { id: 'ayurvedic-medicines', label: 'Ayurvedic Medicines', optional: true, items: [...3 items...] }
     ```
     - 3 items inside (Yogi Kanthika, Herbal Amritdhara, Kailas Jeevan). Each `suggested: true`, `defaultStatus: 'action-needed'`.
     - Item labels + descriptions per the Reference Medicines extension table below.
   - `overallPrepProgress()` filter update: only count items where `!item.suggested && !category.optional`. Suggested items + Ayurvedic category items are bonus; don't count toward the denominator.
   - `PreparationDashboard.tsx`: render a small `SUGGESTED` chip inline at the end of any item label where `item.suggested === true`. Style: `font-mono uppercase tracking-widest text-[9px] text-sacred bg-sacred/10 border border-sacred/30 rounded-none px-1.5 py-0.5 ml-2`. The sticky-nav chip strip auto-extends to 15 chips (the strip already maps over `CATEGORIES`); confirm the new chip renders correctly.

   **Cluster C: Reference master meds list extension** (`reference-data.ts` only):
   - Add 5 new rows to the existing `MASTER MEDICINES LIST` table in the `medicines-and-diamox` article:

     | WHAT | WHY | WHEN | NOTES |
     |---|---|---|---|
     | Yogi Kanthika | Sore throat from cold dry mountain air | As needed | Ayurvedic. Lozenge-style pills. |
     | Herbal Amritdhara | Multi-purpose. Internal: stomach upset, gas, indigestion. External: cuts, joint pain, headache, cold/cough. | As needed | Ayurvedic capsules. Both internal and external use. |
     | Kailas Jeevan | Acidity, gas, joint relief. Cooling cream. | As needed | Ayurvedic multipurpose cream. Named for this trip context. |
     | Ayr Saline Nasal Gel | Nasal dryness at altitude | Daily Days 3-10 | Aloe-based. Apply morning + evening. |
     | Unived Salt Capsules | Electrolyte replacement during sweat-heavy days | Days 5-10 | Especially helpful on trek days. |

   **Parallelization**: 3 worktree-isolated agents (Cluster A, Cluster B, Cluster C). Cluster files are disjoint; safe to run concurrently. Each opens its own PR; all 3 merge cleanly.

   **Anti-AI rules** apply throughout.

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
- 2026-06-22 v2.2 -- post /grill-me resolution. Accordion: first Q open per section, multi-open, ephemeral state, new RefBlock variant. Facts: mix mode (contextual + general), static, slim border-l-4 sacred block, 12 facts in kailash-facts.ts. Tracker: ipapi.co/json (only), 9-node itinerary chain + return footer, before/during phase split (IP geo pre-trip, JourneyState during trip), country fallback, sessionStorage 1h cache, tappable to Itinerary with diagonal stripes, privacy line on card. Ready to build.
- 2026-06-22 v2.3 -- city tracker REDESIGN. PR #190 shipped the vertical-chain-in-its-own-bento version; v2.3 reframes the tracker as a horizontal scroll INSIDE the existing countdown bento (no separate tile). Color rule simplified: GREEN for done + present, BLACK for upcoming. Removes the standalone CityTracker BentoGridItem; chain moves into the countdown card. Open sub-decisions go to /grill-me v2.3 before re-build.
- 2026-06-22 v2.4 -- city tracker FULL round trip. v2.3 grilled and resolved (ring on current pill, only visitor city green pre-trip, refactor CityTracker, aria-current). v2.4 then layers: (1) chain includes the FULL return leg (14 nodes for Mumbai cohort, more for Dubai/NY/Port Louis cohorts), (2) visitor's start + end city/country persisted to localStorage as `kailash_route_v1`, (3) "Returns via" footer removed (return leg now on-chain), (4) duplicate-name pills (KTM, Lhasa, Purang, Darchen each appear twice) keyed by chainIndex, labels not decorated. Open sub-decisions for v2.4 go to /grill-me.
- 2026-06-22 v2.4-final -- v2.4 grilled and resolved. Cohort detection by IP country code (IN -> canonical, AE -> Dubai-extended, MU -> Port Louis-extended, US -> NY-extended); other countries -> canonical chain + "Watching from..." label; geo-fail -> 12-node tail-clipped chain starting at Kathmandu with sacred ochre highlight on the leading Kathmandu pill. Manual edit deferred. Privacy line removed entirely. New 4th color state: SACRED (--sacred ochre token) for the geo-fallback entry-point marker. Ready to build.
- 2026-06-22 v2.5 -- gap-fill + new locked-in. Three previously-locked items now SHIPPED + documented in per-tab specs (FAQ accordion PR #189, Kailash facts PR #191, city tracker v2.4 PRs #196 + #197 fit fix). Documented previously-undocumented libs (`origin.ts` cohort-by-tz, `timezone.ts` local/trip mode, `city-cohort.ts`, `kailash-facts.ts`). Added localStorage keys (`kailash_route_v1`, `kailash_origin`, `kailash_tz_pref`, `kailash_tz_mode`) and sessionStorage table (`kailash_geo_v1`). Added @radix-ui/react-accordion to tech stack, ipapi.co to External APIs + preconnect list. New locked-in roadmap item: Reference article #9 "Apps and Connectivity in Tibet / China" -- yatri-facing field guide to GFW-blocked apps, Chinese alternatives, pre-departure install checklist, payment caveats, home-screen install instructions. Ready to build.
- 2026-06-22 v2.6 -- per-day bag state + airline weight allowances. New `bagState: BagState` field on every TripDay drives a "BAGS TODAY" block at the top of each expanded DayCard, plus a flight-allowance inline sub-row on flight days (D1, 3, 5, 10, 11, 13). Variable row count per day: typically 2 rows, expands to 3 on parikrama days (D7-D9) and handoff days (D5, D10). Bag location uses 5 state tags (with-you, stowed, stowed-locked, with-porters, in-transit, not-yet) with color tokens. Reference > Bag Transitions article gets a new bottom section: "Airline weight allowances" table with typical values for all 6 flight legs + warning callout to verify with YPO. Operator-sourced (existing 4-bag system trusted); Adip confirms specific weight numbers with YPO before packing day. Ready to build.
- 2026-06-22 v2.7 -- day-wise Diamox regime. New `app/src/lib/diamox-regime.ts` ISO-date-keyed map covers the full 24-day canonical Mumbai regime (28 Jun test, 6 Jul evening start, 7-19 Jul twice-daily maintenance, 20-21 Jul post-descent buffer) = 32 doses, 16 tabs of 250 mg. DayCard renders a slim sacred-ochre DIAMOX TODAY single-line block above BAGS TODAY for the 13 trip days. Reference > Medicines article gets a new "DIAMOX REGIME CALENDAR" section between PROTOCOL and SIDE EFFECTS: 17-row table covering bookend days too, with TODAY-row highlight via JourneyState. Plus new "WHY WE DO NOT STOP ABRUPTLY" prose + cohort-aware warning callout (Dubai/Mauritius/NY cohorts extend buffer past 21 Jul to match their own return-home day). Existing protocol Q&A "Duration" row updated from "Stop Day 10 at Lhasa" to "Continue through your return-home day + 1-2 day buffer". User-facing copy spells out "twice daily" everywhere; never uses the BID Latin abbreviation. Ready to build.
- 2026-06-22 v2.8 -- LIVE location pin on city tracker. Small visual addition: Material Symbols `my_location` (concentric circles, Google Maps live-GPS dot) renders inline INSIDE the current pill, BEFORE the city name. Subtle opacity pulse (1 -> 0.6 -> 1, 2s ease-in-out, infinite) via new `@keyframes pulse-live` in index.css. Wrapped in `prefers-reduced-motion: no-preference` for a11y. Co-exists with the existing ring; ring marks "current in chain order", pin marks "this is YOU LIVE". Applies to all `current` pill conditions EXCEPT the sacred geo-fail fallback pill (which means "we don't know where you are"). Implementation: CityTracker.tsx + index.css only. No data model changes. Ready to build.
- 2026-06-22 v2.11 -- weather timestamp + suggested packing items + new Ayurvedic Medicines category + Reference master meds extension. Parallelized into 3 worktree-isolated agents (disjoint file overlap). Cluster A: WeatherConfidence widget gets a 'LAST UPDATED ... NEXT UPDATE IN X MIN' line driven by the existing in-memory weather cache fetchedAt + 1h TTL, refreshes every 30s. Cluster B: new CheckItem.suggested field + 7 SUGGESTED items slotted into existing categories (sun, personal-care, health-kit, day-pack) + new 'Ayurvedic Medicines' optional sub-category with 3 items (Yogi Kanthika, Amritdhara, Kailas Jeevan) inserted after Health Kit. Progress bar excludes suggested + optional-category items. Sticky-nav 14 -> 15 chips automatically. Cluster C: Reference > Medicines master meds list grows from 7 to 12 rows (adds the 3 Ayurvedic + Ayr nasal gel + Unived salt caps). Ready to build.
- 2026-06-22 v2.10 -- offline-capable PWA. `vite-plugin-pwa` (Workbox) added. Auto-generated web manifest (name "Kailash Mansarovar Yatra 2026", short_name "Kailash 2026", standalone display mode, sacred-ochre theme color, 192/512/maskable icon set). Silent auto-update (skipWaiting + clientsClaim). Cache strategies: CartoDB tiles CacheFirst 30d, Open-Meteo NetworkFirst with 24h cache fallback, ipapi.co NetworkFirst with 1h cache fallback, OSRM CacheFirst 30d. Map tile pre-warming on SW activate fetches ~200-400 tiles (~5-10 MB) covering all 13 day routes. New OfflineBadge component renders top-right when navigator.onLine === false. Existing static HTML fallback in #root continues to work for JS-less crawlers alongside the SW. Out-of-scope: push notifications, background sync, periodic sync, custom install prompt (browser native A2HS sufficient). Files: new OfflineBadge.tsx + precache-tiles.ts + 3 icon PNGs; edit vite.config.ts + package.json + App.tsx. Ready to build.
- 2026-06-22 v2.9 -- four-add bundle. (5a) Step count chip appended to existing walk/trek chip in DayCard, derived from `walk_h * 5500 + active_trek_h * 4500` rounded to nearest 500. (5b) Diamox bookend mini-cards: new DiamoxBookendCard component renders 4 instances (28 Jun + 6 Jul above D1, 20 Jul + 21 Jul below D13) with date + PRE/POST badge + the existing DIAMOX TODAY block + a 1-line context note per dose. No bagState/weather/timeline/map. (5c) Day chip strip grows 13 -> 17 with bookend chips visually distinct (smaller font, sacred ochre border, date label + PRE/POST badge, no temp/moon row). Scrollspy + jump-to extends via `id="diamox-{dateISO}"`. (5d) Live weather EVERYWHERE: new shared useLiveDayWeather hook in weather.ts replaces static day.weather lookups in 5 surfaces (chip strip per-chip temp, DayCard compressed header, DayCard chips row, DayCard summary header, Hero coldest/warmest stat tiles). Climatology fallback when outside 16-day window or fetch fails. No per-number marker; Prepare WeatherConfidence widget stays the single confidence surface. (5e) Precip type detection: extends Open-Meteo parser to read weather_code + snowfall_sum, replaces "rain %" chip with single PRECIP chip whose icon swaps by dominant type (rainy / ac_unit / thunderstorm). Climatology fallback heuristic: high altitude + freezing -> snow icon. Heavy file overlap (DayCard.tsx + ItineraryTab.tsx + weather.ts) prevents parallelization; one Sonnet sequential. Ready to build.
