import { forwardRef } from 'react';
import { MealIllustration } from '@/assets/Illustrations';
import { Tag } from '@/components/ui/Tag';
import { SplitMontage } from '@/features/split-screen/SplitMontage';
import type { ReadContent } from './types';
import { ActHeader } from './ActHeader';

/**
 * Babak 2 — montase cepat, absurd, repetitif. Layar terbelah dua sisi yang
 * bertolak belakang (Shikaku: obsesi kekanak-kanakan; Yugeru: kebosanan yang
 * mencair), lalu menyatu dalam satu adegan simbolik.
 */
export const Act2 = forwardRef<HTMLElement, { c: ReadContent['act2']; dayLabel: string }>(
  function Act2({ c, dayLabel }, ref) {
    return (
      <section ref={ref} id="act-2" aria-labelledby="act-2-title" className="relative">
        <ActHeader label={c.label} title={c.title} jp={c.jp} variant="chaos" id="act-2-title" />
        <div className="container-ink -mt-8 mb-6 flex flex-wrap items-center gap-3">
          <Tag kind="dramatized" />
          <p className="t-label text-ink-soft">{c.numberNote}</p>
        </div>
        <p className="container-ink t-shikaku mb-10 text-2xl md:text-4xl">{c.intro}</p>
        <SplitMontage
          leftTitle={c.shikakuSide}
          rightTitle={c.yugeruSide}
          left={c.shikaku}
          right={c.yugeru}
          dayLabel={dayLabel}
          merge={
            <figure className="panel flex flex-col gap-4 p-5 md:p-8">
              <MealIllustration className="h-auto w-full" />
              <figcaption className="flex flex-col gap-2">
                <span className="t-label">{c.merge.title}</span>
                <span className="t-yugeru text-xl md:text-2xl">{c.merge.body}</span>
                <span className="t-label text-ink-soft">{c.merge.caption}</span>
              </figcaption>
            </figure>
          }
        />
      </section>
    );
  },
);
