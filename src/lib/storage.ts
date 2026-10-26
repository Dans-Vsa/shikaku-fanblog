/**
 * Pembungkus localStorage yang aman: tidak pernah melempar error
 * (mode privat Safari, kuota penuh, SSR) dan selalu tervalidasi.
 */
const PREFIX = 'shikaku:';

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const s = window.localStorage;
    const probe = `${PREFIX}__probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

const storage = safeStorage();

export function readStore<T>(key: string, fallback: T, validate?: (v: unknown) => v is T): T {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (!storage) return;
  try {
    storage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* kuota penuh / mode privat: abaikan, state tetap hidup di memori */
  }
}

export function removeStore(key: string): void {
  storage?.removeItem(PREFIX + key);
}

export const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
export const isOneOf =
  <T extends string>(...values: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === 'string' && (values as readonly string[]).includes(v);
