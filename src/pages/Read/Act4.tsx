import { forwardRef, useRef } from 'react';
import { OfficialFigure } from '@/components/ui/OfficialFigure';
import { Paragraphs } from '@/components/ui/RichText';
import { Tag, type TagKind } from '@/components/ui/Tag';
import { covers, images, RIGHTS } from '@/config/images';
import { BeforeAfterSlider } from '@/features/before-after-slider/BeforeAfterSlider';
import { useLang } from '@/hooks/useProviders';
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
  const { lang } = useLang();
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
            <OfficialFigure
              image={images.mangaTitle}
              className="mx-auto w-full max-w-xs"
              imgClassName="border-[3px] border-ink"
              caption="シカク · Jump SQ.19 · 2014"
              sizes="320px"
            />
          </figure>
        </article>

        {/* Panel 2 */}
        <article
          data-reveal
          className="grid gap-8 border-t-[3px] border-ink pt-8 lg:grid-cols-[1.2fr_1fr]"
        >
          <figure className="order-2 grid grid-cols-2 items-end gap-6 bg-paper-deep/60 p-6 lg:order-1">
            <div className="flex flex-col items-center gap-2">
              <img
                src={images.charaYugeru.small}
                width={480}
                height={640}
                alt={images.charaYugeru.alt[lang]}
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-[12rem]"
              />
              <span className="t-label">Yugeru · Shikaku (2014)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                src={covers['Fire Punch']}
                width={360}
                height={565}
                alt="Fire Punch vol. 1"
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-[10rem] border-[3px] border-ink"
              />
              <span className="t-label">Agni · Fire Punch (2016)</span>
            </div>
            <figcaption className="t-label col-span-2 text-[0.6rem] text-ink-soft">
              {RIGHTS.anime} · {RIGHTS.manga}
            </figcaption>
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
            credit={`${RIGHTS.manga} · ${RIGHTS.anime}`}
            before={
              <img
                src={images.mangaTitle.src}
                width={764}
                height={1200}
                alt={images.mangaTitle.alt[lang]}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block aspect-[2/3] w-full object-cover"
              />
            }
            after={
              <img
                src={images.animeKv.src}
                width={1080}
                height={1519}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-full w-full object-cover"
              />
            }
          />
        </article>
      </div>
    </section>
  );
});
