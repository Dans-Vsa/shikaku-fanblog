import { useState } from 'react';
import { images } from '@/config/images';
import { PlayIcon } from '@/components/ui/icons';
import { media } from '@/config/media';

interface TrailerEmbedProps {
  playLabel: string;
  facadeLabel: string;
  title: string;
}

/**
 * Embed trailer resmi dengan facade. Sebelum diklik: frame resmi PV (di-host sendiri,
 * tanpa request ke YouTube). Setelah diklik: iframe
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
      {/* poster = frame resmi Special PV (thumbnail YouTube avex pictures) */}
      <img
        src={images.animePv.src}
        srcSet={`${images.animePv.small} 640w, ${images.animePv.src} 1280w`}
        sizes="(min-width: 1024px) 60vw, 95vw"
        width={1280}
        height={720}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span
        className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,rgb(0_0_0/0.25)_0_1px,transparent_1px_4px)]"
        aria-hidden="true"
      />
      <span className="t-label absolute bottom-[10%] left-[6%] border-2 border-paper px-2 py-1">
        {facadeLabel}
      </span>
      <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-paper bg-ink transition-transform duration-300 ease-snap group-hover:scale-110 group-active:scale-95">
        <PlayIcon size={34} />
      </span>
    </button>
  );
}
