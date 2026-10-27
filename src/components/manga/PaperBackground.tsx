/**
 * Lapisan serat kertas + noise tetap (fixed) di belakang konten.
 * Tekstur SVG feTurbulence buatan sendiri (public/textures). Statis = nol biaya per frame.
 */
export function PaperBackground() {
  return (
    <div aria-hidden="true" className="paper-bg pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}textures/noise.svg')`,
          backgroundSize: '200px 200px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgb(var(--ink-rgb) / 0.09) 100%)',
        }}
      />
    </div>
  );
}
