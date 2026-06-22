/**
 * Kailash facts shown between consecutive day cards in the Itinerary tab.
 *
 * Array index i = fact shown BETWEEN day i+1 and day i+2.
 * array[0] -> between D1 and D2; array[11] -> between D12 and D13.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

export interface KailashFact {
  title?: string;
  body: string;
  source?: string;
}

export const KAILASH_FACTS: KailashFact[] = [
  // [0] Between D1 (KTM) and D2 (KTM)
  {
    body: 'Kathmandu has served as the traditional staging point for the Kailash yatra since at least the 19th century. Pilgrims from across the subcontinent gathered here before the overland and later air routes into Tibet opened.',
  },
  // [1] Between D2 (KTM) and D3 (Lhasa)
  {
    body: 'The flight from Kathmandu (1,380 m) to Lhasa (3,656 m) gains more than 2,270 m of altitude in roughly 90 minutes. Most itineraries build in two nights in Lhasa before continuing west, giving the body time to begin producing extra red blood cells.',
  },
  // [2] Between D3 (Lhasa) and D4 (Lhasa)
  {
    body: 'The Potala Palace in Lhasa stands at approximately 3,700 m and rises another 117 m above the valley floor. Construction of its current form began in 1645 under the fifth Dalai Lama and took nearly 50 years to complete.',
  },
  // [3] Between D4 (Lhasa) and D5 (Mansarovar)
  {
    body: 'Lake Manasarovar sits at 4,590 m above sea level, making it one of the highest freshwater lakes in the world. It covers roughly 320 sq km and reaches a maximum depth of about 90 m.',
  },
  // [4] Between D5 (Mansarovar) and D6 (Mansarovar puja)
  {
    body: 'Manasarovar is considered sacred in four religions. Hindus identify it as the lake born in the mind of Brahma and believe bathing in it cleanses a lifetime of sin. Buddhists, Jains, and Bon practitioners also regard the lake as a place of profound spiritual power.',
  },
  // [5] Between D6 (Mansarovar) and D7 (Dirapuk)
  {
    body: 'The Kailash parikrama is a 52 km clockwise circuit around the mountain. At the altitudes involved, most pilgrims complete it in three days, though devoted practitioners sometimes attempt it in a single day. The circuit has been performed continuously for over a thousand years.',
  },
  // [6] Between D7 (Dirapuk) and D8 (Dolma La)
  {
    body: 'Dolma La pass, the high point of the parikrama at 5,630 m, is 266 m higher than Everest Base Camp (5,364 m). For most pilgrims it is the highest point they will ever stand at in their lives.',
  },
  // [7] Between D8 (Dolma La) and D9 (Darchen)
  {
    body: 'Mt Kailash (6,638 m) has never been climbed. The Chinese government has refused all climbing permits on the grounds that an ascent would be offensive to the millions of Hindus, Buddhists, Jains, and Bon followers for whom the summit is considered the abode of the divine.',
  },
  // [8] Between D9 (Darchen) and D10 (return leg)
  {
    body: 'Kailash is the only mountain on Earth simultaneously sacred to four distinct religions: Hinduism (seat of Shiva), Tibetan Buddhism (home of Demchok), Jainism (the site where Rishabhadeva attained liberation), and Bon (the soul of the universe in pre-Buddhist Tibetan belief).',
  },
  // [9] Between D10 and D11 (KTM)
  {
    body: 'The descent from the Tibetan plateau back to Kathmandu reverses roughly 2,200 m of altitude in a single day of travel. Most pilgrims report that appetite and sleep quality noticeably improve within the first 24 hours back at lower elevation.',
  },
  // [10] Between D11 (KTM) and D12 (KTM)
  {
    body: 'Kathmandu has historically functioned as a decompression stop at the end of the yatra, not just the beginning. Pilgrims who completed the journey by foot or mule required several days of rest before the onward trip home; modern itineraries preserve this rest day.',
  },
  // [11] Between D12 (KTM) and D13 (Mumbai)
  {
    body: 'Records of pilgrims travelling to Kailash from the Indian subcontinent date to at least the 8th century. The routes, modes of transport, and border formalities have changed many times, but the pilgrimage itself has continued without significant interruption across those centuries.',
  },
];
