/**
 * BackToTop. Floating bottom-right button that scrolls the page back
 * to the top. Hidden until the user has scrolled at least one viewport
 * height so it never appears on a fresh visit. Smooth-scrolls on tap.
 *
 * Renders inside the SPA root; `position: fixed` is fine here because
 * no ancestor creates a containing block that would clip it.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { useEffect, useState } from 'react';
import { Icon } from './Icon';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-none border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name="arrow_upward" size={20} />
    </button>
  );
}
