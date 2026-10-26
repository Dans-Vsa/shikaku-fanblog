import { useContext } from 'react';
import {
  AudioCtx,
  LangContext,
  MotionContext,
  PerformanceContext,
  SpoilerContext,
} from '@/app/providers/contexts';

function required<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} harus dipakai di dalam provider-nya.`);
  return value;
}

export const useLang = () => required(useContext(LangContext), 'useLang');
export const useSpoiler = () => required(useContext(SpoilerContext), 'useSpoiler');
export const useMotion = () => required(useContext(MotionContext), 'useMotion');
export const useAudio = () => required(useContext(AudioCtx), 'useAudio');
export const usePerformance = () => required(useContext(PerformanceContext), 'usePerformance');
