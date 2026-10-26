import { renderRich } from './rich';

export function RichText({
  text,
  as: As = 'p',
  className,
}: {
  text: string;
  as?: 'p' | 'span' | 'li';
  className?: string;
}) {
  return <As className={className}>{renderRich(text)}</As>;
}

/** Beberapa paragraf sekaligus. */
export function Paragraphs({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <div className={`prose-ink ${className}`}>
      {items.map((p, i) => (
        <RichText key={i} text={p} />
      ))}
    </div>
  );
}
