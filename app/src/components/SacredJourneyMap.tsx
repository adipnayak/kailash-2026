/**
 * SacredJourneyMap.
 * Full-width inline SVG. No map library. Pure custom schematic geography.
 * v4 migration: wires useJourneyState(), detectOrigin(), GSAP delight layer.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, emojis.
 */

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import type { JourneyState } from '../lib/journey-state';
import { resolveOrigin, type OriginId } from '../lib/origin';

// Stop positions on the 1200x500 viewBox
const STOP_CX: Record<string, number> = {
  'stop-kathmandu': 480,
  'stop-lhasa': 940,
  'stop-mansarovar': 480,
  'stop-darchen': 420,
  'stop-dirapuk': 290,
  'stop-dolma-la': 260,
  'stop-zuthulphuk': 330,
};
const STOP_CY: Record<string, number> = {
  'stop-kathmandu': 380,
  'stop-lhasa': 280,
  'stop-mansarovar': 220,
  'stop-darchen': 235,
  'stop-dirapuk': 180,
  'stop-dolma-la': 110,
  'stop-zuthulphuk': 190,
};

// Which stop name corresponds to each trip day
const TRIP_DAY_TO_STOP: Record<number, string> = {
  1: 'stop-kathmandu',
  2: 'stop-kathmandu',
  3: 'stop-lhasa',
  4: 'stop-lhasa',
  5: 'stop-mansarovar',
  6: 'stop-mansarovar',
  7: 'stop-darchen',
  8: 'stop-dolma-la',
  9: 'stop-zuthulphuk',
  10: 'stop-lhasa',
  11: 'stop-kathmandu',
  12: 'stop-kathmandu',
  13: 'stop-kathmandu',
};

interface Props {
  phase: JourneyState;
  onScrollToDay?: (dayId: string) => void;
  onSwitchTab?: (tab: 'itinerary') => void;
}

export function SacredJourneyMap({ phase, onScrollToDay, onSwitchTab }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [origin, setOrigin] = useState<OriginId>('all');
  const pulseRef = useRef<gsap.core.Tween | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Origin auto-detect on mount
  useEffect(() => {
    setOrigin(resolveOrigin());
  }, []);

  // GSAP delight animations
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Kill any previous context
    if (ctxRef.current) {
      ctxRef.current.revert();
    }

    const ctx = gsap.context(() => {
      // --- Route line draw-in ---
      const routePaths = svg.querySelectorAll<SVGPathElement>('.delight-route-draw');
      routePaths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.inOut',
          delay: 0.2,
        });
      });

      // --- Parikrama loop draw-in (after main route) ---
      const parikramaPath = svg.querySelector<SVGPathElement>('.delight-parikrama-loop');
      if (parikramaPath) {
        const length = parikramaPath.getTotalLength();
        gsap.set(parikramaPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(parikramaPath, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.inOut',
          delay: 1.2,
        });
      }

      // --- Sacred markers stagger scale-in ---
      const markers = svg.querySelectorAll<SVGGElement>('.delight-sacred-marker');
      gsap.from(markers, {
        scale: 0.7,
        opacity: 0,
        transformOrigin: 'center center',
        duration: 0.5,
        ease: 'back.out(1.4)',
        stagger: 0.08,
        delay: 1.6,
      });

      // --- You-are-here pulse during phase ---
      if (phase.phase === 'during' && phase.tripDayIndex) {
        const stopClass = TRIP_DAY_TO_STOP[phase.tripDayIndex];
        if (stopClass) {
          const stopNode = svg.querySelector<SVGCircleElement>(
            `.${stopClass} .stop-node`,
          );
          if (stopNode) {
            const tween = gsap.to(stopNode, {
              opacity: 0.4,
              duration: 0.9,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              delay: 2.0,
            });
            pulseRef.current = tween;
          }
        }
      }
    }, svg);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
      ctxRef.current = null;
      pulseRef.current = null;
    };
  }, [phase.phase, phase.tripDayIndex]);

  function handleStopClick(dayId: string) {
    if (onSwitchTab) onSwitchTab('itinerary');
    if (onScrollToDay) {
      onScrollToDay(dayId);
    } else {
      const el = document.getElementById(dayId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleStopKeyDown(e: React.KeyboardEvent, dayId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStopClick(dayId);
    }
  }

  const currentStopClass =
    phase.phase === 'during' && phase.tripDayIndex
      ? TRIP_DAY_TO_STOP[phase.tripDayIndex]
      : null;

  const originClass = origin !== 'all' ? `origin-active-${origin}` : '';

  return (
    <section
      data-section="sacred-journey-map"
      aria-label="Sacred Journey Map"
      className="w-full overflow-x-auto border-b border-border bg-bg py-0"
    >
      <svg
        ref={svgRef}
        id="sacred-journey-map"
        data-phase={phase.phase}
        viewBox="0 0 1200 500"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Sacred Journey Map showing the route from origin cities through Kathmandu, Lhasa, Mansarovar, and the Parikrama loop around Mount Kailash"
        className={`w-full ${originClass}`}
        style={{ minWidth: '700px' }}
      >
        <title>Sacred Journey Map</title>

        <defs>
          <style>{`
            #sacred-journey-map .phase-before,
            #sacred-journey-map .phase-during,
            #sacred-journey-map .phase-after { display: none; }
            #sacred-journey-map[data-phase="before"] .phase-before { display: block; }
            #sacred-journey-map[data-phase="during"] .phase-during { display: block; }
            #sacred-journey-map[data-phase="after"]  .phase-after  { display: block; }

            #sacred-journey-map .stop { cursor: pointer; }
            #sacred-journey-map .stop:hover .stop-node { stroke-width: 3; }
            #sacred-journey-map .stop:focus { outline: none; }
            #sacred-journey-map .stop:focus .stop-node { stroke: var(--accent); stroke-width: 3; }

            #sacred-journey-map[data-phase="during"] .stop:not(.you-are-here) { opacity: 0.3; transition: opacity 400ms; }
            #sacred-journey-map[data-phase="during"] .stop.you-are-here { opacity: 1; }

            #sacred-journey-map[data-phase="after"] .sacred-marker use { color: var(--accent); }

            #sacred-journey-map .origin-ray {
              stroke: var(--muted);
              stroke-width: 1;
              stroke-dasharray: 3,3;
              transition: stroke 400ms, stroke-width 400ms, stroke-dasharray 400ms;
            }

            #sacred-journey-map.origin-active-mumbai .origin-group[data-origin="mumbai"] .origin-ray,
            #sacred-journey-map.origin-active-uae    .origin-group[data-origin="uae"]    .origin-ray,
            #sacred-journey-map.origin-active-us     .origin-group[data-origin="us"]     .origin-ray,
            #sacred-journey-map.origin-active-mauritius .origin-group[data-origin="mauritius"] .origin-ray {
              stroke: var(--ink);
              stroke-width: 2.5;
              stroke-dasharray: none;
            }

            #sacred-journey-map.origin-active-mumbai .origin-group[data-origin="mumbai"] .origin-node,
            #sacred-journey-map.origin-active-uae    .origin-group[data-origin="uae"]    .origin-node,
            #sacred-journey-map.origin-active-us     .origin-group[data-origin="us"]     .origin-node,
            #sacred-journey-map.origin-active-mauritius .origin-group[data-origin="mauritius"] .origin-node {
              stroke-width: 2.5;
            }
          `}</style>
        </defs>

        {/* Geography */}
        <g className="map-geography" stroke="var(--border)" strokeWidth="1" fill="none">
          <path
            d="M 180,80 Q 400,55 700,65 Q 950,55 1120,75 Q 1120,200 1120,300 Q 950,310 700,295 Q 400,310 180,295 Z"
            fill="var(--card)"
            fillOpacity="0.4"
          />
          <path
            d="M 350,355 Q 450,340 550,350 Q 620,345 650,360 L 640,400 Q 500,395 380,400 Z"
            fill="var(--card)"
            fillOpacity="0.3"
          />
          <path
            d="M 120,470 Q 250,440 380,460 Q 500,425 620,445 Q 760,460 900,445 Q 1020,460 1120,470 L 1120,495 L 120,495 Z"
            fill="var(--card)"
            fillOpacity="0.35"
          />
          <text x="900" y="455" fontFamily="Inter Tight, sans-serif" fontSize="11" fill="var(--muted)" letterSpacing="0.2em">INDIA</text>
          <text x="520" y="385" fontFamily="Inter Tight, sans-serif" fontSize="10" fill="var(--muted)" letterSpacing="0.18em">NEPAL</text>
          <text x="780" y="190" fontFamily="Inter Tight, sans-serif" fontSize="11" fill="var(--muted)" letterSpacing="0.2em">TIBET</text>
        </g>

        {/* Origin rays */}
        <g className="origin-rays">
          <g className="origin-group" data-origin="us">
            <line className="origin-ray" x1="60" y1="140" x2="480" y2="380" />
          </g>
          <g className="origin-group" data-origin="uae">
            <line className="origin-ray" x1="60" y1="240" x2="480" y2="380" />
          </g>
          <g className="origin-group" data-origin="mumbai">
            <line className="origin-ray" x1="135" y1="440" x2="480" y2="380" />
          </g>
          <g className="origin-group" data-origin="mauritius">
            <line className="origin-ray" x1="60" y1="470" x2="480" y2="380" />
          </g>
        </g>

        {/* Origin labels */}
        <g className="origins" fontFamily="JetBrains Mono, monospace">
          <g className="origin" data-origin="us">
            <circle className="origin-node" cx="60" cy="140" r="6" fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="75" y="144" fontSize="11" fill="var(--ink)" letterSpacing="0.05em">NEW YORK</text>
            <text x="75" y="156" fontSize="8" fill="var(--muted)" letterSpacing="0.1em">America/New_York</text>
          </g>
          <g className="origin" data-origin="uae">
            <circle className="origin-node" cx="60" cy="240" r="6" fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="75" y="244" fontSize="11" fill="var(--ink)" letterSpacing="0.05em">DUBAI</text>
            <text x="75" y="256" fontSize="8" fill="var(--muted)" letterSpacing="0.1em">Asia/Dubai</text>
          </g>
          <g className="origin" data-origin="mumbai">
            <circle className="origin-node" cx="135" cy="440" r="6" fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="150" y="444" fontSize="11" fill="var(--ink)" letterSpacing="0.05em">MUMBAI</text>
            <text x="150" y="456" fontSize="8" fill="var(--muted)" letterSpacing="0.1em">Asia/Kolkata</text>
          </g>
          <g className="origin" data-origin="mauritius">
            <circle className="origin-node" cx="60" cy="470" r="6" fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="75" y="474" fontSize="11" fill="var(--ink)" letterSpacing="0.05em">PORT LOUIS</text>
            <text x="75" y="486" fontSize="8" fill="var(--muted)" letterSpacing="0.1em">Indian/Mauritius</text>
          </g>
        </g>

        {/* Route segments */}
        <g className="route-segments" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round">
          <path className="delight-route-draw" d="M 480,380 Q 700,330 940,280" strokeDasharray="6,4" />
          <path className="delight-route-draw" d="M 940,280 Q 700,250 480,220" strokeDasharray="6,4" />
          <path className="delight-route-draw" d="M 480,220 L 420,235" />
          <path className="delight-route-draw" d="M 420,235 L 480,220" opacity="0.4" />
          <path className="delight-route-draw" d="M 480,220 Q 700,255 940,280" strokeDasharray="6,4" opacity="0.4" />
          <path className="delight-route-draw" d="M 940,280 Q 700,335 480,380" strokeDasharray="6,4" opacity="0.4" />
        </g>

        {/* Parikrama loop (2.5px, visual hero) */}
        <g className="parikrama-loop" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path
            className="delight-parikrama-loop"
            d="M 420,235 Q 360,200 290,180 Q 240,150 260,110 Q 280,85 320,100 Q 380,140 380,180 Q 360,210 420,235 Z"
          />
        </g>

        {/* Trip stops (clickable) */}
        <g className="trip-stops" fontFamily="JetBrains Mono, monospace">

          <g
            className={`stop stop-kathmandu${currentStopClass === 'stop-kathmandu' ? ' you-are-here' : ''}`}
            data-day-id="day-1"
            role="button"
            tabIndex={0}
            aria-label="Kathmandu 1380 meters Days 1 2 11 12 13"
            onClick={() => handleStopClick('day-1')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-1')}
          >
            <circle className="stop-node" cx="480" cy="380" r="9" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
            <text x="495" y="385" fontSize="13" fill="var(--ink)" fontWeight="600">Kathmandu</text>
            <text x="495" y="399" fontSize="9" fill="var(--muted)" letterSpacing="0.1em">D1 D2 D11 D12 D13 - 1,380M</text>
            <title>Kathmandu - 1,380m / 4,528ft</title>
          </g>

          <g
            className={`stop stop-lhasa${currentStopClass === 'stop-lhasa' ? ' you-are-here' : ''}`}
            data-day-id="day-3"
            role="button"
            tabIndex={0}
            aria-label="Lhasa 3656 meters Days 3 4 10"
            onClick={() => handleStopClick('day-3')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-3')}
          >
            <circle className="stop-node" cx="940" cy="280" r="9" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
            <text x="955" y="285" fontSize="13" fill="var(--ink)" fontWeight="600">Lhasa</text>
            <text x="955" y="299" fontSize="9" fill="var(--muted)" letterSpacing="0.1em">D3 D4 D10 - 3,656M</text>
            <title>Lhasa - 3,656m / 11,995ft</title>
          </g>

          <g
            className={`stop stop-mansarovar${currentStopClass === 'stop-mansarovar' ? ' you-are-here' : ''}`}
            data-day-id="day-5"
            role="button"
            tabIndex={0}
            aria-label="Mansarovar 4570 meters Days 5 6 holy lake"
            onClick={() => handleStopClick('day-5')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-5')}
          >
            <circle className="stop-node" cx="480" cy="220" r="9" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
            <text x="495" y="225" fontSize="13" fill="var(--ink)" fontWeight="600">Mansarovar</text>
            <text x="495" y="239" fontSize="9" fill="var(--muted)" letterSpacing="0.1em">D5 D6 - 4,570M</text>
            <title>Mansarovar - 4,570m / 14,993ft - holy lake</title>
          </g>

          <g
            className={`stop stop-darchen${currentStopClass === 'stop-darchen' ? ' you-are-here' : ''}`}
            data-day-id="day-7"
            role="button"
            tabIndex={0}
            aria-label="Darchen 4575 meters Day 7 trailhead Day 9 finish"
            onClick={() => handleStopClick('day-7')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-7')}
          >
            <circle className="stop-node" cx="420" cy="235" r="8" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
            <text x="405" y="261" fontSize="11" fill="var(--ink)" fontWeight="600" textAnchor="end">Darchen</text>
            <text x="405" y="273" fontSize="8" fill="var(--muted)" letterSpacing="0.1em" textAnchor="end">D7 START D9 FINISH - 4,575M</text>
            <title>Darchen - 4,575m / 15,010ft - parikrama trailhead</title>
          </g>

          <g
            className={`stop stop-dirapuk${currentStopClass === 'stop-dirapuk' ? ' you-are-here' : ''}`}
            data-day-id="day-7"
            role="button"
            tabIndex={0}
            aria-label="Dirapuk 4900 meters Day 7 night camp"
            onClick={() => handleStopClick('day-7')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-7')}
          >
            <circle className="stop-node" cx="290" cy="180" r="8" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
            <text x="275" y="173" fontSize="11" fill="var(--ink)" fontWeight="600" textAnchor="end">Dirapuk</text>
            <text x="275" y="161" fontSize="8" fill="var(--muted)" letterSpacing="0.1em" textAnchor="end">D7 NIGHT - 4,900M</text>
            <title>Dirapuk - 4,900m / 16,076ft - Day 7 night camp</title>
          </g>

          {/* Dolma La: double-size, filled red, pulsing */}
          <g
            className={`stop stop-dolma-la critical${currentStopClass === 'stop-dolma-la' ? ' you-are-here' : ''}`}
            data-day-id="day-8"
            role="button"
            tabIndex={0}
            aria-label="Dolma La pass 5630 meters Day 8 the highest point"
            onClick={() => handleStopClick('day-8')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-8')}
          >
            <circle className="stop-node delight-breathing" cx="260" cy="110" r="14" fill="var(--red)" stroke="var(--red)" strokeWidth="2" />
            <text x="245" y="98" fontSize="14" fill="var(--red)" fontWeight="700" textAnchor="end">Dolma La</text>
            <text x="245" y="86" fontSize="10" fill="var(--red)" letterSpacing="0.1em" fontWeight="600" textAnchor="end">D8 - 5,630M / 18,471FT</text>
            <title>Dolma La pass - 5,630m / 18,471ft - Day 8 - the highest point of the journey</title>
          </g>

          <g
            className={`stop stop-zuthulphuk${currentStopClass === 'stop-zuthulphuk' ? ' you-are-here' : ''}`}
            data-day-id="day-8"
            role="button"
            tabIndex={0}
            aria-label="Zuthulphuk 4790 meters Day 8 night camp"
            onClick={() => handleStopClick('day-8')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-8')}
          >
            <circle className="stop-node" cx="330" cy="190" r="8" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
            <text x="345" y="195" fontSize="11" fill="var(--ink)" fontWeight="600">Zuthulphuk</text>
            <text x="345" y="207" fontSize="8" fill="var(--muted)" letterSpacing="0.1em">D8 NIGHT - 4,790M</text>
            <title>Zuthulphuk - 4,790m / 15,715ft - Day 8 night camp</title>
          </g>
        </g>

        {/* Sacred markers (always visible per v3.12 lock) */}
        <g className="sacred-markers" fontFamily="Inter Tight, sans-serif">

          {/* Pashupatinath (KTM Day 2) */}
          <g
            className="sacred-marker delight-sacred-marker"
            data-day-id="day-2"
            role="button"
            tabIndex={0}
            aria-label="Pashupatinath sacred site Kathmandu Day 2"
            onClick={() => handleStopClick('day-2')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-2')}
            style={{ cursor: 'pointer' }}
          >
            <rect x="430" y="395" width="10" height="10" fill="var(--accent)" opacity="0.8" rx="1" />
            <text x="425" y="425" fontSize="9" fill="var(--accent)" fontStyle="italic" textAnchor="end" letterSpacing="0.05em">Pashupatinath</text>
            <title>Pashupatinath - Kathmandu Day 2 - sacred Shiva temple</title>
          </g>

          {/* Jokhang (Lhasa Day 4) */}
          <g
            className="sacred-marker delight-sacred-marker"
            data-day-id="day-4"
            role="button"
            tabIndex={0}
            aria-label="Jokhang Temple Lhasa Day 4"
            onClick={() => handleStopClick('day-4')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-4')}
            style={{ cursor: 'pointer' }}
          >
            <rect x="970" y="245" width="10" height="10" fill="var(--accent)" opacity="0.8" rx="1" />
            <text x="985" y="258" fontSize="9" fill="var(--accent)" fontStyle="italic" letterSpacing="0.05em">Jokhang</text>
            <title>Jokhang Temple - Lhasa Day 4 - most sacred temple in Tibetan Buddhism</title>
          </g>

          {/* Mansarovar Snan (Day 6) */}
          <g
            className="sacred-marker delight-sacred-marker"
            data-day-id="day-6"
            role="button"
            tabIndex={0}
            aria-label="Mansarovar Snan holy bath Day 6"
            onClick={() => handleStopClick('day-6')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-6')}
            style={{ cursor: 'pointer' }}
          >
            <ellipse cx="433" cy="198" rx="7" ry="4" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.9" />
            <text x="425" y="183" fontSize="9" fill="var(--accent)" fontStyle="italic" textAnchor="end" letterSpacing="0.05em">Mansarovar Snan</text>
            <title>Mansarovar Snan (holy bath) - Day 6 - the lake of the mind</title>
          </g>

          {/* Chiu Gompa (Day 6) */}
          <g
            className="sacred-marker delight-sacred-marker"
            data-day-id="day-6"
            role="button"
            tabIndex={0}
            aria-label="Chiu Gompa monastery Mansarovar Day 6"
            onClick={() => handleStopClick('day-6')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-6')}
            style={{ cursor: 'pointer' }}
          >
            <rect x="510" y="197" width="9" height="9" fill="var(--accent)" opacity="0.8" rx="1" />
            <text x="523" y="209" fontSize="9" fill="var(--accent)" fontStyle="italic" letterSpacing="0.05em">Chiu Gompa</text>
            <title>Chiu Gompa Puja - Day 6 - monastery overlooking Mansarovar</title>
          </g>

          {/* Kailash Darshan (Day 7) */}
          <g
            className="sacred-marker delight-sacred-marker"
            data-day-id="day-7"
            role="button"
            tabIndex={0}
            aria-label="First Kailash Darshan Day 7"
            onClick={() => handleStopClick('day-7')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-7')}
            style={{ cursor: 'pointer' }}
          >
            <polygon points="312,161 318,148 324,161" fill="var(--accent)" opacity="0.8" />
            <text x="295" y="145" fontSize="9" fill="var(--accent)" fontStyle="italic" textAnchor="end" letterSpacing="0.05em">Kailash Darshan</text>
            <title>First Kailash Darshan (sacred sight) - Day 7 - the sacred mountain viewpoint</title>
          </g>

          {/* Dolma La sacred ring */}
          <g className="sacred-marker delight-sacred-marker" data-day-id="day-8">
            <circle cx="260" cy="110" r="22" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2,3" opacity="0.7" />
            <title>Dolma La Crossing (spiritual crossing) - Day 8 - death and rebirth in pilgrim tradition</title>
          </g>

          {/* Gauri Kund (Day 8 descent) */}
          <g
            className="sacred-marker delight-sacred-marker"
            data-day-id="day-8"
            role="button"
            tabIndex={0}
            aria-label="Gauri Kund sacred glacial lake Day 8"
            onClick={() => handleStopClick('day-8')}
            onKeyDown={(e) => handleStopKeyDown(e, 'day-8')}
            style={{ cursor: 'pointer' }}
          >
            <ellipse cx="291" cy="155" rx="6" ry="3.5" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.9" />
            <text x="300" y="170" fontSize="9" fill="var(--accent)" fontStyle="italic" letterSpacing="0.05em">Gauri Kund</text>
            <title>Gauri Kund (sacred glacial lake) - Day 8 descent</title>
          </g>
        </g>

        {/* Before phase */}
        <g className="phase-before">
          <path
            d="M 420,235 Q 360,200 290,180 Q 240,150 260,110 Q 280,85 320,100 Q 380,140 380,180 Q 360,210 420,235 Z"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            opacity="0.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="600"
            y="475"
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            fill="var(--muted)"
            textAnchor="middle"
            letterSpacing="0.15em"
            fontWeight="600"
          >
            THE PARIKRAMA - 3-DAY CIRCUMAMBULATION OF KAILASH - ANCHOR OF THE YATRA
          </text>
        </g>

        {/* During phase */}
        <g className="phase-during">
          <text
            x="600"
            y="475"
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            fill="var(--ink)"
            textAnchor="middle"
            letterSpacing="0.15em"
            fontWeight="600"
          >
            LIVE TRACK - YOU ARE HERE
          </text>
        </g>

        {/* After phase */}
        <g className="phase-after">
          {Object.entries(STOP_CX).map(([stopCls, cx]) => (
            <circle
              key={stopCls}
              cx={cx + 12}
              cy={STOP_CY[stopCls] - 14}
              r="5"
              fill="var(--green)"
              opacity="0.85"
            />
          ))}
          <text
            x="600"
            y="475"
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            fill="var(--accent)"
            textAnchor="middle"
            letterSpacing="0.15em"
            fontWeight="700"
          >
            YATRA SAMPOORNA - 7 SACRED SITES - 1 PARIKRAMA - 5,630M CROSSED
          </text>
        </g>

        {/* Legend */}
        <g className="map-legend" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--muted)" letterSpacing="0.05em">
          <text x="1000" y="25" fontWeight="700" fontSize="10" letterSpacing="0.12em" fill="var(--ink)">LEGEND</text>
          <line x1="1000" y1="38" x2="1025" y2="38" stroke="var(--ink)" strokeWidth="2.5" />
          <text x="1032" y="41">PARIKRAMA LOOP</text>
          <line x1="1000" y1="51" x2="1025" y2="51" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="1032" y="54">DRIVE / FOOT</text>
          <line x1="1000" y1="64" x2="1025" y2="64" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="6,4" />
          <text x="1032" y="67">FLIGHT</text>
          <circle cx="1012" cy="78" r="6" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />
          <text x="1032" y="81">STOP</text>
          <circle cx="1012" cy="93" r="7" fill="var(--red)" />
          <text x="1032" y="96">PEAK - DOLMA LA</text>
          <rect x="1005" y="103" width="10" height="10" fill="var(--accent)" opacity="0.8" rx="1" />
          <text x="1032" y="113">SACRED SITE</text>
        </g>
      </svg>
    </section>
  );
}
