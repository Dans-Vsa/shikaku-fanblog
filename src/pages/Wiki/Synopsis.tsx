import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { Paragraphs } from '@/components/ui/RichText';
import { Tabs } from '@/components/ui/Tabs';
import en from '@/content/en/synopsis.json';
import id from '@/content/id/synopsis.json';
import { Spoiler } from '@/features/spoiler-ink/Spoiler';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { useSpoiler } from '@/hooks/useSpoiler';
import { WikiNav } from './WikiNav';

type TabKey = 'safe' | 'full';

export default function Synopsis() {
  const c = useLocalized({ id, en });
  const { hidden } = useSpoiler();
  const [tab, setTab] = useState<TabKey>(hidden ? 'safe' : 'full');
  useDocumentTitle(c.title);
  useScrollChaos(0.2);

  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="物語" lede={c.lede} />
      <WikiNav />
      <section className="container-ink py-12">
        <Tabs
          label={c.title}
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'safe', label: c.tabs.safe },
            { key: 'full', label: c.tabs.full },
          ]}
        >
          {tab === 'safe' ? (
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
              <div>
                <h2 className="mb-6 text-4xl">{c.safe.title}</h2>
                <Paragraphs items={c.safe.body} className="max-w-prose text-lg" />
              </div>
              <PanelFrame as="aside" className="h-fit p-6" tilt={1}>
                <dl className="grid gap-3">
                  {c.safe.facts.map((f) => (
                    <div key={f.k} className="border-b-2 border-ink/20 pb-2">
                      <dt className="t-label text-ink-soft">{f.k}</dt>
                      <dd className="text-xl">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              </PanelFrame>
            </div>
          ) : (
            <div>
              <h2 className="text-4xl">{c.full.title}</h2>
              <p className="t-label mt-3 max-w-2xl text-ink-soft">{c.full.note}</p>
              <ol className="mt-10 grid gap-8">
                {c.full.acts.map((act) => (
                  <li key={act.n} className="grid gap-4 md:grid-cols-[140px_1fr]">
                    <div className="flex items-baseline gap-3 md:flex-col">
                      <span className="t-label">{act.n.toString().padStart(2, '0')}</span>
                      <span lang="ja" className="jp text-5xl leading-none">
                        {act.jp}
                      </span>
                    </div>
                    <PanelFrame as="article" className="p-6" chaotic tilt={act.n % 2 ? -0.3 : 0.3}>
                      <h3 className="mb-4 text-3xl">{act.title}</h3>
                      <Spoiler label={act.title}>
                        <Paragraphs items={act.body} className="text-lg" />
                      </Spoiler>
                    </PanelFrame>
                  </li>
                ))}
              </ol>
              <section className="mt-16 grid gap-6 md:grid-cols-[1fr_2fr]">
                <h2 className="text-4xl">{c.afterTitle}</h2>
                <Spoiler label={c.afterTitle}>
                  <Paragraphs items={c.after} className="max-w-prose text-lg" />
                </Spoiler>
              </section>
            </div>
          )}
        </Tabs>
      </section>
    </main>
  );
}
