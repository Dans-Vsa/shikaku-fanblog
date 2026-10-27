import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExternalIcon } from '@/components/ui/icons';
import { Paragraphs } from '@/components/ui/RichText';
import en from '@/content/en/official.json';
import id from '@/content/id/official.json';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { covers, images, RIGHTS } from '@/config/images';

export default function OfficialLinks() {
  const { t } = useTranslation();
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.05);
  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="公式" lede={c.lede} />
      <section className="container-ink pb-12">
        <Paragraphs items={c.why} className="max-w-prose text-lg" />
      </section>
      <section className="container-ink grid gap-10 md:grid-cols-2">
        {c.groups.map((g, gi) => (
          <div key={g.title}>
            <h2 className="mb-5 border-b-[3px] border-ink pb-2 text-3xl">{g.title}</h2>
            <figure className="mb-5 flex items-end gap-4">
              <img
                src={gi === 0 ? covers['17-21'] : images.animeKv.small}
                width={gi === 0 ? 360 : 600}
                height={gi === 0 ? 565 : 844}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-48 w-auto border-[3px] border-ink shadow-[5px_5px_0_var(--ink)]"
              />
              <figcaption className="t-label text-[0.6rem] text-ink-soft">
                {gi === 0 ? RIGHTS.manga : RIGHTS.anime}
              </figcaption>
            </figure>
            <ul className="flex flex-col gap-4">
              {g.items.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="link"
                    className="panel group flex items-start justify-between gap-4 p-5 transition-transform duration-200 ease-snap hover:-translate-y-1"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-xl font-bold">{item.label}</span>
                      <span className="text-base text-ink-soft">{item.note}</span>
                      <span className="t-label break-all text-ink-soft">
                        {new URL(item.url).host}
                      </span>
                    </span>
                    <ExternalIcon className="mt-1 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="sr-only">{t('common.external')}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <p className="container-ink t-label mt-10 text-ink-soft">{c.regionNote}</p>
    </main>
  );
}
