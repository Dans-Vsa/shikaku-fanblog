import { useState } from 'react';
import { ShikakuFigure } from '@/assets/Silhouettes';
import { PlayIcon } from '@/components/ui/icons';
import { media } from '@/config/media';

interface TrailerEmbedProps {
  playLabel: string;
  facadeLabel: string;
  title: string;
}

/**
 * Embed trailer resmi dengan facade. Sebelum diklik: poster TV buatan sendiri
 * (tanpa thumbnail resmi, tanpa request ke YouTube). Setelah diklik: iframe
 * youtube-nocookie dengan autoplay. Nol biaya performa sampai pengguna memilih.
 */
export function TrailerEmbed({ playLabel, facadeLabel, title }: TrailerEmbedProps) {
  const [active, setActive] = useState(false);
  const id = media.shikakuTrailer.youtubeId;

  if (active) {
    return (
      <div className="relative aspect-video w-full border-[3px] border-ink bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={playLabel}
      data-cursor="link"
      className="group relative block aspect-video w-full overflow-hidden border-[3px] border-ink bg-ink text-paper"
    >
      {/* poster TV buatan sendiri */}
      <span
        className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,rgb(255_255_255/0.12)_0_1px,transparent_1px_4px)]"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-0 right-[8%] h-[92%] w-auto opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <ShikakuFigure figureStyle="ink" className="h-full w-auto [filter:invert(1)]" />
      </span>
      <span
        lang="ja"
        className="jp absolute left-[6%] top-[10%] text-[clamp(3rem,10vw,7rem)] leading-none"
        aria-hidden="true"
      >
        シカク
      </span>
      <span className="t-label absolute bottom-[10%] left-[6%] border-2 border-paper px-2 py-1">
        {facadeLabel}
      </span>
      <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-paper bg-ink transition-transform duration-300 ease-snap group-hover:scale-110 group-active:scale-95">
        <PlayIcon size={34} />
      </span>
    </button>
  );
}
