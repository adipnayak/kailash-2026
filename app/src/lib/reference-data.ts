/**
 * Reference articles data.
 * Parsed verbatim from kailash-reference-content.txt (7 sections).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * Icon names confirmed present in @aliimam/icons dist.
 */

export type RefBlock =
  | { type: "prose"; body: string }
  | { type: "heading"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "ordered-list"; items: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "callout"; tone: "info" | "warning" | "critical"; title?: string; body: string }
  | { type: "accordion"; items: Array<{ question: string; answer: string }> }
  | { type: "diamox-calendar" };

export interface RefArticle {
  id: string;
  title: string;
  icon: string;
  intro?: string;
  blocks: RefBlock[];
}

export const REFERENCE_ARTICLES: RefArticle[] = [
  {
    id: "medicines-and-diamox",
    title: "Medicines and Diamox Protocol",
    icon: "Pill",
    blocks: [
      { type: "heading", text: "MASTER MEDICINES LIST" },
      {
        type: "table",
        headers: ["WHAT", "WHY", "WHEN", "NOTES"],
        rows: [
          ["Diamox", "Altitude prevention", "T-3 onwards", "Sulfa allergy check FIRST."],
          ["Ibuprofen", "Pain, NSAID", "As needed at altitude", "Hydrate. Check renal load."],
          ["ORS", "Dehydration", "Daily Days 5 to 10", "Even when not thirsty."],
          ["Imodium", "Stomach upset", "Tent-toilet leg backup", "Days 7 to 8 risk window."],
          ["Antacid", "Diamox comfort", "As needed", "Diamox metabolic acidosis."],
          ["Lip balm", "UV skin", "Hourly", "SPF 30+."],
          ["Sunscreen", "UV skin", "Every 2 h", "SPF 50+."],
          ["Yogi Kanthika", "Sore throat from cold dry mountain air", "As needed", "Ayurvedic. Lozenge-style pills."],
          ["Herbal Amritdhara", "Multi-purpose. Internal: stomach upset, gas, indigestion. External: cuts, joint pain, headache, cold/cough.", "As needed", "Ayurvedic capsules. Both internal and external use."],
          ["Kailas Jeevan", "Acidity, gas, joint relief. Cooling cream.", "As needed", "Ayurvedic multipurpose cream. Named for this trip context."],
          ["Ayr Saline Nasal Gel", "Nasal dryness at altitude", "Daily Days 3-10", "Aloe-based. Apply morning + evening."],
          ["Unived Salt Capsules", "Electrolyte replacement during sweat-heavy days", "Days 5-10", "Especially helpful on trek days."],
        ],
      },
      { type: "heading", text: "DIAMOX (ACETAZOLAMIDE) PROTOCOL" },
      {
        type: "table",
        headers: ["QUESTION", "STANDARD ANSWER", "YATRI-SPECIFIC CHECK"],
        rows: [
          ["What is it", "Carbonic anhydrase inhibitor. Increases respiratory drive at altitude. Speeds acclimatization.", "Confirm at doctor consult."],
          ["When to start", "T-3 to T-2 before arriving at the first high-altitude location.", "Doctor-led decision."],
          ["Standard dose (prophylaxis)", "125 mg twice daily for most adults. 250 mg twice daily if higher risk.", "Doctor sets per yatri."],
          ["Duration", "Continue twice daily through your return-home day. Add a 1 to 2 day post-descent buffer. Do not stop abruptly. See the regime calendar below for exact dates.", "Doctor confirms exact dose, end date, and taper."],
          ["Taper", "Most protocols do not require a taper at this dose.", "Doctor confirms."],
          ["Sulfa allergy check", "Diamox IS a sulfonamide. Contraindicated if sulfa-allergic.", "CRITICAL pre-Rx check."],
          ["Sulfa allergy alternative", "Ginkgo Biloba (less effective but viable).", "Doctor confirms alternative dose."],
          ["Pregnancy or breastfeeding", "Discuss with doctor.", "Doctor confirms."],
        ],
      },
      { type: "heading", text: "DIAMOX REGIME CALENDAR" },
      {
        type: "callout",
        tone: "info",
        body: "Canonical regime for the Mumbai cohort (28 Jun to 21 Jul). If your return-home is later than 19 Jul (Dubai, Mauritius, New York cohorts), continue twice daily through YOUR return-home day plus 1 to 2 day buffer. Your doctor confirms exact dose and timing for your medical profile.",
      },
      { type: "diamox-calendar" },
      { type: "heading", text: "WHY WE DO NOT STOP ABRUPTLY" },
      {
        type: "prose",
        body: "After Diamox prophylaxis, do not stop abruptly. Continue twice daily for 1 to 2 days after you reach your final return-home destination, so the body's compensatory respiratory drive (increased ventilation that the drug induced) tapers smoothly as the drug clears. Diamox elimination half-life is roughly 4 to 9 hours; full physiological reset takes about 24 to 48 hours. The buffer also provides safety margin against unexpected re-ascent (delayed flight, missed connection, layover at altitude). For most adults at 125 mg twice daily, no formal taper is needed; the 1 to 2 day continuation IS the taper.",
      },
      {
        type: "callout",
        tone: "warning",
        body: "If you have onward travel from Mumbai (Dubai, Mauritius, New York, etc.), continue twice daily through your return-home day plus 1 to 2 day buffer. Your buffer dates shift later than 20 to 21 Jul. Your doctor confirms.",
      },
      { type: "heading", text: "DIAMOX COMMON SIDE EFFECTS" },
      {
        type: "table",
        headers: ["SIDE EFFECT", "FREQUENCY", "WHAT IT FEELS LIKE", "WHEN TO ESCALATE"],
        rows: [
          ["Paresthesias (tingling fingers, toes, face)", "Very common", "Mild pins-and-needles first 2 to 3 days", "Usually fades. If severe or persistent, doctor."],
          ["Frequent urination", "Very common (diuretic)", "Wake 1 to 2 times at night", "Hydrate aggressively. Do not reduce water."],
          ["Altered taste", "Common", "Carbonated drinks taste flat or metallic", "Self-limited. Avoid carbonation."],
          ["Mild nausea", "Common", "First 1 to 2 days", "Take with food."],
          ["Drowsiness", "Common", "Mild", "Avoid driving or piloting. Let it pass."],
          ["Photosensitivity", "Common", "Skin burns faster in sun", "Reapply sunscreen aggressively."],
          ["Increased breathing rate", "Expected mechanism", "Subjective shortness of breath at rest", "This is the drug working."],
          ["Kidney stones", "Rare", "Flank pain", "Stop drug. Doctor immediately."],
          ["Severe rash or Stevens-Johnson", "Rare but serious", "Spreading rash, fever", "Stop drug. Emergency immediately."],
          ["Severe metabolic acidosis", "Rare", "Confusion, deep rapid breathing", "Stop drug. Doctor immediately."],
        ],
      },
      { type: "heading", text: "CLASS-LEVEL DRUG INTERACTIONS TO DISCUSS WITH THE DOCTOR" },
      {
        type: "table",
        headers: ["DRUG CLASS", "INTERACTION WITH DIAMOX"],
        rows: [
          ["NSAIDs (ibuprofen, naproxen)", "Reduce renal clearance. Can increase Diamox levels and risk of metabolic acidosis at altitude. Use lowest effective NSAID dose and hydrate."],
          ["Aspirin (high-dose)", "Same renal interaction. Low-dose cardiac aspirin usually fine but confirm."],
          ["Other carbonic anhydrase inhibitors (topiramate, methazolamide)", "Additive metabolic acidosis. Do not stack."],
          ["Loop diuretics or thiazides", "Additive electrolyte loss (potassium). Monitor."],
          ["Lithium", "Diamox can reduce lithium levels. Doctor adjusts dose."],
          ["Allopurinol", "Shared renal clearance pathway. Monitor uric acid. Standard dose usually fine."],
          ["Methotrexate", "Increased methotrexate toxicity risk."],
          ["Metformin", "Increased metabolic acidosis risk. Doctor evaluates."],
          ["Aminoglycoside antibiotics", "Increased ototoxicity risk."],
          ["Berberine and other glucose-lowering supplements", "Diamox can shift metabolic state. Monitor blood sugar if diabetic or prediabetic."],
          ["Vitamin C, methylfolate, B12, D3, K2", "No significant interaction expected."],
          ["Ursodeoxycholic acid", "No significant interaction expected."],
          ["NAC (N-acetylcysteine)", "No significant interaction expected. Mildly renoprotective."],
          ["Omega 3 fish oil", "No significant interaction expected."],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: "The yatri must hand a written list of their entire medication and supplement stack to the prescribing doctor before the Diamox Rx is written.",
      },
      { type: "heading", text: "QUESTIONS TO ASK YOUR DOCTOR" },
      {
        type: "ordered-list",
        items: [
          "Am I sulfa-allergic? If unknown, request a skin test or alternative drug.",
          "What dose of Diamox do you recommend for my body weight and medical history?",
          "Should I take it prophylactically from T-3, or only if symptoms appear?",
          "Are there any drugs or supplements in my current stack that interact with Diamox?",
          "What are my safe NSAID limits at altitude with Diamox?",
          "What is my personal pee-clear hydration baseline?",
          "What is the escalation protocol if I develop severe paresthesias, rash, or breathing difficulty?",
          "Do I need a glucose-monitoring plan given Diamox metabolic effects?",
          "Should I update any of my chronic medications (dose or timing) for the trip duration?",
          "If I have a sulfa allergy, what is the safe alternative (Ginkgo Biloba dose and duration)?",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "DISCLAIMER",
        body: "This is reference information for trip planning, not medical advice. Diamox is a prescription medication. The yatri must consult their own doctor for prescription, dose, and interactions with their personal medication stack. Do not take any drug listed here without the prescribing doctor's confirmation that it is safe for the yatri's specific health profile.",
      },
    ],
  },

  {
    id: "connectivity-playbook",
    title: "Connectivity Playbook",
    icon: "Wifi",
    intro: "Tibet is behind the Great Firewall. Without a working VPN, WhatsApp, Google, Instagram, Facebook, YouTube, Gmail are all blocked.",
    blocks: [
      { type: "heading", text: "WHAT IS BLOCKED IN TIBET (WITHOUT VPN)" },
      {
        type: "table",
        headers: ["SERVICE", "BLOCKED", "WORKAROUND"],
        rows: [
          ["WhatsApp", "Yes", "Astrill VPN reconnects, or use WeChat as fallback."],
          ["Google (search, maps, drive, gmail)", "Yes", "Astrill VPN reconnects, or download Maps.me offline before entry."],
          ["Instagram, Facebook, YouTube", "Yes", "Astrill VPN reconnects."],
          ["iMessage, FaceTime", "Mostly yes", "Astrill VPN reconnects."],
          ["WeChat", "No (allowed by design)", "Useful Tibet-side backup channel."],
          ["Banking and payment apps", "Variable", "Do critical actions before entry."],
          ["Streaming (Netflix etc.)", "Yes", "Skip. Download offline content before entry."],
        ],
      },
      { type: "heading", text: "ESIM + VPN SETUP TIMELINE" },
      {
        type: "table",
        headers: ["STEP", "WHEN", "WHAT"],
        rows: [
          ["Install Holafly China eSIM", "T-12", "Purchase and install before leaving home network. Test activation in India."],
          ["Install Astrill VPN", "T-12", "Annual subscription on phone and laptop. Do not use a free VPN."],
          ["Test Astrill from India", "T-10", "Toggle VPN on. Confirm WhatsApp and Google still work."],
          ["Activate Holafly", "T-3", "Activation triggers the data clock. Activate close to KTM departure."],
          ["Pre-download offline assets", "T-3", "Maps.me Tibet, Spotify, audiobooks, all PDFs."],
          ["Final connectivity test", "T-2", "Toggle VPN on Holafly eSIM. Keep screenshots of working state."],
        ],
      },
      { type: "heading", text: "FALLBACK HIERARCHY WHEN CONNECTIVITY DROPS" },
      {
        type: "ordered-list",
        items: [
          "Toggle Astrill VPN off and on. Single most common fix.",
          "Switch VPN server location. Try Hong Kong, Singapore, Japan.",
          "Switch to mobile data from WiFi or vice versa. Hotel WiFi sometimes filters more aggressively.",
          "Wait 30 minutes. Great Firewall enforcement varies through the day.",
          "Use WeChat as fallback. Works without VPN.",
          "Switch to the operator-issued China phone for emergencies.",
          "Sat phone (operator Sherpa team). Genuine emergency only.",
        ],
      },
      { type: "heading", text: "PRE-DOWNLOAD CHECKLIST (T-3)" },
      {
        type: "unordered-list",
        items: [
          "Maps.me Tibet region and Kailash kora layer. Confirm tile cache loaded.",
          "Google Maps offline area for Kathmandu only.",
          "All PDF documents: permits, insurance, tickets, hotel confirmations, this page printed.",
          "Spotify or Apple Music playlists for offline.",
          "Audiobooks: 2 to 3 books for trek nights.",
          "Operator PDF brief from YPO.",
          "Mantras and spiritual reading material for the Parikrama leg.",
          "Emergency contact card image. Screenshot to camera roll.",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "WHAT FAMILY SHOULD INSTALL",
        body: "Install WeChat before the yatri's departure as a fallback communication channel. WeChat works inside Tibet without a VPN. If WhatsApp goes dark for the yatri, WeChat is the most reliable backup channel.",
      },
    ],
  },

  {
    id: "apps-in-china",
    title: "Apps and Connectivity in Tibet / China",
    icon: "Smartphone",
    intro:
      "China's Great Firewall blocks most Google, Meta, Twitter, and many Western services. Install and log in to everything BEFORE entering China. Many SMS verifications and first-time activations fail inside Tibet. Once you're past the GFW, you cannot easily install new apps or sign in to old ones without a VPN that already works.",
    blocks: [
      {
        type: "callout",
        tone: "critical",
        body: "Install and log in to everything before arriving in China. Many verification SMS messages and app activations do not work reliably once you are inside Tibet.",
      },
      { type: "heading", text: "Communication apps" },
      {
        type: "table",
        headers: ["App", "Works in China", "Notes", "Chinese alternative"],
        rows: [
          ["WhatsApp", "Blocked", "VPN required", "WeChat"],
          ["Facebook Messenger", "Blocked", "VPN required", "WeChat"],
          ["Instagram", "Blocked", "VPN required", "Xiaohongshu (RED)"],
          ["Facebook", "Blocked", "VPN required", "Weibo"],
          ["X (Twitter)", "Blocked", "VPN required", "Weibo"],
          ["Telegram", "Unreliable", "VPN often required", "WeChat"],
          ["Gmail", "Blocked", "VPN required", "Outlook"],
          ["Google Meet", "Blocked", "VPN required", "Zoom"],
          ["Zoom", "Usually works", "Most reliable Western option", "-"],
          ["Microsoft Teams", "Usually works", "Generally accessible", "-"],
          ["WeChat", "Works", "China's primary comms app -- install and verify before you go", "-"],
        ],
      },
      { type: "heading", text: "Maps and navigation" },
      {
        type: "table",
        headers: ["App", "Works", "Notes"],
        rows: [
          ["Google Maps", "Limited / blocked", "Not reliable"],
          ["Apple Maps", "Generally works", "Default for iOS users"],
          ["Maps.me", "Excellent offline", "Download Tibet region before departure"],
          ["Organic Maps", "Excellent offline", "Open-source alternative to Maps.me"],
          ["Amap (Gaode)", "Works", "China's local map app"],
          ["Baidu Maps", "Works", "China's other local map app"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: "For this yatra, you will not need navigation much (the operator handles all routing). But offline maps are still useful for orientation. Download Tibet region in Maps.me or Organic Maps before departure.",
      },
      { type: "heading", text: "Email" },
      {
        type: "table",
        headers: ["App", "Works", "Notes"],
        rows: [
          ["Gmail", "VPN required", "Both web + app blocked"],
          ["Outlook", "Generally works", "Recommended for the trip"],
          ["Yahoo Mail", "Variable", "Inconsistent reachability"],
          ["Apple Mail", "Works for non-Gmail accounts", "iCloud Mail works; Gmail accounts via Apple Mail still need VPN"],
        ],
      },
      { type: "heading", text: "Cloud storage" },
      {
        type: "table",
        headers: ["App", "Works", "Notes"],
        rows: [
          ["Google Drive", "VPN required", ""],
          ["Google Photos", "VPN required", ""],
          ["Dropbox", "Inconsistent", "Sometimes works, sometimes not"],
          ["OneDrive", "Usually works", ""],
          ["iCloud", "Usually works", ""],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: "Keep offline copies on your device of: passport, visa, insurance, flight tickets. Do not rely on cloud retrieval from inside Tibet.",
      },
      { type: "heading", text: "Search and translation" },
      {
        type: "table",
        headers: ["App", "Works", "Notes"],
        rows: [
          ["Google Search", "Blocked", "Use Bing or DuckDuckGo"],
          ["Google Translate", "Blocked", "Use Microsoft Translator or Apple Translate"],
          ["Microsoft Translator", "Works", "Download offline English-Chinese pack before departure"],
          ["Apple Translate", "Works", "Download offline packs before departure"],
          ["Pleco", "Works", "Best Chinese-English dictionary; offline-capable"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: "Download offline language packs BEFORE you leave: English <-> Chinese for navigation, Hindi <-> English for the group, plus Tibetan if you want signage support.",
      },
      { type: "heading", text: "VPNs" },
      {
        type: "prose",
        body: "Many international services require a VPN to work behind the GFW. Common options that have historically worked: ExpressVPN, NordVPN, Surfshark, Astrill (used widely by long-term China residents). VPN reliability is a moving target -- what worked last month may fail today.",
      },
      {
        type: "callout",
        tone: "critical",
        body: "Install AND test your VPN before entering China. Downloading or activating VPN services from inside China is difficult -- the VPN app stores themselves are throttled. The day you arrive is the worst day to discover your VPN does not work.",
      },
      { type: "heading", text: "Payment apps" },
      {
        type: "table",
        headers: ["App", "Works", "Notes"],
        rows: [
          ["Visa / Mastercard", "Limited", "Accepted at major hotels and airports; not at smaller shops"],
          ["Google Pay", "Blocked", ""],
          ["Apple Pay", "Limited", "Some merchants only"],
          ["WeChat Pay", "Limited for foreign visitors", "Requires Chinese bank linkage or temporary tourist mode (recently rolled out for international cards)"],
          ["Alipay", "Limited for foreign visitors", "Same as WeChat Pay; tourist mode available"],
          ["Cash (CNY)", "Always works", "Carry enough for incidentals, tips, food not covered by the operator"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        body: "Carry CNY cash in small denominations for personal expenses and emergencies. The operator covers meals and accommodation, but you will want cash for snacks, water, souvenirs, and tips.",
      },
      { type: "heading", text: "Best setup for this yatra (pre-departure checklist)" },
      {
        type: "unordered-list",
        items: [
          "WhatsApp installed and logged in",
          "VPN installed and tested (not just installed -- actually connect to a foreign server once before you fly)",
          "Offline maps downloaded (Tibet region in Maps.me or Organic Maps)",
          "Passport scan saved offline on phone",
          "Visa scan saved offline on phone",
          "Insurance documents saved offline on phone",
          "Emergency contacts saved offline (not just in the cloud address book)",
          "Important PDFs downloaded to device storage",
          "Offline language packs downloaded (Microsoft Translator or Apple Translate, English <-> Chinese)",
          "WeChat installed, verified, and a small balance loaded if you want to try paying with it",
          "This site saved as a home-screen icon so it behaves like a native app during the trip",
        ],
      },
      { type: "heading", text: "Connectivity expectations during the journey" },
      {
        type: "table",
        headers: ["Location", "Days", "Connectivity"],
        rows: [
          ["Kathmandu", "D1, D2, D11, D12", "Excellent"],
          ["Lhasa", "D3, D4, D10", "Good"],
          ["Purang", "D5, D10", "Moderate"],
          ["Mansarovar", "D5, D6", "Limited (phone only at hotel)"],
          ["Darchen", "D7, D9", "Limited"],
          ["Dirapuk", "D7", "Very limited"],
          ["Dolma La", "D8", "None"],
          ["Zuthulphuk", "D8", "Very limited"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        body: "Family members: during the parikrama (Days 7-9), delayed communication is normal and expected. A 24-48 hour silence is not a cause for concern.",
      },
      { type: "heading", text: "Add the site to your home screen" },
      {
        type: "prose",
        body: "On iPhone: open the site in Safari, tap the share icon, scroll to 'Add to Home Screen'. On Android: open the site in Chrome, tap the three-dot menu, select 'Install app' or 'Add to home screen'. The site then behaves like a native app -- launches without browser chrome, loads instantly from cache, and works during the trip even when the rest of the internet is unreachable.",
      },
    ],
  },

  {
    id: "bag-transitions",
    title: "Bag Transitions - The 4-Bag System",
    icon: "Backpack",
    intro: "Knowing which bag is where on each day is the single biggest operational unlock.",
    blocks: [
      { type: "heading", text: "THE 4 BAGS" },
      {
        type: "table",
        headers: ["#", "BAG", "SOURCE", "ROLE"],
        rows: [
          ["1", "Main suitcase or duffel 50 to 70 L", "Yatri brings from home", "Checked baggage home to KTM and KTM to Lhasa. Stays in Lhasa hotel storage Days 5 to 10."],
          ["2", "YPO orange duffle ~50 L", "YPO distributes Day 2", "Trek-leg primary. Porters carry on Parikrama Days 7 to 10."],
          ["3", "Personal Parikrama daypack 20 to 25 L with hip-belt", "Yatri brings (new purchase)", "Always with the yatri Day 1 onward. Carries everything irreplaceable."],
          ["4", "YPO orange daypack + sidebag", "YPO distributes Day 2", "Spare or backup."],
        ],
      },
      { type: "heading", text: "WHAT STAYS WHERE (10 PHASES)" },
      {
        type: "table",
        headers: ["PHASE", "MAIN SUITCASE", "YPO DUFFLE", "PERSONAL DAYPACK"],
        rows: [
          ["Days 1, 2 (KTM)", "Marriott KTM room", "Not yet distributed (Day 2 PM)", "With yatri"],
          ["Day 3 (KTM to Lhasa)", "Checked on flight", "Loading begins evening", "Cabin"],
          ["Days 3, 4 (Lhasa)", "St Regis room", "Loading complete by Day 4 evening", "With yatri (sightseeing)"],
          ["Day 5 (Lhasa to Mansarovar) THE HANDOFF", "Stays in St Regis Lhasa storage (next 5 nights)", "Travels with group", "Cabin baggage on the flight"],
          ["Days 5, 6 (Mansarovar)", "Lhasa", "At hotel", "With yatri"],
          ["Days 7, 8, 9 (Parikrama)", "Lhasa", "Porters carry. Meets at each tent or hotel.", "Always with yatri. 4 to 6 kg target. The critical bag."],
          ["Day 10 (Darchen to Lhasa) THE REUNION", "Back in hand at St Regis", "Travels with group", "With yatri"],
          ["Day 11 (Lhasa to KTM)", "Checked on flight", "Lighter load", "Cabin"],
          ["Days 11, 12, 13 (KTM return)", "Marriott KTM room", "With group", "With yatri"],
        ],
      },
      { type: "heading", text: "5 CRITICAL BAG RULES" },
      {
        type: "ordered-list",
        items: [
          "Days 7 to 10 critical items NEVER go in the main suitcase. It is locked in Lhasa for 5 nights.",
          "Personal daypack contents on Day 8 = every must-not-lose item. If porters delay the duffle, you survive Day 8 on what is in the daypack.",
          "Daypack weight ceiling: 6 kg. Above 7 kg on Day 8 is miserable. Pack twice, weigh once.",
          "Suitcase reserve = lost-bag insurance. Keep a month of personal meds, spare power bank, and one clean return-trip outfit in the suitcase.",
          "The handoff moment (Day 5 morning): confirm with the Lhasa hotel front desk. Get a printed claim ticket. Photograph it. Keep it in the daypack documents pouch.",
        ],
      },
      { type: "heading", text: "AIRLINE WEIGHT ALLOWANCES" },
      {
        type: "callout",
        tone: "warning",
        body: "Numbers below are typical for these routes. Verify with YPO before packing day. The LXA-Purang leg is the binding constraint for Days 5-10 packing.",
      },
      {
        type: "table",
        headers: ["Leg", "Flight", "Check (kg)", "Cabin (kg)", "Notes"],
        rows: [
          ["BOM -> KTM (Day 1)", "IndiGo 6E-1157", "30", "7", "Standard international economy"],
          ["KTM -> LXA (Day 3)", "Air China / Tibet Airlines", "20", "5 to 7", "High-altitude route, lower limits common"],
          ["LXA -> Purang (Day 5)", "Tibet Airlines small aircraft", "10 to 20", "5", "Small plane, strict limits, LiPo over 100 Wh restricted, no drones"],
          ["Purang -> LXA (Day 10)", "Tibet Airlines small aircraft", "10 to 20", "5", "Same as Day 5"],
          ["LXA -> KTM (Day 11)", "Air China / Tibet Airlines", "20", "5 to 7", "Same as Day 3 reverse"],
          ["KTM -> BOM (Day 13)", "Nepal Airlines RA-201", "30", "7", "Standard international economy"],
        ],
      },
    ],
  },

  {
    id: "customs-and-immigration",
    title: "Customs and Immigration Tips",
    icon: "ShieldCheck",
    intro: "Tibet customs at Lhasa airport on Day 3 is the strictest immigration checkpoint of the trip.",
    blocks: [
      { type: "heading", text: "PHONE-CLEAN PROTOCOL (T-2)" },
      {
        type: "prose",
        body: "Tibet customs will scroll the phone gallery. The following content is confiscated, detained, or used as grounds for refusal of entry.",
      },
      {
        type: "table",
        headers: ["CONTENT TYPE", "ACTION BEFORE T-2"],
        rows: [
          ["Dalai Lama photographs (any context)", "Delete from gallery and downloads. Clear iCloud cache."],
          ["\"Free Tibet\" content", "Delete. Including social media bookmarks."],
          ["Political books or magazines on the Tibet situation", "Remove from Kindle or iBooks downloads."],
          ["Maps of Tibet showing borders different from Chinese cartography", "Delete. Use Maps.me Tibet which follows Chinese cartography."],
          ["Flags or imagery of the Tibetan flag", "Delete."],
          ["News articles critical of Chinese policy", "Delete. Clear browser history."],
          ["Pictures of Taiwan in a sovereign-nation context", "Delete."],
          ["Social media posts referencing the above", "Delete."],
        ],
      },
      {
        type: "prose",
        body: "Empty the phone gallery aggressively. A small gallery (under 500 items) gets cleared faster than a 50,000 photo gallery.",
      },
      { type: "heading", text: "ALLOWED (NO NEED TO HIDE)" },
      {
        type: "table",
        headers: ["CONTENT TYPE", "STATUS"],
        rows: [
          ["Family photos, selfies, personal pictures", "Fine"],
          ["General travel photos", "Fine"],
          ["Religious imagery of Lord Shiva, Hindu deities, non-political Buddhist imagery", "Fine. The yatra is religious. This is expected."],
          ["Maps.me Tibet (Chinese cartography)", "Fine"],
          ["YPO operator brief and branded materials", "Fine. Proves you are on an organised trip."],
        ],
      },
      { type: "heading", text: "CCC CERTIFICATION CHECK (POWER BANKS AND ELECTRONICS)" },
      {
        type: "unordered-list",
        items: [
          "Verify the CCC mark physically on the power bank casing before packing.",
          "If buying new, choose Anker or Xiaomi or brands that publish CCC certification.",
          "Capacity ceiling: most airlines allow up to 20,000 mAh in carry-on. Above this, restricted.",
          "Pack power banks in carry-on only. Lithium batteries in checked baggage trigger automatic confiscation.",
        ],
      },
      { type: "heading", text: "WHAT TO BRING PRINTED (IN CASE THE PHONE FAILS)" },
      {
        type: "unordered-list",
        items: [
          "Passport (original) plus 2 photocopies",
          "Tibet Group Permit (operator-issued)",
          "Chinese Group Visa (operator-issued, stamped in passport)",
          "Travel insurance policy with helpline number",
          "Flight tickets KTM to Lhasa and Lhasa to KTM",
          "Hotel confirmation (operator's letter)",
          "Emergency contact card",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "DAY 2 EMBASSY NOC VISIT",
        body: "The Indian Embassy NOC is operator-coordinated. The yatri shows up at the embassy with the group. Operator handles paperwork. Bring: passport (with valid Chinese Group Visa stamped), one photocopy of the passport bio page, a modest collared shirt and pants (embassy dress code). Routine same-morning visit.",
      },
    ],
  },

  {
    id: "acclimatization-rules",
    title: "Acclimatization Rules",
    icon: "Mountain",
    intro: "The biggest risk on this trip is not the pass. It is acute mountain sickness (AMS) from sleep-altitude accumulation.",
    blocks: [
      { type: "heading", text: "CLIMB HIGH, SLEEP LOW" },
      {
        type: "prose",
        body: "Sleep altitude matters more than peak altitude. You can visit higher than you sleep (briefly) and recover. You cannot sleep higher than your body has acclimatized to and recover overnight.",
      },
      {
        type: "prose",
        body: "The YPO itinerary builds this in (Day 3 to 4 Lhasa rest, Day 5 to 6 Mansarovar rest, Day 7 Dirapuk pre-pass), but the yatri must understand the principle to interpret their own symptoms correctly.",
      },
      { type: "heading", text: "AMS SYMPTOM ESCALATION FLOW" },
      {
        type: "table",
        headers: ["LEVEL", "WHAT IT FEELS LIKE", "ACTION"],
        rows: [
          ["Normal acclimatization", "Mild headache, slight breathlessness on exertion, waking 1 to 2 times at night to pee, slight nausea on Day 1 at altitude.", "Continue. Hydrate. Rest. Normal Diamox dose."],
          ["Mild AMS", "Persistent headache despite ibuprofen, poor appetite, fatigue beyond expected, trouble sleeping.", "Stop ascending. Rest at current altitude. Hydrate. Ibuprofen 400 mg every 6 h max. Do not ascend further until headache clears."],
          ["Moderate AMS", "Severe headache, vomiting, ataxia (cannot walk a straight line heel-to-toe), breathlessness at rest.", "DESCEND immediately. Oxygen if available. Operator Sherpa team has cylinders."],
          ["HACE (Cerebral Edema)", "Confusion, severe ataxia, personality change, drowsiness escalating to coma.", "EMERGENCY DESCENT. Oxygen + dexamethasone. Operator sat phone for evacuation."],
          ["HAPE (Pulmonary Edema)", "Severe breathlessness at rest, cough with pink frothy sputum, gurgling in chest, lips blue.", "EMERGENCY DESCENT. Oxygen + nifedipine. Operator sat phone for evacuation."],
        ],
      },
      {
        type: "callout",
        tone: "critical",
        title: "THE DESCENT RULE",
        body: "If symptoms worsen or are not clearly improving in 12 to 24 hours, descend. Pride at altitude kills. The yatri who insists on continuing through moderate AMS to \"not miss Dolma La\" is the yatri who needs evacuation.",
      },
      { type: "heading", text: "WHAT THE OPERATOR DOES AT ALTITUDE" },
      {
        type: "unordered-list",
        items: [
          "Sherpa team carries oxygen cylinders, dexamethasone, nifedipine.",
          "Pre-Parikrama health check at Mansarovar.",
          "Sat phone for genuine evacuation.",
          "Local Tibetan guide knows descent paths and helicopter pickup points.",
          "China phone issued to the group for low-grade emergencies.",
        ],
      },
      { type: "heading", text: "ACCLIMATIZATION-DAY DISCIPLINE" },
      {
        type: "prose",
        body: "Day 3 evening and Day 4 (Lhasa) are mandatory acclimatization. The yatri who treats Day 4 as \"extra Lhasa sightseeing\" and walks 8 km plus Potala steps without pacing can trigger AMS by Day 5. Pace decisions on Day 3 to 4 determine Day 8 outcomes.",
      },
    ],
  },

  {
    id: "visa-and-permits",
    title: "Visa and Permits Workflow",
    icon: "FileText",
    intro: "The Chinese Group Visa is the single biggest pre-trip dependency the yatri does not control directly.",
    blocks: [
      { type: "heading", text: "T-30 TO T-1 TIMELINE" },
      {
        type: "table",
        headers: ["WHEN", "STEP", "OWNER", "RISK IF DELAYED"],
        rows: [
          ["T-30 to T-25", "Operator emails passport-courier instructions", "YPO", "Low. Normal lead time."],
          ["T-25 to T-22", "Yatri couriers passport to Delhi visa agent with signature-on-delivery", "Yatri", "Critical. Late dispatch = late visa = missed trip."],
          ["T-22 to T-21", "Passport arrives at the visa agent", "Courier", "Track AWB. Escalate if delivery missed."],
          ["T-21 to T-15", "Chinese embassy in Delhi processes Group Visa", "Embassy via agent", "Operator handles. Yatri waits."],
          ["T-15 to T-7", "Visa stamped. Passport ready for return courier.", "Visa agent", "If still stamping at T-7, escalate urgently."],
          ["T-7 to T-4", "Return courier to yatri", "Visa agent", "Track AWB. Signature-on-delivery for return."],
          ["T-4 to T-1", "Passport in hand. All documents verified.", "Yatri", "If not back by T-4, operator handles escalation. Trip may be re-scheduled."],
        ],
      },
      { type: "heading", text: "WHAT TO DO IF DELAYED" },
      {
        type: "table",
        headers: ["DELAY SCENARIO", "ACTION"],
        rows: [
          ["Outbound courier delayed (T-22 missed)", "Contact courier company immediately. Request priority handling. Notify operator and visa agent same day."],
          ["Visa agent slow to confirm receipt", "Forward courier AWB to visa agent and operator. Request acknowledgment within 24 h."],
          ["Embassy processing slow (T-7, no return AWB)", "Escalate to operator emergency contact. Operator has direct embassy liaison."],
          ["Return courier delayed (T-3, still in transit)", "Track AWB live. Contact courier customer care. Request urgent diversion. Operator can sometimes courier replacement permit copies."],
          ["Passport not in hand by T-1", "Operator handles trip re-scheduling. Insurance covers if rider includes trip disruption."],
        ],
      },
      { type: "heading", text: "OPERATOR VS YATRI VS VISA AGENT OWNERSHIP" },
      {
        type: "table",
        headers: ["OWNER", "ITEMS"],
        rows: [
          ["Operator (YPO)", "Group permit application, embassy liaison, group visa stamping, NOC visit on Day 2, permit copies for Tibet border crossing."],
          ["Yatri", "Passport courier to visa agent, return courier tracking, escalation if delayed, backup photocopies plus insurance docs ready."],
          ["Visa agent (operator partner)", "Embassy submission, stamping, return courier dispatch, same-day status updates to operator."],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "PHOTOGRAPH EVERYTHING BEFORE COURIERING",
        body: "Before the passport leaves the yatri's hands, photograph every page (bio page, all visa stamps, blank pages) and back up to private cloud storage. If the passport is lost in transit, the yatri can apply for an emergency replacement using the photographs as proof of identity.",
      },
    ],
  },

  {
    id: "pre-trip-spiritual-practices",
    title: "Pre-Trip Spiritual Practices (Optional)",
    icon: "Heart",
    intro: "These are presented as optional practices, not requirements. The yatra is open to yatris across the spiritual spectrum.",
    blocks: [
      {
        type: "table",
        headers: ["PRACTICE", "WHEN", "WHAT"],
        rows: [
          ["Intention setting (sankalpa)", "T-7 to T-3", "Write one sentence in a notebook. \"This yatra is for ______\". Bring the notebook on the trip. Re-read at Mansarovar on Day 6."],
          ["Mantra familiarisation", "T-14 to T-1", "The mantra most often spoken on the Parikrama is Om Mani Padme Hum, the six-syllable Buddhist mantra of compassion. Hindu yatris may carry Om Namah Shivaya or the Maha Mrityunjaya Mantra. The yatri does not have to chant. Familiarity helps when others around them chant."],
          ["Light fasting (optional)", "T-1 evening", "Some yatris choose a vegetarian-light dinner the night before departure. Optional. The trip itself becomes vegetarian by default."],
          ["Ancestral remembrance", "T-3 to T-1", "Some yatris carry a name or photograph of ancestors to remember at the Mansarovar Day 6 puja. Per tradition."],
          ["Closing the home (optional)", "T-1", "Some yatris light a lamp at home before leaving. Per family tradition."],
        ],
      },
    ],
  },
  {
    id: "faqs",
    title: "FAQs",
    icon: "HelpCircle",
    intro:
      "Common questions about the Mansarovar Yatra, sourced from the operator briefing. Sections cover insurance, the kit provided, medical support, porters and horses, cash, the China group visa, and operator contacts.",
    blocks: [
      { type: "heading", text: "INSURANCE" },
      {
        type: "accordion",
        items: [
          {
            question: "Are we getting insurance through the travel agent (Everest Travels)?",
            answer: "Yes. Comprehensive insurance is being provided specifically for the Mansarovar Yatra, including high-altitude coverage and medical evacuation if required.",
          },
          {
            question: "Do participants need to purchase insurance separately for the Yatra?",
            answer: "No. Insurance coverage is being arranged and provided as part of the Yatra.",
          },
          {
            question: "Do we need to purchase travel insurance for July 7-17 on our own?",
            answer: "No. Insurance for the Yatra period is already being provided.",
          },
        ],
      },

      { type: "heading", text: "KIT PROVIDED" },
      {
        type: "accordion",
        items: [
          {
            question: "What items are being provided by the travel agent / YPO?",
            answer: "Duffle Bag, Backpack, Side Bag, Warm Cap, and Puffer Jacket (size S / M / L).",
          },
          {
            question: "Is YPO providing two backpacks and a jacket?",
            answer: "Yes. The provided kit includes two bags (a backpack and a side bag) along with a puffer jacket and the other items listed above.",
          },
          {
            question: "Do we need sleeping bags during the Yatra?",
            answer: "No. Sleeping bags are not required.",
          },
        ],
      },

      { type: "heading", text: "MEDICAL SUPPORT" },
      {
        type: "accordion",
        items: [
          {
            question: "Are emergency medical kits and medications available?",
            answer: "Yes. The travel crew is equipped with essential medical kits and oxygen cylinders to handle emergencies during the journey.",
          },
          {
            question: "Will a doctor accompany the group?",
            answer: "No. A doctor does not accompany the group. The travel team carries the necessary medical supplies. In case of a serious medical emergency, the Chinese authorities can assist in transferring participants to the nearest medical camp for first aid and further assistance.",
          },
        ],
      },

      { type: "heading", text: "PORTERS AND HORSES" },
      {
        type: "accordion",
        items: [
          {
            question: "Can porters and horses be booked now?",
            answer: "Porters and horses are available on a user-pay basis. Bookings will be arranged one day in advance, and requirements will be discussed with the group in Lhasa.",
          },
        ],
      },

      { type: "heading", text: "ACCOMMODATION" },
      {
        type: "accordion",
        items: [
          {
            question: "What are the hotel accommodation details?",
            answer: "Kathmandu: Marriott Hotel. Lhasa: St. Regis Hotel.",
          },
        ],
      },

      { type: "heading", text: "CASH" },
      {
        type: "accordion",
        items: [
          {
            question: "Do we need to carry cash? How much?",
            answer: "We recommend 5,000 Yuan in cash. Carrying more is personal preference.",
          },
        ],
      },

      { type: "heading", text: "CHINA GROUP VISA" },
      {
        type: "prose",
        body: "For the Kailash Mansarovar Yatra via Tibet, the Chinese visa is not an ordinary individual visa. It is a group visa issued only after the Tibet Travel Permit and other approvals are obtained, and the process differs according to nationality and passport type. All members generally have to enter and exit together.",
      },
      {
        type: "prose",
        body: "Because the visa is issued collectively, there is no fixed per-person visa fee that can easily be found online. The cost depends on several factors:",
      },
      {
        type: "unordered-list",
        items: [
          "Nationality and passport held",
          "Whether the traveler is an Indian citizen, NRI, OCI holder, or foreign national",
          "Size and composition of the group",
          "Route taken (Nepal, Lhasa, etc.)",
          "Permit charges and government fees",
          "Standard versus expedited processing",
          "Additional documentation requirements",
        ],
      },

      { type: "heading", text: "OPERATOR CONTACTS" },
      {
        type: "table",
        headers: ["ROLE", "NAME", "DETAILS"],
        rows: [
          [
            "Travel agency",
            "Everest Travels (Rajan Tandan)",
            "402 Fourth Floor, 25/14 East Patel Nagar, New Delhi 110008. Tel: +91 11 4446 7654. Mobile: +91 98109 06771.",
          ],
          ["Yatra Admin", "Isra", "+91 81785 60740"],
        ],
      },
    ],
  },
];
