import { PageHeader } from '@/components/layout/PageHeader';
import { Paragraphs, RichText } from '@/components/ui/RichText';
import { ShikakuFigure, YugeruFigure } from '@/assets/Silhouettes';
import en from '@/content/en/characters.json';
import id from '@/content/id/characters.json';
import { Spoiler } from '@/features/spoiler-ink/Spoiler';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { FlipCard } from './FlipCard';
import { WikiNav } from './WikiNav';

type Character = (typeof id.characters)[number];

function Fields({ fields }: { fields: Character['fields'] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-sm">
      {fields.map((f) => (
        <div key={f.k} className="contents">
          <dt className="uppercase tracking-wider text-ink-soft">{f.k}</dt>
          <dd>
            <RichText as="span" text={f.v} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ContractFront({ c }: { c: Character }) {
  return (
    <article className="doc-contract panel relative flex h-full flex-col gap-5 p-6 md:p-8">
      <header className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
        <div>
          <p className="t-label">{c.docTitle}</p>
          <h2 className="t-yugeru mt-1 text-5xl">{c.name}</h2>
        </div>
        <span lang="ja" className="jp text-4xl">
          {c.jp}
        </span>
      </header>
      <div className="grid gap-6 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto w-[150px] border-2 border-ink bg-paper-deep p-2">
          <YugeruFigure figureStyle="hatch" boredom={0.75} className="h-auto w-full" />
        </div>
        <Fields fields={c.fields} />
      </div>
      <Paragraphs items={c.frontBody} className="t-yugeru text-xl" />
      <span
        aria-hidden="true"
        className="t-label absolute bottom-6 right-6 rotate-[-12deg] border-[3px] border-ink px-3 py-1 text-base opacity-80"
      >
        {c.stamp}
      </span>
    </article>
  );
}

function WantedFront({ c }: { c: Character }) {
  return (
    <article className="doc-wanted relative flex h-full flex-col gap-5 border-[3px] border-ink p-6 md:p-8">
      <header className="text-center">
        <p className="t-shikaku text-5xl tracking-widest md:text-6xl">{c.docTitle.split('·')[0]}</p>
        <p className="t-label mt-1">{c.docTitle.split('·')[1]}</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto w-[150px] rotate-[-3deg] border-[3px] border-ink bg-paper p-2 shadow-[4px_4px_0_var(--ink)]">
          <ShikakuFigure figureStyle="ink" className="h-auto w-full" />
          <span
            aria-hidden="true"
            className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 bg-ink/20"
          />
        </div>
        <div className="flex flex-col gap-3">
          <p className="t-shikaku text-5xl">
            {c.name}{' '}
            <span lang="ja" className="jp text-3xl">
              {c.jp}
            </span>
          </p>
          <Fields fields={c.fields} />
        </div>
      </div>
      <Paragraphs items={c.frontBody} className="text-lg" />
      <ul className="t-scrawl flex flex-wrap gap-x-5 text-2xl" aria-label="quirks">
        {c.quirks.map((q) => (
          <li key={q}>✗ {q}</li>
        ))}
      </ul>
      <span
        aria-hidden="true"
        className="t-shikaku absolute right-4 top-24 rotate-[14deg] border-[3px] border-ink px-2 text-lg"
      >
        {c.stamp}
      </span>
    </article>
  );
}

function Back({ c, contract }: { c: Character; contract: boolean }) {
  return (
    <article
      className={`panel flex h-full flex-col gap-5 p-6 md:p-8 ${contract ? 'bg-ink text-paper' : 'bg-paper'}`}
    >
      <p className="t-label opacity-80">{c.name}</p>
      <h3 className={contract ? 't-yugeru text-4xl' : 't-shikaku text-4xl'}>{c.backTitle}</h3>
      <Spoiler label={c.backTitle}>
        <Paragraphs items={c.backBody} className="text-lg" />
      </Spoiler>
      {contract && (
        <ul className="mt-auto flex flex-wrap gap-2">
          {c.quirks.map((q) => (
            <li key={q} className="t-label border border-paper/60 px-2 py-1">
              {q}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function Characters() {
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.2);
  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="人物" lede={c.lede} />
      <WikiNav />
      <section className="container-ink grid gap-8 py-12 lg:grid-cols-[1fr_1.4fr]">
        <Paragraphs items={c.intro} className="max-w-prose text-lg" />
        <p className="t-label self-end text-ink-soft">{c.flipHint}</p>
      </section>
      <section className="container-ink grid gap-12 md:grid-cols-2">
        {c.characters.map((ch) => (
          <FlipCard
            key={ch.id}
            label={ch.name}
            frontLabel={c.front}
            backLabel={c.back}
            front={ch.style === 'contract' ? <ContractFront c={ch} /> : <WantedFront c={ch} />}
            back={<Back c={ch} contract={ch.style === 'contract'} />}
          />
        ))}
      </section>
      <section className="container-ink mt-20 grid gap-6 md:grid-cols-[1fr_2fr]">
        <h2 className="text-4xl">{c.dynamicsTitle}</h2>
        <Paragraphs items={c.dynamics} className="max-w-prose text-lg" />
      </section>
    </main>
  );
}
