/**
 * PreparationDashboard.
 * 5-category trip checklist with localStorage persistence (kailash_prep_v2).
 * Visible only in BEFORE phase. Hidden during and after.
 * PRD reference: section 8 (Preparation Dashboard).
 *
 * Categories: Passport, Flights, Medical (optional), Connectivity, Packing.
 * Insurance category removed as of v4 spec.
 *
 * Two states only: COMPLETE (green check) or ACTION NEEDED (red alert).
 * Tap a row to toggle. Items stay in their declared order regardless of
 * state -- no auto-sort -- so users can find what they were looking at.
 *
 * Before phase: red ACTION NEEDED rows expand with blocking copy.
 * During / After: component returns null.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourneyState } from '../hooks/useJourneyState';
import { Icon } from './Icon';
import gsap from 'gsap';

// Per-category icon for the sticky chip strip. Names are Material
// Symbols Outlined (see fonts.google.com/icons).
const CATEGORY_ICON: Record<string, string> = {
  passport: 'badge',
  flights: 'flight',
  medical: 'medical_services',
  connectivity: 'wifi',
  packing: 'hiking',
  // Sub-categories split out of the original 'Things to Carry'.
  clothing: 'checkroom',
  footwear: 'directions_walk',
  electronics: 'devices',
  'health-kit': 'healing',
  sun: 'wb_sunny',
  'day-pack': 'backpack',
  'docs-money': 'fact_check',
  'personal-care': 'soap',
  spiritual: 'self_improvement',
};

/* ------------------------------------------------------------------ */
/* Types + data                                                         */
/* ------------------------------------------------------------------ */

import {
  CATEGORIES,
  loadPrepStatus,
  savePrepStatus,
  type ItemStatus,
  type CheckItem,
  type Category,
  type StatusMap,
} from '../lib/prep-data';


// loadStatus / saveStatus / CATEGORIES come from ../lib/prep-data
// (single source of truth shared with the Hero overview prep card).
const loadStatus = loadPrepStatus;
const saveStatus = savePrepStatus;

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: ItemStatus }) {
  // Two states only: empty square (action-needed) or filled square with
  // a white check (complete). No nested status icon inside the box --
  // the box border itself carries the action-needed signal.
  if (status === 'complete') {
    return (
      <span className="inline-flex w-4 h-4 shrink-0 items-center justify-center rounded-sm border-2 border-emerald bg-emerald">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="inline-flex w-4 h-4 shrink-0 rounded-sm border-2 border-foreground bg-background"
      aria-hidden
    />
  );
}

function statusLabel(status: ItemStatus): string {
  return status === 'complete' ? 'Complete' : 'Action needed';
}

const CYCLE: Record<ItemStatus, ItemStatus> = {
  'action-needed': 'complete',
  complete: 'action-needed',
};

interface ItemRowProps {
  item: CheckItem;
  status: ItemStatus;
  isOptionalCategory: boolean;
  onCycle: () => void;
}

function ItemRow({ item, status, isOptionalCategory, onCycle }: ItemRowProps) {
  const isBlocking = status === 'action-needed';
  const isComplete = status === 'complete';

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onCycle}
        className="flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-background focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        aria-label={`${item.label}: ${statusLabel(status)}. Click to change.`}
      >
        <span className="mt-0.5">
          <StatusIcon status={status} />
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={[
              'block text-sm font-medium',
              isComplete ? 'line-through text-muted-foreground' : isBlocking ? 'text-destructive' : 'text-foreground',
            ].join(' ')}
          >
            {item.label}
          </span>
          {isOptionalCategory && !isComplete && (
            <span className="mt-0.5 block text-xs text-muted-foreground">Optional</span>
          )}
        </span>
        <span
          className={[
            'shrink-0 rounded-none px-2 py-0.5 font-mono text-xs',
            isBlocking
              ? 'bg-destructive/10 text-destructive'
              : isComplete
                ? 'bg-emerald/10 text-emerald'
                : isOptionalCategory
                  ? 'bg-border text-muted-foreground'
                  : 'bg-sacred/10 text-sacred',
          ].join(' ')}
        >
          {statusLabel(status).toLowerCase()}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isBlocking && !isOptionalCategory && (
          <motion.div
            key="blocking"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 px-4 pb-4 pl-12">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
              <p className="text-xs leading-relaxed text-destructive">{item.blocking}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  statusMap: StatusMap;
  onCycle: (itemId: string) => void;
}

function categoryCompletion(category: Category, statusMap: StatusMap): number {
  const total = category.items.length;
  if (total === 0) return 0;
  const done = category.items.filter(
    (item) => (statusMap[item.id] ?? item.defaultStatus) === 'complete',
  ).length;
  return Math.round((done / total) * 100);
}

function categoryHasBlocking(category: Category, statusMap: StatusMap): boolean {
  if (category.optional) return false;
  return category.items.some(
    (item) => (statusMap[item.id] ?? item.defaultStatus) === 'action-needed',
  );
}

function CategoryCard({ category, statusMap, onCycle }: CategoryCardProps) {
  const pct = categoryCompletion(category, statusMap);
  const hasBlocking = categoryHasBlocking(category, statusMap);
  const allDone = pct === 100;

  // No sort -- items stay in their declared order so a tap doesn't make
  // the row jump to the bottom of the list. Adip's call.
  const sorted = category.items;

  return (
    <div
      className={[
        'rounded-none border bg-card overflow-hidden',
        hasBlocking ? 'border-destructive/40' : allDone ? 'border-emerald/40' : 'border-border',
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-sm font-semibold text-foreground">{category.label}</h3>
          {category.optional && (
            <span className="rounded-none border border-muted/30 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              optional
            </span>
          )}
          {hasBlocking && (
            <span className="rounded-none bg-destructive/10 px-2 py-0.5 font-mono text-xs text-destructive">
              action needed
            </span>
          )}
          {allDone && !hasBlocking && (
            <span className="rounded-none bg-emerald/10 px-2 py-0.5 font-mono text-xs text-emerald">
              complete
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className={[
            'h-full transition-all duration-300',
            allDone ? 'bg-emerald' : hasBlocking ? 'bg-destructive' : 'bg-sacred',
          ].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div>
        {sorted.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            status={statusMap[item.id] ?? item.defaultStatus}
            isOptionalCategory={category.optional}
            onCycle={() => onCycle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overall progress                                                     */
/* ------------------------------------------------------------------ */

function overallPct(statusMap: StatusMap): number {
  const required = CATEGORIES.filter((c) => !c.optional).flatMap((c) => c.items);
  if (required.length === 0) return 0;
  const done = required.filter(
    (item) => (statusMap[item.id] ?? item.defaultStatus) === 'complete',
  ).length;
  return Math.round((done / required.length) * 100);
}

function totalBlocking(statusMap: StatusMap): number {
  return CATEGORIES.filter((c) => !c.optional)
    .flatMap((c) => c.items)
    .filter((item) => (statusMap[item.id] ?? item.defaultStatus) === 'action-needed').length;
}

/* ------------------------------------------------------------------ */
/* Main export                                                          */
/* ------------------------------------------------------------------ */

export function PreparationDashboard() {
  const journey = useJourneyState();
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLOListElement>(null);

  // Scrollspy: active = the LAST category whose top has crossed below
  // the sticky-nav threshold (~130 px). Same pattern as ReferenceTab
  // post PR #175 -- works for sections of any height.
  const [activeCategory, setActiveCategory] = useState<string | null>(CATEGORIES[0]?.id ?? null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Threshold sits below the sticky-nav bottom (~110 px) plus the
    // scroll-mt-32 (128 px) used on each category section, with some
    // buffer so small upscrolls don't push the active chip back to the
    // previous category.
    const THRESHOLD = 200;
    const onScroll = () => {
      let current = CATEGORIES[0]?.id ?? null;
      for (const c of CATEGORIES) {
        const el = document.getElementById(`category-${c.id}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= THRESHOLD) {
          current = c.id;
        }
      }
      if (current) setActiveCategory(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-scroll active chip into view in the horizontal strip.
  useEffect(() => {
    if (!activeCategory || !navRef.current) return;
    const chip = navRef.current.querySelector<HTMLElement>(
      `[data-category="${activeCategory}"]`,
    );
    if (chip) {
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const jumpToCategory = useCallback((id: string) => {
    // Set active immediately so the chip animates on tap; the scrollspy
    // effect above will keep it in sync once the smooth scroll settles.
    setActiveCategory(id);
    const el = document.getElementById(`category-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Load from localStorage on mount. Migrate/purge old keys.
  useEffect(() => {
    setStatusMap(loadStatus());
  }, []);

  // Persist on every change
  useEffect(() => {
    saveStatus(statusMap);
  }, [statusMap]);

  // GSAP entrance animation for header area
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.4,
        ease: 'power2.out',
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // BEFORE phase only
  if (journey.phase !== 'before') return null;

  function handleCycle(itemId: string) {
    setStatusMap((prev) => {
      // Find default status for item
      let defaultStatus: ItemStatus = 'action-needed';
      for (const cat of CATEGORIES) {
        const found = cat.items.find((i) => i.id === itemId);
        if (found) {
          defaultStatus = found.defaultStatus;
          break;
        }
      }
      const current = prev[itemId] ?? defaultStatus;
      const next = CYCLE[current];
      return { ...prev, [itemId]: next };
    });
  }

  const pct = overallPct(statusMap);
  const blocking = totalBlocking(statusMap);
  const { daysToDeparture } = journey;

  return (
    <section
      data-section="preparation-dashboard"
      className="border-b border-border bg-background px-6 py-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div ref={headerRef}>
          {/* Explainer */}
          <div className="mb-6">
            <h2 className="font-sans text-2xl font-medium text-foreground">Your preparation checklist</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap each item as you complete it. Your readiness updates below.
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Private to this browser. Nothing leaves your device.
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {daysToDeparture > 0
                  ? `${daysToDeparture} day${daysToDeparture === 1 ? '' : 's'} to departure`
                  : 'Departure day'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {blocking > 0 && (
                <span className="rounded-none bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive">
                  {blocking} action{blocking === 1 ? '' : 's'} needed
                </span>
              )}
              <span className="font-mono text-xs text-muted-foreground">{pct}% ready</span>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4 h-1 rounded-full bg-border overflow-hidden">
            <motion.div
              className={['h-full rounded-full', blocking > 0 ? 'bg-destructive' : pct === 100 ? 'bg-emerald' : 'bg-sacred'].join(' ')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {blocking > 0 && (
            <p className="mt-4 text-xs text-destructive">
              Items marked "action needed" are blocking your preparation. Tap each item to update its status.
            </p>
          )}
        </div>

        {/* Sticky category nav -- chip strip mirroring ItineraryTab DayNav
            and ReferenceTab. Auto-highlights the category whose top has
            crossed below the sticky-nav threshold. */}
        <div className="sticky top-12 z-40 -mx-6 mt-6 border-y border-border bg-background px-6 py-4">
          <ol ref={navRef} className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <li key={cat.id} className="shrink-0">
                  <button
                    type="button"
                    data-category={cat.id}
                    onClick={() => jumpToCategory(cat.id)}
                    aria-label={'Jump to ' + cat.label}
                    aria-current={isActive ? 'true' : undefined}
                    className={
                      'flex items-center gap-2 rounded-none border px-4 py-2 font-mono text-xs cursor-pointer transition-colors ' +
                      (isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground')
                    }
                    title={cat.label}
                  >
                    <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
                      <Icon name={CATEGORY_ICON[cat.id] ?? 'check_box'} size={14} />
                    </span>
                    <span>{cat.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Category cards stacked vertically (one per row). Side-by-side
            md:grid-cols-2 broke the sticky-nav scrollspy because two
            categories shared the same top y-coord on wide screens. */}
        <div className="mt-6 grid gap-4 grid-cols-1">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              id={`category-${cat.id}`}
              className="scroll-mt-32"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
            >
              <CategoryCard
                category={cat}
                statusMap={statusMap}
                onCycle={handleCycle}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-muted-foreground">
          Click any item to cycle its status. Progress is saved locally on this device.
        </p>
      </div>
    </section>
  );
}
