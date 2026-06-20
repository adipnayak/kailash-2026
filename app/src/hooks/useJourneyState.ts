import { useMemo, useState, useEffect } from 'react';
import { computeJourneyState, getReferenceDate, type JourneyState } from '../lib/journey-state';

/**
 * Returns the current JourneyState.
 * Re-evaluates on date param change (?date=YYYY-MM-DD).
 * For foundation pass we compute once on mount; future Ralphs can add
 * an interval refresh when the engine needs to live-update across midnight.
 */
export function useJourneyState(): JourneyState {
  const [now] = useState<Date>(() => getReferenceDate());
  return useMemo(() => computeJourneyState(now), [now]);
}

const TAB_KEY = 'kailash_tab';
export type Tab = 'overview' | 'itinerary' | 'prepare' | 'reference';

export function useTabPersist(initial: Tab = 'overview'): [Tab, (t: Tab) => void] {
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(TAB_KEY) as Tab | null;
    return stored || initial;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TAB_KEY, tab);
  }, [tab]);
  return [tab, setTab];
}
