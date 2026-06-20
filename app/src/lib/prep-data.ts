/**
 * prep-data.ts
 * 12-category ~100-item Kailash preparation checklist.
 * Source: verbatim from kailash-prep-checklist.txt
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

export interface PrepItem {
  name: string;
  note: string;
}

export interface PrepCategory {
  id: string;
  title: string;
  icon: string; // @aliimam/icons name
  items: PrepItem[];
}

export const PREP_CATEGORIES: PrepCategory[] = [
  {
    id: 'documents-and-money',
    title: 'DOCUMENTS AND MONEY',
    icon: 'DocumentFilled',
    items: [
      {
        name: 'Passport (original, valid 6+ months past return)',
        note: 'Couriered to Delhi visa agent in T-21 window.',
      },
      {
        name: 'Passport photocopies x4 + 2 passport photos',
        note: 'One at home, one in suitcase, two in daypack.',
      },
      {
        name: 'Tibet Group Permit + Chinese Group Visa (operator-issued)',
        note: 'Delivered with returned passport.',
      },
      {
        name: 'Indian Embassy NOC (issued Day 2)',
        note: 'Operator coordinates.',
      },
      {
        name: 'BOM to KTM flight tickets (printed + on phone)',
        note: 'Both copies survive a dead phone.',
      },
      {
        name: 'Travel insurance policy + 24/7 helpline (printed + on phone)',
        note: 'Air-ambulance rider mandatory.',
      },
      {
        name: 'Hotel + operator confirmation summary (A4 sheet)',
        note: 'Print one. Leave one with family.',
      },
      {
        name: 'Emergency contact card',
        note: 'Operator + home + doctor + embassy.',
      },
      {
        name: 'Vaccination card (yellow card)',
        note: 'Standard YPO requirement.',
      },
      {
        name: 'USD ~200 cash',
        note: 'Emergency reserve.',
      },
      {
        name: 'INR ~10,000 cash',
        note: 'Mumbai + return-leg coverage.',
      },
      {
        name: 'CNY ~5,000 cash',
        note: 'Cash-only economy past Lhasa.',
      },
      {
        name: 'Forex card with USD + CNY loaded',
        note: 'Backup to cash.',
      },
      {
        name: '1 credit card + 1 debit card (split locations)',
        note: 'Card lost/cloned is a known failure mode.',
      },
    ],
  },
  {
    id: 'electronics-and-connectivity',
    title: 'ELECTRONICS AND CONNECTIVITY',
    icon: 'Smartphone',
    items: [
      {
        name: 'Smartphone (charged, maps cached, PDFs saved)',
        note: 'Primary device.',
      },
      {
        name: 'CCC certified power bank, 20,000 mAh or more',
        note: 'Non-CCC banks confiscated at check-in.',
      },
      {
        name: 'Phone charger + USB-C/Lightning cables x2',
        note: 'Cable failure is the #1 silent killer.',
      },
      {
        name: 'Universal travel adapter (A, C, D, G)',
        note: 'Nepal C/D. Tibet/China A/C/I.',
      },
      {
        name: 'Holafly China eSIM (installed, tested)',
        note: 'Tibet is behind the Great Firewall.',
      },
      {
        name: 'Astrill VPN subscription (tested)',
        note: 'Without it, WhatsApp/Google/Instagram blocked.',
      },
      {
        name: 'Headlamp (Petzl Tikkina) + spare batteries',
        note: 'Day 8 04:00 pre-dawn.',
      },
      {
        name: 'Backup torch / small flashlight',
        note: 'Headlamp battery failure mode.',
      },
      {
        name: 'Headphones / earbuds',
        note: 'Long flights + acclim rest.',
      },
      {
        name: 'Power bank cables (USB-A and USB-C)',
        note: 'One per device.',
      },
      {
        name: 'Camera + spare SD + charger (optional)',
        note: 'Phone is the default.',
      },
    ],
  },
  {
    id: 'medicines',
    title: 'MEDICINES',
    icon: 'Pill',
    items: [
      {
        name: 'Diamox prescription, full course',
        note: 'Start ~T-3. Continue per doctor.',
      },
      {
        name: 'Ibuprofen x20 (Brufen 400 mg)',
        note: 'Specify ibuprofen, not paracetamol.',
      },
      {
        name: 'ORS sachets x10 to 15',
        note: 'Altitude dehydration is severe.',
      },
      {
        name: 'Imodium (loperamide)',
        note: 'Tent-toilet leg.',
      },
      {
        name: 'Antacid (Pan-D / Razo)',
        note: 'Diamox metabolic acidosis comfort.',
      },
      {
        name: 'Antiseptic wipes + bandages + medical tape',
        note: 'Day 1 hotspot management.',
      },
      {
        name: 'Compeed blister plasters x6',
        note: 'Apply on Day 1 hotspot immediately.',
      },
      {
        name: 'Antihistamine (cetirizine)',
        note: 'Allergic reaction backup.',
      },
      {
        name: 'Personal regular meds (full duration + 3 days buffer)',
        note: 'No refill possible at altitude.',
      },
      {
        name: 'Camphor pods',
        note: 'Traditional altitude breathing aid.',
      },
      {
        name: 'Lip balm SPF 30+',
        note: 'Altitude UV cracks lips fast.',
      },
      {
        name: 'Sunscreen SPF 50+ (50 ml daypack + 200 ml suitcase)',
        note: 'Reapply every 2 h.',
      },
    ],
  },
  {
    id: 'clothing-bottom',
    title: 'CLOTHING: BOTTOM',
    icon: 'Shirt',
    items: [
      {
        name: 'Standard trek pants x2 (Forclaz MT500)',
        note: 'Days 7, 9, 10.',
      },
      {
        name: 'Insulated waterproof pant for Day 8 (Bugaboo V or Trek 500 + MT900)',
        note: 'The Dolma La pant.',
      },
      {
        name: 'Thermal base bottoms x2',
        note: 'Under trek pants Days 7 to 9.',
      },
      {
        name: 'Travel pants (KTM and return)',
        note: 'Cotton allowed on rest days only.',
      },
      {
        name: 'Sleep / camp pants',
        note: 'Dirapuk + Zuthulphuk tent nights.',
      },
    ],
  },
  {
    id: 'clothing-top',
    title: 'CLOTHING: TOP',
    icon: 'Shirt',
    items: [
      {
        name: 'Merino base layers x3 (top + bottom sets)',
        note: 'No cotton on trek days.',
      },
      {
        name: 'Slim mid-layer fleece',
        note: 'Must fit under YPO rain shell on Day 8.',
      },
      {
        name: 'Thermal base top x2',
        note: 'Day 8 inner layer.',
      },
      {
        name: 'YPO rain shell (provided Day 2)',
        note: 'Outer layer Days 5 to 9.',
      },
      {
        name: 'Cotton tee x2',
        note: 'Rest days only.',
      },
      {
        name: 'Travel layer / olive parka for evenings',
        note: 'Lhasa / Mansarovar / Darchen evenings.',
      },
    ],
  },
  {
    id: 'clothing-feet',
    title: 'CLOTHING: FEET',
    icon: 'Mountain',
    items: [
      {
        name: 'Hiking boots (Simond MT500 or Forclaz MT500), broken in 80 to 100 km',
        note: 'Cannot break in on the trek.',
      },
      {
        name: 'Wool midweight socks x4',
        note: 'Days 5 to 10.',
      },
      {
        name: 'Thin liner socks x2',
        note: 'Under wool. Prevents blisters.',
      },
      {
        name: 'Compression socks',
        note: 'Day 8 recovery + Day 10 evening.',
      },
      {
        name: 'Sneakers',
        note: 'Days 1 to 2 + 11 to 13.',
      },
      {
        name: 'Camp / hotel slippers',
        note: 'Hotel use.',
      },
    ],
  },
  {
    id: 'clothing-hands',
    title: 'CLOTHING: HANDS',
    icon: 'Hand',
    items: [
      {
        name: 'Insulated outer gloves (waterproof shell + insulation)',
        note: 'Frostbite risk in 30 min bare-handed at the pass.',
      },
      {
        name: 'Touch-screen liner gloves',
        note: 'Under outer. Solo Days 7 + 9.',
      },
      {
        name: 'Hand warmers x6 to 10',
        note: 'Day 8 pre-dawn + at the pass.',
      },
    ],
  },
  {
    id: 'clothing-head-and-face',
    title: 'CLOTHING: HEAD AND FACE',
    icon: 'Glasses',
    items: [
      {
        name: 'Cat 4 sunglasses (wraparound)',
        note: 'UV 11+ at 5,630 m.',
      },
      {
        name: 'Sunglasses leash',
        note: 'Pass wind rips off unsecured glasses.',
      },
      {
        name: 'Full-face sun mask (UPF 50+)',
        note: 'Altitude UV 3 to 4x sea level.',
      },
      {
        name: 'Wide-brim sun hat (UPF 50+, chin strap)',
        note: 'Supplements YPO cap.',
      },
      {
        name: 'Beanie',
        note: 'Dolma La + pre-dawn.',
      },
      {
        name: 'Buff / neck gaiter',
        note: 'Wind + UV.',
      },
      {
        name: 'Bandana',
        note: 'Multi-use.',
      },
    ],
  },
  {
    id: 'trek-gear-and-bags',
    title: 'TREK GEAR AND BAGS',
    icon: 'Backpack',
    items: [
      {
        name: 'Main suitcase / duffel 50 to 70 L',
        note: 'Stays in Lhasa storage Days 5 to 10.',
      },
      {
        name: 'Personal Parikrama daypack 20 to 25 L with hip-belt',
        note: 'Always with you Day 1 onward.',
      },
      {
        name: 'Trekking poles (anti-shock, adjustable)',
        note: 'Knee load -25% on descent.',
      },
      {
        name: 'Heavy-duty pack liner / dry bag 30 to 60 L',
        note: 'Dolma La descent rain proof.',
      },
      {
        name: 'Zip-lock bags x20',
        note: 'Pill organisation, wet-dry separation.',
      },
      {
        name: 'Microfibre quick-dry towel',
        note: 'Mansarovar bath + hotel days.',
      },
      {
        name: 'Pee Buddies (urination funnel)',
        note: 'Tent toilet leg.',
      },
      {
        name: 'Hand wipes + body wipes (Days 7 to 8 no bathing)',
        note: 'Hygiene fallback.',
      },
      {
        name: 'Soap strips / paper soap',
        note: 'Lightweight wash.',
      },
      {
        name: 'Toothbrush + paste, floss, spare contacts if needed',
        note: 'Standard hygiene.',
      },
      {
        name: 'Hand sanitiser (60 ml)',
        note: 'Tent / restaurant use.',
      },
    ],
  },
  {
    id: 'snacks-and-hydration',
    title: 'SNACKS AND HYDRATION',
    icon: 'FlaskConical',
    items: [
      {
        name: 'Protein bars x10 to 15 (RiteBite Max / Yoga Bar)',
        note: 'Appetite drops at altitude.',
      },
      {
        name: 'Dry fruits + nuts 500 to 750 g',
        note: 'Slow-release energy.',
      },
      {
        name: 'Glucose tablets / powder x4 sachets',
        note: 'Day 8 fast-energy reserve.',
      },
      {
        name: 'Electrolyte sachets (ORS / Electral / Enerzal) x10 to 15',
        note: 'Altitude dehydration.',
      },
      {
        name: 'Insulated water bottle 1 L (Hydro Flask / Decathlon)',
        note: 'Cold-temperature reliable hydration.',
      },
      {
        name: 'Hydration bladder 1 to 2 L',
        note: 'Day 8 hands-free water.',
      },
      {
        name: 'Tea / coffee sachets (instant)',
        note: 'Hot drink on cold morning.',
      },
      {
        name: 'Salt / sugar / spice sachets',
        note: 'Tibet food preference adjustment.',
      },
    ],
  },
  {
    id: 'spiritual-items-optional',
    title: 'SPIRITUAL ITEMS (OPTIONAL)',
    icon: 'Heart',
    items: [
      {
        name: 'Empty bottle for Mansarovar holy water',
        note: 'Fill at Day 6 Kora.',
      },
      {
        name: 'Ritual coins (INR + CNY mix)',
        note: 'Offerings at temples and stupas.',
      },
      {
        name: 'Sankalpa notebook + pen',
        note: 'Pre-trip intention setting and post-trip reflection.',
      },
      {
        name: 'Rudraksha or personal prayer beads',
        note: 'Per yatri tradition.',
      },
      {
        name: 'Small idol or photograph if part of personal practice',
        note: 'Per yatri tradition.',
      },
    ],
  },
  {
    id: 'did-i-forget',
    title: 'DID I FORGET (T-1 FINAL PASS)',
    icon: 'ClipboardCheck',
    items: [
      {
        name: 'Passport, visa, permits, tickets, insurance in a single zip-lock in the daypack.',
        note: '',
      },
      {
        name: 'Cash in 3 currencies, split between body, daypack, suitcase.',
        note: '',
      },
      {
        name: 'Phone 100%, power bank 100%, headlamp batteries fresh.',
        note: '',
      },
      {
        name: 'Diamox started 2 to 3 days ago (~T-3). Full course packed.',
        note: '',
      },
      {
        name: 'Boots in the daypack OR worn. Never in checked baggage.',
        note: '',
      },
      {
        name: 'Sunglasses, sun mask, sunscreen, lip balm accessible in daypack.',
        note: '',
      },
      {
        name: 'Hand warmers x6 in a dedicated zip-lock. Locatable in the dark at 04:00.',
        note: '',
      },
      {
        name: 'One clean reserve outfit for Day 10 St Regis return. In the suitcase, NOT in the duffle.',
        note: '',
      },
      {
        name: 'All offline assets downloaded (maps, playlists, audiobooks, PDFs).',
        note: '',
      },
      {
        name: 'Toenails trimmed 24 to 48 h ago (NOT same day).',
        note: '',
      },
      {
        name: 'Pee-clear hydration baseline (24 h prior).',
        note: '',
      },
      {
        name: 'Sensitive content deleted from phone (Tibet customs).',
        note: '',
      },
      {
        name: '"Going offline Days 7 to 9" message pre-written to family.',
        note: '',
      },
      {
        name: 'Family has emergency contact card.',
        note: '',
      },
    ],
  },
];
