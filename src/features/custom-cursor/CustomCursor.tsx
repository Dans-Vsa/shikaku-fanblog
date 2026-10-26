import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { gsap } from '@/lib/gsap-setup';
import './cursor.css';

export type CursorState = 'default' | 'link' | 'card' | 'spoiler' | 'text' | 'none' | 'drag';

const INTERACTIVE =
  'a, button, [role="button"], [role="switch"], [role="slider"], summary, label, select';

/**
 * Kursor kustom kontekstual. Satu titik tinta (instan) + cincin (lerp).
 * State dibaca dari atribut `data-cursor` terdekat:
 *   link · card ("BALIK") · spoiler ("SAPU") · drag · text · none (simulasi menggambar crosshair sendiri).
 * Posisi diupdate lewat gsap.ticker (ticker global), transform saja.
 */
export function CustomCursor() {
  const { t } = useTranslation();
  const fine = useMediaQuery('(pointer: fine) and (hover: hover)');
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine) return;
    const html = document.documentElement;
    html.classList.add('has-custom-cursor');
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let visible = false;
    let state: CursorState = 'default';

    const setState = (next: CursorState) => {
      if (next === state || !root.current) return;
      state = next;
      root.current.dataset.state = next;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible && root.current) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        root.current.style.opacity = '1';
      }
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const tagged = target.closest<HTMLElement>('[data-cursor]');
      if (tagged) {
        setState((tagged.dataset.cursor as CursorState) ?? 'default');
        return;
      }
      if (target.closest(INTERACTIVE)) setState('link');
      else if (target.closest('input, textarea, [contenteditable="true"]')) setState('text');
      else setState('default');
    };

    const onDown = () => root.current?.classList.add('is-down');
    const onUp = () => root.current?.classList.remove('is-down');
    const onLeave = () => {
      visible = false;
      if (root.current) root.current.style.opacity = '0';
    };

    const tick = () => {
      const k = reduced ? 1 : 0.22;
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      if (ring.current)
        ring.current.style.transform = `translate3d(${ringPos.x.toFixed(1)}px, ${ringPos.y.toFixed(1)}px, 0)`;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    gsap.ticker.add(tick);
    return () => {
      html.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gsap.ticker.remove(tick);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  return (
    <div
      ref={root}
      className="cursor-root pointer-events-none fixed inset-0 z-[100] opacity-0 transition-opacity duration-200"
      data-state="default"
      aria-hidden="true"
    >
      <div ref={ring} className="absolute left-0 top-0">
        <div className="cursor-ring">
          <span className="cursor-label t-label">
            <span className="label-card">{t('common.flip')}</span>
            <span className="label-spoiler">{t('spoiler.label')}</span>
          </span>
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0">
        <div className="cursor-dot" />
      </div>
    </div>
  );
}
