import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { TransitionLink } from '@/features/page-transition/TransitionLink';
import { ArrowIcon, ExternalIcon } from './icons';

type Variant = 'ink' | 'paper' | 'ghost';

const styles: Record<Variant, string> = {
  ink: 'bg-ink text-paper border-ink shadow-[5px_5px_0_rgb(var(--ink-rgb)/0.35)]',
  paper: 'bg-paper text-ink border-ink shadow-[5px_5px_0_var(--ink)]',
  ghost: 'bg-transparent text-ink border-transparent hover:border-ink',
};

const base =
  'group relative inline-flex select-none items-center gap-3 border-[3px] px-5 py-3 font-mono text-sm font-medium uppercase tracking-[0.12em] transition-[transform,box-shadow] duration-200 ease-snap hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none';

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  icon?: 'arrow' | 'external' | 'none';
}

function Icon({ kind }: { kind: CommonProps['icon'] }) {
  if (kind === 'none') return null;
  const Cmp = kind === 'external' ? ExternalIcon : ArrowIcon;
  return (
    <Cmp
      size={18}
      className="transition-transform duration-300 ease-out group-hover:translate-x-1"
    />
  );
}

export function Button({
  variant = 'ink',
  children,
  className = '',
  icon = 'none',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${base} ${styles[variant]} ${className}`} {...rest}>
      <span>{children}</span>
      <Icon kind={icon} />
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'ink',
  children,
  className = '',
  icon = 'arrow',
}: CommonProps & { to: string }) {
  return (
    <TransitionLink to={to} className={`${base} ${styles[variant]} ${className}`}>
      <span>{children}</span>
      <Icon kind={icon} />
    </TransitionLink>
  );
}

export function ExternalButton({
  href,
  variant = 'paper',
  children,
  className = '',
  srExternal,
}: CommonProps & { href: string; srExternal?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles[variant]} ${className}`}
    >
      <span>{children}</span>
      {srExternal && <span className="sr-only"> {srExternal}</span>}
      <Icon kind="external" />
    </a>
  );
}
