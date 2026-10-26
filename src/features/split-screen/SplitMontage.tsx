import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap } from '@/lib/gsap-setup';
import './split.css';

interface SplitMontageProps {
  leftTitle: string;
  rightTitle: string;
  left: string[];
  right: string[];
  merge: ReactNode;
  /** label penghitung hari, mis. "HARI" */
  dayLabel: string;
}

/**
 * Montase layar terbelah. Dua kolom bergerak berlawanan arah (sinkron scroll),
 * lalu perlahan menyatu menjadi satu panel. Kolom memakai position: sticky
 * (tanpa pin-spacer), GSAP hanya menulis transform berdasarkan progres scrub.
 */
export function SplitMontage({
  leftTitle,
  rightTitle,
  left,
  right,
  merge,
  dayLabel,
}: SplitMontageProps) {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const leftTrack = useRef<HTMLDivElement>(null);
  const rightTrack = useRef<HTMLDivElement>(null);
  const mergeRef = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced || !section.current) return;
    const ctx = gsap.context(() => {
      const travel = () => {
        const lh = leftTrack.current?.scrollHeight ?? 0;
        return Math.max(0, lh - window.innerHeight * 0.55);
      };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (counter.current)
              counter.current.textContent = String(
                Math.max(1, Math.round(self.progress * 365)),
              ).padStart(3, '0');
          },
        },
      });
      tl.fromTo(leftTrack.current, { y: 0 }, { y: () => -travel(), duration: 0.72 }, 0)
        .fromTo(rightTrack.current, { y: () => -travel() }, { y: 0, duration: 0.72 }, 0)
        .to(leftTrack.current, { xPercent: 52, opacity: 0.12, duration: 0.2 }, 0.72)
        .to(rightTrack.current, { xPercent: -52, opacity: 0.12, duration: 0.2 }, 0.72)
        .fromTo(
          mergeRef.current,
          { opacity: 0, scale: 0.86, rotate: -3 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.2 },
          0.76,
        )
        .to({}, { duration: 0.08 });
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <div className="container-ink grid gap-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ol className="grid gap-3">
            {left.map((l) => (
              <li key={l} className="split-panel split-panel--shikaku">
                {l}
              </li>
            ))}
          </ol>
          <ol className="grid gap-3">
            {right.map((r) => (
              <li key={r} className="split-panel split-panel--yugeru">
                {r}
              </li>
            ))}
          </ol>
        </div>
        <div>{merge}</div>
      </div>
    );
  }

  return (
    <section
      ref={section}
      className="relative h-[420vh]"
      aria-label={`${leftTitle} / ${rightTitle}`}
    >
      <div className="sr-only">
        <h3>{leftTitle}</h3>
        <ol>
          {left.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
        <h3>{rightTitle}</h3>
        <ol>
          {right.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </div>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="speedlines pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid h-full max-w-6xl grid-cols-2 gap-3 px-3 md:gap-8 md:px-8">
          <div className="split-col relative">
            <p className="t-shikaku absolute left-0 top-20 z-20 inline-block -rotate-2 bg-ink px-3 py-1 text-xl text-paper md:text-3xl">
              {leftTitle}
            </p>
            <div
              ref={leftTrack}
              aria-hidden="true"
              className="flex flex-col gap-5 pb-[40vh] pt-[30vh] will-change-transform"
            >
              {left.map((l, i) => (
                <p
                  key={l}
                  className="split-panel split-panel--shikaku"
                  style={{ ['--r' as string]: `${(i % 2 ? 1 : -1) * (1.5 + (i % 3))}deg` }}
                >
                  {l}
                </p>
              ))}
            </div>
          </div>
          <div className="split-col relative text-right">
            <p className="t-yugeru absolute right-0 top-20 z-20 inline-block border-b-[3px] border-ink bg-paper px-3 py-1 text-xl md:text-3xl">
              {rightTitle}
            </p>
            <div
              ref={rightTrack}
              aria-hidden="true"
              className="flex flex-col gap-8 pb-[40vh] pt-[30vh] will-change-transform"
            >
              {[...right].reverse().map((r) => (
                <p key={r} className="split-panel split-panel--yugeru">
                  {r}
                </p>
              ))}
            </div>
          </div>
        </div>
        <p
          className="t-label pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 border-2 border-ink bg-paper px-3 py-1"
          aria-hidden="true"
        >
          {dayLabel} <span ref={counter}>001</span> / 365
        </p>
        <div
          ref={mergeRef}
          className="pointer-events-none absolute inset-0 grid place-items-center px-4 opacity-0"
        >
          <div className="pointer-events-auto w-full max-w-2xl">{merge}</div>
        </div>
      </div>
    </section>
  );
}
