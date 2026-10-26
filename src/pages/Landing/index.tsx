import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { InkBlot } from '@/components/manga/InkBlot';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { ButtonLink } from '@/components/ui/Button';
import { ArrowIcon } from '@/components/ui/icons';
import { Paragraphs } from '@/components/ui/RichText';
import en from '@/content/en/landing.json';
import id from '@/content/id/landing.json';
import { ExecutionSim } from '@/features/execution-sim/ExecutionSim';
import { TransitionLink } from '@/features/page-transition/TransitionLink';
import { transitionStore } from '@/features/page-transition/transition-store';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { useSpoiler } from '@/hooks/useSpoiler';
import { gsap } from '@/lib/gsap-setup';

export default function Landing() {
  const c = useLocalized({ id, en });
  const { t } = useTranslation();
  const { setHidden } = useSpoiler();
  const reduced = useReducedMotion();
  const hero = useRef<HTMLDivElement>(null);
  useDocumentTitle('');
  useScrollChaos(0.55, 0.4);

  // Hook muncul seperti dua panel yang dicap ke kertas.
  useEffect(() => {
    if (reduced || !hero.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hook]', {
        yPercent: 60,
        opacity: 0,
        rotate: (i: number) => (i ? 3 : -2),
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.18,
        delay: 0.15,
      });
      gsap.from('[data-hero-fade]', { opacity: 0, y: 20, duration: 0.8, delay: 0.6, stagger: 0.1 });
    }, hero);
    return () => ctx.revert();
  }, [reduced]);

  const choose = (path: 'new' | 'fan') => {
    setHidden(path === 'new');
    void transitionStore.go(path === 'new' ? '/baca' : '/wiki');
  };

  return (
    <main id="main">
      <section
        ref={hero}
        className="container-ink relative grid gap-10 pb-16 pt-10 md:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
      >
        <InkBlot
          variant={0}
          className="pointer-events-none absolute -left-16 top-0 h-64 w-64 opacity-[0.06]"
        />
        <div className="relative flex flex-col gap-6 lg:sticky lg:top-24">
          <p className="t-label" data-hero-fade>
            {c.kicker}
          </p>
          <h1 className="flex flex-col gap-3">
            <span
              data-hook
              className="t-yugeru block text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.95]"
            >
              {c.hookA}
            </span>
            <span
              data-hook
              className="t-shikaku block -rotate-2 self-start bg-ink px-3 py-1 text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1] text-paper"
            >
              {c.hookB}
            </span>
          </h1>
          <p className="max-w-xl text-xl text-ink-soft md:text-2xl" data-hero-fade>
            {c.lede}
          </p>
          <div data-hero-fade className="flex items-center gap-4">
            <span lang="ja" className="jp text-5xl leading-none" aria-hidden="true">
              刺客
            </span>
            <span className="h-[3px] w-10 bg-ink" aria-hidden="true" />
            <span lang="ja" className="jp text-5xl leading-none text-ink/30" aria-hidden="true">
              資格
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-3" data-hero-fade>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="t-label">{c.simTitle}</h2>
          </div>
          <p className="t-scrawl text-2xl">{c.simLede}</p>
          <ExecutionSim onContinue={() => choose('new')} />
        </div>
      </section>

      <section className="container-ink py-16" aria-labelledby="paths-title">
        <h2 id="paths-title" className="t-display mb-10 max-w-[14ch]">
          {c.pathsTitle}
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {(['new', 'fan'] as const).map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => choose(p)}
              data-cursor="card"
              className={`chaos-panel group relative flex flex-col items-start gap-4 border-[3px] border-ink p-8 text-left shadow-[8px_8px_0_var(--ink)] transition-transform duration-300 ease-snap hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none ${
                i ? 'bg-ink text-paper shadow-[8px_8px_0_rgb(var(--ink-rgb)/0.35)]' : 'bg-paper'
              }`}
            >
              <span className="t-label opacity-70">{String(i + 1).padStart(2, '0')}</span>
              <span className={`${i ? 't-yugeru' : 't-shikaku'} text-4xl md:text-5xl`}>
                {c.paths[p].label}
              </span>
              <span className="max-w-md text-lg opacity-90">{c.paths[p].body}</span>
              <span className="t-label mt-2 inline-flex items-center gap-2">
                {c.paths[p].cta}
                <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="container-ink grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <h2 className="text-[clamp(2rem,4vw,3.4rem)]">{c.whyTitle}</h2>
        <Paragraphs items={c.why} className="max-w-prose text-xl" />
      </section>

      <section className="container-ink grid gap-6 md:grid-cols-3">
        {c.teasers.map((tz, i) => (
          <PanelFrame key={tz.to} as="article" chaotic tilt={[-0.8, 0.5, -0.3][i]} className="p-0">
            <TransitionLink
              to={tz.to}
              data-cursor="card"
              className="group flex h-full flex-col gap-3 p-6"
            >
              <span
                lang="ja"
                className="jp text-7xl leading-none transition-transform duration-500 ease-snap group-hover:-rotate-6 group-hover:scale-110"
                aria-hidden="true"
              >
                {tz.jp}
              </span>
              <span className="text-3xl font-bold">{tz.title}</span>
              <span className="text-lg text-ink-soft">{tz.body}</span>
              <ArrowIcon className="mt-auto transition-transform duration-300 group-hover:translate-x-2" />
            </TransitionLink>
          </PanelFrame>
        ))}
      </section>

      <section className="container-ink mt-16 flex flex-col items-start gap-4 border-t-[3px] border-ink pt-10 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl text-lg">{c.legal}</p>
        <ButtonLink to="/baca-resmi" variant="paper">
          {c.legalCta}
        </ButtonLink>
      </section>
      <span className="sr-only">{t('brand')}</span>
    </main>
  );
}
