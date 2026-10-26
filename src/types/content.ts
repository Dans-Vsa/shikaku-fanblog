export type Lang = 'id' | 'en';

export const LANGS: readonly Lang[] = ['id', 'en'] as const;

/** Label kejujuran konten: setiap klaim diberi salah satu label ini. */
export type ClaimKind = 'fact' | 'fan' | 'theory' | 'opinion';

export type Localized<T> = Record<Lang, T>;

export interface Paragraphs {
  title: string;
  body: string[];
}

export interface LabeledBlock {
  kind: ClaimKind;
  title: string;
  body: string[];
  spoiler?: boolean;
}
