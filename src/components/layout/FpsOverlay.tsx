import { useFpsMonitor } from '@/hooks/useFpsMonitor';
import { usePerformance } from '@/hooks/useProviders';
import { QUALITIES } from '@/lib/perf-detect';

/** Monitor FPS + pemilih kualitas. Hanya tampil di mode debug (?debug=1). */
export function FpsOverlay() {
  const { debug, quality, setQuality, webgl, measured } = usePerformance();
  const fps = useFpsMonitor();
  if (!debug) return null;
  return (
    <div className="fixed bottom-3 right-3 z-[110] flex items-center gap-3 border-2 border-ink bg-paper px-3 py-2 font-mono text-xs">
      <span className={fps < 45 ? 'font-bold underline' : ''}>{fps} FPS</span>
      <span>WebGL: {webgl ? 'on' : 'off'}</span>
      <span>{measured ? 'bench ✓' : 'bench…'}</span>
      <label className="flex items-center gap-1">
        Q
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value as (typeof QUALITIES)[number])}
          className="border border-ink bg-paper"
        >
          {QUALITIES.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
