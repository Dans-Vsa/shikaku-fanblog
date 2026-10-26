import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { initialLang, setLanguage } from '@/lib/i18n';
import type { Lang } from '@/types/content';
import { LangContext } from './contexts';

/**
 * Ganti bahasa tanpa reload: konten utama memudar keluar (140ms),
 * bahasa diganti, lalu memudar masuk. Tidak ada layar kosong.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      const root = document.documentElement;
      const reduced = root.dataset.motion === 'reduced';
      if (reduced) {
        void setLanguage(next);
        setLangState(next);
        return;
      }
      root.classList.add('lang-out');
      window.setTimeout(() => {
        void setLanguage(next);
        setLangState(next);
        requestAnimationFrame(() => root.classList.remove('lang-out'));
      }, 160);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <I18nextProvider i18n={i18n}>
      <LangContext.Provider value={value}>{children}</LangContext.Provider>
    </I18nextProvider>
  );
}
