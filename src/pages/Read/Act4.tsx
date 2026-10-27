import { forwardRef, useRef } from 'react';
import { BurningFigure } from '@/assets/Illustrations';
import { ShikakuFigure, YugeruFigure } from '@/assets/Silhouettes';
import { Paragraphs } from '@/components/ui/RichText';
import { Tag, type TagKind } from '@/components/ui/Tag';
import { BeforeAfterSlider } from '@/features/before-after-slider/BeforeAfterSlider';
import { useReveal } from '@/hooks/useReveal';
import type { ReadContent } from './types';
import { ActHeader } from './ActHeader';

/**
 * Babak 4 — ruang arsip/galeri kurasi. Ritme sengaja berbeda: putih bersih,
 * grid museum, label plakat, tanpa kemiringan. Tiga panel bedah DNA Fujimoto.
 */
export const Act4 = forwardRef<HTMLElement, { c: ReadContent['act4'] }>(function Act4({ c }, ref) {
  const scope = useRef<HTMLDivElement>(null);
  useReveal(scope, { y: 20, stagger: 0.1 });
  const [unhinged, immortal, evolution] = c.panels;

  return (
    <section ref={ref} id="act-4" aria-labelledby="act-4-title" className="relative bg-paper py-10">
      <ActHeader label={c.label} title={c.title} jp={c.jp} variant="gallery" id="act-4-title" />
      <div ref={scope} className="container-ink flex flex-col gap-24">
        <p data-reveal className="max-w-2xl text-xl text-ink-soft md:text-2xl">
          {c.intro}
        </p>

        {/* Panel 1 */}
        <article
          data-reveal
          className="grid gap-8 border-t-[3px] border-ink pt-8 lg:grid-cols-[1fr_1.2fr]"
        >
          <div className="flex flex-col gap-4">
            <p className="t-label">01 · {unhinged.id}</p>
            <h3 className="text-4xl">{unhinged.title}</h3>
            <Tag kind={unhinged.kind as TagKind} className="self-start" />
            <Paragraphs items={unhinged.body} className="max-w-prose text-lg" />
          </div>
          <figure className="flex flex-col justify-center gap-4 bg-paper-deep/60 p-6">
            <ol className="flex flex-wrap items-center gap-2">
              {unhinged.chain?.map((name, i) => (
                <li key={name} className="flex items-center gap-2">
                  <span
                    className={`t-label border-2 border-ink px-3 py-2 ${i === 0 ? 'bg-ink text-paper' : 'bg-paper'}`}
                  >
                    {name}
                  </span>
                  {i < (unhinged.chain?.length ?? 0) - 1 && <span aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
            <div className="mx-auto w-40">
              <ShikakuFigure figureStyle="ink" className="h-auto w-full" />
            </div>
            <figcaption className="t-label text-center text-ink-soft">シカク · 2014</figcaption>
          </figure>
        </article>

        {/* Panel 2 */}
        <article
          data-reveal
          className="grid gap-8 border-t-[3px] border-ink pt-8 lg:grid-cols-[1.2fr_1fr]"
        >
          <figure className="order-2 grid grid-cols-2 items-end gap-6 bg-paper-deep/60 p-6 lg:order-1">
            <div className="flex flex-col items-center gap-2">
              <YugeruFigure figureStyle="hatch" boredom={1} className="h-auto w-28" />
              <span className="t-label">Yugeru · 2014</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BurningFigure className="h-auto w-28" />
              <span className="t-label">Agni · 2016</span>
            </div>
          </figure>
          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <p className="t-label">02 · {immortal.id}</p>
            <h3 className="text-4xl">{immortal.title}</h3>
            <Tag kind={immortal.kind as TagKind} className="self-start" />
            <Paragraphs items={immortal.body} className="max-w-prose text-lg" />
          </div>
        </article>

        {/* Panel 3 */}
        <article
          data-reveal
          className="grid gap-8 border-t-[3px] border-ink pt-8 lg:grid-cols-[1fr_1.2fr]"
        >
          <div className="flex flex-col gap-4">
            <p className="t-label">03 · {evolution.id}</p>
            <h3 className="text-4xl">{evolution.title}</h3>
            <Tag kind={evolution.kind as TagKind} className="self-start" />
            <Paragraphs items={evolution.body} className="max-w-prose text-lg" />
          </div>
          <BeforeAfterSlider
            label={evolution.title}
            beforeLabel={c.sliderBefore}
            afterLabel={c.sliderAfter}
            className="mx-auto w-full max-w-md bg-paper"
            before={
              <div className="halftone flex justify-center bg-paper p-6">
                <ShikakuFigure figureStyle="hatch" className="h-auto w-56" />
              </div>
            }
            after={
              <div className="flex h-full justify-center bg-gradient-to-b from-paper to-paper-deep p-6">
                <ShikakuFigure figureStyle="cel" className="h-auto w-56" />
              </div>
            }
          />
        </article>
      </div>
    </section>
  );
});
