/**
 * Koordinator transisi halaman. TransitionLink memanggil `go()`:
 *   1. tirai tinta menutup layar (halaman lama masih terlihat di baliknya),
 *   2. navigate() — chunk route dimuat sementara layar tertutup,
 *   3. PageTransition membuka tirai setelah halaman baru ter-render.
 * Tidak pernah ada layar kosong.
 */
type Cover = () => Promise<void>;
type Navigate = (to: string) => void;

let cover: Cover | null = null;
let navigate: Navigate | null = null;
let busy = false;

export const transitionStore = {
  register(c: Cover, n: Navigate) {
    cover = c;
    navigate = n;
    return () => {
      cover = null;
      navigate = null;
    };
  },
  async go(to: string) {
    if (!navigate) return;
    if (busy) return;
    if (to === window.location.pathname + window.location.search) return;
    busy = true;
    try {
      if (cover) await cover();
      navigate(to);
    } finally {
      busy = false;
    }
  },
};
