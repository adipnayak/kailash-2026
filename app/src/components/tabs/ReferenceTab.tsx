/**
 * ReferenceTab.
 * 7 reference articles: Medicines/Connectivity/Bags/Customs/Acclim/Visa/Spiritual.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * Icons via Material Symbols Outlined.
 */

import { Icon } from '../Icon';
import type { RefArticle, RefBlock } from "../../lib/reference-data";
import { REFERENCE_ARTICLES } from "../../lib/reference-data";

// Map icon string names to Material Symbols Outlined names.
const ICON_MAP: Record<string, React.ReactNode> = {
  Pill: <Icon name="medication" size={20} />,
  Wifi: <Icon name="wifi" size={20} />,
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
  return (
    <div data-tab="reference">
      {/* Header + table of contents */}
      <section className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-sans text-2xl font-medium text-foreground">Reference</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Seven reference articles covering every operational and safety topic for the yatra.
            Jump directly to any section below.
          </p>
          <nav className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
            {REFERENCE_ARTICLES.map((article) => {
              const icon = ICON_MAP[article.icon] ?? <Icon name="description" size={14} />;
              return (
                <a
                  key={article.id}
                  href={`#${article.id}`}
                  className="inline-flex items-center gap-2 rounded-none border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-card transition-colors"
                >
                  <span className="text-muted-foreground">{icon}</span>
                  {article.title}
                </a>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Articles */}
      {REFERENCE_ARTICLES.map((article) => (
        <ArticleSection key={article.id} article={article} />
      ))}
    </div>
  );
}
