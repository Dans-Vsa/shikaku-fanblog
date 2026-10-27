/**
 * Pipeline CRT satu pass. Semua efek dikendalikan uniform `uIntensity` (0..1)
 * yang terhubung ke progres scroll, plus uniform transisi (burn/power/off/flash).
 * GLSL ES 1.00 agar jalan di WebGL1 maupun WebGL2.
 */
export const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const fragmentBody = /* glsl */ `
uniform sampler2D tMap;
uniform vec2 uRes;
uniform float uTime;
uniform float uIntensity;
uniform float uBurn;
uniform float uPower;
uniform float uOff;
uniform float uFlash;
uniform float uMotion;
uniform float uCurve;
uniform float uScan;
uniform float uMask;
uniform float uAberr;
uniform float uNoise;
uniform float uRoll;
uniform float uJitter;
uniform float uTear;
uniform float uBloom;
uniform float uFlicker;
uniform float uVignette;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uTint;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec2 barrel(vec2 uv, float k) {
  vec2 c = uv * 2.0 - 1.0;
  c *= 1.0 + k * dot(c, c);
  return c * 0.5 + 0.5;
}

void main() {
  float I = uIntensity;
  float m = uMotion;
  float t = uTime;

  // --- power off: runtuh vertikal lalu horizontal menjadi titik putih ---
  float offV = smoothstep(0.0, 0.55, uOff);
  float offH = smoothstep(0.5, 0.9, uOff);
  vec2 c = vUv - 0.5;
  c.y /= max(1.0 - offV * 0.996, 0.004);
  c.x /= max(1.0 - offH * 0.996, 0.004);
  // --- power on: garis horizontal melebar ---
  c.y /= mix(0.004, 1.0, smoothstep(0.0, 1.0, uPower));
  vec2 suv = c + 0.5;
  bool inTube = abs(c.x) <= 0.5 && abs(c.y) <= 0.5;

  vec2 uv = barrel(suv, uCurve);

  // jitter vertikal + horizontal hold wobble + signal tearing (hanya gerak penuh)
  uv.y += (hash(vec2(floor(t * 24.0), 3.0)) - 0.5) * uJitter * I * m * 0.012;
  uv.x += (vnoise(vec2(uv.y * 9.0, t * 2.3)) - 0.5) * 0.03 * I * I * m;
  float tearBand = step(1.0 - uTear * I * 0.18, hash(vec2(floor(uv.y * 48.0), floor(t * 12.0))));
  uv.x += tearBand * (hash(vec2(floor(t * 18.0), floor(uv.y * 48.0))) - 0.5) * 0.12 * m;

  // chromatic aberration (naik-turun dengan intensitas)
  vec2 dir = uv - 0.5;
  float ca = uAberr + I * 0.014;
  vec3 col;
  col.r = texture2D(tMap, uv + dir * ca).r;
  col.g = texture2D(tMap, uv).g;
  col.b = texture2D(tMap, uv - dir * ca).b;

#ifdef BLOOM
  vec3 glow = vec3(0.0);
  for (int i = 0; i < BLOOM_TAPS; i++) {
    float a = float(i) * 6.28318 / float(BLOOM_TAPS);
    vec2 o = vec2(cos(a), sin(a) * uRes.x / uRes.y) * 0.0045;
    glow += texture2D(tMap, uv + o).rgb + texture2D(tMap, uv + o * 2.4).rgb * 0.6;
  }
  glow /= float(BLOOM_TAPS) * 1.6;
  col += max(glow - 0.35, 0.0) * uBloom * 1.8;
#endif

  // fosfor: luminans dipetakan ke warna tabung
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, uTint * lum * 1.3, 0.42);

  // scanline halus (periode 3 px agar teks tetap terbaca)
  float sl = 0.5 + 0.5 * sin(gl_FragCoord.y * 2.0944);
  col *= 1.0 - uScan * (1.0 - sl);

  // shadow mask RGB triad
  float px = mod(floor(gl_FragCoord.x), 3.0);
  vec3 mask = vec3(1.0 - uMask);
  if (px < 1.0) mask.r = 1.0; else if (px < 2.0) mask.g = 1.0; else mask.b = 1.0;
  col *= mask * (1.0 + uMask * 0.6);

  // statis analog animatif
  float st = hash(gl_FragCoord.xy + fract(t * 43.0) * vec2(91.7, 37.3));
  col += (st - 0.5) * uNoise * (0.18 + I * 0.9);
  // sinyal hilang: statis menelan gambar saat intensitas puncak
  col = mix(col, vec3(st) * uTint * 1.1, smoothstep(0.78, 1.0, I) * 0.7);

  // rolling bar (horizontal hold)
  float roll = fract(t * 0.11);
  float bar = 1.0 - smoothstep(0.0, 0.09, abs(uv.y - roll));
  col *= 1.0 - bar * uRoll * (0.12 + I * 0.25) * m;

  // flicker tipis
  col *= 1.0 - uFlicker * m * (0.025 + 0.025 * sin(t * 113.0) + I * 0.04 * step(0.93, hash(vec2(floor(t * 20.0), 7.0))));

  // vignette + sudut membulat
  vec2 vv = uv * (1.0 - uv.yx);
  col *= pow(clamp(vv.x * vv.y * 16.0, 0.0, 1.0), uVignette);
  vec2 q = abs(uv - 0.5) * 2.0;
  vec2 rc = max(q - 0.9, 0.0);
  float corner = 1.0 - smoothstep(0.085, 0.1, length(rc));
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) corner = 0.0;
  col *= corner;
  if (!inTube) col = vec3(0.0);

  // garis terang saat tabung baru menyala / titik putih saat padam
  float lineGlow = (1.0 - smoothstep(0.0, 0.6, uPower)) * smoothstep(0.02, 0.0, abs(vUv.y - 0.5)) * step(0.001, uPower);
  float dotGlow = smoothstep(0.85, 0.95, uOff) * (1.0 - smoothstep(0.97, 1.0, uOff)) * smoothstep(0.03, 0.0, length((vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  col += vec3(lineGlow + dotGlow) + uFlash;
  col *= 1.0 - smoothstep(0.96, 1.0, uOff);

  // kertas manga terbakar: tepi hangus bergerigi
  float n = fbm(vUv * vec2(uRes.x / uRes.y, 1.0) * 2.6 + 3.1);
  float edge = uBurn * 1.3 - 0.12;
  float paperMask = smoothstep(edge - 0.015, edge, n);
  float rim = smoothstep(edge - 0.07, edge - 0.015, n) * (1.0 - paperMask);
  vec3 paper = uPaper * (0.94 + 0.06 * vnoise(vUv * uRes * 0.5));
  col = mix(col, uInk, rim);
  col = mix(col, paper, paperMask);

  gl_FragColor = vec4(col, 1.0);
}
`;
