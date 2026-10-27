import { images } from '@/config/images';
import { useLang } from '@/hooks/useProviders';

/** Desain karakter resmi anime (Shikaku / Yugeru), latar transparan. */
export function CharaPortrait({
  who,
  className = '',
}: {
  who: 'shikaku' | 'yugeru';
  className?: string;
}) {
  const { lang } = useLang();
  const img = who === 'shikaku' ? images.charaShikaku : images.charaYugeru;
  return (
    <img
      src={img.small}
      srcSet={`${img.small} 480w, ${img.src} 900w`}
      sizes="(min-width: 768px) 220px, 40vw"
      width={480}
      height={640}
      alt={img.alt[lang]}
      loading="lazy"
      decoding="async"
      className={`block aspect-[1/2] h-auto w-full object-cover ${className}`}
    />
  );
}
