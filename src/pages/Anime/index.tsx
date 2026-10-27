import { useTranslation } from 'react-i18next';
import { ShikakuFigure, YugeruFigure } from '@/assets/Silhouettes';
import { PageHeader } from '@/components/layout/PageHeader';
import { PanelFrame } from '@/components/manga/PanelFrame';
import { ExternalButton } from '@/components/ui/Button';
import { ExternalIcon } from '@/components/ui/icons';
import { Paragraphs } from '@/components/ui/RichText';
import { Tag } from '@/components/ui/Tag';
import { media } from '@/config/media';
import en from '@/content/en/anime.json';
import id from '@/content/id/anime.json';
import { BeforeAfterSlider } from '@/features/before-after-slider/BeforeAfterSlider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { TrailerEmbed } from './TrailerEmbed';

function Pair({ style }: { style: 'hatch' | 'cel' }) {
  return (
    <div
      className={`flex items-end justify-center gap-4 p-6 ${style === 'hatch' ? 'halftone bg-paper' : 'bg-gradient-to-b from-paper to-paper-deep'}`}
    >
      <ShikakuFigure figureStyle={style} className="h-auto w-[38%]" />
      <YugeruFigure figureStyle={style} boredom={0.7} className="h-auto w-[38%]" />
    </div>
  );
}

export default function Anime() {
  const { t } = useTranslation();
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.3);

  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="二つの息" lede={c.lede} />

      <section className="container-ink grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="t-label">{c.trailerTitle}</h2>
          <TrailerEmbed
            playLabel={c.play}
            facadeLabel={c.facadeLabel}
            title={media.shikakuTrailer.title}
          />
          <p className="text-base text-ink-soft">{c.trailerNote}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a
                href={media.shikakuTrailer.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink inline-flex items-center gap-2"
              >
                {c.trailerYoutube} <ExternalIcon size={16} />
                <span className="sr-only">{t('common.external')}</span>
              </a>
            </li>
            <li>
              <a
                href={media.trailerFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink inline-flex items-center gap-2"
              >
                {c.trailerFallback} <ExternalIcon size={16} />
                <span className="sr-only">{t('common.external')}</span>
              </a>
            </li>
          </ul>
        </div>

        <PanelFrame as="aside" className="flex h-fit flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl">{c.infoTitle}</h2>
            <Tag kind="fact" />
          </div>
          <dl className="grid gap-3">
            {c.info.map((row) => (
              <div
                key={row.k}
                className="grid gap-1 border-b-2 border-ink/15 pb-2 sm:grid-cols-[8rem_1fr]"
              >
                <dt className="t-label pt-1 text-ink-soft">{row.k}</dt>
                <dd className="text-lg">{row.v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3">
            <ExternalButton
              href={media.primeVideo.us}
              variant="ink"
              srExternal={t('common.external')}
            >
              {c.primeCta}
            </ExternalButton>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <a
                href={media.primeVideo.jp}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink inline-flex items-center gap-1 text-base"
              >
                {c.primeJp} <ExternalIcon size={14} />
              </a>
              <a
                href={media.officialAnimeSite}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink inline-flex items-center gap-1 text-base"
              >
                {c.officialSite} <ExternalIcon size={14} />
              </a>
            </div>
          </div>
          <p className="text-sm text-ink-soft">{c.factsNote}</p>
        </PanelFrame>
      </section>

      <section className="container-ink mt-24 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl">{c.sliderTitle}</h2>
          <p className="max-w-prose text-lg">{c.sliderBody}</p>
        </div>
        <BeforeAfterSlider
          label={c.sliderTitle}
          beforeLabel={c.sliderBefore}
          afterLabel={c.sliderAfter}
          before={<Pair style="hatch" />}
          after={<Pair style="cel" />}
          className="bg-paper"
        />
      </section>

      <section className="container-ink mt-24">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <h2 className="text-4xl">{c.compareTitle}</h2>
          <Tag kind="opinion" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {c.compare.map((col, i) => (
            <PanelFrame
              key={col.title}
              as="article"
              chaotic
              tilt={[-0.5, 0.4, -0.2][i]}
              className="p-6"
            >
              <h3 className="mb-4 text-2xl">{col.title}</h3>
              <Paragraphs items={col.body} className="text-base" />
            </PanelFrame>
          ))}
        </div>
      </section>

      <section className="container-ink mt-20">
        <div className="max-w-3xl border-l-[6px] border-ink pl-4">
          <h2 className="t-label mb-2">{c.copyrightTitle}</h2>
          <p className="text-base text-ink-soft">{c.copyright}</p>
        </div>
      </section>
    </main>
  );
}
