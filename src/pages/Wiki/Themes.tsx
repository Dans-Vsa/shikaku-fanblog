import { PageHeader } from '@/components/layout/PageHeader';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { Paragraphs } from '@/components/ui/RichText';
import { Tag, type TagKind } from '@/components/ui/Tag';
import en from '@/content/en/themes.json';
import id from '@/content/id/themes.json';
import { Spoiler } from '@/features/spoiler-ink/Spoiler';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { WikiNav } from './WikiNav';

export default function Themes() {
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.25);
  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="主題" lede={c.lede} />
      <WikiNav />
      <section className="container-ink py-12">
        <Paragraphs items={c.intro} className="max-w-prose text-lg" />
      </section>
      <section className="container-ink grid gap-10">
        {c.themes.map((theme, i) => {
          const body = <Paragraphs items={theme.body} className="text-lg" />;
          return (
            <PanelFrame
              key={theme.id}
              as="article"
              chaotic
              tilt={i % 2 ? 0.4 : -0.4}
              className={`grid gap-6 p-6 md:grid-cols-[160px_1fr] md:p-10 ${i % 2 ? 'md:ml-[8%]' : 'md:mr-[8%]'}`}
            >
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <span lang="ja" className="jp text-6xl leading-none md:text-7xl" aria-hidden="true">
                  {theme.jp}
                </span>
                <Tag kind={theme.kind as TagKind} />
              </div>
              <div>
                <h2 className="mb-5 text-4xl">{theme.title}</h2>
                {theme.spoiler ? <Spoiler label={theme.title}>{body}</Spoiler> : body}
              </div>
            </PanelFrame>
          );
        })}
      </section>
      <section className="container-ink mt-20">
        <div className="border-y-[3px] border-ink py-12 text-center">
          <p className="t-label">{c.closingTitle}</p>
          <p className="t-yugeru mx-auto mt-4 max-w-3xl text-3xl md:text-4xl">{c.closing}</p>
        </div>
      </section>
    </main>
  );
}
