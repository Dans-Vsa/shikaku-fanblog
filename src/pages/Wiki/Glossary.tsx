import { useDeferredValue, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Paragraphs, RichText } from '@/components/ui/RichText';
import { glossary } from '@/features/glossary-tooltip/glossary-data';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLang } from '@/hooks/useProviders';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { WikiNav } from './WikiNav';

export default function Glossary() {
  const { lang } = useLang();
  const c = glossary[lang];
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query.trim().toLowerCase());
  useDocumentTitle(c.title);
  useScrollChaos(0.05);

  const terms = c.terms.filter(
    (t) => !q || [t.term, t.jp, t.romaji, t.short].some((s) => s.toLowerCase().includes(q)),
  );

  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="用語" lede={c.lede} />
      <WikiNav />
      <section className="container-ink grid gap-8 py-12 lg:grid-cols-[1fr_1fr]">
        <Paragraphs items={c.intro} className="max-w-prose text-lg" />
        <label className="flex flex-col gap-2 self-end">
          <span className="t-label">{c.search}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-[3px] border-ink bg-paper px-4 py-3 font-mono text-base outline-none focus-visible:shadow-[5px_5px_0_var(--ink)]"
            placeholder={c.placeholder}
          />
        </label>
      </section>
      <section className="container-ink">
        {terms.length === 0 && <p className="t-label py-10">{c.empty}</p>}
        <ul className="grid gap-x-10 border-t-[3px] border-ink md:grid-cols-2">
          {terms.map((t) => (
            <li
              key={t.id}
              id={t.id}
              className="grid grid-cols-[4.5rem_1fr] gap-4 border-b-2 border-ink/20 py-6"
            >
              <span lang="ja" className="jp text-4xl leading-none" aria-hidden="true">
                {t.jp.slice(0, 2)}
              </span>
              <div>
                <h2 className="text-2xl font-bold">
                  {t.term}{' '}
                  <span className="t-label ml-1 align-middle text-ink-soft">{t.romaji}</span>
                </h2>
                <p className="mt-2 text-lg">
                  <RichText as="span" text={t.short} />
                </p>
                <p className="mt-2 text-base text-ink-soft">{t.long}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
