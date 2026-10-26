import id from '@/content/id/glossary.json';
import en from '@/content/en/glossary.json';
import type { Lang } from '@/types/content';

export interface GlossaryTerm {
  id: string;
  term: string;
  jp: string;
  romaji: string;
  short: string;
  long: string;
}

export interface GlossaryContent {
  kicker: string;
  title: string;
  lede: string;
  intro: string[];
  search: string;
  empty: string;
  placeholder: string;
  terms: GlossaryTerm[];
}

export const glossary: Record<Lang, GlossaryContent> = { id, en };

const index: Record<Lang, Map<string, GlossaryTerm>> = {
  id: new Map(id.terms.map((t) => [t.id, t])),
  en: new Map(en.terms.map((t) => [t.id, t])),
};

export function findTerm(lang: Lang, termId: string): GlossaryTerm | undefined {
  return index[lang].get(termId);
}
