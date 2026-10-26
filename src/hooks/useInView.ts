import { useEffect, useState, type RefObject } from 'react';

/** IntersectionObserver sederhana; dipakai untuk pause render saat tak terlihat. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options: IntersectionObserverInit = { rootMargin: '100px' },
): boolean {
  const [inView, setInView] = useState(false);
  const { root, rootMargin, threshold } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      root,
      rootMargin,
      threshold,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, root, rootMargin, threshold]);

  return inView;
}
