import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpoiler } from '@/hooks/useSpoiler';
import { playSfx } from '@/lib/audio-bridge';
import './spoiler.css';

interface SpoilerProps {
  children: ReactNode;
  /** Deskripsi singkat isi spoiler (untuk tombol & pembaca layar) */
  label?: string;
  /** inline = sensor kata di dalam kalimat; block = sensor satu bagian */
  inline?: boolean;
  className?: string;
}

/**
 * Sensor tinta. Saat mode aman spoiler aktif, konten ditutup blok tinta bergerigi
 * dan dibuat `inert` (tak terbaca pembaca layar, tak bisa difokus). Klik = tinta
 * tersapu hanya untuk bagian ini. Toggle global membuka semuanya.
 */
export function Spoiler({ children, label, inline = false, className = '' }: SpoilerProps) {
  const { t } = useTranslation();
  const { hidden } = useSpoiler();
  const [revealed, setRevealed] = useState(false);
  const covered = hidden && !revealed;
  const text = label ?? t('spoiler.label');

  const reveal = () => {
    playSfx('paper', { volume: 0.6 });
    setRevealed(true);
  };

  if (inline) {
    return (
      <span className={`spoiler-ink inline ${covered ? 'is-covered' : ''} ${className}`}>
        <span inert={covered} aria-hidden={covered || undefined} className="spoiler-content">
          {children}
        </span>
        {covered && (
          <button
            type="button"
            className="spoiler-cover"
            data-cursor="spoiler"
            onClick={reveal}
            aria-label={t('spoiler.revealAria', { label: text })}
          />
        )}
      </span>
    );
  }

  return (
    <div className={`spoiler-ink relative ${covered ? 'is-covered' : ''} ${className}`}>
      <div inert={covered} aria-hidden={covered || undefined} className="spoiler-content">
        {children}
      </div>
      {covered && (
        <button
          type="button"
          className="spoiler-cover spoiler-cover--block"
          data-cursor="spoiler"
          onClick={reveal}
          aria-label={t('spoiler.revealAria', { label: text })}
        >
          <span className="t-label border-2 border-paper px-2 py-1">{t('spoiler.label')}</span>
          <span className="t-scrawl text-2xl md:text-3xl">{text}</span>
          <span className="t-label opacity-80">{t('spoiler.reveal')} →</span>
        </button>
      )}
      {hidden && revealed && (
        <button type="button" className="t-label mt-3 underline" onClick={() => setRevealed(false)}>
          {t('spoiler.hide')}
        </button>
      )}
    </div>
  );
}
