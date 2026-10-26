import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomCursor } from '@/features/custom-cursor/CustomCursor';
import { PageTransition } from '@/features/page-transition/PageTransition';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { startLenis, stopLenis } from '@/lib/lenis-setup';
import { PaperBackground } from '../manga/PaperBackground';
import { FpsOverlay } from './FpsOverlay';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { ProgressInk } from './ProgressInk';

export default function RootLayout() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  // Smooth scroll hanya saat gerak penuh; reduced motion = scroll native.
  useEffect(() => {
    if (reduced) {
      stopLenis();
      return;
    }
    startLenis();
    return () => stopLenis();
  }, [reduced]);

  return (
    <>
      <a
        href="#main"
        className="fixed left-3 top-3 z-[120] -translate-y-24 border-[3px] border-ink bg-paper px-4 py-2 font-mono text-sm transition-transform focus:translate-y-0"
      >
        {t('skip')}
      </a>
      <PaperBackground />
      <ProgressInk />
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
      <Footer />
      <PageTransition />
      <CustomCursor />
      <FpsOverlay />
    </>
  );
}
