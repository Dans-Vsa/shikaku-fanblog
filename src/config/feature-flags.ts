const params =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

export const featureFlags = {
  /** ?debug=1 : panel shader CRT + monitor FPS */
  debug: params.get('debug') === '1',
  /** ?quality=high|medium|low : paksa level kualitas (lewati benchmark) */
  forcedQuality: params.get('quality'),
  /** ?webgl=0 : paksa fallback CSS untuk menguji jalur non-WebGL */
  disableWebGL: params.get('webgl') === '0',
  /** Ambang FPS untuk mode performa otomatis */
  lowFpsThreshold: 42,
} as const;
