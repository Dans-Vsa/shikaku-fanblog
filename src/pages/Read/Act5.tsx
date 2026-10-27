import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { ArrowIcon } from '@/components/ui/icons';
import { RichText } from '@/components/ui/RichText';
import { CrtScreen } from '@/features/crt-effect/CrtScreen';
import { TransitionLink } from '@/features/page-transition/TransitionLink';
import { useSpoiler } from '@/hooks/useSpoiler';
import { ScrollTrigger } from '@/lib/gsap-setup';
import type { ReadContent } from './types';
import { ActHeader } from './ActHeader';

/**
 * Babak 5 — pembajakan siaran. Seluruh layar berubah dari kertas manga menjadi
 * monitor TV yang dibajak (shader CRT). Progres scroll → satu angka 0..1 yang
 * dibaca loop render; React tidak re-render per frame.
 */
export const Act5 = forwardRef<HTMLElement, { c: ReadContent['act5'] }>(function Act5({ c }, ref) {
  const { hidden, setHidden } = useSpoiler();
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress;
      },
      onLeave: () => {
        progress.current = 1;
      },
      onLeaveBack: () => {
        progress.current = 0;
      },
    });
    return () => st.kill();
  }, []);

  const strip = (s: string) => s.replace(/\{\{s:(.*)\}\}/, '$1');
  const text = useMemo(
    () => ({
      channel: c.channel,
      lowerThird: c.lowerThird,
      signalLost: c.signalLost,
      hijack: c.hijack,
      confession: c.screenConfession,
      answer: c.screenAnswer,
      censored: c.screenCensored,
      morphNote: c.morphNote,
    }),
    [c],
  );

  return (
    <section ref={ref} id="act-5" aria-labelledby="act-5-title" className="relative">
      <ActHeader label={c.label} title={c.title} jp={c.jp} variant="tv" id="act-5-title" />
      <p className="container-ink t-yugeru -mt-6 mb-10 text-2xl md:text-3xl">{c.intro}</p>

      {/* Isi siaran untuk pembaca layar & tanpa animasi (canvas aria-hidden) */}
      <div className="sr-only">
        <p>{c.hijack}</p>
        <ul>
          {c.confession.map((l) => (
            <li key={l}>
              <RichText as="span" text={l} />
            </li>
          ))}
        </ul>
        <p>
          {c.morphCaption} — {c.morphNote}
        </p>
        <ul>
          {c.answer.map((l) => (
            <li key={l}>{hidden ? c.screenCensored : strip(l)}</li>
          ))}
        </ul>
      </div>

      <div ref={track} className="relative h-[680vh]">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <CrtScreen progress={progress} text={text} censored={hidden} />
          {hidden && (
            <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2 px-4 text-center">
              <p className="t-label bg-black/70 px-2 py-1 text-crt">{c.censoredHint}</p>
              <button
                type="button"
                onClick={() => setHidden(false)}
                className="t-label border-2 border-crt bg-black px-4 py-2 text-crt transition-colors hover:bg-crt hover:text-black"
              >
                {c.revealCta}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-ink flex flex-col gap-10 py-24">
        <p className="t-yugeru max-w-3xl text-3xl md:text-4xl">
          <RichText as="span" text={hidden ? `{{s:${c.ending}}}` : c.ending} />
        </p>
        <div>
          <h3 className="t-label mb-4">{c.ctaTitle}</h3>
          <ul className="grid gap-4 md:grid-cols-3">
            {c.ctas.map((cta) => (
              <li key={cta.to}>
                <TransitionLink
                  to={cta.to}
                  data-cursor="card"
                  className="panel group flex h-full flex-col gap-2 p-6 transition-transform duration-300 ease-snap hover:-translate-y-1"
                >
                  <span className="text-3xl font-bold">{cta.label}</span>
                  <span className="text-lg text-ink-soft">{cta.body}</span>
                  <ArrowIcon className="mt-auto transition-transform group-hover:translate-x-2" />
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});
