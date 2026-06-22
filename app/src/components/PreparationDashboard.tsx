/**
 * PreparationDashboard.
 * 5-category trip checklist with localStorage persistence (kailash_prep_v2).
 * Visible only in BEFORE phase. Hidden during and after.
 * PRD reference: section 8 (Preparation Dashboard).
 *
 * Categories: Passport, Flights, Medical (optional), Connectivity, Packing.
 * Insurance category removed as of v4 spec.
 *
 * Status icons:
 *   CheckCircle (green)  = COMPLETE
 *   Clock (yellow)       = PENDING
 *   AlertCircle (red)    = ACTION NEEDED
 *   Minus (gray)         = OPTIONAL (Medical only)
 *
 * Before phase: red ACTION NEEDED rows expand with blocking copy.
 *   Green/yellow items are demoted (collapsed).
 * During / After: component returns null.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck, Clock, CircleAlert, CircleMinus } from '@aliimam/icons';
import { useJourneyState } from '../hooks/useJourneyState';
import gsap from 'gsap';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type ItemStatus = 'complete' | 'pending' | 'action-needed' | 'optional';

interface CheckItem {
  id: string;
  label: string;
  blocking: string; // shown when status=action-needed, explains what is blocking
  defaultStatus: ItemStatus;
}

interface Category {
  id: string;
  label: string;
  optional: boolean; // Medical is optional; never blocks complete
  items: CheckItem[];
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const CATEGORIES: Category[] = [
  {
    id: 'passport',
    label: 'Passport',
    optional: false,
    items: [
      {
        id: 'passport-valid',
        label: 'Passport valid 6+ months past return date',
        blocking: 'Passport must be valid until at least January 2027. Renew immediately.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'passport-copy',
        label: 'Colour copy lodged with travel agent',
        blocking: 'Travel agent needs a colour scan for the Tibet group permit application.',
        defaultStatus: 'pending',
      },
      {
        id: 'passport-china-visa',
        label: 'China group visa (applied via operator)',
        blocking: 'Operator applies on behalf of the group. Confirm with operator that your details are submitted.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'passport-noc',
        label: 'Indian Embassy NOC appointment confirmed (Day 2 in Kathmandu)',
        blocking: 'Embassy NOC visit is mandatory. Confirm with operator that you are on the list.',
        defaultStatus: 'pending',
      },
    ],
  },
  {
    id: 'flights',
    label: 'Flights',
    optional: false,
    items: [
      {
        id: 'flights-ktm-out',
        label: 'Outbound flight to Kathmandu booked (arrive by 07 Jul)',
        blocking: 'You must land in Kathmandu by evening on 07 Jul. Book immediately.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'flights-ktm-return',
        label: 'Return flight from Kathmandu booked (depart 19 Jul or later)',
        blocking: 'Return must depart no earlier than 19 Jul. Book with buffer for delays.',
        defaultStatus: 'pending',
      },
      {
        id: 'flights-pnr-shared',
        label: 'PNR shared with operator and emergency contact',
        blocking: 'Operator and emergency contact both need your flight details.',
        defaultStatus: 'pending',
      },
    ],
  },
  {
    id: 'medical',
    label: 'Medical',
    optional: true,
    items: [
      {
        id: 'medical-diamox',
        label: 'Diamox prescription obtained from doctor',
        blocking: 'Consult your doctor for Acetazolamide 250 mg prescription. Start 2 to 3 days before departure.',
        defaultStatus: 'pending',
      },
      {
        id: 'medical-insurance',
        label: 'Travel insurance with air ambulance rider active',
        blocking: 'Altitude emergencies can require helicopter evacuation from Tibet. Air ambulance cover is required.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'medical-consult',
        label: 'Doctor cleared you for high-altitude trekking (5,630 m)',
        blocking: 'Get a fitness clearance from your GP, especially if you have cardiac or respiratory history.',
        defaultStatus: 'pending',
      },
      {
        id: 'medical-kit',
        label: 'Personal med kit packed (Diamox, Paracetamol, ORS, blister patches)',
        blocking: 'Assemble your personal med kit at least 3 days before departure.',
        defaultStatus: 'pending',
      },
    ],
  },
  {
    id: 'connectivity',
    label: 'Connectivity',
    optional: false,
    items: [
      {
        id: 'conn-vpn',
        label: 'VPN installed and tested (Astrill recommended)',
        blocking: 'WhatsApp and most messaging apps are blocked in Tibet without a VPN app. Install and test before you leave India.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'conn-esim',
        label: 'China eSIM purchased and installed',
        blocking: 'Your India SIM will not work in Tibet. Purchase a China eSIM and confirm it activates on arrival.',
        defaultStatus: 'pending',
      },
      {
        id: 'conn-offline-maps',
        label: 'Offline maps downloaded (Maps.me or Google Maps offline)',
        blocking: 'Download Tibet region offline maps before departure. No data connectivity during Parikrama (Days 7-9).',
        defaultStatus: 'pending',
      },
      {
        id: 'conn-family-msg',
        label: 'Pre-written offline message sent to family (Days 7-9 blackout)',
        blocking: 'Write and send the offline message before Day 7. No phone or WiFi for 3 days during Parikrama.',
        defaultStatus: 'pending',
      },
    ],
  },
  {
    id: 'packing',
    label: 'Packing',
    optional: false,
    items: [
      {
        id: 'packing-layers',
        label: 'Base, mid and hard-shell layers packed',
        blocking: 'Temperature at 5,630 m can drop below freezing. Three-layer system is mandatory.',
        defaultStatus: 'pending',
      },
      {
        id: 'packing-boots',
        label: 'Trek boots broken in (at least 4 sessions)',
        blocking: 'Unbroken boots at Dolma La will cause blisters and injury. Break them in now.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'packing-poles',
        label: 'Trekking poles packed',
        blocking: 'Poles are essential at altitude. Pack adjustable collapsible poles.',
        defaultStatus: 'pending',
      },
      {
        id: 'packing-headlamp',
        label: 'Headlamp with fresh batteries packed',
        blocking: 'Day 8 starts at 04:00. Headlamp is not optional.',
        defaultStatus: 'pending',
      },
      {
        id: 'packing-sunprotection',
        label: 'SPF 50+ sunscreen and UV-blocking sunglasses packed',
        blocking: 'UV radiation at 5,630 m is extreme. Snow blindness is a real risk.',
        defaultStatus: 'pending',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* localStorage helpers                                                */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kailash_prep_v2';
const OLD_KEYS = ['kailash_prep_v3', 'kailash_checklist_v3'];

type StatusMap = Record<string, ItemStatus>;

function purgeOldKeys(): void {
  if (typeof window === 'undefined') return;
  for (const k of OLD_KEYS) {
    try {
      // Also remove any Insurance-related keys from old prep data
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        // purge insurance keys
        for (const key of Object.keys(parsed)) {
          if (key.startsWith('insurance')) {
            delete parsed[key];
          }
        }
      }
    } catch {
      // ignore parse errors
    }
    localStorage.removeItem(k);
  }
}

function loadStatus(): StatusMap {
  purgeOldKeys();
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: StatusMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (
        typeof v === 'string' &&
        (v === 'complete' || v === 'pending' || v === 'action-needed' || v === 'optional')
      ) {
        // Strip any insurance keys that might have slipped in
        if (!k.startsWith('insurance')) {
          out[k] = v as ItemStatus;
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveStatus(map: StatusMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === 'complete') {
    return <CircleCheck size={16} className="text-emerald shrink-0" />;
  }
  if (status === 'pending') {
    return <Clock size={16} className="text-sacred shrink-0" />;
  }
  if (status === 'action-needed') {
    return <CircleAlert size={16} className="text-destructive shrink-0" />;
  }
  return <CircleMinus size={16} className="text-muted-foreground shrink-0" />;
}

function statusLabel(status: ItemStatus): string {
  if (status === 'complete') return 'Complete';
  if (status === 'pending') return 'Pending';
  if (status === 'action-needed') return 'Action needed';
  return 'Optional';
}

const CYCLE: Record<ItemStatus, ItemStatus> = {
  'action-needed': 'pending',
  pending: 'complete',
  complete: 'action-needed',
  optional: 'complete',
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
          <StatusIcon status={isOptionalCategory ? (isComplete ? 'complete' : 'optional') : status} />
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
          {isOptionalCategory && !isComplete ? 'optional' : statusLabel(status).toLowerCase()}
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

  // Sort: action-needed first, then pending, then complete
  const sorted = [...category.items].sort((a, b) => {
    const sa = statusMap[a.id] ?? a.defaultStatus;
    const sb = statusMap[b.id] ?? b.defaultStatus;
    const order: Record<ItemStatus, number> = {
      'action-needed': 0,
      pending: 1,
      complete: 2,
      optional: 3,
    };
    return order[sa] - order[sb];
  });

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
      let defaultStatus: ItemStatus = 'pending';
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-sans text-2xl font-medium text-foreground">Preparation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
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

        {/* Category cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
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
