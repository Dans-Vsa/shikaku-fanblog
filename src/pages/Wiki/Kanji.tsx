import { PageHeader } from '@/components/layout/PageHeader';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { Paragraphs, RichText } from '@/components/ui/RichText';
import { Tag } from '@/components/ui/Tag';
import en from '@/content/en/kanji.json';
import id from '@/content/id/kanji.json';
import { GlossaryTerm } from '@/features/glossary-tooltip/GlossaryTerm';
import { KanjiMorph } from '@/features/kanji-morph/KanjiMorph';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { WikiNav } from './WikiNav';

export default function Kanji() {
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.15);
  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="漢字" lede={c.lede} />
      <WikiNav />

      <section className="container-ink py-12" aria-label={c.morphLabel}>
        <PanelFrame as="div" className="p-4 md:p-10">
          <KanjiMorph
            label={c.morphLabel}
            hint={c.morphHint}
            playLabel={c.play}
            pauseLabel={c.pause}
          />
        </PanelFrame>
      </section>

      <section className="container-ink grid gap-8 md:grid-cols-2">
        {c.pairs.map((p, i) => (
          <PanelFrame
            key={p.word}
            as="article"
            className="flex flex-col gap-5 p-6 md:p-8"
            tilt={i ? 0.6 : -0.6}
          >
            <header className="flex items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
              <span lang="ja" className="jp text-7xl leading-none md:text-8xl">
                {p.word}
              </span>
              <span className="text-right">
                <span className="t-label block">{p.reading}</span>
                <span className="text-2xl font-bold">{p.meaning}</span>
              </span>
            </header>
            <ul className="grid grid-cols-2 gap-4">
              {p.chars.map((ch) => (
                <li
                  key={ch.c}
                  className="group border-2 border-ink p-3 transition-colors hover:bg-ink hover:text-paper"
                >
                  <span
                    lang="ja"
                    className="jp block text-5xl leading-none transition-transform duration-300 group-hover:scale-110"
                  >
                    {ch.c}
                  </span>
                  <span className="t-label mt-2 block">{ch.r}</span>
                  <span className="mt-1 block text-base">{ch.m}</span>
                </li>
              ))}
            </ul>
            <RichText text={p.note} className="text-lg" />
          </PanelFrame>
        ))}
      </section>

      <section className="container-ink mt-16 grid gap-6 md:grid-cols-[1fr_2fr]">
        <h2 className="text-4xl">{c.wordplayTitle}</h2>
        <Paragraphs items={c.wordplay} className="max-w-prose text-lg" />
      </section>

      <section className="container-ink mt-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-4xl">{c.homophonesTitle}</h2>
          <Tag kind="fan" />
        </div>
        <p className="mb-8 max-w-prose text-lg text-ink-soft">{c.homophonesNote}</p>
        <ul className="grid gap-5 md:grid-cols-3">
          {c.homophones.map((h) => (
            <li key={h.word} className="chaos-panel panel flex flex-col gap-3 p-5">
              <span lang="ja" className="jp text-6xl leading-none">
                {h.word}
              </span>
              <span className="text-2xl font-bold">
                <GlossaryTerm termId={h.id}>{h.meaning}</GlossaryTerm>
              </span>
              <span className="text-lg text-ink-soft">{h.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
