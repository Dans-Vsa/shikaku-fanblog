import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import idUi from '@/content/id/ui.json';
import enUi from '@/content/en/ui.json';
import { isOneOf, readStore, writeStore } from './storage';
import type { Lang } from '@/types/content';

const STORAGE_KEY = 'lang';
const isLang = isOneOf<Lang>('id', 'en');

function detectInitial(): Lang {
  const stored = readStore<Lang | null>(STORAGE_KEY, null, (v): v is Lang | null => isLang(v));
  if (stored) return stored;
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'id';
  return nav.startsWith('id') || nav.startsWith('ms') ? 'id' : 'en';
}

export const initialLang = detectInitial();

void i18n.use(initReactI18next).init({
  resources: {
    id: { translation: idUi },
    en: { translation: enUi },
  },
  lng: initialLang,
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(lang: Lang) {
  writeStore(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  return i18n.changeLanguage(lang);
}

export default i18n;
