import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { Paragraphs, RichText } from '@/components/ui/RichText';
import { ExternalIcon } from '@/components/ui/icons';
import { Tag, type TagKind } from '@/components/ui/Tag';
import en from '@/content/en/production.json';
import id from '@/content/id/production.json';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { WikiNav } from './WikiNav';

export default function Production() {
  const { t } = useTranslation();
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.1);
  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="制作" lede={c.lede} />
      <WikiNav />
      <section className="container-ink grid gap-10 py-12 lg:grid-cols-[1fr_1.6fr]">
        <PanelFrame as="aside" className="h-fit p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl">{c.factsTitle}</h2>
            <Tag kind="fact" />
          </div>
          <dl className="grid gap-3">
            {c.facts.map((f) => (
              <div
                key={f.k}
                className="grid gap-1 border-b-2 border-ink/15 pb-2 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="t-label pt-1 text-ink-soft">{f.k}</dt>
                <dd className="text-lg">{f.v}</dd>
              </div>
            ))}
          </dl>
        </PanelFrame>
        <div className="grid gap-12">
          {c.sections.map((s) => (
            <article key={s.title}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="text-4xl">{s.title}</h2>
                <Tag kind={s.kind as TagKind} />
              </div>
              <Paragraphs items={s.body} className="max-w-prose text-lg" />
            </article>
          ))}
        </div>
      </section>
      <section className="container-ink py-8">
        <h2 className="mb-6 text-4xl">{c.triviaTitle}</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {c.trivia.map((tr) => (
            <li key={tr.text} className="chaos-panel panel flex flex-col gap-3 p-5">
              <Tag kind={tr.kind as TagKind} className="self-start" />
              <RichText text={tr.text} className="text-lg" />
            </li>
          ))}
        </ul>
      </section>
      <section className="container-ink py-8">
        <h2 className="mb-4 text-3xl">{c.sourcesTitle}</h2>
        <ul className="grid gap-2">
          {c.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink inline-flex items-center gap-2 text-lg"
              >
                {s.label}
                <ExternalIcon size={16} />
                <span className="sr-only">{t('common.external')}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
