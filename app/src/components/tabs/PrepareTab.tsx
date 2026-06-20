/**
 * PrepareTab.
 * PreparationDashboard (5 high-level categories) at top.
 * Detailed 12-category checklist below.
 * Checkbox per item · persisted to localStorage key kailash_prep_v3_checklist.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect } from 'react';
import type { JourneyState } from '../../lib/journey-state';
import { PreparationDashboard } from '../PreparationDashboard';
import { WeatherConfidence } from '../WeatherConfidence';
import {
  DocumentFilled,
  Smartphone,
  Pill,
  Shirt,
  Mountain,
  Hand,
  Glasses,
  Backpack,
  FlaskConical,
  Heart,
  ClipboardCheck,
} from '@aliimam/icons';
import type { PrepCategory } from '../../lib/prep-data';
import { PREP_CATEGORIES } from '../../lib/prep-data';

/* ------------------------------------------------------------------ */
/* localStorage helpers                                                 */
/* ------------------------------------------------------------------ */

const CHECKLIST_KEY = 'kailash_prep_v3_checklist';

function slugify(categoryId: string, itemName: string): string {
  return `${categoryId}::${itemName.slice(0, 60)}`;
}

function loadChecked(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'boolean') out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function saveChecked(map: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(map));
}

/* ------------------------------------------------------------------ */
/* Icon map                                                             */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.ReactNode> = {
  DocumentFilled: <DocumentFilled size={16} />,
  Smartphone: <Smartphone size={16} />,
  Pill: <Pill size={16} />,
  Shirt: <Shirt size={16} />,
  Mountain: <Mountain size={16} />,
  Hand: <Hand size={16} />,
  Glasses: <Glasses size={16} />,
  Backpack: <Backpack size={16} />,
  FlaskConical: <FlaskConical size={16} />,
  Heart: <Heart size={16} />,
  ClipboardCheck: <ClipboardCheck size={16} />,
};

/* ------------------------------------------------------------------ */
/* Category section                                                     */
/* ------------------------------------------------------------------ */

interface CategorySectionProps {
  category: PrepCategory;
  checked: Record<string, boolean>;
  onToggle: (slug: string) => void;
}

function CategorySection({ category, checked, onToggle }: CategorySectionProps) {
  const totalItems = category.items.length;
  const doneItems = category.items.filter(
    (item) => checked[slugify(category.id, item.name)],
  ).length;
  const allDone = doneItems === totalItems && totalItems > 0;

  return (
    <div className="rounded border border-border bg-card overflow-hidden">
      {/* Category header */}
      <div
        className={[
          'flex items-center justify-between px-4 py-3 border-b border-border',
          allDone ? 'bg-green/5' : 'bg-card',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <span className={allDone ? 'text-green' : 'text-muted'}>
            {ICON_MAP[category.icon] ?? <ClipboardCheck size={16} />}
          </span>
          <h3 className="font-mono text-xs font-semibold tracking-wider text-ink">
            {category.title}
          </h3>
        </div>
        <span className="font-mono text-xs text-muted">
          {doneItems}/{totalItems}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className={[
            'h-full transition-all duration-300',
            allDone ? 'bg-green' : 'bg-accent',
          ].join(' ')}
          style={{ width: totalItems > 0 ? `${Math.round((doneItems / totalItems) * 100)}%` : '0%' }}
        />
      </div>

      {/* Items */}
      <ul className="divide-y divide-border">
        {category.items.map((item) => {
          const slug = slugify(category.id, item.name);
          const isChecked = checked[slug] ?? false;
          return (
            <li key={slug} className="flex items-start gap-3 px-4 py-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                aria-label={item.name}
                onClick={() => onToggle(slug)}
                className={[
                  'mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                  isChecked
                    ? 'bg-green border-green'
                    : 'bg-bg border-border hover:border-accent',
                ].join(' ')}
              >
                {isChecked && (
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <span
                  className={[
                    'block text-sm font-medium leading-snug',
                    isChecked ? 'line-through text-muted' : 'text-ink',
                  ].join(' ')}
                >
                  {item.name}
                </span>
                {item.note && (
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {item.note}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checklist overview bar                                               */
/* ------------------------------------------------------------------ */

function totalProgress(checked: Record<string, boolean>): { done: number; total: number } {
  let total = 0;
  let done = 0;
  for (const cat of PREP_CATEGORIES) {
    for (const item of cat.items) {
      total++;
      if (checked[slugify(cat.id, item.name)]) done++;
    }
  }
  return { done, total };
}

/* ------------------------------------------------------------------ */
/* Main export                                                          */
/* ------------------------------------------------------------------ */

export function PrepareTab({ phase: _phase }: { phase: JourneyState }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  useEffect(() => {
    saveChecked(checked);
  }, [checked]);

  function handleToggle(slug: string) {
    setChecked((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  const { done, total } = totalProgress(checked);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div data-tab="prepare">
      {/* High-level status dashboard */}
      <PreparationDashboard />
      <WeatherConfidence />

      {/* Detailed 12-category checklist */}
      <section
        data-section="detailed-checklist"
        className="border-b border-border bg-bg px-6 py-8"
      >
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-sans text-2xl font-medium text-ink">Full packing checklist</h2>
              <p className="mt-1 text-sm text-muted">
                {total} items across 12 categories. Check off as you pack.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted">{done}/{total} checked</span>
              <span
                className={[
                  'rounded px-2 py-1 font-mono text-xs',
                  pct === 100 ? 'bg-green/10 text-green' : 'bg-border text-muted',
                ].join(' ')}
              >
                {pct}%
              </span>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mb-8 h-1 rounded-full bg-border overflow-hidden">
            <div
              className={[
                'h-full rounded-full transition-all duration-300',
                pct === 100 ? 'bg-green' : 'bg-accent',
              ].join(' ')}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Category grid: 2 columns on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PREP_CATEGORIES.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                checked={checked}
                onToggle={handleToggle}
              />
            ))}
          </div>

          <p className="mt-6 text-xs text-muted">
            Progress is saved locally on this device. Tap any checkbox to toggle.
          </p>
        </div>
      </section>
    </div>
  );
}
