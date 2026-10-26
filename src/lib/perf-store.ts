/**
 * Store FPS ringan (di luar React) agar overlay debug & mode performa
 * bisa membaca FPS tanpa memicu re-render seluruh pohon.
 */
type Listener = (fps: number) => void;

const listeners = new Set<Listener>();
let current = 60;

export const perfStore = {
  get fps() {
    return current;
  },
  publish(fps: number) {
    current = fps;
    listeners.forEach((l) => l(fps));
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
