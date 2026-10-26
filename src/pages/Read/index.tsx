import { useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tag } from '@/components/ui/Tag';
import en from '@/content/en/chapters.json';
import id from '@/content/id/chapters.json';
import { EmotionMap } from '@/features/emotion-map/EmotionMap';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalized } from '@/hooks/useLocalized';
import { setChaos } from '@/hooks/useScrollChaos';
import { setAmbience } from '@/lib/audio-bridge';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
import type { AmbienceName } from '@/lib/audio-manager';
import { Act1 } from './Act1';
import { Act2 } from './Act2';
import { Act3 } from './Act3';

/** Arah emosi per babak: --chaos, --mood, dan suasana audio. */
const DIRECTION: { chaos: number; mood: number; ambience: AmbienceName }[] = [
  { chaos: 0.05, mood: 0.3, ambience: 'hush' },
  { chaos: 1, mood: 0.85, ambience: 'none' },
  { chaos: 0, mood: 0.05, ambience: 'none' },
  { chaos: 0.12, mood: 0.35, ambience: 'none' },
  { chaos: 0.75, mood: 1, ambience: 'tv' },
];

export default function Read() {
  const c = useLocalized({ id, en });
  useDocumentTitle(c.title);
  const a1 = useRef<HTMLElement>(null);
  const a2 = useRef<HTMLElement>(null);
  const a3 = useRef<HTMLElement>(null);
  const a4 = useRef<HTMLElement>(null);
  const a5 = useRef<HTMLElement>(null);
  const sections = useMemo(() => [a1, a2, a3, a4, a5], []);
  const moods = useMemo(() => DIRECTION.map((d) => d.mood), []);

  // Sutradara babak: transisi --chaos/--mood yang halus + ambience per babak.
  useEffect(() => {
    const proxy = { chaos: 0.05, mood: 0.3 };
    let current = -1;
    const go = (i: number) => {
      if (i === current) return;
      current = i;
      const d = DIRECTION[i];
      gsap.to(proxy, {
        chaos: d.chaos,
        mood: d.mood,
        duration: 1.2,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: () => setChaos(proxy.chaos, proxy.mood),
      });
      setAmbience(d.ambience);
    };
    const triggers = sections.flatMap((r, i) =>
      !r.current
        ? []
        : ScrollTrigger.create({
            trigger: r.current,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && go(i),
          }),
    );
    go(0);
    return () => {
      triggers.forEach((t) => t.kill());
      gsap.killTweensOf(proxy);
      setChaos(0, 0);
      setAmbience('none');
    };
  }, [sections]);

  return (
    <main id="main" className="overflow-x-clip">
      <PageHeader kicker={c.kicker} title={c.title} jp="読" lede={c.lede}>
        <div className="flex max-w-2xl flex-col gap-3 border-l-[6px] border-ink pl-4">
          <p className="text-lg">{c.spoilerNote}</p>
          <p className="flex flex-wrap items-center gap-2 text-base text-ink-soft">
            <Tag kind="dramatized" /> {c.dramatizedNote}
          </p>
        </div>
        <nav aria-label={c.title} className="mt-4">
          <ol className="flex flex-wrap gap-2">
            {c.toc.map((t, i) => (
              <li key={t}>
                <a
                  href={`#act-${i + 1}`}
                  className="t-label inline-flex items-center gap-2 border-2 border-ink px-3 py-2 transition-colors hover:bg-ink hover:text-paper"
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {t}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </PageHeader>

      <Act1 ref={a1} c={c.act1} />
      <Act2 ref={a2} c={c.act2} dayLabel={c.act2.dayLabel} />
      <Act3 ref={a3} c={c.act3} />

      <EmotionMap sections={sections} moods={moods} labels={c.toc} title={c.emotionMap} />
    </main>
  );
}
