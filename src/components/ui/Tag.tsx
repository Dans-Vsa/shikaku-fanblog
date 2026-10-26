import { useTranslation } from 'react-i18next';
import type { ClaimKind } from '@/types/content';

export type TagKind = ClaimKind | 'dramatized';

const look: Record<TagKind, string> = {
  fact: 'bg-ink text-paper border-ink',
  fan: 'bg-paper text-ink border-ink border-dashed',
  theory: 'bg-paper text-ink border-ink border-dotted',
  opinion: 'bg-paper-deep text-ink border-ink',
  dramatized: 'bg-paper text-ink-soft border-ink-soft',
};

/** Label kejujuran konten: [FAKTA] / [ANALISIS FANS] / [TEORI FANS] / [OPINI]. */
export function Tag({ kind, className = '' }: { kind: TagKind; className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`t-label inline-flex items-center gap-1 border-2 px-2 py-0.5 ${look[kind]} ${className}`}
      title={t(`tag.${kind}Hint`)}
    >
      <span aria-hidden="true">[</span>
      {t(`tag.${kind}`)}
      <span aria-hidden="true">]</span>
      <span className="sr-only">: {t(`tag.${kind}Hint`)}</span>
    </span>
  );
}
