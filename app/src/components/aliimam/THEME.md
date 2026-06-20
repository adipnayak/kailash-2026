# aliimam native theme tokens

Source: apps/www/src/styles/globals.css in aliimam-in/aliimam (main branch, 2026-06-20)
These are the unmodified aliimam/shadcn light-mode defaults this codebase now uses.

Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.

---

## Font family

| Role  | Value                                    | Tailwind utility |
|-------|------------------------------------------|------------------|
| sans  | Geist Sans (system fallback: sans-serif) | font-sans        |
| mono  | Geist Mono (system fallback: monospace)  | font-mono        |

Previous: Inter Tight (sans) + JetBrains Mono (mono).
Geist is loaded via @fontsource/geist (npm) or falls back to system sans/mono.

---

## Color tokens (light mode, oklch)

| Token                | oklch value                  | Approx hex | Role                             |
|----------------------|------------------------------|------------|----------------------------------|
| --background         | oklch(1 0 0)                 | #ffffff    | Page background (pure white)     |
| --foreground         | oklch(0.145 0 0)             | #1a1a1a    | Body text                        |
| --card               | oklch(1 0 0)                 | #ffffff    | Card surface                     |
| --card-foreground    | oklch(0.145 0 0)             | #1a1a1a    | Card text                        |
| --primary            | oklch(0.205 0 0)             | #222222    | Primary action / filled button   |
| --primary-foreground | oklch(0.985 0 0)             | #fafafa    | Text on primary                  |
| --secondary          | oklch(0.97 0 0)              | #f7f7f7    | Secondary surface                |
| --secondary-foreground | oklch(0.205 0 0)           | #222222    | Text on secondary                |
| --muted              | oklch(0.97 0 0)              | #f7f7f7    | Muted surface                    |
| --muted-foreground   | oklch(0.556 0 0)             | #666666    | Secondary / helper text          |
| --accent             | oklch(0.97 0 0)              | #f7f7f7    | Accent surface (near-white)      |
| --accent-foreground  | oklch(0.205 0 0)             | #222222    | Text on accent surface           |
| --destructive        | oklch(0.577 0.245 27.325)    | ~#c0392b   | Error / critical                 |
| --border             | oklch(0.922 0 0)             | #ebebeb    | Borders                          |
| --input              | oklch(0.922 0 0)             | #ebebeb    | Input borders                    |
| --ring               | oklch(0.708 0 0)             | #999999    | Focus ring                       |

--radius: 0rem (square corners by default)

---

## Delta vs Maurten override

| Maurten token  | Maurten value | aliimam equivalent     | aliimam value           | Note                                     |
|----------------|---------------|------------------------|-------------------------|------------------------------------------|
| --bg           | #f3f3f2       | --background           | oklch(1 0 0) = #ffffff  | Warm off-white -> pure white             |
| --ink          | #000000       | --foreground           | oklch(0.145 0 0)        | Pure black -> near-black                 |
| --card         | #ffffff       | --card                 | oklch(1 0 0) = #ffffff  | Same                                     |
| --border       | #dcdcd8       | --border               | oklch(0.922 0 0)        | Warm gray -> cool light gray             |
| --muted        | #6a6a68       | --muted-foreground     | oklch(0.556 0 0)        | Warm gray -> cool gray                   |
| --red          | #b73e2a       | --destructive          | oklch(0.577 0.245 27.3) | Brand terracotta -> standard shadcn red  |
| --accent       | #8e6628       | --accent-foreground    | oklch(0.205 0 0)        | Ochre -> dark on near-white surface      |
| --green        | #4a7a4d       | (no direct equivalent) | use text-emerald-* etc  | Removed; use Tailwind semantic colors    |

Tailwind aliases changed:
  bg-bg           -> bg-background
  text-ink        -> text-foreground
  text-muted      -> text-muted-foreground
  bg-card         -> bg-card (same name, now pure white)
  border-border   -> border-border (same name, now #ebebeb)
  text-red        -> text-destructive
  text-accent     -> text-accent-foreground
  text-green      -> (removed; inlined or use text-emerald-600)
