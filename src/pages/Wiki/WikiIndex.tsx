import { PageHeader } from '@/components/layout/PageHeader';
import { Paragraphs } from '@/components/ui/RichText';
import { ArrowIcon } from '@/components/ui/icons';
import en from '@/content/en/wiki.json';
import id from '@/content/id/wiki.json';
import { TransitionLink } from '@/features/page-transition/TransitionLink';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';

export default function WikiIndex() {
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.15);
  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="資料" lede={c.lede} />
      <section className="container-ink grid gap-10 pb-10 lg:grid-cols-[1fr_2fr]">
        <Paragraphs items={c.intro} className="max-w-prose text-lg" />
        <ul className="grid gap-5 sm:grid-cols-2">
          {c.cards.map((card, i) => (
            <li key={card.to} className="chaos-panel">
              <TransitionLink
                to={card.to}
                data-cursor="card"
                className="panel group flex h-full flex-col gap-3 p-5 transition-transform duration-300 ease-snap hover:-translate-y-1 hover:rotate-[-0.6deg]"
              >
                <span className="flex items-start justify-between">
                  <span className="t-label">{String(i + 1).padStart(2, '0')}</span>
                  <span
                    lang="ja"
                    className="jp text-4xl leading-none transition-transform duration-300 group-hover:scale-110"
                  >
                    {card.jp}
                  </span>
                </span>
                <span className="text-3xl font-bold">{card.title}</span>
                <span className="text-lg text-ink-soft">{card.body}</span>
                <ArrowIcon className="mt-auto transition-transform duration-300 group-hover:translate-x-2" />
              </TransitionLink>
            </li>
          ))}
        </ul>
      </section>
      <aside className="container-ink">
        <div className="panel max-w-3xl bg-ink p-6 text-paper">
          <h2 className="t-shikaku text-2xl">{c.fanTitle}</h2>
          <p className="mt-3 text-lg text-paper/90">{c.fan}</p>
        </div>
      </aside>
    </main>
  );
}
