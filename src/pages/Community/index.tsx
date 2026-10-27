import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import en from '@/content/en/community.json';
import id from '@/content/id/community.json';
import { Quiz } from '@/features/quiz/Quiz';
import { Spoiler } from '@/features/spoiler-ink/Spoiler';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { useScrollChaos } from '@/hooks/useScrollChaos';
import { LocalCommunityStore, type BoardKind, type CommunityPost } from '@/lib/community-store';
import { PostBoard } from './PostBoard';

export default function Community() {
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  useScrollChaos(0.45);

  // Adapter: ganti LocalCommunityStore dengan implementasi backend kapan pun.
  const store = useMemo(
    () =>
      new LocalCommunityStore(
        c.seeds.map<CommunityPost>((s, i) => ({
          ...s,
          kind: s.kind as BoardKind,
          seed: true,
          createdAt: i,
        })),
      ),
    [c.seeds],
  );

  return (
    <main id="main">
      <PageHeader kicker={c.kicker} title={c.title} jp="仲間" lede={c.lede}>
        <p className="max-w-2xl border-l-[6px] border-ink pl-4 text-base text-ink-soft">
          {c.storageNote}
        </p>
        <nav aria-label={c.title}>
          <ul className="flex flex-wrap gap-2">
            {(['wall', 'quiz', 'board'] as const).map((k) => (
              <li key={k}>
                <a
                  href={`#${k}`}
                  className="t-label inline-block border-2 border-ink px-3 py-2 transition-colors hover:bg-ink hover:text-paper"
                >
                  {c.sections[k]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <section id="wall" className="container-ink scroll-mt-24 py-12" aria-labelledby="wall-title">
        <h2 id="wall-title" className="mb-3 text-4xl md:text-5xl">
          {c.wall.title}
        </h2>
        <p className="mb-8 max-w-prose text-lg">{c.wall.intro}</p>
        <PostBoard kind="panels" store={store} text={c.wall} variant="wall" />
      </section>

      <section id="quiz" className="invert-scope scroll-mt-24 py-20" aria-labelledby="quiz-title">
        <div className="container-ink">
          <h2 id="quiz-title" className="t-shikaku mb-8 text-5xl md:text-6xl">
            {c.quiz.title}
          </h2>
          <Quiz c={c.quiz} />
        </div>
      </section>

      <section
        id="board"
        className="container-ink scroll-mt-24 py-16"
        aria-labelledby="board-title"
      >
        <h2 id="board-title" className="mb-3 text-4xl md:text-5xl">
          {c.board.title}
        </h2>
        <p className="mb-2 max-w-prose text-lg">{c.board.intro}</p>
        <p className="t-label mb-8 text-ink-soft">{c.board.spoilerWarning}</p>
        <Spoiler label={c.board.spoilerWarning}>
          <PostBoard kind="interpretations" store={store} text={c.board} variant="board" />
        </Spoiler>
      </section>
    </main>
  );
}
