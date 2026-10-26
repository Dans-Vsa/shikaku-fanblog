import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/** Registrasi plugin GSAP sekali saja. Semua modul memakai instance ini. */
export function setupGsap() {
  if (registered) return { gsap, ScrollTrigger };
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.6 });
  // Lenis yang menggerakkan scroll; ScrollTrigger cukup membaca posisi.
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
