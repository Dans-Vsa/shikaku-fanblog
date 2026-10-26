import { createContext } from 'react';
import type { Lang } from '@/types/content';
import type { Quality } from '@/lib/perf-detect';
import type { AmbienceName, SfxName } from '@/lib/audio-manager';

export interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export interface SpoilerContextValue {
  /** true = mode aman spoiler (konten spoiler disensor tinta) */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  toggle: () => void;
}

export type MotionPref = 'system' | 'full' | 'reduced';

export interface MotionContextValue {
  reduced: boolean;
  systemReduced: boolean;
  pref: MotionPref;
  setPref: (pref: MotionPref) => void;
  toggle: () => void;
}

export interface AudioContextValue {
  muted: boolean;
  toggle: () => void;
  setMuted: (muted: boolean) => void;
  play: (name: SfxName, opts?: { volume?: number; pitchJitter?: number }) => void;
  setAmbience: (name: AmbienceName) => void;
}

export interface PerformanceContextValue {
  quality: Quality;
  webgl: boolean;
  /** true setelah benchmark awal selesai */
  measured: boolean;
  setQuality: (q: Quality) => void;
  debug: boolean;
}

export const LangContext = createContext<LangContextValue | null>(null);
export const SpoilerContext = createContext<SpoilerContextValue | null>(null);
export const MotionContext = createContext<MotionContextValue | null>(null);
export const AudioCtx = createContext<AudioContextValue | null>(null);
export const PerformanceContext = createContext<PerformanceContextValue | null>(null);
