import { forwardRef, type MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { transitionStore } from './transition-store';

/**
 * Link internal yang memutar tirai tinta sebelum berpindah halaman.
 * Klik dengan modifier (ctrl/cmd/shift/tengah) tetap perilaku bawaan browser.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(function TransitionLink(
  { onClick, to, ...rest },
  ref,
) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target && rest.target !== '_self') return;
    e.preventDefault();
    void transitionStore.go(typeof to === 'string' ? to : (to.pathname ?? '/'));
  };
  return <Link ref={ref} to={to} onClick={handle} {...rest} />;
});
