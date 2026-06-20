# aliimam Design System Adoption (v4/aliimam-real)

## What changed

This documents the REAL adoption (not the cosmetic alias swap from the previous PR).

### 5 Visual Deltas (intentional)

1. Athletic White (#f3f3f2) -> pure white (oklch(1 0 0))
   - Was: slightly warm off-white Maurten background
   - Now: pure shadcn neutral white

2. Performance Black (#000000 via --ink) -> near-black (oklch(0.145 0 0))
   - Was: literal #000 mapped through --ink alias
   - Now: native shadcn foreground near-black

3. Warm red Dolma La (#b73e2a via --red) -> shadcn destructive red (oklch(0.577 0.245 27.325))
   - Was: Maurten warm brick-red
   - Now: shadcn destructive (slightly cooler, more crimson)
   - Usage: Dolma La markers, offline icons, CRITICAL DAY badges, blocking prep items

4. Ochre accent (#8e6628 via --accent) -> new --sacred token (oklch(0.65 0.13 75))
   - Was: Maurten gold-brown --accent mapped to shadcn --accent
   - Now: --sacred is a SEPARATE token, distinct from shadcn --accent (which is neutral gray)
   - Usage: JAI_BHOLE_NATH, OM_NAMAH_SHIVAYA, CandleFilled icons, spiritual_focus borders,
     intermittent connectivity icons, SNAN AND PUJA badges, progress bar fill, sacred map arcs

5. Inter Tight + JetBrains Mono -> Geist Sans + Geist Mono
   - Was: @fontsource/inter-tight (400/500/600/700) + @fontsource/jetbrains-mono (400/500)
   - Now: geist package variable fonts (self-hosted from public/fonts/)
   - Geist-Variable.woff2 (sans) + GeistMono-Variable.woff2 (mono) copied to app/public/fonts/

### Additional token: --emerald

- --emerald: oklch(0.53 0.14 155) forest green
- Was Maurten #4a7a4d (--green)
- Usage: good connectivity icons, checkmarks, recovery badges, 100% prep bar, weather confidence

### shadcn neutral light palette in use

```
--background:        oklch(1 0 0)
--foreground:        oklch(0.145 0 0)
--card:              oklch(1 0 0)
--card-foreground:   oklch(0.145 0 0)
--popover:           oklch(1 0 0)
--popover-foreground: oklch(0.145 0 0)
--primary:           oklch(0.205 0 0)
--primary-foreground: oklch(0.985 0 0)
--secondary:         oklch(0.97 0 0)
--secondary-foreground: oklch(0.205 0 0)
--muted:             oklch(0.97 0 0)
--muted-foreground:  oklch(0.556 0 0)
--accent:            oklch(0.97 0 0)
--accent-foreground: oklch(0.205 0 0)
--destructive:       oklch(0.577 0.245 27.325)
--border:            oklch(0.922 0 0)
--input:             oklch(0.922 0 0)
--ring:              oklch(0.708 0 0)
--radius:            0.625rem
```

Custom tokens (beyond shadcn neutral):
```
--sacred:            oklch(0.65 0.13 75)    warm gold, devotional markers only
--sacred-foreground: oklch(0.985 0 0)
--emerald:           oklch(0.53 0.14 155)   forest green, success states only
--emerald-foreground: oklch(0.985 0 0)
```

## Rule: Do NOT reintroduce Maurten tokens

The following are BANNED from this codebase:
- CSS vars: --bg, --ink, --red, --green (as top-level vars)
- Tailwind classes: bg-bg, text-ink, bg-ink, text-bg, text-muted (the old class, now text-muted-foreground), text-red, bg-red, text-green, bg-green, text-accent (old ochre usage)
- Font imports: @fontsource/inter-tight, @fontsource/jetbrains-mono

If a future PR tries to add these back, reject it.

## aliimam blocks wired

- AliimamHero: App.tsx (landing section above data hero)
- AliimamFooter: Footer.tsx (dates from DAYS[0]/DAYS[12], no hardcoded dates)
- AliimamStats: OverviewTab.tsx (4-stat headline strip)
- AliimamCta: OverviewTab.tsx (prepare CTA section)
- AliimamFeature: DayCard.tsx (spiritual_focus callout in single-card mode)

## @aliimam/icons coverage

All 9 components now use @aliimam/icons:
- Hero.tsx (Mountain, MapPin, Radio, TriangleAlert, Clock, PlaneTakeoff, PlaneLanding)
- DayCard.tsx (ChevronDown, Mountain, Clock, Ruler, Wifi, WifiOff, Bed, CircleCheck, ...)
- Nav.tsx (LayoutGrid, CalendarDays, ListChecks, BookOpen)
- SacredJourneyMap.tsx (MapPin, Mountain)
- AltitudeChart.tsx (Ruler, Bed, Sun)
- JourneyTimeline.tsx (CalendarDays, Clock, Mountain)
- OverviewTab.tsx (Mountain, Ruler, Snowflake, Sun, WifiOff, Globe)
- ItineraryTab.tsx (CalendarDays)
- PrepareTab.tsx (ListChecks)
- ConnectivityRibbon.tsx (existing)
- PreparationDashboard.tsx (existing)
- WeatherConfidence.tsx (existing)
- ReferenceTab.tsx (existing: Pill, Wifi, Backpack, ShieldCheck, Mountain, FileText, Heart)
- All aliimam/ blocks (existing)
