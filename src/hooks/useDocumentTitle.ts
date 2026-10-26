import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · SHIKAKU シカク` : 'SHIKAKU シカク — Fanblog & Wiki';
  }, [title]);
}
