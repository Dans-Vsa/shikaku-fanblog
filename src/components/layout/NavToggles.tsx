import { useTranslation } from 'react-i18next';
import { SpoilerToggle } from '@/features/spoiler-ink/SpoilerToggle';
import { useAudio, useLang, useMotion } from '@/hooks/useProviders';
import { playSfx } from '@/lib/audio-bridge';
import { LANGS } from '@/types/content';
import { MotionIcon, SpeakerIcon } from '../ui/icons';
import { Toggle } from '../ui/Toggle';

/** Segmented control ID | EN dengan blok tinta yang bergeser. */
function LangToggle() {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const index = LANGS.indexOf(lang);
  return (
    <div
      role="group"
      aria-label={t('toggle.lang')}
      className="relative inline-flex h-10 border-2 border-ink bg-paper"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/2 bg-ink transition-transform duration-300 ease-snap"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          aria-label={t('toggle.langSwitch', { lang: l === 'id' ? 'Bahasa Indonesia' : 'English' })}
          onClick={() => {
            playSfx('tick');
            setLang(l);
          }}
          className={`t-label relative z-10 w-10 transition-colors duration-300 ${
            l === lang ? 'text-paper' : 'text-ink'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function NavToggles({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const { muted, setMuted } = useAudio();
  const { reduced, setPref } = useMotion();

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label={t('nav.settings')}
      role="group"
    >
      <LangToggle />
      <SpoilerToggle />
      <Toggle
        checked={!muted}
        onChange={(on) => {
          setMuted(!on);
          // bunyi konfirmasi saat dinyalakan (modul audio dimuat lebih dulu)
          if (on) window.setTimeout(() => playSfx('tick'), 60);
        }}
        label={t('toggle.soundAction')}
        stateLabel={muted ? t('toggle.soundOff') : t('toggle.soundOn')}
      >
        <SpeakerIcon on={!muted} />
      </Toggle>
      <Toggle
        checked={reduced}
        onChange={(on) => setPref(on ? 'reduced' : 'full')}
        label={t('toggle.motionAction')}
        stateLabel={reduced ? t('toggle.motionReduced') : t('toggle.motionFull')}
      >
        <MotionIcon reduced={reduced} />
      </Toggle>
    </div>
  );
}
