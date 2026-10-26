import { useSyncExternalStore } from 'react';
import { perfStore } from '@/lib/perf-store';

/** FPS rata-rata 2 detik terakhir (dari ticker global). */
export function useFpsMonitor(): number {
  return useSyncExternalStore(
    (cb) => perfStore.subscribe(cb),
    () => Math.round(perfStore.fps),
    () => 60,
  );
}
