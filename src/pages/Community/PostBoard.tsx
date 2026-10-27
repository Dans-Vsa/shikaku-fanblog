import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { BoardKind, CommunityPost, CommunityStore } from '@/lib/community-store';
import { playSfx } from '@/lib/audio-bridge';

interface BoardText {
  nameLabel?: string;
  textLabel: string;
  textPlaceholder: string;
  tagLabel: string;
  tags: string[];
  submit: string;
  anonymous?: string;
  empty?: string;
  seedLabel?: string;
  count?: string;
  posted?: string;
  vote?: string;
  voted?: string;
}

const MAX = 400;

/**
 * Papan posting generik (dinding panel & papan tafsiran) di atas CommunityStore.
 * Tidak tahu apa-apa soal localStorage — cukup ganti adapter untuk backend.
 */
export function PostBoard({
  kind,
  store,
  text,
  variant,
}: {
  kind: BoardKind;
  store: CommunityStore;
  text: BoardText;
  variant: 'wall' | 'board';
}) {
  const id = useId();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState(text.tags[0]);
  const [status, setStatus] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    void store.list(kind).then((p) => alive && setPosts(p));
    return () => {
      alive = false;
    };
  }, [store, kind, version]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    await store.add({ kind, author: author || text.anonymous || '—', text: body, tag });
    playSfx('paper');
    setBody('');
    setStatus(text.posted ?? '✓');
    setVersion((v) => v + 1);
  };

  const vote = async (postId: string) => {
    await store.vote(postId);
    playSfx('tick');
    setVersion((v) => v + 1);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={(e) => void submit(e)} className="panel flex h-fit flex-col gap-4 p-6">
        {text.nameLabel && (
          <label className="flex flex-col gap-1">
            <span className="t-label">{text.nameLabel}</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={40}
              autoComplete="nickname"
              className="border-[3px] border-ink bg-paper px-3 py-2 font-mono text-base outline-none focus-visible:shadow-[4px_4px_0_var(--ink)]"
            />
          </label>
        )}
        <label className="flex flex-col gap-1">
          <span className="t-label">{text.textLabel}</span>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX))}
            placeholder={text.textPlaceholder}
            rows={5}
            aria-describedby={`${id}-count`}
            className="resize-y border-[3px] border-ink bg-paper px-3 py-2 text-lg outline-none focus-visible:shadow-[4px_4px_0_var(--ink)]"
          />
          <span id={`${id}-count`} className="t-label self-end text-ink-soft">
            {(text.count ?? '{{n}}').replace('{{n}}', String(MAX - body.length))}
          </span>
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="t-label mb-1">{text.tagLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {text.tags.map((t) => (
              <label
                key={t}
                className={`t-label cursor-pointer border-2 border-ink px-3 py-1.5 transition-colors ${tag === t ? 'bg-ink text-paper' : 'bg-paper'}`}
              >
                <input
                  type="radio"
                  name={`${id}-tag`}
                  value={t}
                  checked={tag === t}
                  onChange={() => setTag(t)}
                  className="sr-only"
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" icon="arrow" className="self-start">
          {text.submit}
        </Button>
        <p role="status" className="t-label min-h-5">
          {status}
        </p>
      </form>

      <ul
        className={variant === 'wall' ? 'columns-1 gap-5 sm:columns-2' : 'flex flex-col gap-4'}
        aria-live="polite"
      >
        {posts.length === 0 && text.empty && <li className="t-label">{text.empty}</li>}
        {posts.map((p, i) => (
          <li
            key={p.id}
            className={
              variant === 'wall'
                ? 'chaos-panel mb-5 break-inside-avoid border-[3px] border-ink bg-paper p-5 shadow-[5px_5px_0_var(--ink)]'
                : 'flex gap-4 border-b-2 border-ink/20 pb-4'
            }
            style={variant === 'wall' ? { transform: `rotate(${(i % 3) - 1}deg)` } : undefined}
          >
            {variant === 'board' && (
              <button
                type="button"
                onClick={() => void vote(p.id)}
                disabled={store.hasVoted(p.id)}
                aria-label={`${store.hasVoted(p.id) ? text.voted : text.vote}: ${p.votes}`}
                className="flex h-16 w-14 shrink-0 flex-col items-center justify-center border-[3px] border-ink transition-transform duration-200 ease-snap active:scale-90 disabled:bg-ink disabled:text-paper"
              >
                <span aria-hidden="true">▲</span>
                <span className="font-mono text-sm">{p.votes}</span>
              </button>
            )}
            <div className="flex flex-col gap-2">
              <p className={variant === 'wall' ? 't-scrawl text-2xl leading-snug' : 'text-lg'}>
                {p.text}
              </p>
              <p className="t-label flex flex-wrap items-center gap-2 text-ink-soft">
                <span>— {p.author}</span>
                {p.tag && <span className="border border-ink px-1.5">{p.tag}</span>}
                {p.seed && text.seedLabel && (
                  <span className="italic normal-case tracking-normal">({text.seedLabel})</span>
                )}
                {variant === 'wall' && <span>♥ {p.votes}</span>}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
