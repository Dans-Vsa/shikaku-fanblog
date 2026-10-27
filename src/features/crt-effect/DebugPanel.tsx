import { useState } from 'react';
import { crtParams, type CrtParams } from './quality-levels';

const RANGES: Record<keyof CrtParams, [number, number, number]> = {
  curve: [0, 0.3, 0.005],
  scan: [0, 0.8, 0.01],
  mask: [0, 0.6, 0.01],
  aberr: [0, 0.01, 0.0002],
  noise: [0, 0.5, 0.01],
  roll: [0, 2, 0.05],
  jitter: [0, 3, 0.05],
  tear: [0, 3, 0.05],
  bloom: [0, 2, 0.05],
  flicker: [0, 3, 0.05],
  vignette: [0, 1, 0.01],
  intensityOverride: [-1, 1, 0.01],
};

/**
 * Panel debug tersembunyi (?debug=1). Mengubah objek `crtParams` secara langsung —
 * loop render membacanya tiap frame, jadi perubahan terlihat seketika.
 */
export function DebugPanel() {
  const [, force] = useState(0);
  const [open, setOpen] = useState(true);
  const set = (k: keyof CrtParams, v: number) => {
    crtParams[k] = v;
    force((n) => n + 1);
  };
  return (
    <div
      className="fixed left-3 top-20 z-[110] w-72 border-2 border-crt bg-black/85 p-3 font-mono text-[11px] text-crt"
      data-lenis-prevent
    >
      <button type="button" className="mb-2 underline" onClick={() => setOpen((o) => !o)}>
        CRT debug {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className="grid gap-1.5">
          {(Object.keys(RANGES) as (keyof CrtParams)[]).map((k) => {
            const [min, max, step] = RANGES[k];
            return (
              <label key={k} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-2">
                <span>{k}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={crtParams[k]}
                  onChange={(e) => set(k, Number(e.target.value))}
                />
                <span className="text-right">{crtParams[k].toFixed(k === 'aberr' ? 4 : 2)}</span>
              </label>
            );
          })}
          <button
            type="button"
            className="mt-2 border border-crt px-2 py-1"
            onClick={() => void navigator.clipboard?.writeText(JSON.stringify(crtParams, null, 2))}
          >
            copy JSON
          </button>
        </div>
      )}
    </div>
  );
}
