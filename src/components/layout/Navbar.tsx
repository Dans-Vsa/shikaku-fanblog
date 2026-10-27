import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mainNav, footerNav } from '@/config/site';
import { TransitionLink } from '@/features/page-transition/TransitionLink';
import { getLenis, onLenisScroll } from '@/lib/lenis-setup';
import { LogoMark, MenuIcon } from '../ui/icons';
import { NavToggles } from './NavToggles';

function isActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
}

export function Navbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Tutup drawer saat route berubah (pola "adjust state during render").
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Sembunyikan saat scroll turun, tampilkan saat naik. Transform saja (compositor).
  useEffect(() => {
    let last = 0;
    let hidden = false;
    const apply = (y: number) => {
      const el = bar.current;
      if (!el) return;
      const down = y > last + 4;
      const up = y < last - 4;
      if (down && y > 160 && !hidden) {
        hidden = true;
        el.style.transform = 'translateY(-110%)';
      } else if ((up || y < 80) && hidden) {
        hidden = false;
        el.style.transform = 'translateY(0)';
      }
      last = y;
    };
    const offLenis = onLenisScroll((y) => apply(y));
    const onNative = () => {
      if (!getLenis()) apply(window.scrollY);
    };
    window.addEventListener('scroll', onNative, { passive: true });
    return () => {
      offLenis();
      window.removeEventListener('scroll', onNative);
    };
  }, []);

  // Drawer: kunci scroll, Escape menutup, fokus masuk ke drawer.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    drawer.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      ref={bar}
      className="fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out"
    >
      <div className="border-b-[3px] border-ink bg-paper/95 backdrop-blur-[2px]">
        <div className="container-ink flex h-16 items-center justify-between gap-4">
          <TransitionLink to="/" className="flex shrink-0 items-center gap-3">
            <LogoMark />
            <span className="flex flex-col leading-none">
              <span className="t-shikaku text-xl tracking-wider">{t('brand')}</span>
              <span className="t-label text-[0.6rem] text-ink-soft">
                <span lang="ja" className="jp normal-case tracking-normal">
                  シカク
                </span>{' '}
                · {t('brandSub')}
                <span className="sr-only"> — {t('nav.home')}</span>
              </span>
            </span>
          </TransitionLink>

          <nav aria-label={t('nav.main')} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.to);
                return (
                  <li key={item.to} className="group relative">
                    <TransitionLink
                      to={item.to}
                      aria-current={active ? 'page' : undefined}
                      className="t-label relative block px-3 py-2"
                    >
                      {t(item.key)}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3 bottom-1 h-[3px] origin-left bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                          active ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </TransitionLink>
                    {item.children && (
                      <ul className="invisible absolute left-0 top-full min-w-56 translate-y-2 border-[3px] border-ink bg-paper p-2 opacity-0 shadow-[6px_6px_0_var(--ink)] transition-all duration-200 ease-out group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        {item.children.map((c) => (
                          <li key={c.to}>
                            <TransitionLink
                              to={c.to}
                              aria-current={pathname === c.to ? 'page' : undefined}
                              className="block px-3 py-2 text-lg transition-colors hover:bg-ink hover:text-paper aria-[current=page]:underline"
                            >
                              {t(c.key)}
                            </TransitionLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <NavToggles className="hidden lg:flex" />

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            aria-label={open ? t('nav.close') : t('nav.menu')}
            onClick={() => setOpen((o) => !o)}
          >
            <MenuIcon open={open} size={22} />
          </button>
        </div>
      </div>

      <div
        id="mobile-drawer"
        ref={drawer}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t-[3px] border-ink bg-paper lg:hidden"
        data-lenis-prevent
      >
        <nav aria-label={t('nav.main')} className="container-ink flex flex-col gap-8 py-8">
          <ul className="flex flex-col">
            {[{ to: '/', key: 'nav.home' }, ...mainNav, ...footerNav].map((item, i) => (
              <li key={item.to} style={{ ['--i' as string]: i }}>
                <TransitionLink
                  to={item.to}
                  aria-current={isActive(pathname, item.to) ? 'page' : undefined}
                  className="flex items-baseline gap-3 border-b-2 border-ink/20 py-3 text-3xl font-bold aria-[current=page]:italic"
                >
                  <span className="t-label text-ink-soft">{String(i).padStart(2, '0')}</span>
                  {t(item.key)}
                </TransitionLink>
                {'children' in item && item.children && (
                  <ul className="grid grid-cols-2 gap-x-4 py-2 pl-10">
                    {item.children.map((c) => (
                      <li key={c.to}>
                        <TransitionLink to={c.to} className="block py-1 text-lg">
                          {t(c.key)}
                        </TransitionLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <NavToggles className="flex-wrap" />
        </nav>
      </div>
    </header>
  );
}
