/**
 * MoonPhase. Tiny SVG icon snapped to one of 8 standard phases so the
 * silhouette stays distinct at 10-14 px. The previous clip-path approach
 * collapsed the terminator ellipse to a smudge at small sizes.
 *
 * Each preset draws the lit portion as an explicit two-arc path:
 *   - Crescent: outer semicircle + inner semi-ellipse (opposite sweep) -> sliver
 *   - Half:     outer semicircle + straight line back -> exact half disc
 *   - Gibbous:  outer semicircle + inner semi-ellipse (same sweep) -> wide
 *
 * The lit side is the RIGHT side for waxing phases (1..3) and the LEFT
 * side for waning phases (5..7). New (0) is an outlined empty disc; Full
 * (4) is a solid disc.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface MoonPhaseProps {
  /** 0..1 fraction of the synodic cycle (0=new, 0.25=first quarter,
      0.5=full, 0.75=last quarter). */
  phase: number;
  size?: number;
}

// Inherit from the parent's text color so the moon flips automatically
// when its container does -- e.g. on the active day chip in ItineraryTab,
// which switches from text-foreground to text-primary-foreground.
const FG = 'currentColor';
const STROKE_W = 1;

export function MoonPhase({ phase, size = 14 }: MoonPhaseProps) {
  // Snap continuous phase to 8 discrete buckets so the rendered shape
  // matches the verbal label ("Last Quarter" etc).
  const idx = ((Math.round(phase * 8) % 8) + 8) % 8;

  const r = size / 2;
  const innerR = r - STROKE_W / 2;
  const top = STROKE_W / 2;
  const bottom = size - STROKE_W / 2;

  // Width of the inner ellipse half for crescents (0.45) vs gibbous (0.45).
  const lensRx = innerR * 0.45;

  let litPath: string | null = null;
  let fullDisc = false;

  switch (idx) {
    case 0: // new moon -- empty outlined disc
      break;
    case 1: // waxing crescent (right-lit, narrow)
      litPath = `M ${r} ${top} A ${innerR} ${innerR} 0 0 1 ${r} ${bottom} A ${lensRx} ${innerR} 0 0 0 ${r} ${top} Z`;
      break;
    case 2: // first quarter -- exact right half
      litPath = `M ${r} ${top} A ${innerR} ${innerR} 0 0 1 ${r} ${bottom} L ${r} ${top} Z`;
      break;
    case 3: // waxing gibbous (right-lit, wide)
      litPath = `M ${r} ${top} A ${innerR} ${innerR} 0 0 1 ${r} ${bottom} A ${lensRx} ${innerR} 0 0 1 ${r} ${top} Z`;
      break;
    case 4: // full moon -- solid disc
      fullDisc = true;
      break;
    case 5: // waning gibbous (left-lit, wide)
      litPath = `M ${r} ${top} A ${innerR} ${innerR} 0 0 0 ${r} ${bottom} A ${lensRx} ${innerR} 0 0 0 ${r} ${top} Z`;
      break;
    case 6: // last quarter -- exact left half
      litPath = `M ${r} ${top} A ${innerR} ${innerR} 0 0 0 ${r} ${bottom} L ${r} ${top} Z`;
      break;
    case 7: // waning crescent (left-lit, narrow)
      litPath = `M ${r} ${top} A ${innerR} ${innerR} 0 0 0 ${r} ${bottom} A ${lensRx} ${innerR} 0 0 1 ${r} ${top} Z`;
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle
        cx={r}
        cy={r}
        r={innerR}
        fill={fullDisc ? FG : 'none'}
        stroke={FG}
        strokeWidth={STROKE_W}
      />
      {litPath && <path d={litPath} fill={FG} />}
    </svg>
  );
}
