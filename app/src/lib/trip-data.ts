/**
 * Trip data for the 13-day Kailash Mansarovar yatra.
 * Ported from index.html (v3.12) DAYS array.
 *
 * v4 data restore: all 13 days with full per-day detail from v3.12.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, or emojis
 * in any rendered string.
 */

export type DayType = 'normal' | 'critical' | 'holy' | 'rest';
export type ConnStatus = 'good' | 'intermittent' | 'offline';
export type Risk = 'easy' | 'moderate' | 'high';

export interface WeatherData {
  temp_high: number;
  temp_low: number;
  feels_like: number;
  rain_pct: number;
  wind_kmh: number;
  wind_label: string;
  uv: number;
  source: string;
}

export interface TimelineEvent {
  time: string;
  event: string;
}

export interface WhatToWear {
  bottom: string;
  top: string;
  feet: string;
  hands: string;
  head_face: string;
}

export interface FoodData {
  breakfast: string;
  lunch: string;
  dinner: string;
  daypack_snacks: string;
  hydration: string;
}

export interface BathroomData {
  type: string;
  water: string;
  shower: string;
  notes: string;
}

export interface TimingData {
  wake: string;
  walk_h: number;
  active_trek_h: number;
  rest_h: number;
  sleep_target_h: number;
  notes: string;
}

export interface SpiritualFocus {
  title: string;
  body: string;
}

export interface TripDay {
  day: number;
  date: string; // ISO yyyy-mm-dd
  weekday: string;
  location: string;
  altitude_peak: number; // metres, the high point reached today
  altitude_sleep: number; // metres, where tonight is spent
  risk: Risk;
  conn_status: ConnStatus;
  conn_label: string;
  next_signal: string | null;
  day_type: DayType;
  headline: string;
  /**
   * Sacred label shown with a first-occurrence gloss in parentheses.
   * Example: 'Mansarovar' first occurrence renders as 'Mansarovar (the lake)'.
   */
  sacred_label?: string;
  // Rich fields from v3.12
  title: string;
  subtitle: string;
  badge?: string; // e.g. 'CRITICAL DAY', 'SNAN AND PUJA', 'RECOVERY'
  weather: WeatherData;
  timeline: TimelineEvent[];
  what_to_wear: WhatToWear;
  food: FoodData;
  bathroom: BathroomData;
  timing: TimingData;
  carry_critical: string[];
  spiritual_focus?: SpiritualFocus;
  stay: string;
  bathing: string;
  connectivity: 'good' | 'intermittent' | 'offline';
  next_signal_label: string;
  sleep_altitude_m: number;
  peak_altitude_m: number;
  difficulty: 'easy' | 'moderate' | 'high';
}

export const DEPART = '2026-07-07';
export const RETURN_DATE = '2026-07-19';

export const DAYS: TripDay[] = [
  {
    day: 1,
    date: '2026-07-07',
    weekday: 'Tue',
    location: 'Kathmandu, Nepal',
    altitude_peak: 1380,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'WiFi and phone work normally',
    next_signal: null,
    day_type: 'normal',
    headline: 'Arrive in Kathmandu. The yatra begins here.',
    title: 'Day 1',
    subtitle: 'Arrive in Kathmandu. The yatra begins here.',
    weather: {
      temp_high: 29,
      temp_low: 20,
      feels_like: 27,
      rain_pct: 75,
      wind_kmh: 8,
      wind_label: 'calm',
      uv: 7,
      source: 'climatology',
    },
    timeline: [
      { time: '08:05', event: 'Group arrival window opens at KTM airport' },
      { time: '11:00-15:00', event: 'Operator pickup window' },
      { time: '18:30', event: 'Group dinner at Marriott (2 h)' },
    ],
    what_to_wear: {
      bottom: 'Travel pants',
      top: 'Cotton tee. Light rain jacket on hand for monsoon landing.',
      feet: 'Sneakers',
      hands: 'None',
      head_face: 'Cap, sunglasses',
    },
    food: {
      breakfast: 'Hotel buffet. Light. Avoid heavy dairy.',
      lunch: 'Local Nepali or Indian thali. Vegetarian default.',
      dinner: 'Group dinner at hotel.',
      daypack_snacks: '1 protein bar, dry fruits, 2 glucose tabs reserve.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Western flush + bidet',
      water: '24 h hot',
      shower: 'Hot water shower',
      notes: 'Last hot shower for 4 days starts from Day 5 onward.',
    },
    timing: {
      wake: '07:30',
      walk_h: 0.5,
      active_trek_h: 0,
      rest_h: 6,
      sleep_target_h: 8,
      notes: 'Recovery from flight. Light prep for Day 2.',
    },
    carry_critical: [
      'Passport, phone, power bank',
      'INR cash + 1 card',
      'Sunglasses, cap',
      'Ibuprofen + ORS pouch',
    ],
    stay: 'MARRIOTT KTM',
    bathing: 'HOT WATER. WESTERN TOILET.',
    connectivity: 'good',
    next_signal_label: 'live now',
    sleep_altitude_m: 1380,
    peak_altitude_m: 1380,
    difficulty: 'easy',
  },
  {
    day: 2,
    date: '2026-07-08',
    weekday: 'Wed',
    location: 'Kathmandu, Nepal',
    altitude_peak: 1380,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'WiFi and phone work normally',
    next_signal: null,
    day_type: 'normal',
    headline: 'Kathmandu. Embassy NOC and Pashupatinath.',
    title: 'Day 2',
    subtitle: 'Kathmandu. Embassy NOC and Pashupatinath.',
    weather: {
      temp_high: 29,
      temp_low: 20,
      feels_like: 27,
      rain_pct: 70,
      wind_kmh: 8,
      wind_label: 'calm',
      uv: 7,
      source: 'climatology',
    },
    timeline: [
      { time: '09:00', event: 'Indian Embassy NOC visit (group)' },
      { time: '12:00', event: 'Pashupatinath darshan' },
      { time: '15:30', event: 'Hotel return. Acclim rest.' },
      { time: '16:00', event: 'YPO briefing + orange kit distribution' },
      { time: '19:30', event: 'Group dinner' },
    ],
    what_to_wear: {
      bottom: 'Travel pants',
      top: 'Modest collared shirt for embassy. Scarf for darshan.',
      feet: 'Sneakers',
      hands: 'None',
      head_face: 'Cap',
    },
    food: {
      breakfast: 'Hotel buffet.',
      lunch: 'Local thali.',
      dinner: 'Hotel group dinner.',
      daypack_snacks: '1 protein bar in daypack.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Western flush + bidet',
      water: '24 h hot',
      shower: 'Hot water shower',
      notes: 'Last KTM shower before the Lhasa leg.',
    },
    timing: {
      wake: '07:00',
      walk_h: 2,
      active_trek_h: 0,
      rest_h: 5,
      sleep_target_h: 8,
      notes: 'NOC + sightseeing on foot. Pace it.',
    },
    carry_critical: [
      'Documents + scarf for darshan',
      'Embassy fee in INR',
      'Phone, power bank',
      'Sunglasses, water',
    ],
    stay: 'MARRIOTT KTM',
    bathing: 'HOT WATER. WESTERN TOILET.',
    connectivity: 'good',
    next_signal_label: 'live now',
    sleep_altitude_m: 1380,
    peak_altitude_m: 1380,
    difficulty: 'easy',
  },
  {
    day: 3,
    date: '2026-07-09',
    weekday: 'Thu',
    location: 'Lhasa, Tibet',
    altitude_peak: 3656,
    altitude_sleep: 3656,
    risk: 'moderate',
    conn_status: 'intermittent',
    conn_label: 'Some apps blocked. Bring VPN app for WhatsApp.',
    next_signal: 'after VPN reconnects',
    day_type: 'normal',
    headline: 'Crossing into Tibet. First altitude jump to 3,656 m.',
    title: 'Day 3',
    subtitle: 'Crossing into Tibet. First altitude jump to 3,656 m.',
    weather: {
      temp_high: 22,
      temp_low: 11,
      feels_like: 20,
      rain_pct: 30,
      wind_kmh: 10,
      wind_label: 'breezy',
      uv: 9,
      source: 'climatology',
    },
    timeline: [
      { time: '06:00', event: 'KTM hotel checkout' },
      { time: '08:30', event: 'KTM to Lhasa flight' },
      { time: '12:30', event: 'Lhasa Gonggar arrival. Customs.' },
      { time: '15:00', event: 'Hotel check-in at St Regis Lhasa. Rest mandatory.' },
      { time: '19:00', event: 'Light hotel dinner. Early sleep.' },
    ],
    what_to_wear: {
      bottom: 'Trek pants',
      top: 'Merino base + slim mid-layer for cabin chill.',
      feet: 'Sneakers or trek boots (cabin baggage)',
      hands: 'Liner gloves accessible',
      head_face: 'Cap, sunglasses, buff for cabin',
    },
    food: {
      breakfast: 'Hotel buffet. Light protein. No alcohol.',
      lunch: 'Packed at airport or in-flight light.',
      dinner: 'Hotel restaurant. Early (20:00).',
      daypack_snacks: '1 protein bar, glucose tabs.',
      hydration: '4 L (altitude)',
    },
    bathroom: {
      type: 'Western flush',
      water: '24 h hot',
      shower: 'Hot water shower',
      notes: 'Pre-altitude shower bank. Use it.',
    },
    timing: {
      wake: '05:30',
      walk_h: 1,
      active_trek_h: 0,
      rest_h: 5,
      sleep_target_h: 9,
      notes: 'Acclimatization day. Diamox active. Rest after arrival.',
    },
    carry_critical: [
      'All meds (Diamox started)',
      'Passport + permits',
      'All warm layers (cabin baggage)',
      'ORS, snacks, phone, power bank',
    ],
    stay: 'ST REGIS LHASA',
    bathing: 'HOT WATER. WESTERN TOILET.',
    connectivity: 'intermittent',
    next_signal_label: 'after VPN reconnects',
    sleep_altitude_m: 3656,
    peak_altitude_m: 3656,
    difficulty: 'moderate',
  },
  {
    day: 4,
    date: '2026-07-10',
    weekday: 'Fri',
    location: 'Lhasa, Tibet',
    altitude_peak: 3656,
    altitude_sleep: 3656,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'Some apps blocked. Text rather than call.',
    next_signal: null,
    day_type: 'normal',
    headline: 'Lhasa. Acclimatization day at Jokhang and Potala.',
    title: 'Day 4',
    subtitle: 'Lhasa. Acclimatization day at Jokhang and Potala.',
    weather: {
      temp_high: 22,
      temp_low: 11,
      feels_like: 20,
      rain_pct: 25,
      wind_kmh: 12,
      wind_label: 'breezy',
      uv: 10,
      source: 'climatology',
    },
    timeline: [
      { time: '08:30', event: 'Jokhang Temple visit' },
      { time: '11:00', event: 'Barkhor Street walk' },
      { time: '14:00', event: 'Potala Palace tour' },
      { time: '18:30', event: 'Hotel dinner. Acclim rest.' },
    ],
    what_to_wear: {
      bottom: 'Trek pants',
      top: 'Merino base + mid-layer fleece',
      feet: 'Sneakers or low-cut trek shoe',
      hands: 'Liner gloves morning only',
      head_face: 'Cap, sunglasses, sun mask',
    },
    food: {
      breakfast: 'Hotel buffet. Light.',
      lunch: 'Chinese vegetarian. Plain rice if uncertain stomach.',
      dinner: 'Hotel restaurant. Early (20:00).',
      daypack_snacks: '1 protein bar.',
      hydration: '4 L',
    },
    bathroom: {
      type: 'Western flush',
      water: '24 h hot',
      shower: 'Hot water shower',
      notes: 'Pre-altitude shower bank continues.',
    },
    timing: {
      wake: '07:00',
      walk_h: 3,
      active_trek_h: 0,
      rest_h: 4,
      sleep_target_h: 9,
      notes: 'Pace yourself. Potala steps are deceptively heavy on the lungs.',
    },
    carry_critical: [
      'Sunscreen reapply 2 h',
      'Sun hat, sunglasses',
      '1 L water',
      'Power bank',
    ],
    stay: 'ST REGIS LHASA',
    bathing: 'HOT WATER. WESTERN TOILET.',
    connectivity: 'intermittent',
    next_signal_label: 'live now',
    sleep_altitude_m: 3656,
    peak_altitude_m: 3656,
    difficulty: 'easy',
  },
  {
    day: 5,
    date: '2026-07-11',
    weekday: 'Sat',
    location: 'Mansarovar approach, Tibet',
    altitude_peak: 4670,
    altitude_sleep: 4670,
    risk: 'moderate',
    conn_status: 'intermittent',
    conn_label: 'Phone only. Operator number for emergencies.',
    next_signal: 'evening at hotel',
    day_type: 'normal',
    headline: 'Toward the lake. Long drive to Mansarovar.',
    sacred_label: 'Mansarovar',
    title: 'Day 5',
    subtitle: 'Toward the lake. Long drive to Mansarovar.',
    weather: {
      temp_high: 13,
      temp_low: 3,
      feels_like: 9,
      rain_pct: 25,
      wind_kmh: 18,
      wind_label: 'strong',
      uv: 11,
      source: 'climatology',
    },
    timeline: [
      { time: '05:30', event: 'St Regis breakfast. Suitcase handoff to hotel storage.' },
      { time: '07:00', event: 'Lhasa to Ali domestic flight' },
      { time: '10:30', event: 'Ali to Mansarovar drive (long)' },
      { time: '18:00', event: 'Mansarovar hotel arrival. Light dinner. Early sleep.' },
    ],
    what_to_wear: {
      bottom: 'Trek pants + thermal base',
      top: 'Merino base + mid-layer + YPO shell',
      feet: 'Trek boots',
      hands: 'Liner gloves all day. Outer gloves accessible.',
      head_face: 'Cap, sunglasses, buff, sun mask',
    },
    food: {
      breakfast: 'Hotel buffet KTM-style or packed.',
      lunch: 'Packed lunch on the drive (sandwiches, eggs, fruit).',
      dinner: 'Operator-coordinated at the camp. Simple.',
      daypack_snacks: '2 protein bars, dry fruits, glucose tabs.',
      hydration: '4 L',
    },
    bathroom: {
      type: 'Western flush, sometimes bucket-supplemented',
      water: 'Limited hot. Ration.',
      shower: 'Hot bucket bath only.',
      notes: 'Last shower until Day 10 evening.',
    },
    timing: {
      wake: '04:30',
      walk_h: 1,
      active_trek_h: 0,
      rest_h: 4,
      sleep_target_h: 9,
      notes: 'Transit-heavy. Conserve energy at altitude.',
    },
    carry_critical: [
      'All meds, all altitude meds',
      'ORS, gloves (Ali cold)',
      '1 L water, snacks',
      'Power bank',
    ],
    spiritual_focus: {
      title: 'DAY 5 · MANSAROVAR APPROACH',
      body: 'The road toward the lake winds across high plateau. Many pilgrims feel the gravity of the place even from the bus. Save your energy for tomorrow morning at the shore.',
    },
    stay: 'SPRING HOTEL MANSAROVAR',
    bathing: 'LIMITED HOT WATER. BUCKET-SUPPLEMENTED.',
    connectivity: 'intermittent',
    next_signal_label: 'evening at hotel',
    sleep_altitude_m: 4670,
    peak_altitude_m: 4670,
    difficulty: 'moderate',
  },
  {
    day: 6,
    date: '2026-07-12',
    weekday: 'Sun',
    location: 'Mansarovar, Tibet',
    altitude_peak: 4670,
    altitude_sleep: 4670,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'Phone only at hotel. Operator number for emergencies.',
    next_signal: 'evening',
    day_type: 'holy',
    headline: 'Mansarovar Snan and Puja.',
    sacred_label: 'Mansarovar',
    title: 'Day 6',
    subtitle: 'Mansarovar Snan and Puja.',
    badge: 'SNAN AND PUJA',
    weather: {
      temp_high: 13,
      temp_low: 3,
      feels_like: 9,
      rain_pct: 25,
      wind_kmh: 18,
      wind_label: 'strong',
      uv: 11,
      source: 'climatology',
    },
    timeline: [
      { time: '05:00', event: 'Early start for the lake shore' },
      { time: '06:00', event: 'Mansarovar holy bath (Snan)' },
      { time: '08:00', event: 'Chiu Gompa puja' },
      { time: '12:00', event: 'Hotel lunch. Rest.' },
      { time: '16:00', event: 'Optional Kora walk along the shore' },
      { time: '19:00', event: 'Group dinner' },
    ],
    what_to_wear: {
      bottom: 'Trek pants + thermal base',
      top: 'Merino base + mid-layer + YPO shell. Pre-bath change of merino for after.',
      feet: 'Trek boots. Sandals at the shore.',
      hands: 'Liner + outer gloves at dawn.',
      head_face: 'Beanie, sunglasses, sun mask',
    },
    food: {
      breakfast: 'Light. Fasted state preferred before puja.',
      lunch: 'Post-puja lunch at hotel.',
      dinner: 'Hotel dinner, group.',
      daypack_snacks: 'Dry fruits, protein bar.',
      hydration: '4 L',
    },
    bathroom: {
      type: 'Western flush + bucket',
      water: 'Limited hot. Ration.',
      shower: 'Hot bucket bath at the hotel.',
      notes: 'Last wash until Day 10.',
    },
    timing: {
      wake: '04:30',
      walk_h: 2,
      active_trek_h: 0,
      rest_h: 4,
      sleep_target_h: 9,
      notes: 'Easy day. Symbolically the heart of the yatra.',
    },
    carry_critical: [
      'Empty bottle for holy water',
      'Towel, spare merino base for post-bath',
      'Ritual items, sankalpa notebook',
      '1 L water',
    ],
    spiritual_focus: {
      title: 'DAY 6 · SNAN AND PUJA',
      body: 'Mansarovar is traditionally considered one of the holiest lakes in the world. Many pilgrims take a ritual bath at dawn and offer prayers at Chiu Gompa before beginning the Parikrama tomorrow. If you carry a name or a photograph of an ancestor, this is the moment to bring it forward.\nHar Har Mahadev.',
    },
    stay: 'SPRING HOTEL MANSAROVAR',
    bathing: 'HOT BUCKET BATH AT HOTEL.',
    connectivity: 'intermittent',
    next_signal_label: 'evening',
    sleep_altitude_m: 4670,
    peak_altitude_m: 4670,
    difficulty: 'easy',
  },
  {
    day: 7,
    date: '2026-07-13',
    weekday: 'Mon',
    location: 'Yamadwar to Dirapuk, Tibet',
    altitude_peak: 4900,
    altitude_sleep: 4900,
    risk: 'moderate',
    conn_status: 'offline',
    conn_label: 'No signal. Sherpa team carries comms.',
    next_signal: 'Day 10 evening at Lhasa',
    day_type: 'normal',
    headline: 'Yamadwar to Dirapuk. The Parikrama begins.',
    sacred_label: 'Parikrama',
    title: 'Day 7',
    subtitle: 'Yamadwar to Dirapuk. The Parikrama begins.',
    weather: {
      temp_high: 10,
      temp_low: 0,
      feels_like: 5,
      rain_pct: 35,
      wind_kmh: 25,
      wind_label: 'strong',
      uv: 11,
      source: 'climatology',
    },
    timeline: [
      { time: '06:00', event: 'Mansarovar to Darchen drive' },
      { time: '08:00', event: 'Yamadwar gate. Parikrama begins.' },
      { time: '08:30-13:30', event: 'Trek to Dirapuk (5 to 6 h, ~12 km)' },
      { time: '14:00', event: 'Lunch at Dirapuk guesthouse' },
      { time: '16:00', event: 'North face of Kailash darshan (weather permitting)' },
      { time: '19:00', event: 'Dinner at guesthouse. Early sleep before Day 8.' },
    ],
    what_to_wear: {
      bottom: 'Trek pants + thermal base',
      top: 'Merino base + mid-layer fleece + YPO shell (layered for sun-cloud cycles)',
      feet: 'Trek boots + wool sock + liner. Compeed on any hotspot.',
      hands: 'Liner gloves all day. Outer gloves in daypack.',
      head_face: 'Cap, sunglasses, sun mask, buff',
    },
    food: {
      breakfast: 'Hotel breakfast 08:00 + packed lunch.',
      lunch: 'Packed lunch on the trail. Eat by 13:00.',
      dinner: 'Guest house. Dal chawal style.',
      daypack_snacks: '3 protein bars + 4 glucose tabs + dry fruits sachet.',
      hydration: '4 L (carry 1.5 L in daypack)',
    },
    bathroom: {
      type: 'Tent pit or open field',
      water: 'None',
      shower: 'None',
      notes: 'Wet wipes only. Keep extremities dry.',
    },
    timing: {
      wake: '05:00',
      walk_h: 1.5,
      active_trek_h: 6,
      rest_h: 2,
      sleep_target_h: 9,
      notes: 'First Parikrama day. Pace easy. Conserve for tomorrow.',
    },
    carry_critical: [
      '1.5 L water in daypack',
      'All sun protection',
      'Headlamp, slim fleece, gloves + liners',
      'TP roll + wet wipes',
      'Power bank, phone in zip-lock, Compeed in pocket',
    ],
    spiritual_focus: {
      title: 'DAY 7 · YAMADWAR GATEWAY',
      body: 'Yamadwar is the symbolic gate of death and rebirth at the start of the Parikrama. Many yatris pass through with a moment of silence. Walk steadily. The mountain reveals itself slowly.',
    },
    stay: 'SHISHAPANGMA GUEST HOUSE DIRAPUK',
    bathing: 'NONE. WET WIPES ONLY.',
    connectivity: 'offline',
    next_signal_label: 'Day 10 evening at Lhasa',
    sleep_altitude_m: 4900,
    peak_altitude_m: 4900,
    difficulty: 'moderate',
  },
  {
    day: 8,
    date: '2026-07-14',
    weekday: 'Tue',
    location: 'Dolma La Pass, Tibet',
    altitude_peak: 5630,
    altitude_sleep: 4670,
    risk: 'high',
    conn_status: 'offline',
    conn_label: 'No signal. Sherpa sat phone for emergency only.',
    next_signal: 'Day 10 evening at Lhasa',
    day_type: 'critical',
    headline: 'Dolma La Pass. The high point of the yatra.',
    sacred_label: 'Dolma La',
    title: 'Day 8',
    subtitle: 'Dolma La Pass. The high point of the yatra.',
    badge: 'CRITICAL DAY',
    weather: {
      temp_high: 5,
      temp_low: -8,
      feels_like: -15,
      rain_pct: 45,
      wind_kmh: 50,
      wind_label: 'extreme',
      uv: 11,
      source: 'climatology',
    },
    timeline: [
      { time: '04:00', event: 'Wake. High-calorie breakfast (porridge + protein).' },
      { time: '05:00', event: 'Pre-dawn departure from Dirapuk' },
      { time: '09:00', event: 'Approach the pass. Slow. Sip every 15 min.' },
      { time: '09:30', event: 'Dolma La summit. 5,630 m. Short pause.' },
      { time: '13:00', event: 'Steep descent. Knees on poles.' },
      { time: '14:00', event: 'Mid-descent rest. Packed lunch in 10-min bursts.' },
      { time: '19:00', event: 'Arrive Zuthulphuk. Late dinner. Sleep.' },
    ],
    what_to_wear: {
      bottom: 'Insulated trek pant (Bugaboo V or Trek 500 Winter + overpants). Thermal base under.',
      top: 'Merino base + thermal base top + mid-layer fleece + YPO shell. Layer state changes through the day.',
      feet: 'Trek boots + wool sock + liner sock. Compression socks for the descent.',
      hands: 'Insulated outer gloves at the pass. Liner gloves below. Hand warmers x2 pre-dawn, x2 at the pass.',
      head_face: 'Beanie, Cat 4 sunglasses + leash, sun mask, buff',
    },
    food: {
      breakfast: '04:00 high-calorie. Porridge + protein.',
      lunch: 'Packed lunch eaten in 10-min bursts during descent.',
      dinner: 'Late dinner. Soup-forward. Easy digest.',
      daypack_snacks: '4 protein bars + 4 glucose tabs + dry fruits + electrolytes.',
      hydration: '5 L. Sip every 15 min.',
    },
    bathroom: {
      type: 'Open field at the pass. Tent pit at camp.',
      water: 'None.',
      shower: 'None.',
      notes: 'Pee Buddies useful in minus 5 deg C wind.',
    },
    timing: {
      wake: '04:00',
      walk_h: 0,
      active_trek_h: 8.5,
      rest_h: 2,
      sleep_target_h: 7,
      notes: 'Year round snow possible at the pass. Whiteout possible. Pass-day weather can flip in 30 minutes.',
    },
    carry_critical: [
      'Both Cat 4 sunglasses (primary + backup)',
      'Sun mask + hat',
      '2 L water in bladder',
      '4 hand warmers (2 pre-dawn, 2 at the pass)',
      'Ibuprofen x6, ORS x3',
      'Snacks + glucose tabs x4',
      'Pack liner inside the daypack',
      'Phone in zip-lock',
      'Headlamp + spare batteries',
      'Liner gloves spare',
    ],
    spiritual_focus: {
      title: 'DAY 8 · DOLMA LA CROSSING',
      body: 'Many pilgrims regard crossing the pass as a symbolic death of the old self and the beginning of a new one. The mantra most often spoken at the pass is Om Mani Padme Hum. Walk steadily. Kailash rewards patience more than speed.\nJai Bhole Nath. One step at a time.',
    },
    stay: 'GUEST HOUSE ZUTHULPHUK',
    bathing: 'NONE.',
    connectivity: 'offline',
    next_signal_label: 'Day 10 evening at Lhasa',
    sleep_altitude_m: 4670,
    peak_altitude_m: 5630,
    difficulty: 'high',
  },
  {
    day: 9,
    date: '2026-07-15',
    weekday: 'Wed',
    location: 'Zuthulphuk to Darchen, Tibet',
    altitude_peak: 4900,
    altitude_sleep: 4760,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'Phone returns at Darchen. Operator number available.',
    next_signal: 'Darchen evening (limited)',
    day_type: 'normal',
    headline: 'Zuthulphuk to Darchen. Completing the Parikrama.',
    title: 'Day 9',
    subtitle: 'Zuthulphuk to Darchen. Completing the Parikrama.',
    weather: {
      temp_high: 12,
      temp_low: 1,
      feels_like: 7,
      rain_pct: 25,
      wind_kmh: 20,
      wind_label: 'strong',
      uv: 11,
      source: 'climatology',
    },
    timeline: [
      { time: '07:00', event: 'Light breakfast. Pack.' },
      { time: '08:00', event: 'Trek from Zuthulphuk past the Mani Wall' },
      { time: '11:00', event: 'Parikrama ends at Darchen' },
      { time: '13:00', event: 'Late lunch. Recovery food.' },
      { time: '15:00', event: 'Hotel rest. First wash in 3 days (cold to lukewarm).' },
      { time: '19:30', event: 'Hotel dinner' },
    ],
    what_to_wear: {
      bottom: 'Trek pants + thermal base (mornings cold)',
      top: 'Merino base + mid-layer + YPO shell',
      feet: 'Trek boots',
      hands: 'Liner gloves morning only',
      head_face: 'Cap, sunglasses, sun mask',
    },
    food: {
      breakfast: 'Light.',
      lunch: 'Late lunch at Darchen hotel. Recovery food.',
      dinner: 'Hotel dinner.',
      daypack_snacks: 'Light. Appetite returning.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Basic Western flush',
      water: 'Limited hot. Early evening only.',
      shower: 'Cold to lukewarm.',
      notes: 'First wash in 3 days. Take it.',
    },
    timing: {
      wake: '06:00',
      walk_h: 2,
      active_trek_h: 3,
      rest_h: 4,
      sleep_target_h: 9,
      notes: 'Easy descent. Recovery focus.',
    },
    carry_critical: [
      'Light kit',
      'Ibuprofen if needed',
      'Liner gloves for cold morning',
      'Water, snacks',
    ],
    spiritual_focus: {
      title: 'DAY 9 · MANI WALL',
      body: 'The Mani Wall is a long collection of stones carved with Buddhist mantras, left by generations of pilgrims. Walking past it clockwise is considered part of the Parikrama practice. Day 9 is a slow-release day. The hardest is behind you.',
    },
    stay: 'HIMALAYA HOTEL DARCHEN',
    bathing: 'LIMITED HOT. COLD TO LUKEWARM.',
    connectivity: 'intermittent',
    next_signal_label: 'Darchen evening (limited)',
    sleep_altitude_m: 4760,
    peak_altitude_m: 4900,
    difficulty: 'easy',
  },
  {
    day: 10,
    date: '2026-07-16',
    weekday: 'Thu',
    location: 'Darchen to Lhasa, Tibet',
    altitude_peak: 4575,
    altitude_sleep: 3656,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'WiFi back at St Regis. VPN app needed for some apps.',
    next_signal: 'evening at hotel',
    day_type: 'normal',
    headline: 'Darchen to Lhasa. First shower in four days.',
    title: 'Day 10',
    subtitle: 'Darchen to Lhasa. First shower in four days.',
    weather: {
      temp_high: 22,
      temp_low: 11,
      feels_like: 20,
      rain_pct: 30,
      wind_kmh: 10,
      wind_label: 'breezy',
      uv: 9,
      source: 'climatology',
    },
    timeline: [
      { time: '05:00', event: 'Packed breakfast. Cold morning.' },
      { time: '06:00', event: 'Darchen to Ali drive' },
      { time: '12:30', event: 'Ali to Lhasa flight' },
      { time: '15:30', event: 'St Regis check-in. Suitcase reunion.' },
      { time: '17:00', event: 'Long hot shower. The reward shower.' },
      { time: '20:00', event: 'Concluding group dinner' },
    ],
    what_to_wear: {
      bottom: 'Trek pants',
      top: 'Merino base + mid-layer',
      feet: 'Trek boots in transit. Sneakers at hotel.',
      hands: 'Liner gloves morning only',
      head_face: 'Cap, sunglasses',
    },
    food: {
      breakfast: '05:00 packed breakfast. Cold morning.',
      lunch: 'Lhasa lunch. First proper Chinese spread in 5 days.',
      dinner: 'Concluding group dinner.',
      daypack_snacks: '1 protein bar.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Western flush',
      water: '24 h hot',
      shower: 'Long hot shower.',
      notes: 'The reward shower.',
    },
    timing: {
      wake: '04:30',
      walk_h: 2,
      active_trek_h: 0,
      rest_h: 4,
      sleep_target_h: 9,
      notes: 'Transit. Stop Diamox this evening per protocol.',
    },
    carry_critical: [
      'Documents, phone, meds',
      'Power bank, light kit',
      'Suitcase claim ticket: do NOT lose',
    ],
    stay: 'ST REGIS LHASA',
    bathing: 'LONG HOT SHOWER. WESTERN TOILET.',
    connectivity: 'intermittent',
    next_signal_label: 'evening at hotel',
    sleep_altitude_m: 3656,
    peak_altitude_m: 4575,
    difficulty: 'easy',
  },
  {
    day: 11,
    date: '2026-07-17',
    weekday: 'Fri',
    location: 'Lhasa to Kathmandu, Nepal',
    altitude_peak: 3656,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'WiFi and phone restored at KTM',
    next_signal: null,
    day_type: 'normal',
    headline: 'Back to Kathmandu. The yatra closes.',
    title: 'Day 11',
    subtitle: 'Back to Kathmandu. The yatra closes.',
    weather: {
      temp_high: 29,
      temp_low: 20,
      feels_like: 27,
      rain_pct: 75,
      wind_kmh: 8,
      wind_label: 'calm',
      uv: 7,
      source: 'climatology',
    },
    timeline: [
      { time: '07:00', event: 'St Regis checkout' },
      { time: '10:00', event: 'Lhasa to KTM flight' },
      { time: '13:00', event: 'Marriott KTM check-in' },
      { time: '15:00', event: 'Free afternoon' },
      { time: '19:00', event: 'Casual dinner' },
    ],
    what_to_wear: {
      bottom: 'Trek or travel pants',
      top: 'Merino base + light layer',
      feet: 'Sneakers or trek boots (cabin)',
      hands: 'None',
      head_face: 'Cap',
    },
    food: {
      breakfast: 'Hotel buffet. Normal appetite returns.',
      lunch: 'Local Newari or Indian.',
      dinner: 'Casual dinner.',
      daypack_snacks: 'None needed.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Western flush + bidet',
      water: '24 h hot',
      shower: 'Hot water shower',
      notes: 'Normal hotel state.',
    },
    timing: {
      wake: '06:00',
      walk_h: 2,
      active_trek_h: 0,
      rest_h: 4,
      sleep_target_h: 9,
      notes: 'Transit + decompression.',
    },
    carry_critical: [
      'Documents, phone',
      'Cash for KTM',
      'Light layer',
    ],
    stay: 'MARRIOTT KTM',
    bathing: 'HOT WATER. WESTERN TOILET.',
    connectivity: 'good',
    next_signal_label: 'live now',
    sleep_altitude_m: 1380,
    peak_altitude_m: 3656,
    difficulty: 'easy',
  },
  {
    day: 12,
    date: '2026-07-18',
    weekday: 'Sat',
    location: 'Kathmandu, Nepal',
    altitude_peak: 1380,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'Normal signal',
    next_signal: null,
    day_type: 'rest',
    headline: 'Day of recovery and gratitude.',
    title: 'Day 12',
    subtitle: 'Day of recovery and gratitude.',
    badge: 'RECOVERY',
    weather: {
      temp_high: 29,
      temp_low: 20,
      feels_like: 27,
      rain_pct: 75,
      wind_kmh: 8,
      wind_label: 'calm',
      uv: 7,
      source: 'climatology',
    },
    timeline: [
      { time: '09:00', event: 'Late breakfast' },
      { time: '11:00', event: 'Optional Thamel walk or quiet hotel day' },
      { time: '15:00', event: 'Massage or rest' },
      { time: '19:00', event: 'Final group dinner' },
    ],
    what_to_wear: {
      bottom: 'Travel pants',
      top: 'Cotton tee',
      feet: 'Sneakers',
      hands: 'None',
      head_face: 'Cap, sunglasses',
    },
    food: {
      breakfast: 'Hotel buffet.',
      lunch: 'Local Newari.',
      dinner: 'Casual dinner. Final group meal.',
      daypack_snacks: 'None.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Western flush + bidet',
      water: '24 h hot',
      shower: 'Hot water shower',
      notes: 'Hotel state.',
    },
    timing: {
      wake: '08:00',
      walk_h: 3,
      active_trek_h: 0,
      rest_h: 6,
      sleep_target_h: 9,
      notes: 'No formal program. Rest. Reflect.',
    },
    carry_critical: [
      'Light kit',
      'Cash for Thamel',
      'Phone, sunscreen, power bank',
    ],
    spiritual_focus: {
      title: 'DAY 12 · GRATITUDE AND REFLECTION',
      body: 'The Parikrama is behind you. The mountain stays. Many yatris use this day to write in the sankalpa notebook, share photos with the group, and let the experience settle. Rest is not a luxury today. It is the closing ritual.',
    },
    stay: 'MARRIOTT KTM',
    bathing: 'HOT WATER. WESTERN TOILET.',
    connectivity: 'good',
    next_signal_label: 'live now',
    sleep_altitude_m: 1380,
    peak_altitude_m: 1380,
    difficulty: 'easy',
  },
  {
    day: 13,
    date: '2026-07-19',
    weekday: 'Sun',
    location: 'Home',
    altitude_peak: 1380,
    altitude_sleep: 0,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'Normal signal',
    next_signal: null,
    day_type: 'normal',
    headline: 'Home.',
    title: 'Day 13',
    subtitle: 'Home.',
    weather: {
      temp_high: 32,
      temp_low: 24,
      feels_like: 30,
      rain_pct: 65,
      wind_kmh: 10,
      wind_label: 'calm',
      uv: 8,
      source: 'climatology',
    },
    timeline: [
      { time: '04:30', event: 'Marriott checkout for early flight' },
      { time: '06:30', event: 'KTM airport' },
      { time: '09:00', event: 'Flight home' },
    ],
    what_to_wear: {
      bottom: 'Travel pants',
      top: 'Cotton tee',
      feet: 'Sneakers',
      hands: 'None',
      head_face: 'Cap',
    },
    food: {
      breakfast: 'Hotel early box.',
      lunch: 'In-flight.',
      dinner: 'Home.',
      daypack_snacks: '1 protein bar reserve.',
      hydration: '3 L',
    },
    bathroom: {
      type: 'Western flush',
      water: '24 h hot',
      shower: 'Home shower.',
      notes: 'Home.',
    },
    timing: {
      wake: '03:30',
      walk_h: 1.5,
      active_trek_h: 0,
      rest_h: 3,
      sleep_target_h: 6,
      notes: 'Early flight.',
    },
    carry_critical: [
      'Documents, phone, boarding pass',
      'Light rain jacket',
    ],
    stay: 'HOME',
    bathing: 'HOME.',
    connectivity: 'good',
    next_signal_label: 'live now',
    sleep_altitude_m: 0,
    peak_altitude_m: 1380,
    difficulty: 'easy',
  },
];

export const MILESTONES: { label: string; dayOffset: number }[] = [
  { label: 'Mansarovar', dayOffset: 4 },
  { label: 'Parikrama begins', dayOffset: 6 },
  { label: 'Dolma La', dayOffset: 7 },
];

export const WHAT_MATTERS: Record<number, string[]> = {
  1: ['Rest and recover from the flight', 'Attend the welcome group dinner', "Review tomorrow's Day 2 schedule"],
  2: ['Attend the Indian Embassy NOC visit', 'Visit Pashupatinath Mandir', 'Prepare layers for the Lhasa altitude jump'],
  3: ['Acclimatize. Rest after arrival. No exertion.', 'Hydrate aggressively. 4 L minimum.', 'No alcohol today'],
  4: ['Pace yourself at Potala. Altitude on stairs is real.', 'Reapply sun protection every 2 hours', 'Rest by 20:00'],
  5: ['Conserve energy on the long transit', 'Hydrate on the drive. 4 L.', 'Prepare gear for Mansarovar morning'],
  6: ['Attend the Mansarovar Snan at dawn', 'Hydrate and rest after the ritual', 'Set gear out tonight for Day 7 start'],
  7: ['Pack the Parikrama bag tonight', 'Pace steady. Conserve for tomorrow.', 'Sleep by 21:00. Day 8 starts at 04:00.'],
  8: ['Pace yourself. Sip water every 15 min.', 'Hydrate aggressively. 5 L.', 'Layer up before the pass. Do not wait.'],
  9: ['Recovery focus. Easy descent pace.', 'Eat warm food. Appetite matters.', 'First wash in 3 days. Take it.'],
  10: ['Stop Diamox this evening per protocol', 'Long hot shower at St Regis', 'Message family. Connectivity restored.'],
  11: ['Transit day. Rest and decompress.', 'Message family on landing at KTM', 'No strenuous activity'],
  12: ['Rest. Reflect. No formal program.', 'Hydrate and eat well', 'Write in the sankalpa notebook if you have one'],
  13: ['Early checkout. 04:30 alarm.', 'All documents and boarding pass in hand', 'Message family at home arrival'],
};

export const BEFORE_WHAT_MATTERS_BY_TWINDOW: Record<number, string[]> = {
  21: ['Passport courier dispatched to visa agent', 'Confirm operator package details', 'Begin breaking in trek boots'],
  14: ['Book doctor consult for Diamox prescription', 'Purchase overseas travel insurance with air ambulance rider', 'Book Chinese eSIM and test VPN'],
  7: ['Collect Diamox prescription from doctor', 'Download offline maps and essential apps', 'Test VPN end to end'],
  3: ['Start Diamox 2 to 3 days before departure', 'Trim toenails. Not on departure day.', 'Pre-write offline message for family'],
};
