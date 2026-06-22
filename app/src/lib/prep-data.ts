/**
 * Shared preparation-checklist data + helpers.
 *
 * Single source of truth used by PreparationDashboard (the full tab)
 * and Hero (the Overview prep card that summarises by category).
 * Previously each component owned its own data and they drifted: the
 * Hero card read `prep_<id>` booleans nothing ever wrote, so it always
 * showed "4 of 4 things left" regardless of Prepare-tab progress.
 *
 * Two states per item: 'complete' or 'action-needed'. Tap toggles.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

export type ItemStatus = 'complete' | 'action-needed';

export interface CheckItem {
  id: string;
  label: string;
  blocking: string;
  defaultStatus: ItemStatus;
}

export interface Category {
  id: string;
  label: string;
  optional: boolean;
  items: CheckItem[];
}

export type StatusMap = Record<string, ItemStatus>;

export const PREP_STORAGE_KEY = 'kailash_prep_v2';
const OLD_KEYS = ['kailash_prep_v3', 'kailash_checklist_v3'];

export const CATEGORIES: Category[] = [
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
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
      },
      {
        id: 'flights-pnr-shared',
        label: 'PNR shared with operator and emergency contact',
        blocking: 'Operator and emergency contact both need your flight details.',
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
      },
      {
        id: 'medical-kit',
        label: 'Personal med kit packed (Diamox, Paracetamol, ORS, blister patches)',
        blocking: 'Assemble your personal med kit at least 3 days before departure.',
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
      },
      {
        id: 'conn-offline-maps',
        label: 'Offline maps downloaded (Maps.me or Google Maps offline)',
        blocking: 'Download Tibet region offline maps before departure. No data connectivity during Parikrama (Days 7-9).',
        defaultStatus: 'action-needed',
      },
      {
        id: 'conn-family-msg',
        label: 'Pre-written offline message sent to family (Days 7-9 blackout)',
        blocking: 'Write and send the offline message before Day 7. No phone or WiFi for 3 days during Parikrama.',
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
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
        defaultStatus: 'action-needed',
      },
      {
        id: 'packing-headlamp',
        label: 'Headlamp with fresh batteries packed',
        blocking: 'Day 8 starts at 04:00. Headlamp is not optional.',
        defaultStatus: 'action-needed',
      },
      {
        id: 'packing-sunprotection',
        label: 'SPF 50+ sunscreen and UV-blocking sunglasses packed',
        blocking: 'UV radiation at 5,630 m is extreme. Snow blindness is a real risk.',
        defaultStatus: 'action-needed',
      },
    ],
  },
];

export function purgeOldPrepKeys(): void {
  if (typeof window === 'undefined') return;
  for (const k of OLD_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        for (const key of Object.keys(parsed)) {
          if (key.startsWith('insurance')) delete parsed[key];
        }
        localStorage.setItem(k, JSON.stringify(parsed));
      }
    } catch {
      // Ignore parse errors -- old format may be corrupted.
    }
    localStorage.removeItem(k);
  }
}

export function loadPrepStatus(): StatusMap {
  purgeOldPrepKeys();
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PREP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: StatusMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && (v === 'complete' || v === 'action-needed')) {
        if (!k.startsWith('insurance')) out[k] = v as ItemStatus;
      } else if (typeof v === 'string' && (v === 'pending' || v === 'optional')) {
        // v3 4-state values migrate to action-needed so returning users
        // don't silently lose progress.
        if (!k.startsWith('insurance')) out[k] = 'action-needed';
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function savePrepStatus(map: StatusMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREP_STORAGE_KEY, JSON.stringify(map));
  // Fire a same-tab signal so Hero (or anything else watching) can
  // re-read without waiting for a navigation. The native 'storage' event
  // only fires across windows.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('kailash-prep-updated'));
  }
}

/**
 * True when every non-optional item in the named category has been
 * marked 'complete'. Optional items don't move the needle either way.
 */
export function isCategoryComplete(categoryId: string, statusMap: StatusMap): boolean {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return false;
  return cat.items.every((item) => (statusMap[item.id] ?? item.defaultStatus) === 'complete');
}

/**
 * Overall completion fraction across ALL items (including medical /
 * optional). Used for the progress bar.
 */
export function overallPrepProgress(statusMap: StatusMap): { complete: number; total: number; pct: number } {
  let complete = 0;
  let total = 0;
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      total += 1;
      if ((statusMap[item.id] ?? item.defaultStatus) === 'complete') complete += 1;
    }
  }
  const pct = total === 0 ? 0 : Math.round((complete / total) * 100);
  return { complete, total, pct };
}
