import type { ElementType, ReactNode } from 'react';

interface CardProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Kemiringan ikut --chaos */
  chaotic?: boolean;
}

export function Card({
  as: Tag = 'article',
  children,
  className = '',
  chaotic = false,
}: CardProps) {
  return (
    <Tag
      className={`panel p-5 md:p-6 ${chaotic ? 'chaos-panel' : ''} ${className}`}
      data-cursor="card"
    >
      {children}
    </Tag>
  );
}
