/**
 * OfflineBadge. Fixed top-right pill that appears when the browser reports
 * navigator.onLine === false. Hidden (returns null) when online.
 *
 * Subscribes to the window 'online' and 'offline' events so the badge
 * appears/disappears reactively without polling.
 *
 * Position: fixed top-14 right-4 -- sits below the main nav bar (which is
 * typically h-14) without overlapping it. z-30 keeps it above page content
 * but below modal overlays and the nav itself.
 *
 * Accessibility: role="status" + aria-live="polite" so screen readers
 * announce the badge when it appears.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { useEffect, useState } from 'react';

export function OfflineBadge() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      className="fixed top-14 right-4 z-30 rounded-none border border-destructive bg-destructive px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-destructive-foreground"
      role="status"
      aria-live="polite"
    >
      Offline
    </div>
  );
}
