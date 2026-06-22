/**
 * aliimam stats-01 block -- adapted for Vite/React + Maurten tokens.
 * Source: aliimam-in/aliimam registry/aliimam/blocks/stats/stats-01/stats.tsx
 * License: MIT (aliimam-in/aliimam)
 *
 * Adaptations:
 *   - Removed CounterNumber dependency (self-contained plain number display)
 *   - Replaced shadcn tokens with Maurten CSS vars
 *   - Made stats configurable via props
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface Stat {
  value: string;
  label: string;
}

interface AliimamStatsProps {
  headline?: string;
  stats?: Stat[];
}

const DEFAULT_STATS: Stat[] = [
  { value: '13', label: 'Days' },
  { value: '5,630 m', label: 'Peak Altitude' },
  { value: '2,000 km', label: 'Total Distance' },
];

export function AliimamStats({
  headline = 'A once-in-a-lifetime yatra to the sacred Kailash Manasarovar.',
  stats = DEFAULT_STATS,
}: AliimamStatsProps) {
  return (
    <div className="relative container flex flex-col items-center justify-center overflow-hidden py-20">
      <div className="z-10 flex w-full flex-col items-center justify-center text-center">
        <p className="text-muted-foreground mb-10 max-w-sm text-center text-sm md:max-w-md">
          {headline}
        </p>
        <div className="grid flex-wrap justify-center gap-6 space-y-4 text-center md:flex">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={[
                'space-y-2 px-6',
                i > 0 && i < stats.length - 1 ? 'md:border-x md:px-12 border-border' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="text-4xl font-extrabold tracking-tighter text-foreground">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--background) 0%, var(--background) 50%, rgba(255,255,255,0) 100%), radial-gradient(ellipse at 50% 120%, var(--border) 0%, var(--background) 80%)',
          opacity: 0.7,
        }}
      >
        <div
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 70%)',
            backgroundImage:
              'repeating-conic-gradient(from 0deg at 50% 100%, var(--border) 0deg, var(--border) 2deg, transparent 2deg, transparent 10deg)',
            bottom: '-20%',
            height: '100%',
            left: '50%',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
            opacity: 0.3,
            pointerEvents: 'none',
            position: 'absolute',
            transform: 'translateX(-50%)',
            width: '200%',
          }}
        />
      </div>
    </div>
  );
}
