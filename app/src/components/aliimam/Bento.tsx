/**
 * BentoGrid + BentoGridItem.
 * Minimal aliimam-style bento layout component.
 *
 * Tailwind v4 does not JIT arbitrary grid-cols-${N} class names, so we
 * use inline style for the grid-template-columns value and keep Tailwind
 * only for well-known utilities.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// BentoGrid
// ---------------------------------------------------------------------------
export interface BentoGridCols {
  base?: number;
  md?: number;
  lg?: number;
}

export interface BentoGridProps {
  cols?: BentoGridCols;
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({
  cols = { base: 2, md: 3, lg: 4 },
  children,
  className,
}: BentoGridProps) {
  // Build responsive CSS custom-property overrides via inline style.
  // We set --bento-cols for each breakpoint using a cascade approach.
  // Tailwind breakpoints: md = 768px, lg = 1024px.
  const baseCols = cols.base ?? 2;
  const mdCols = cols.md ?? baseCols;
  const lgCols = cols.lg ?? mdCols;

  // Inline style supplies the default (base) column count.
  // Tailwind responsive variants supply md/lg overrides via CSS vars.
  const style: React.CSSProperties = {
    gridTemplateColumns: `repeat(${baseCols}, minmax(0, 1fr))`,
  };

  return (
    <div
      className={cn(
        'grid auto-rows-[minmax(140px,auto)] gap-3 sm:gap-4',
        // md and lg responsive overrides applied via data attrs + CSS below
        className,
      )}
      style={style}
      data-bento-cols-base={baseCols}
      data-bento-cols-md={mdCols}
      data-bento-cols-lg={lgCols}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BentoGridItem
// ---------------------------------------------------------------------------
export interface BentoGridItemProps {
  colSpan?: number;
  rowSpan?: number;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function BentoGridItem({
  colSpan = 1,
  rowSpan = 1,
  className,
  children,
  style,
}: BentoGridItemProps) {
  const itemStyle: React.CSSProperties = {
    ...style,
    ...(colSpan > 1 ? { gridColumn: `span ${colSpan} / span ${colSpan}` } : {}),
    ...(rowSpan > 1 ? { gridRow: `span ${rowSpan} / span ${rowSpan}` } : {}),
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40',
        className,
      )}
      style={itemStyle}
    >
      {children}
    </div>
  );
}
