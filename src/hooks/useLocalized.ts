import type { Lang, Localized } from '@/types/content';
import { useLang } from './useProviders';

/**
 * Konten halaman disimpan per bahasa (src/content/{id,en}/*.json) dan diimpor
 * statis oleh chunk halaman, sehingga ganti bahasa instan tanpa flicker/Suspense.
 */
export function useLocalized<T>(content: Localized<T>): T {
  const { lang } = useLang();
  return content[lang];
}

export function localized<T>(id: T, en: T): Localized<T> {
  return { id, en } satisfies Record<Lang, T>;
}
