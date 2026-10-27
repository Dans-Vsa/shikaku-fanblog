import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExternalIcon } from '@/components/ui/icons';
import { Paragraphs } from '@/components/ui/RichText';
import { fontCredits, libraryCredits, type CreditItem } from '@/config/credits';
import en from '@/content/en/credits.json';
import id from '@/content/id/credits.json';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';

export default function Credits() {
  const { t } = useTranslation();
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0);

  const table = (items: CreditItem[], title: string) => (
    <div>
      <h2 className="mb-4 border-b-[3px] border-ink pb-2 text-3xl">{title}</h2>
      <ul className="flex flex-col">
        {items.map((it) => (
          <li
            key={it.name}
            className="grid gap-1 border-b-2 border-ink/15 py-3 sm:grid-cols-[1fr_auto]"
          >
            <span>
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink inline-flex items-center gap-1 text-xl font-bold"
              >
                {it.name} <ExternalIcon size={14} />
                <span className="sr-only">{t('common.external')}</span>
              </a>
              <span className="block text-base text-ink-soft">
                {c.roles[it.role as keyof typeof c.roles]}
              </span>
            </span>
            <span className="t-label self-center">{it.license}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="謝辞" lede={c.lede} />
      <section className="container-ink grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 border-b-[3px] border-ink pb-2 text-3xl">{c.originalTitle}</h2>
          <Paragraphs items={c.original} className="text-lg" />
        </div>
        <div>
          <h2 className="mb-4 border-b-[3px] border-ink pb-2 text-3xl">{c.madeTitle}</h2>
          <ul className="flex list-[square] flex-col gap-2 pl-5 text-lg">
            {c.made.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        {table(fontCredits, c.fontsTitle)}
        {table(libraryCredits, c.librariesTitle)}
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-2xl">{c.sourcesTitle}</h2>
          <p className="max-w-prose text-lg">{c.sources}</p>
          <p className="t-label mt-6 text-ink-soft">{c.license}</p>
        </div>
      </section>
    </main>
  );
}
