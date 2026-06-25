/**
 * ReferenceTab.
 * 8 reference articles: Medicines/Connectivity/Bags/Customs/Acclim/Visa/Spiritual/FAQs.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * Icons via Material Symbols Outlined.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import type { RefArticle, RefBlock } from "../../lib/reference-data";
import { REFERENCE_ARTICLES } from "../../lib/reference-data";
import { DIAMOX_REGIME } from "../../lib/diamox-regime";
import { getReferenceDate } from "../../lib/journey-state";

// Map icon string names to Material Symbols Outlined names.
const ICON_MAP: Record<string, React.ReactNode> = {
  Pill: <Icon name="medication" size={20} />,
  Wifi: <Icon name="wifi" size={20} />,
  Smartphone: <Icon name="smartphone" size={20} />,
  Backpack: <Icon name="backpack" size={20} />,
  ShieldCheck: <Icon name="verified_user" size={20} />,
  Mountain: <Icon name="landscape" size={20} />,
  FileText: <Icon name="description" size={20} />,
  Heart: <Icon name="favorite" size={20} />,
  HelpCircle: <Icon name="help" size={20} />,
};

function CalloutBlock({ block }: { block: Extract<RefBlock, { type: "callout" }> }) {
  const borderColor =
    block.tone === "critical"
      ? "border-destructive"
      : block.tone === "warning"
        ? "border-sacred"
        : "border-border";

  const labelColor =
    block.tone === "critical"
      ? "text-destructive"
      : block.tone === "warning"
        ? "text-sacred"
        : "text-muted-foreground";

  return (
    <div className={`my-4 rounded-none border-l-4 ${borderColor} bg-card px-4 py-4`}>
      {block.title && (
        <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
          {block.title}
        </p>
      )}
      <p className="text-sm text-foreground leading-relaxed">{block.body}</p>
    </div>
  );
}

function BlockRenderer({ block }: { block: RefBlock }) {
  switch (block.type) {
    case "prose":
      return <p className="my-4 text-sm text-foreground leading-relaxed">{block.body}</p>;

    case "heading":
      return (
        <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {block.text}
        </h3>
      );

    case "table":
      return (
        <div className="my-4 w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? "bg-background" : "bg-card"}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "ordered-list":
      return (
        <ol className="my-4 ml-4 list-decimal space-y-1">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-foreground leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );

    case "unordered-list":
      return (
        <ul className="my-4 ml-4 list-disc space-y-1">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-foreground leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );

    case "callout":
      return <CalloutBlock block={block} />;

    case "accordion":
      return (
        <Accordion type="multiple" defaultValue={["q-0"]} className="my-4">
          {block.items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`q-${i}`}
              className="border-b border-border last:border-0"
            >
              <AccordionTrigger className="text-left py-3 hover:no-underline">
                <span className="text-sm font-medium text-foreground">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-0">
                <p className="text-sm text-foreground leading-relaxed">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      );

    case "diamox-calendar": {
      const todayISO = (() => {
        const d = getReferenceDate();
        return (
          d.getFullYear() +
          '-' +
          String(d.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(d.getDate()).padStart(2, '0')
        );
      })();
      return (
        <div className="my-4 w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                {["Date", "Phase", "Use", "Dose", "mg", "Tabs"].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIAMOX_REGIME.map((row, ri) => {
                const isToday = row.dateISO === todayISO;
                const rowClass = isToday
                  ? 'ring-2 ring-sacred bg-background'
                  : ri % 2 === 0
                  ? 'bg-background'
                  : 'bg-card';
                const doseCopy =
                  row.schedule === 'twice-daily'
                    ? '2 twice daily'
                    : row.doses === 1
                    ? '1 ' + row.schedule
                    : String(row.doses) + ' ' + row.schedule;
                return (
                  <tr key={ri} className={rowClass}>
                    <td className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed whitespace-nowrap">
                      {isToday && (
                        <span className="mr-2 inline-block font-mono text-sacred text-[10px] uppercase tracking-widest border border-sacred px-1 py-0.5 leading-none">
                          TODAY
                        </span>
                      )}
                      {row.dayLabel}
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed font-mono">
                      {row.phaseLabel}
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed">
                      {row.use}
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed whitespace-nowrap">
                      {doseCopy}
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed">
                      {row.mg}
                    </td>
                    <td className="px-4 py-2 text-xs text-foreground align-top border-b border-border leading-relaxed">
                      {row.tabs}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-card border-t-2 border-sacred">
                <td
                  colSpan={6}
                  className="px-4 py-2 text-xs font-semibold text-sacred border-b border-border"
                >
                  Total - 32 doses - 16 tabs (of 250 mg)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return null;
  }
}

function ArticleSection({ article }: { article: RefArticle }) {
  const icon = ICON_MAP[article.icon] ?? <Icon name="description" size={20} />;

  return (
    <section
      id={article.id}
      className="border-b border-border bg-background px-6 py-8 scroll-mt-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-muted-foreground">{icon}</span>
          <h2 className="font-sans text-xl font-medium text-foreground">{article.title}</h2>
        </div>
        {article.intro && (
          <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{article.intro}</p>
        )}
        {article.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </section>
  );
}

export function ReferenceTab() {
  // Scrollspy: active = the LAST article whose top has crossed below
  // the sticky nav (~130 px from viewport top). IntersectionObserver
  // with intersectionRatio was unreliable here because the articles
  // vary wildly in length (Medicines is huge, Customs is small) -- a
  // short fully-visible article kept beating a long article that only
  // had a slice in view. Plain scroll-position math is robust.
  const [activeArticle, setActiveArticle] = useState<string | null>(REFERENCE_ARTICLES[0]?.id ?? null);
  const navRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const THRESHOLD = 130;
    const onScroll = () => {
      let current = REFERENCE_ARTICLES[0]?.id ?? null;
      for (const a of REFERENCE_ARTICLES) {
        const el = document.getElementById(a.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= THRESHOLD) {
          current = a.id;
        } else {
          break; // every following section is further down -- stop
        }
      }
      if (current) setActiveArticle(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-scroll the active chip into view in the horizontal nav strip.
  // Use the strip's own scrollLeft instead of chip.scrollIntoView so it
  // never touches window scroll (iOS Safari can mis-route scrollIntoView
  // on children of sticky ancestors to the window).
  useEffect(() => {
    if (!activeArticle || !navRef.current) return;
    const strip = navRef.current;
    const chip = strip.querySelector<HTMLElement>(`[data-article="${activeArticle}"]`);
    if (!chip) return;
    const stripRect = strip.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const delta =
      (chipRect.left + chipRect.right) / 2 - (stripRect.left + stripRect.right) / 2;
    strip.scrollBy({ left: delta, behavior: 'smooth' });
  }, [activeArticle]);

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // window.scrollTo with explicit pixel offset -- iOS Safari is
    // unreliable with el.scrollIntoView({behavior:'smooth'}).
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <div data-tab="reference">
      {/* Header */}
      <section className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-sans text-2xl font-medium text-foreground">Reference</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Reference articles covering every operational and safety topic for the yatra.
            Jump directly to any section below.
          </p>
        </div>
      </section>

      {/* Sticky article-nav strip. Mirrors ItineraryTab DayNav -- solid
          bg (no backdrop-blur) so iOS Safari sticky stays glued through
          the address-bar collapse. Auto-highlights via IntersectionObserver. */}
      <div className="sticky top-12 z-40 border-b border-border bg-background px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <ol ref={navRef} className="flex gap-2 overflow-x-auto" style={{ overscrollBehaviorX: "contain" }}>
            {REFERENCE_ARTICLES.map((article) => {
              const icon = ICON_MAP[article.icon] ?? <Icon name="description" size={14} />;
              const isActive = activeArticle === article.id;
              return (
                <li key={article.id} className="shrink-0">
                  <button
                    type="button"
                    data-article={article.id}
                    onClick={() => jumpTo(article.id)}
                    aria-label={'Jump to ' + article.title}
                    aria-current={isActive ? 'true' : undefined}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(0,0,0,0.05)' }}
                    className={
                      'flex items-center gap-2 rounded-none border px-4 py-2 font-mono text-xs cursor-pointer transition-colors ' +
                      (isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground')
                    }
                    title={article.title}
                  >
                    <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>{icon}</span>
                    <span>{article.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Articles */}
      {REFERENCE_ARTICLES.map((article) => (
        <ArticleSection key={article.id} article={article} />
      ))}
    </div>
  );
}
