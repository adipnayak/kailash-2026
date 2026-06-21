/**
 * MoonPhase. Tiny SVG icon of the moon at a given phase (0..1).
 * Renders the full disc + an inset shadow ellipse that scales by phase.
 * No emoji per design rule.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface MoonPhaseProps {
  /** 0..1 -- 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter */
  phase: number;
  size?: number;
}

export function MoonPhase({ phase, size = 14 }: MoonPhaseProps) {
  // Map 0..1 phase -> illumination geometry. New (0) = fully dark, full (0.5) =
  // fully lit. Waxing (0..0.5) lights the right; waning (0.5..1) lights the left.
  const r = size / 2;
  const cx = r;
  const cy = r;
  const waxing = phase < 0.5;
  // 0 at new and full (boundary), 1 at the quarter
  const distance = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  // Width of the lit ellipse from centre -- 1 at quarter, 0 at new/full
  const elliptCx = waxing ? cx - r * (1 - distance) : cx + r * (1 - distance);
  const elliptRx = r * Math.abs(1 - 2 * distance);
  // Lit half: right when waxing, left when waning. Filled rect masks half.
  const litSide = waxing ? cx : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Dark disc (background, the unlit moon) */}
      <circle cx={cx} cy={cy} r={r} fill="var(--muted)" />
      {/* Lit half */}
      <defs>
        <clipPath id={`moon-clip-${phase.toFixed(3)}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#moon-clip-${phase.toFixed(3)})`}>
        {/* Lit semicircle (the always-lit half of the moon for this waxing/waning state) */}
        <rect x={litSide} y={0} width={r} height={size} fill="var(--foreground)" />
        {/* Terminator ellipse: subtracts (dark) from lit side when waxing < quarter,
            adds (lit) to dark side when waxing > quarter, vice versa for waning. */}
        <ellipse
          cx={elliptCx}
          cy={cy}
          rx={elliptRx}
          ry={r}
          fill={
            (waxing && phase < 0.25) || (!waxing && phase > 0.75)
              ? 'var(--muted)'
              : 'var(--foreground)'
          }
        />
      </g>
      {/* Outline */}
      <circle cx={cx} cy={cy} r={r - 0.5} fill="none" stroke="var(--border)" strokeWidth={0.5} />
    </svg>
  );
}
