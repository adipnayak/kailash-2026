/**
 * aliimam ShineBorder component · adapted for Vite/React + Maurten tokens.
 * Source: aliimam.in/r/shine-border (manual port · shadcn CLI not configured).
 * License: MIT (aliimam-in/aliimam).
 *
 * CSS @property approach: animates a custom angle var that the conic-gradient
 * uses to sweep the border. No JS animation, no framer-motion.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useId } from 'react';

interface ShineBorderProps {
  borderWidth?: number;
  duration?: number;
  color?: string;
  className?: string;
  children: React.ReactNode;
}

export function ShineBorder({
  borderWidth = 2,
  duration = 14,
  color = 'var(--sacred)',
  className = '',
  children,
}: ShineBorderProps) {
  const reactId = useId();
  const propName = '--shine-angle-' + reactId.replace(/[^a-zA-Z0-9]/g, '');
  const animName = 'shine-spin-' + reactId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div className={'relative isolate ' + className}>
      <style>{`
        @property ${propName} {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes ${animName} {
          to { ${propName}: 360deg; }
        }
        .shine-${animName}::before {
          content: '';
          position: absolute;
          inset: -${borderWidth}px;
          z-index: -1;
          background: conic-gradient(from var(${propName}), transparent 60%, ${color} 75%, transparent 90%);
          animation: ${animName} ${duration}s linear infinite;
        }
      `}</style>
      <div className={'shine-' + animName + ' relative bg-background'} style={{ padding: borderWidth }}>
        <div className="bg-background">{children}</div>
      </div>
    </div>
  );
}
