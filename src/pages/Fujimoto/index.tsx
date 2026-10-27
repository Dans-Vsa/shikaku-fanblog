import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExternalButton } from '@/components/ui/Button';
import { network } from '@/config/site';
import { Paragraphs } from '@/components/ui/RichText';
import { Tag } from '@/components/ui/Tag';
import en from '@/content/en/fujimoto.json';
import id from '@/content/id/fujimoto.json';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { gsap } from '@/lib/gsap-setup';
import { covers, RIGHTS } from '@/config/images';

function coverFor(e: { title: string; kind: string }) {
  if (covers[e.title]) return covers[e.title];
  if (e.kind === 'book') return covers['17-21'];
  if (e.title.includes('17-26')) return covers['17-26'];
  return undefined;
}

type Event = (typeof id.events)[number];

function EventCard({ e, index, kind }: { e: Event; index: number; kind: string }) {
  const star = e.kind === 'star';
  return (
    <li
      className={`relative flex w-[19rem] shrink-0 flex-col gap-3 border-[3px] border-ink p-5 md:w-[22rem] ${
        star
          ? 'bg-ink text-paper shadow-[8px_8px_0_rgb(var(--ink-rgb)/0.35)]'
          : 'bg-paper shadow-[6px_6px_0_var(--ink)]'
      }`}
      style={{ transform: `rotate(${star ? -1.5 : index % 2 ? 0.6 : -0.4}deg)` }}
    >
      {coverFor(e) && (
        <img
          src={coverFor(e)}
          alt=""
          width={360}
          height={565}
          loading="lazy"
          decoding="async"
          className={`h-44 w-full border-2 object-cover ${star ? 'border-paper' : 'border-ink'} ${e.title.includes('17-26') ? 'object-center' : 'object-top'}`}
        />
      )}
      <span className={`t-label ${star ? 'text-paper/80' : 'text-ink-soft'}`}>{kind}</span>
      <span className="text-5xl font-bold leading-none">{e.year}</span>
      <span className={`${star ? 't-shikaku text-3xl' : 'text-2xl font-bold'} leading-tight`}>
        {e.title}
      </span>
      <span className="text-base opacity-90">{e.body}</span>
      {star && (
        <span
          aria-hidden="true"
          className="t-shikaku absolute -right-3 -top-4 rotate-12 border-2 border-paper bg-ink px-2 text-lg"
        >
          ★
        </span>
      )}
    </li>
  );
}

/**
 * Timeline horizontal: section setinggi N layar, isi sticky, track bergeser
 * horizontal mengikuti scroll (transform saja). Mobile/reduced motion: daftar vertikal.
 */
export default function Fujimoto() {
  const { t } = useTranslation();
  const c = useLocalized({ id, en });
  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 768px)');
  const horizontal = wide && !reduced;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  useDocumentTitle(c.title);
  useScrollChaos(0.35);

  useEffect(() => {
    if (!horizontal || !section.current || !track.current) return;
    const ctx = gsap.context(() => {
      gsap.to(track.current, {
        x: () => -(track.current!.scrollWidth - window.innerWidth + 64),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, [horizontal]);

  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="藤本" lede={c.lede} />
      <section className="container-ink pb-10">
        <Paragraphs items={c.intro} className="max-w-prose text-lg" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag kind="fact" />
          <p className="t-label text-[0.6rem] text-ink-soft">{RIGHTS.manga}</p>
          {horizontal && <p className="t-label text-ink-soft">{c.hint}</p>}
        </div>
      </section>

      {horizontal ? (
        <section
          ref={section}
          className="relative"
          style={{ height: `${c.events.length * 32 + 100}vh` }}
          aria-label={c.title}
        >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-[3px] bg-ink" aria-hidden="true" />
            <ol
              ref={track}
              className="relative flex items-center gap-10 px-16 will-change-transform"
            >
              {c.events.map((e, i) => (
                <EventCard
                  key={e.title}
                  e={e}
                  index={i}
                  kind={c.kinds[e.kind as keyof typeof c.kinds]}
                />
              ))}
            </ol>
          </div>
        </section>
      ) : (
        <section className="container-ink" aria-label={c.title}>
          <ol className="flex flex-col gap-6 border-l-[3px] border-ink pl-6">
            {c.events.map((e, i) => (
              <EventCard
                key={e.title}
                e={e}
                index={i}
                kind={c.kinds[e.kind as keyof typeof c.kinds]}
              />
            ))}
          </ol>
        </section>
      )}

      <section className="container-ink mt-24">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="t-display">{c.dnaTitle}</h2>
          <Tag kind="fan" />
        </div>
        <p className="mb-10 max-w-prose text-xl text-ink-soft">{c.dnaLede}</p>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.dna.map((d) => (
            <li key={d.title} className="chaos-panel panel flex flex-col gap-3 p-6">
              <span lang="ja" className="jp text-6xl leading-none" aria-hidden="true">
                {d.jp}
              </span>
              <h3 className="text-2xl">{d.title}</h3>
              <p className="text-base">{d.body}</p>
              <p className="t-scrawl mt-auto border-t-2 border-dashed border-ink/40 pt-3 text-2xl">
                → {d.inShikaku}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section className="container-ink mt-24" aria-labelledby="network-title">
        <div className="panel flex flex-col gap-5 p-6 md:p-10">
          <h2 id="network-title" className="text-4xl">
            {c.networkTitle}
          </h2>
          <p className="max-w-prose text-lg">{c.networkBody}</p>
          <div className="flex flex-wrap gap-4">
            <ExternalButton href={network.archive} variant="ink">
              {t('footer.archive')}
            </ExternalButton>
            <ExternalButton href={network.hub}>{t('footer.hub')}</ExternalButton>
          </div>
        </div>
      </section>
    </main>
  );
}
