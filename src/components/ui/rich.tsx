import { Fragment, type ReactNode } from 'react';
import { GlossaryTerm } from '@/features/glossary-tooltip/GlossaryTerm';
import { Spoiler } from '@/features/spoiler-ink/Spoiler';
import { Tag, type TagKind } from './Tag';

/**
 * Markup ringan untuk konten JSON (agar teks tidak di-hardcode di komponen):
 *   {{g:termId}} / {{g:termId|label}}  -> istilah glosarium + tooltip
 *   {{s:teks}}                         -> spoiler tinta inline
 *   {{tag:fact|fan|theory|opinion|dramatized}} -> label kejujuran
 *   {{jp:刺客}}                         -> teks Jepang (font & lang="ja")
 *   **tebal**, *miring*
 */
const TOKEN = /(\{\{[^}]+\}\}|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
const TAGS: TagKind[] = ['fact', 'fan', 'theory', 'opinion', 'dramatized'];

function renderToken(token: string, key: number): ReactNode {
  if (token.startsWith('{{')) {
    const inner = token.slice(2, -2);
    const colon = inner.indexOf(':');
    const kind = inner.slice(0, colon);
    const body = inner.slice(colon + 1);
    if (kind === 'g') {
      const [id, label] = body.split('|');
      return (
        <GlossaryTerm key={key} termId={id}>
          {label}
        </GlossaryTerm>
      );
    }
    if (kind === 's') {
      return (
        <Spoiler key={key} inline>
          {renderRich(body)}
        </Spoiler>
      );
    }
    if (kind === 'tag' && (TAGS as string[]).includes(body)) {
      return <Tag key={key} kind={body as TagKind} className="mx-1 align-middle" />;
    }
    if (kind === 'jp') {
      return (
        <span key={key} lang="ja" className="jp">
          {body}
        </span>
      );
    }
    return token;
  }
  if (token.startsWith('**')) return <strong key={key}>{token.slice(2, -2)}</strong>;
  if (token.startsWith('*')) return <em key={key}>{token.slice(1, -1)}</em>;
  return token;
}

export function renderRich(text: string): ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((p, i) => (i % 2 === 1 ? renderToken(p, i) : <Fragment key={i}>{p}</Fragment>));
}
