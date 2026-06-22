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
  {
    id: 'carry',
    label: 'Things to Carry',
    optional: false,
    items: [
      // ---- Clothing & layers ---------------------------------------
      { id: 'carry-tshirts', label: 'Quick-dry T-shirts (4-5)', blocking: 'Cotton holds sweat at altitude. Quick-dry tops only.', defaultStatus: 'action-needed' },
      { id: 'carry-uv-shirts', label: 'Long-sleeve UV shirts (2)', blocking: 'High-altitude sun burns exposed skin within an hour. Long sleeves with UPF rating.', defaultStatus: 'action-needed' },
      { id: 'carry-thermal-top', label: 'Thermal top (2)', blocking: 'Base layer for cold mornings. Merino or synthetic, not cotton.', defaultStatus: 'action-needed' },
      { id: 'carry-thermal-bottom', label: 'Thermal bottom (2)', blocking: 'Base layer for cold mornings, especially at Mansarovar and Dolma La.', defaultStatus: 'action-needed' },
      { id: 'carry-trek-pants', label: 'Trekking pants (2)', blocking: 'Convertible / quick-dry trek pants for Parikrama days.', defaultStatus: 'action-needed' },
      { id: 'carry-travel-pants', label: 'Comfortable travel pants (1)', blocking: 'For flight and city days in Kathmandu / Lhasa.', defaultStatus: 'action-needed' },
      { id: 'carry-fleece', label: 'Fleece jacket', blocking: 'Mid layer for cool evenings. Pairs with base + shell.', defaultStatus: 'action-needed' },
      { id: 'carry-puffer', label: 'Lightweight puffer / down jacket', blocking: 'YPO provides one. Confirm your size is in.', defaultStatus: 'action-needed' },
      { id: 'carry-shell', label: 'Waterproof shell jacket', blocking: 'Outer layer for wind + sleet. Hard shell, not soft shell.', defaultStatus: 'action-needed' },
      { id: 'carry-rain-pants', label: 'Rain pants', blocking: 'Tibet monsoon can wet the Parikrama trail. Light rain pants over trek pants.', defaultStatus: 'action-needed' },
      { id: 'carry-beanie', label: 'Warm beanie', blocking: 'YPO provides a warm cap. Pack a backup.', defaultStatus: 'action-needed' },
      { id: 'carry-sun-cap', label: 'Sun cap', blocking: 'For Kathmandu + Mansarovar daytime sun.', defaultStatus: 'action-needed' },
      { id: 'carry-buff', label: 'Neck gaiter / buff (2)', blocking: 'Sun cover + dust filter + warmth. One on, one drying.', defaultStatus: 'action-needed' },
      { id: 'carry-gloves-light', label: 'Lightweight gloves', blocking: 'For cool mornings + sun protection during the trek.', defaultStatus: 'action-needed' },
      { id: 'carry-gloves-warm', label: 'Warm waterproof gloves', blocking: 'For Dolma La pre-dawn ascent. Lightweight gloves alone are not enough.', defaultStatus: 'action-needed' },

      // ---- Footwear ------------------------------------------------
      { id: 'carry-trek-shoes', label: 'Trekking shoes (already broken in)', blocking: 'Same as packing-boots above. Confirm broken in.', defaultStatus: 'action-needed' },
      { id: 'carry-slippers', label: 'Hotel slippers / sandals', blocking: 'For hotel rooms and around camps. Light and packable.', defaultStatus: 'action-needed' },
      { id: 'carry-trek-socks', label: 'Trekking socks (5 pairs)', blocking: 'Merino or synthetic. Wet socks lead to blisters.', defaultStatus: 'action-needed' },
      { id: 'carry-wool-socks', label: 'Wool socks (2 pairs)', blocking: 'For Dolma La and cold camp nights. Heavyweight wool.', defaultStatus: 'action-needed' },

      // ---- Electronics ---------------------------------------------
      { id: 'carry-phone', label: 'Phone', blocking: 'Camera + offline maps + emergency. Charged before each travel day.', defaultStatus: 'action-needed' },
      { id: 'carry-powerbank', label: 'Power bank (20,000 mAh+)', blocking: 'No mains power during Parikrama. One full-size bank, charged before Day 7.', defaultStatus: 'action-needed' },
      { id: 'carry-cables', label: 'Charging cables (2)', blocking: 'One primary, one spare. Cables fail at the worst moments.', defaultStatus: 'action-needed' },
      { id: 'carry-adapter', label: 'Universal adapter', blocking: 'Nepal + Tibet sockets differ from Indian sockets. One universal adapter covers both.', defaultStatus: 'action-needed' },

      // ---- Health kit ----------------------------------------------
      { id: 'carry-prescriptions', label: 'Prescription medicines (trip + 5 extra days)', blocking: 'Tibet pharmacies are unreliable. Carry buffer doses.', defaultStatus: 'action-needed' },
      { id: 'carry-diamox', label: 'Diamox (as advised by doctor)', blocking: 'See Medical category. Start 2-3 days before departure per doctor.', defaultStatus: 'action-needed' },
      { id: 'carry-ors', label: 'ORS sachets (8-10)', blocking: 'Dehydration at altitude is the silent altitude-sickness multiplier.', defaultStatus: 'action-needed' },
      { id: 'carry-pain-relief', label: 'Pain relief tablets', blocking: 'Headaches at altitude are common. Paracetamol or ibuprofen strip.', defaultStatus: 'action-needed' },
      { id: 'carry-cold-flu', label: 'Cold and flu medication', blocking: 'Cold air + crowded transport. Pack a small strip.', defaultStatus: 'action-needed' },
      { id: 'carry-lozenges', label: 'Cough lozenges (1 pack)', blocking: 'Dry, dusty Tibetan air dries out throats fast.', defaultStatus: 'action-needed' },
      { id: 'carry-bandaids', label: 'Band-aids (10)', blocking: 'Hotspots, small cuts.', defaultStatus: 'action-needed' },
      { id: 'carry-blister-patches', label: 'Blister patches (4-6)', blocking: 'Compeed or equivalent. The trek is unforgiving on feet.', defaultStatus: 'action-needed' },
      { id: 'carry-sanitizer', label: 'Hand sanitizer', blocking: 'Limited handwashing on Parikrama days.', defaultStatus: 'action-needed' },
      { id: 'carry-wet-wipes', label: 'Wet wipes (2 packs)', blocking: 'Replaces showers during the offline 3-day trek.', defaultStatus: 'action-needed' },
      { id: 'carry-tissues', label: 'Tissues (2 packs)', blocking: 'Toilets along the route often lack paper.', defaultStatus: 'action-needed' },
      { id: 'carry-hand-warmers', label: 'Hand-warmer packets (4-6)', blocking: 'For the Dolma La pre-dawn ascent. Single-use chemical warmers.', defaultStatus: 'action-needed' },

      // ---- Sun protection ------------------------------------------
      { id: 'carry-sunglasses', label: 'Sunglasses (UV400)', blocking: 'Snow blindness at 5,630 m is a real injury. UV400 mandatory.', defaultStatus: 'action-needed' },
      { id: 'carry-sunscreen', label: 'Sunscreen SPF 50+', blocking: 'High-altitude sun burns exposed skin within an hour.', defaultStatus: 'action-needed' },
      { id: 'carry-lipbalm', label: 'Lip balm with SPF', blocking: 'Lips crack fast at altitude + sun. SPF-rated.', defaultStatus: 'action-needed' },
      { id: 'carry-moisturizer', label: 'Moisturizer', blocking: 'Dry Tibet air cracks skin within 2-3 days.', defaultStatus: 'action-needed' },

      // ---- Day pack (used every Parikrama day) ---------------------
      { id: 'carry-daypack', label: 'Day pack (20-30L)', blocking: 'Carries water, snacks, layers, meds during the trek. YPO provides a backpack.', defaultStatus: 'action-needed' },
      { id: 'carry-water-bottle', label: 'Reusable water bottle (1 L)', blocking: 'Insulated metal bottle keeps water from freezing on Dolma La morning.', defaultStatus: 'action-needed' },
      { id: 'carry-snacks', label: 'Snacks / energy bars (10-15)', blocking: 'For long Parikrama days. Nuts, dried fruit, bars.', defaultStatus: 'action-needed' },

      // ---- Docs and money ------------------------------------------
      { id: 'carry-passport-copies', label: 'Passport photocopies (4)', blocking: 'Hotels and permits routinely ask for copies. Carry colour copies separately from the original.', defaultStatus: 'action-needed' },
      { id: 'carry-insurance-print', label: 'Insurance documents printed', blocking: 'Already provided by Everest Travels (see FAQs). Print a hard copy.', defaultStatus: 'action-needed' },
      { id: 'carry-cash-yuan', label: 'Cash: 5,000 Yuan (per operator)', blocking: 'Cards do not work everywhere in Tibet. Carry the recommended cash amount.', defaultStatus: 'action-needed' },
      { id: 'carry-emergency-card', label: 'Emergency contact card', blocking: 'Names + numbers for family + operator, on paper, in your wallet.', defaultStatus: 'action-needed' },
      { id: 'carry-pen', label: 'Pen (for immigration forms)', blocking: 'KTM + Tibet entry forms are filled by hand. Bring a working pen.', defaultStatus: 'action-needed' },

      // ---- Personal care -------------------------------------------
      { id: 'carry-toothbrush', label: 'Toothbrush + paste', blocking: 'Travel-size paste only.', defaultStatus: 'action-needed' },
      { id: 'carry-soap', label: 'Travel soap / body wash', blocking: 'Hotel soap is variable.', defaultStatus: 'action-needed' },
      { id: 'carry-deodorant', label: 'Deodorant', blocking: 'Travel-size, alcohol-free preferred.', defaultStatus: 'action-needed' },
      { id: 'carry-towel', label: 'Microfiber quick-dry towel', blocking: 'Smaller and dries faster than a hotel towel.', defaultStatus: 'action-needed' },
      { id: 'carry-earplugs', label: 'Earplugs', blocking: 'High-altitude sleep disturbance is real. Earplugs help.', defaultStatus: 'action-needed' },
      { id: 'carry-eye-mask', label: 'Eye mask', blocking: 'Lhasa sunrise is early. Eye mask helps protect rest.', defaultStatus: 'action-needed' },
      { id: 'carry-padlock', label: 'Padlock for duffel', blocking: 'Duffel changes hands at airports + hotels. Small lock + cable tie helps.', defaultStatus: 'action-needed' },
      { id: 'carry-dry-bag', label: 'Dry bag (10 L)', blocking: 'Keeps clothes dry during Parikrama rain. Doubles as a wet-clothes bag.', defaultStatus: 'action-needed' },

      // ---- Spiritual (optional) ------------------------------------
      { id: 'carry-mala', label: 'Japa mala', blocking: 'For chanting Om Namah Shivaya / Om Mani Padme Hum on Parikrama. Optional.', defaultStatus: 'action-needed' },
      { id: 'carry-journal', label: 'Small journal + pen', blocking: 'Many yatris keep a daily Parikrama journal. Optional.', defaultStatus: 'action-needed' },
      { id: 'carry-puja-kit', label: 'Compact puja kit', blocking: 'For Mansarovar Day 6 puja. Operator may provide essentials -- pack personal items.', defaultStatus: 'action-needed' },
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
