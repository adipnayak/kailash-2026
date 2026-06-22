# Kailash Mansarovar Yatra 2026 - Product Requirements Doc

## TL;DR

A personal trip-planning and reference website built by Adip Nayak for a 13-day Hindu pilgrimage from Mumbai via Kathmandu to Mt Kailash and Lake Manasarovar in western Tibet (7-19 July 2026). Shared with a 23-yatri WhatsApp group on the eve of departure. The site adapts its display to three phases of the journey: before (countdown and prep checklist), during (live day tracking), and after (completion view). It has no server, no accounts, and no analytics. Everything is client-side: React 19 SPA, Tailwind v4, TypeScript, deployed to GitHub Pages.

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
- **Itinerary** -- ConnectivityRibbon, sticky day-pill nav, 13 DayCards
- **Prepare** -- PreparationDashboard (checklist), WeatherConfidence (Open-Meteo forecast)
- **Reference** -- Seven reference articles with in-page anchor nav

---

## Per-tab spec

### Overview

**What renders:**
- `Hero` component: phase-aware bento grid layout (2-3-4 columns at base/md/lg breakpoints)
  - Before phase: GSAP-animated countdown ("N days to Kailash"), 8 stat tiles (highest altitude, longest trek day, coldest expected, warmest expected, offline days, border crossings, yatra length, parikrama circuit), and a tappable prep-summary card that mirrors Prepare tab progress (4 non-optional categories: Passport, Flights, Connectivity, Packing). The prep card navigates to the Prepare tab on tap.
  - During phase: current day number (1-13 of 13), location, altitude, connectivity status, tomorrow card, yatra progress bar, peak and offline stat tiles.
  - After phase: "Yatra Sampoorna" completion view, route summary, days-since-return, final stats (peak altitude, longest day, border crossings, coldest reached, offline days survived).
- `AltitudeChart` (lazy-loaded): recharts area chart of all 15 points (D0 origins + D1-D13 + D14 return). Two series -- Walking (altitude_peak) and Sleeping (altitude_sleep). Segmented control toggles between them; preference persisted to `kailash_altitude_mode`. Dotted reference line at Dolma La (5,630 m, Day 8 red). Grey dotted markers at ACCLIM (D4), REST (D6), BUFFER (D12). Y-axis metres only, linear scale.

**Data sources:** `DAYS` from `trip-data.ts`, `computeJourneyState()` from `journey-state.ts`, `loadPrepStatus()` from `prep-data.ts`.

**Interactions:** tap any stat tile (informational only); tap prep card to jump to Prepare tab; AltitudeChart segmented control (Walking/Sleeping toggle).

---

### Itinerary

**What renders:**
- `ConnectivityRibbon`: 13-day dot strip showing per-day connectivity (good/intermittent/offline). Three colours: emerald (WiFi + phone), sacred/gold (phone only), destructive/red (no signal). Phase-aware headline. Before: highlights the offline cluster D7-D9 in red. During: today's dot gets a ring highlight. After: static. GFW note (D3-D10, VPN needed) is always visible. Sherpa sat-phone note visible during offline phase and before.
- Sticky day-pill nav below the "Day by Day" heading. Each pill shows day number, temp range, and moon phase icon. Tapping a pill expands that DayCard and smooth-scrolls to it (300 ms post-expand delay to account for height tween). Today's day gets a Clock icon; Dolma La (Day 8) gets a Mountain icon in red.
- 13 `DayCard` components (all expanded by default on first tab visit).

**DayCard -- compressed view:** day badge, location, risk badge, 3 chips (altitude, trek distance/time, connectivity), timeline summary, expand button.

**DayCard -- expanded view:**
- Summary strip: wake time, walking hours, active trek hours, sleep target
- `ItineraryDayMap`: full Leaflet map with CartoDB tiles. Polylines drawn per leg using `day-stops.ts` waypoints. Line style by transport mode: drive/walk are solid (OSRM road-snapped geometry); flight is dashed great-circle; trek is dotted-dashed. Days without detailed stops fall back to the high-level start/end from `day-routes.ts`.
- Astro row: sunrise, sunset, moon phase icon + label + illumination (computed via suncalc at each day's start coords)
- Weather chips: temp range, feels-like, rain %, wind, UV -- source tag shows "forecast" vs "climatology"
- Exposure + conditions chips
- Meals grid (breakfast/lunch/dinner/snacks/hydration)
- Facilities (bathroom type, water, shower)
- Spiritual focus block (shown only for holy/critical days)
- Operational details nested section (what to wear, operational notes)

**Data sources:** `DAYS`, `getDayRoute()` from `day-routes.ts`, `getDayAstro()` from `astro.ts` via suncalc, `useWeather()` from `weather.ts` via Open-Meteo, `DAY_STOPS` from `day-stops.ts`.

**Interactions:** tap DayCard header to toggle expand/collapse (controlled by parent ItineraryTab state); tap day pill to jump and expand. Expansion state is not persisted to localStorage (controlled in-memory by ItineraryTab; defaults to all-open).

---

### Prepare

**What renders:**
- `PreparationDashboard`: shows only in before phase (returns null during and after). Five categories of checklist items: Passport (4 items), Flights (2 items), Medical (optional, items vary), Connectivity (items), Packing (items). Two states per item: complete or action-needed. Tap row to toggle. Action-needed rows expand with blocking copy explaining what to do. No auto-sort. GSAP stagger entrance animation on first render. State persisted to `kailash_prep_v2`. Dispatches `kailash-prep-updated` custom event on save so the Hero prep card re-syncs without polling.
- `WeatherConfidence`: phase-aware weather widget. Before: confidence bar (0% at D2D >= 17, 100% at D2D <= 3, linear between). Shows Open-Meteo forecast for Kathmandu, Lhasa, and Mansarovar -- falls back to static climatology ranges if outside 16-day horizon. During: live today and tomorrow forecasts at 100% confidence. After: static trip-weather summary. Weather fetches cached in-memory per (date, lat, lng) for 1 hour.

**Data sources:** `CATEGORIES` from `prep-data.ts`, Open-Meteo daily API (no key required), `useJourneyState()` for phase.

**Interactions:** tap any checklist row to toggle complete/action-needed. Prep state persists immediately on each toggle.

---

### Reference

**What renders:**
- Header with anchor nav listing all 7 articles as pill buttons.
- Seven `ArticleSection` components driven by `REFERENCE_ARTICLES` from `reference-data.ts`:
  1. Medicines (icon: Pill)
  2. Connectivity (icon: Wifi)
  3. Bags (icon: Backpack)
  4. Customs (icon: ShieldCheck)
  5. Acclimatisation (icon: Mountain)
  6. Visa (icon: FileText)
  7. Spiritual focus (icon: Heart)

Each article renders a sequence of typed blocks: prose, heading, table, ordered-list, unordered-list, callout (with tones: critical/warning/info). Callout borders use `--destructive` (critical), `--sacred` (warning), or `--border` (info).

**Data sources:** static `REFERENCE_ARTICLES` array in `reference-data.ts`. No live data.

**Interactions:** in-page anchor links via href="#article-id". scroll-mt-16 on each section accounts for the sticky nav.

---

## Cross-cutting features

- **Nav:** sticky top bar (z-50, backdrop-blur). Icon-only for inactive tabs; icon + label for active tab. ThemeToggle button on the right.
- **ThemeToggle:** light/dark toggle. Adds/removes `dark` class on `<html>`. Defaults to light. Persisted to `kailash_theme`.
- **Footer:** brand mark + tagline + 3 contextual paragraphs about Kailash, Mansarovar, and the Parikrama.
- **Static HTML fallback:** `app/index.html` contains the full trip content inside `#root` as static HTML (day-by-day summary, key facts). When JavaScript is disabled or blocked, crawlers and AI agents see meaningful content. The React app mounts over this content when JS runs.
- **JSON-LD:** `Event` schema type in `<head>`. Name, description, startDate, endDate, location (GeoCoordinates for Mt Kailash), organizer.
- **llms.txt:** `app/public/llms.txt` -- 43-line structured brief covering trip overview, day summary, page structure, and key LLM-relevant facts (offline days, Dolma La conditions, GFW, self-hosted fonts, CartoDB tiles).
- **Sitemap + robots:** `app/public/sitemap.xml` and `robots.txt` served from Pages root.
- **Date override:** `?date=YYYY-MM-DD` query param overrides `new Date()` for `computeJourneyState()`. Used for manual testing of before/during/after phases without changing the system clock.

---

## Design system

### Typography

- **Sans:** Geist Variable (woff2, self-hosted from the `geist` npm package, copied to `app/public/fonts/`). Used for headings, body, stat values, and the nav label.
- **Mono:** Geist Mono Variable (woff2, self-hosted). Used for labels, badges, chip text, tracking-wider uppercase metadata, and the "JAI BHOLE NATH" devotional token.
- No Google Fonts, no external font CDN.

### Color tokens (CSS custom properties, OKLCH)

Light mode defaults. Dark mode activated by `.dark` on `<html>`.

| Token | Light | Dark | Purpose |
|---|---|---|---|
| --background | oklch(1 0 0) | oklch(0.145 0 0) | page background |
| --foreground | oklch(0.145 0 0) | oklch(0.985 0 0) | body text |
| --card | oklch(1 0 0) | oklch(0.205 0 0) | card/tile background |
| --muted-foreground | oklch(0.556 0 0) | oklch(0.708 0 0) | labels, secondary text |
| --border | oklch(0.922 0 0) | oklch(0.275 0 0) | dividers, outlines |
| --primary | oklch(0.205 0 0) | oklch(0.922 0 0) | active tab underline |
| --destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | critical alerts, Dolma La, offline dots |
| --sacred | oklch(0.65 0.13 75) | oklch(0.78 0.13 75) | devotional markers, intermittent connectivity, progress bar fill |
| --emerald | oklch(0.53 0.14 155) | oklch(0.7 0.14 155) | good connectivity, checkmarks, completion |

`--radius: 0` globally. No rounded corners anywhere.

### Spacing

8-multiple rule throughout: all padding, margin, gap values are multiples of 8px (2, 4, 6, 8, 12, 16, 24, 32 in Tailwind units). Exceptions are permitted for sub-pixel optical adjustments only.

### Component rules

- `rounded-none` on every interactive element. Sharp corners everywhere. No border-radius.
- No emojis anywhere in JSX or data files. All glyphs come from `@aliimam/icons`.
- Icons: `@aliimam/icons` is the canonical source. `lucide-react` is in package.json but its usage is being phased out.
- Devotional budget: `JAI_BHOLE_NATH` (string from `lib/devotional.ts`) appears exactly once, in the Hero before-phase card. `YATRA_SAMPOORNA` appears exactly once, in the Hero after-phase card.
- Max content width: `max-w-6xl` on all section inner divs.
- BentoGrid (aliimam): 2-3-4 column responsive grid used in Hero. Sharp corner tiles with border.

### Anti-AI rules

Zero em-dashes (--), en-dashes (-), smart quotes ("" ''), or emojis in any rendered string or JSX. These are enforced by convention and noted at the top of every source file. Use plain ASCII hyphens and straight quotes only.

---

## Data model + persistence

### trip-data.ts

The `DAYS` array is the master data structure. 13 entries, one per trip day (Day 1-13). Each `TripDay` has:
- Identification: `day` (number), `date` (ISO string), `weekday`, `location`, `day_type` ('normal'|'critical'|'holy'|'rest')
- Altitude: `altitude_peak` (metres, day high point), `altitude_sleep` (metres, overnight)
- Risk: `risk` ('easy'|'moderate'|'high')
- Connectivity: `conn_status` ('good'|'intermittent'|'offline'), `conn_label`, `next_signal`
- `headline` (short day description)
- Nested objects: `weather` (WeatherData), `timeline` (TimelineEvent[]), `what_to_wear` (WhatToWear), `food` (FoodData), `bathroom` (BathroomData), `timing` (TimingData), `spiritual_focus` (SpiritualFocus or null)

Also exported from trip-data.ts: `DEPART` ('2026-07-07'), `RETURN_DATE` ('2026-07-19'), `MILESTONES`, `WHAT_MATTERS` (per-day priority lists), `BEFORE_WHAT_MATTERS_BY_TWINDOW`.

### day-stops.ts

`DAY_STOPS` maps day number to `DayStop[]`. Each stop has `lat`, `lng`, `label`, optional `modeNext` (TransportMode: 'drive'|'walk'|'flight'|'trek'), and optional `intermediate` flag. Intermediate stops bend the polyline through real trail geometry without appearing as named stops in the UI. Days without entries in DAY_STOPS fall back to start/end from `day-routes.ts`.

### day-routes.ts

High-level start/end coordinates per day. Used as fallback when DAY_STOPS has no entry for a day.

### prep-data.ts

`CATEGORIES` array: 5 categories (Passport, Flights, Medical, Connectivity, Packing). Each `Category` has `id`, `label`, `optional` flag, and `items: CheckItem[]`. Each `CheckItem` has `id`, `label`, `blocking` (copy shown when action-needed is expanded), `defaultStatus`. `ItemStatus` is 'complete' | 'action-needed'. Helpers: `loadPrepStatus()`, `savePrepStatus()`, `isCategoryComplete()`.

### localStorage keys

All keys are scoped to the `kailash_` prefix.

| Key | Written by | Read by | Contents |
|---|---|---|---|
| kailash_tab | useTabPersist | useTabPersist | active tab ('overview'|'itinerary'|'prepare'|'reference') |
| kailash_prep_v2 | prep-data.ts savePrepStatus | prep-data.ts loadPrepStatus | JSON StatusMap (Record<itemId, ItemStatus>) |
| kailash_altitude_mode | AltitudeChart | AltitudeChart | 'walking' or 'sleeping' |
| kailash_theme | ThemeToggle | ThemeToggle | 'light' or 'dark' |
| kailash_daycard_v2_{day} | DayCard | DayCard | 'true' or 'false' per day expansion state |
| kailash_weather_v1 | WeatherConfidence | WeatherConfidence | JSON cache of Open-Meteo fetches |
| kailash_tz_mode | timezone.ts | timezone.ts | timezone display mode |
| kailash_tz_pref | timezone.ts | timezone.ts | preferred timezone string |
| kailash_origin | origin.ts | origin.ts | origin city selection |
| kailash_route_v1_{day} | day-routes | day-routes | cached OSRM geometry per day |

No accounts. No server. No analytics. No telemetry of any kind.

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
| Icons | @aliimam/icons | 1.1.3 |
| Animations | framer-motion | 12.40.0 |
| Animations (imperative) | gsap + @gsap/react | 3.15.0 / 2.1.2 |
| Astronomy | suncalc | 2.0.0 |
| Fonts | geist (npm) | 1.7.2 |
| Tailwind plugin | tailwindcss-animate | 1.0.7 |

**External APIs (free tier, no API key):**
- Open-Meteo: daily weather forecast. 16-day horizon. Falls back to climatology from `trip-data.ts` beyond that horizon or on fetch failure. In-memory cache + localStorage cache keyed by date+lat+lng, TTL 1 hour.
- OSRM (router.project-osrm.org): road geometry for drive/walk legs in ItineraryDayMap. Falls back to straight-line segments when OSRM returns no route (common in high-altitude Tibet where road coverage is sparse).

**Map tiles:** CartoDB (Positron/DarkMatter via `{s}.basemaps.cartocdn.com`). These serve through the Great Firewall of China.

---

## Deployment + ops

**Pipeline:** GitHub Actions workflow at `.github/workflows/deploy-v4.yml`. Triggers on push to `main` or the `v4/react-vite-foundation` branch (when `app/**` or the workflow file changes), and on pull requests to `main`. Also has `workflow_dispatch` for manual deploys.

**Steps:** `npm ci` in `app/`, `npm run build` (runs `tsc -b && vite build`), uploads `app/dist/` as a Pages artifact, deploys to GitHub Pages.

**Vite base:** `/kailash-2026/` (matches the Pages URL path).

**Local dev:** `cd app && npm run dev` -- Vite dev server on localhost:5173.

**Local preview of production build:** `cd app && npm run build && npm run preview`.

**Date testing:** append `?date=2026-07-14` to any URL to simulate Day 8 (Dolma La crossing). Use `?date=2026-07-20` for post-trip after-phase.

---

## Worldwide reachability

The site is usable in China (Tibet leg is Days 3-10). All decisions made to ensure this:
- Self-hosted fonts (Geist woff2 in `app/public/fonts/`). No Google Fonts.
- No Mapbox (requires an API key and is blocked). Leaflet + CartoDB tiles only.
- No Google Analytics, no Firebase, no Google APIs of any kind.
- No calls to any domain that reliably fails behind the GFW.
- Open-Meteo and OSRM: both accessible from China (verified at time of build). If either fails, the app degrades gracefully to static data.

---

## Out-of-scope (intentional non-goals)

- User accounts or authentication of any kind.
- Real-time location tracking or sharing across yatris.
- Booking, payments, or checkout flows.
- Push notifications or background sync.
- Server-side rendering or a backend API.
- Analytics or user behaviour tracking.
- Multi-trip or multi-group support.
- Photo galleries or media uploads.
- Comments or social features.
- Native mobile app.

---

## Known limitations

- **localStorage is per-device per-browser.** Prep checklist progress checked on mobile does not sync to desktop. No cross-device sync.
- **OSRM coverage is thin in high-altitude Tibet.** Drive and trek legs in Days 5-10 often fall back to straight polylines because OSRM has no road data for those tracks. The map is still useful for geographic orientation but the line may not follow the actual road.
- **React SPA requires JavaScript.** The static HTML fallback inside `#root` covers the JS-less case (AI crawlers, GoogleBot with no JS). The fallback is a plain text summary, not an interactive page.
- **Open-Meteo 16-day forecast horizon.** Weather data for days more than 16 days out shows climatology (static ranges from trip-data.ts), not actual forecasts. WeatherConfidence shows a confidence bar (0% at D2D >= 17) to communicate this clearly.
- **JourneyState does not auto-refresh.** `useJourneyState` computes once on mount. If a browser tab is left open across midnight, the displayed phase does not update until the tab is reloaded.
- **DayCard expansion state is in-memory only.** The ItineraryTab default is all-open. Per-day expansion is not persisted across tab switches (though `kailash_daycard_v2_{day}` keys exist in localStorage, the primary expansion is controlled by the ItineraryTab's in-memory Set).

---

## Roadmap (what's plausibly next)

- Cross-device prep sync via a shareable URL token or simple read-only export (e.g. share link with prep state encoded in the hash).
- Share-screenshot generator: a one-tap export of the current day card as a shareable image for the WhatsApp group.
- Day map carousel: swipe between day maps without opening each DayCard individually.
- Auto-refresh JourneyState across midnight so a long-open tab does not show stale phase.
- Offline-capable service worker so the full site loads with no network after first visit.

---

## Change log

PRD authored 2026-06-22 by Claude (Sonnet 4.6) based on code walk of 150+ PR history and full source read. Update this file as the site evolves -- it is the single source of truth for what the site is and why it is built the way it is.
