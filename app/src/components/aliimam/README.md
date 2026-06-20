# aliimam blocks and icons

Source: https://aliimam.in · https://github.com/aliimam-in/aliimam
License: MIT (aliimam-in/aliimam)

---

## Blocks imported

5 blocks adapted for Vite/React (removed Next.js deps, shadcn shadcn registry deps):

| Block       | Source file                                          | Adapted file            |
|-------------|------------------------------------------------------|-------------------------|
| hero-01     | registry/aliimam/blocks/hero/hero-01/hero.tsx        | AliimamHero.tsx         |
| stats-01    | registry/aliimam/blocks/stats/stats-01/stats.tsx     | AliimamStats.tsx        |
| feature-01  | registry/aliimam/blocks/feature/feature-01/page.tsx  | AliimamFeature.tsx      |
| cta-01      | registry/aliimam/blocks/cta/cta-01/cta.tsx           | AliimamCta.tsx          |
| footer-01   | registry/aliimam/blocks/footer/footer-01/            | AliimamFooter.tsx       |

Install method: GitHub source direct copy (blocks are Next.js/shadcn components,
adapted inline since `npx shadcn add` requires components.json + Next.js).

---

## Icon library

Package: `@aliimam/icons` v1.1.3 (npm)
Installed via: `npm install @aliimam/icons`

### Import pattern

Named exports from the package root:

```tsx
import { Mountain, Wifi, Clock, Thermometer } from '@aliimam/icons';

// All icons accept size, className, strokeWidth props
<Mountain size={16} className="text-foreground" />
<Wifi size={16} className="text-emerald-600" />
```

### Icon prop interface

```tsx
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
}
```

### Lucide-to-aliimam mapping used in this codebase

| lucide-react       | @aliimam/icons      | Category     |
|--------------------|---------------------|--------------|
| Mountain           | Mountain            | others       |
| MapPin             | MapPin              | navigation   |
| Radio              | Radio               | others       |
| AlertTriangle      | TriangleAlert       | others       |
| Clock              | Clock               | clock        |
| Wifi               | Wifi                | network      |
| WifiOff            | WifiOff             | network      |
| Circle (partial)   | Signal              | network      |
| ChevronDown        | ChevronDown         | arrows       |
| Check              | CircleCheck         | circle       |
| Ruler              | Ruler               | others       |
| Bed                | Bed                 | others       |
| CheckCircle        | CircleCheck         | circle       |
| AlertCircle        | CircleAlert         | circle       |
| Minus              | CircleMinus         | circle       |
| Thermometer        | Thermometer         | health       |
| Wind               | WindFilled          | weather      |
| Droplet            | DropFilled          | weather      |
| Sun                | Sun                 | weather      |

---

## Token system

aliimam blocks use shadcn-compatible CSS variables natively (`--primary`, `--background`, etc.).
`src/index.css` now defines these tokens directly using aliimam light-mode defaults (oklch values).
There is no Maurten override layer. See THEME.md for the full token table and delta vs old Maurten values.

---

## License and attribution

aliimam blocks and icons: MIT License, Copyright Ali Imam (aliimam-in)
See: https://github.com/aliimam-in/aliimam/blob/main/LICENSE.md
