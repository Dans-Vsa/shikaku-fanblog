import { forwardRef, useEffect, useRef } from 'react';
import { EmptyChairIllustration, TeacupsIllustration } from '@/assets/Illustrations';
import { renderRich } from '@/components/ui/rich';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap, ScrollTrigger } from '@/lib/gsap-setup';
import type { ReadContent } from './types';
import { ActHeader } from './ActHeader';

/**
 * Babak 3 — jeda sinematik. Banyak ruang kosong, hampir tanpa teks, tanpa
 * animasi berlebih: tiap kalimat hanya memudar masuk (opacity) di tengah layar.
 */
export const Act3 = forwardRef<HTMLElement, { c: ReadContent['act3'] }>(function Act3({ c }, ref) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !scope.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-silent]').forEach((el) => {
        gsap.set(el, { opacity: 0 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          end: 'bottom 30%',
          onToggle: (self) =>
            gsap.to(el, { opacity: self.isActive ? 1 : 0.08, duration: 1.4, ease: 'power1.inOut' }),
        });
      });
    }, scope);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} id="act-3" aria-labelledby="act-3-title" className="relative">
      <ActHeader label={c.label} title={c.title} jp={c.jp} variant="silent" id="act-3-title" />
      <div ref={scope}>
        {c.lines.map((l, i) => (
          <div key={l} className="flex min-h-[85vh] items-center justify-center px-6">
            <div data-silent className="flex max-w-xl flex-col items-center gap-10 text-center">
              {i === 3 && <EmptyChairIllustration className="h-40 w-auto opacity-80" />}
              {i === c.lines.length - 1 && <TeacupsIllustration className="h-24 w-auto" />}
              <p className="t-yugeru text-xl md:text-2xl">{renderRich(l)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
