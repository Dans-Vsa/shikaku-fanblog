interface ActHeaderProps {
  label: string;
  title: string;
  jp: string;
  variant?: 'cold' | 'chaos' | 'silent' | 'gallery' | 'tv';
  id?: string;
}

/** Kepala babak: label mono + judul + kanji besar. Gaya mengikuti suasana babak. */
export function ActHeader({ label, title, jp, variant = 'cold', id }: ActHeaderProps) {
  const titleClass =
    variant === 'chaos'
      ? 't-shikaku text-[clamp(2.4rem,6vw,5rem)] -rotate-2'
      : variant === 'silent'
        ? 't-yugeru text-[clamp(1.6rem,3vw,2.4rem)] font-normal'
        : 'text-[clamp(2.4rem,5.6vw,4.6rem)]';
  return (
    <header
      className={`container-ink flex items-end justify-between gap-6 ${variant === 'silent' ? 'py-10' : 'py-16'}`}
    >
      <div className="flex flex-col gap-3">
        <p className="t-label flex items-center gap-3">
          <span className="inline-block h-[3px] w-8 bg-current" aria-hidden="true" />
          {label}
        </p>
        <h2 id={id} className={titleClass}>
          {title}
        </h2>
      </div>
      <span
        lang="ja"
        aria-hidden="true"
        className={`jp leading-none ${variant === 'silent' ? 'text-5xl opacity-30' : 'text-[clamp(4rem,10vw,9rem)]'}`}
      >
        {jp}
      </span>
    </header>
  );
}
