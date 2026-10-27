import { RIGHTS, type OfficialImage } from '@/config/images';
import { useLang } from '@/hooks/useProviders';

interface OfficialFigureProps {
  image: OfficialImage;
  className?: string;
  imgClassName?: string;
  /** tampilkan atribusi hak cipta di bawah gambar */
  credit?: boolean;
  sizes?: string;
  priority?: boolean;
  caption?: string;
}

/**
 * Gambar resmi dengan atribusi hak cipta. Lazy + decoding async kecuali `priority`.
 */
export function OfficialFigure({
  image,
  className = '',
  imgClassName = '',
  credit = true,
  sizes = '(min-width: 1024px) 40vw, 90vw',
  priority = false,
  caption,
}: OfficialFigureProps) {
  const { lang } = useLang();
  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <img
        src={image.src}
        srcSet={
          image.small
            ? `${image.small} ${Math.round(image.w / 2)}w, ${image.src} ${image.w}w`
            : undefined
        }
        sizes={image.small ? sizes : undefined}
        width={image.w}
        height={image.h}
        alt={image.alt[lang]}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`block h-auto w-full ${imgClassName}`}
      />
      {(credit || caption) && (
        <figcaption className="t-label text-[0.6rem] text-ink-soft">
          {caption && <span className="mr-2">{caption}</span>}
          {credit && RIGHTS[image.rights]}
        </figcaption>
      )}
    </figure>
  );
}
