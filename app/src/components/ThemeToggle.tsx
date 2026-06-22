/**
 * ThemeToggle. Light/dark toggle persisted to localStorage.
 * Adds/removes the `dark` class on <html>. Initial value reads
 * localStorage then falls back to prefers-color-scheme.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { useEffect, useState } from 'react';
import { Sun, Moon } from '@aliimam/icons';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'kailash_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  // Default light unless the user has explicitly set a theme.
  return 'light';
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-border h-11 w-11 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
