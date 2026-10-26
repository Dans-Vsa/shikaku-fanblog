/** Layar awal saat chunk route pertama dimuat. Tanpa teks yang bergantung i18n. */
export default function BootScreen() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-paper" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <span className="font-jp text-6xl leading-none" aria-hidden="true">
          刺客
        </span>
        <span className="block h-[3px] w-40 origin-left animate-pulse bg-ink" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
