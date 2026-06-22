/**
 * Icon. Thin wrapper around Material Symbols Outlined, self-hosted via
 * the `material-symbols` npm package (no fonts.googleapis.com -- blocked
 * in China). Variable font; we lock weight at 400 to match the prior
 * the prior icon-set look. FILL axis exposed via prop for active states.
 *
 * Usage:
 *   <Icon name="dashboard" size={16} />
 *   <Icon name="check_circle" size={20} filled />
 *
 * Material Symbol names are snake_case. See fonts.google.com/icons.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, size = 20, filled = false, className }: IconProps) {
  return (
    <span
      className={'material-symbols-outlined ' + (className || '')}
      style={{
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: `'wght' 400, 'FILL' ${filled ? 1 : 0}, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
