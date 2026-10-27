import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpoiler } from '@/hooks/useSpoiler';
import { playSfx } from '@/lib/audio-bridge';

/**
 * Toggle spoiler bergaya sensor tinta: blok hitam tersapu ke kanan saat spoiler
 * dibuka, dan tersapu kembali menutup kata "SPOILER" saat disensor.
 */
const FULL =
  'polygon(0% 12%, 6% 0%, 30% 8%, 55% 0%, 82% 10%, 100% 2%, 98% 88%, 74% 100%, 46% 90%, 18% 100%, 2% 92%)';
const GONE =
  'polygon(100% 12%, 100% 0%, 100% 8%, 100% 0%, 100% 10%, 100% 2%, 100% 88%, 100% 100%, 100% 90%, 100% 100%, 100% 92%)';

export function SpoilerToggle() {
  const { t } = useTranslation();
  const { hidden, toggle } = useSpoiler();
  const descId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!hidden}
      aria-label={t('spoiler.label')}
      aria-describedby={descId}
      title={hidden ? t('toggle.spoilerHidden') : t('toggle.spoilerShown')}
      data-cursor="spoiler"
      onClick={() => {
        playSfx('paper', { volume: 0.5 });
        toggle();
      }}
      className="group relative inline-flex h-10 items-center overflow-hidden border-2 border-ink bg-paper px-3 transition-transform duration-200 ease-snap active:scale-95"
    >
      <span className="t-label relative z-0 text-ink">{t('spoiler.label')}</span>
      <span
        aria-hidden="true"
        className="t-label absolute inset-y-[5px] left-1 right-1 z-10 flex items-center justify-center bg-ink text-paper transition-[clip-path] duration-500 ease-ink"
        style={{ clipPath: hidden ? FULL : GONE }}
      >
        {t('spoiler.label')}
      </span>
      <span id={descId} hidden>
        {t('toggle.spoilerAction')}
      </span>
    </button>
  );
}
