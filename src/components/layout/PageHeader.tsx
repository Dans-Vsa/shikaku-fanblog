import type { ReactNode } from 'react';

interface PageHeaderProps {
  kicker: string;
  title: ReactNode;
  jp?: string;
  lede?: ReactNode;
  children?: ReactNode;
}

/** Kepala halaman bergaya sampul bab manga: kicker mono, judul serif, kanji vertikal. */
export function PageHeader({ kicker, title, jp, lede, children }: PageHeaderProps) {
  return (
    <header className="container-ink relative grid gap-6 pb-10 pt-14 md:grid-cols-[1fr_auto] md:pt-20">
      <div className="flex flex-col gap-5">
        <p className="t-label flex items-center gap-3">
          <span className="inline-block h-[3px] w-10 bg-ink" aria-hidden="true" />
          {kicker}
        </p>
        <h1 className="t-display max-w-[16ch]">{title}</h1>
        {lede && <div className="max-w-prose text-xl text-ink-soft md:text-2xl">{lede}</div>}
        {children}
      </div>
      {jp && (
        <p
          lang="ja"
          className="jp hidden select-none text-[clamp(4rem,9vw,8rem)] leading-none text-ink/90 md:block"
          style={{ writingMode: 'vertical-rl' }}
          aria-hidden="true"
        >
          {jp}
        </p>
      )}
    </header>
  );
}
