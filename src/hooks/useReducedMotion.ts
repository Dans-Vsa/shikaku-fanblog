import { useMotion } from './useProviders';

/** true bila sistem ATAU pengguna meminta gerak dikurangi. */
export function useReducedMotion(): boolean {
  return useMotion().reduced;
}
