import { forwardRef, useRef } from 'react';
import { ShikakuFigure, YugeruFigure } from '@/assets/Silhouettes';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { ExecutionSim } from '@/features/execution-sim/ExecutionSim';
import { useReveal } from '@/hooks/useReveal';
import { scrollToElement } from '@/lib/lenis-setup';
import type { ReadContent } from './types';
import { ActHeader } from './ActHeader';

/**
 * Babak 1 — dingin, formal, arsip kontrak. Grid kaku, banyak garis lurus,
 * nol kemiringan. Kontras karakter lalu simulasi eksekusi.
 */
export const Act1 = forwardRef<HTMLElement, { c: ReadContent['act1'] }>(function Act1({ c }, ref) {
  const scope = useRef<HTMLDivElement>(null);
  useReveal(scope, { y: 16, stagger: 0.12 });

  return (
    <section ref={ref} id="act-1" aria-labelledby="act-1-title" className="relative">
      <div ref={scope}>
        <ActHeader label={c.label} title={c.title} jp={c.jp} id="act-1-title" />

        <div className="container-ink grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-8">
            {c.lines.map((l) => (
              <p key={l} data-reveal className="t-yugeru max-w-xl text-2xl md:text-3xl">
                {l}
              </p>
            ))}
          </div>

          <PanelFrame
            as="article"
            className="doc-contract-lines p-6 md:p-8"
            label={c.contract.title}
          >
            <p className="t-label mb-4 border-b-2 border-ink pb-2" data-reveal>
              {c.contract.title}
            </p>
            <dl className="grid gap-2 font-mono text-sm md:text-base">
              {c.contract.fields.map((f) => (
                <div
                  key={f.k}
                  data-reveal
                  className="grid grid-cols-[7rem_1fr] border-b border-dashed border-ink/40 pb-1"
                >
                  <dt className="uppercase tracking-widest text-ink-soft">{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
            <p data-reveal className="t-yugeru mt-6 text-lg">
              {c.contract.clause}
            </p>
            <div data-reveal className="mt-6 flex items-end justify-between">
              <span className="t-scrawl text-3xl">Yugeru</span>
              <span className="t-shikaku rotate-[-8deg] text-3xl">シカク ✓</span>
            </div>
          </PanelFrame>
        </div>

        {/* kontras dua tokoh: grid kaku 50/50 dengan garis tinta tebal */}
        <div className="container-ink mt-20 grid grid-cols-2 border-y-[3px] border-ink">
          {(['yugeru', 'shikaku'] as const).map((k) => (
            <div
              key={k}
              className={`flex flex-col items-center gap-4 p-4 md:flex-row md:items-end md:p-8 ${
                k === 'yugeru' ? 'border-r-[3px] border-ink' : 'bg-ink text-paper'
              }`}
            >
              <div data-reveal className="w-24 shrink-0 md:w-36">
                {k === 'yugeru' ? (
                  <YugeruFigure figureStyle="hatch" boredom={0.9} className="h-auto w-full" />
                ) : (
                  <ShikakuFigure
                    figureStyle="ink"
                    className="h-auto w-full rounded-sm bg-paper p-1"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p
                  data-reveal
                  className={`${k === 'yugeru' ? 't-yugeru' : 't-shikaku'} text-3xl md:text-4xl`}
                >
                  {c.contrast[k].name}
                </p>
                <ul className="flex flex-col">
                  {c.contrast[k].lines.map((l) => (
                    <li
                      key={l}
                      data-reveal
                      className={
                        k === 'yugeru' ? 't-yugeru text-lg md:text-xl' : 't-scrawl text-2xl'
                      }
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* makna kanji pertama */}
        <div className="container-ink mt-20 grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <span lang="ja" data-reveal className="jp text-[clamp(6rem,16vw,12rem)] leading-none">
            {c.kanji.word}
          </span>
          <div data-reveal className="flex flex-col gap-2">
            <p className="t-label">{c.kanji.reading}</p>
            <p className="text-4xl font-bold">{c.kanji.meaning}</p>
            <p className="t-yugeru max-w-md text-xl">{c.kanji.note}</p>
          </div>
        </div>
      </div>

      <div className="container-ink mt-20 flex flex-col gap-4">
        <p className="t-shikaku text-2xl md:text-3xl">{c.simIntro}</p>
        <ExecutionSim onContinue={() => scrollToElement('#act-2')} />
        <p className="t-yugeru max-w-2xl text-xl">{c.simOutro}</p>
      </div>
    </section>
  );
});
