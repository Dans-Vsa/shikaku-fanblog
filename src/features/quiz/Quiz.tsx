import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { playSfx } from '@/lib/audio-bridge';
import { isOneOf, readStore, writeStore } from '@/lib/storage';
import { renderResultCard } from './result-card';

interface Answer {
  t: string;
  s: number;
  y: number;
}
interface Question {
  q: string;
  a: Answer[];
}
interface Result {
  name: string;
  jp: string;
  tagline: string;
  body: string;
}
export interface QuizContent {
  title: string;
  intro: string;
  start: string;
  next: string;
  back: string;
  progress: string;
  retry: string;
  download: string;
  share: string;
  shared: string;
  copied: string;
  cardFooter: string;
  questions: Question[];
  results: Record<'shikaku' | 'yugeru' | 'both', Result>;
}

type ResultKey = 'shikaku' | 'yugeru' | 'both';
const isResult = isOneOf<ResultKey>('shikaku', 'yugeru', 'both');

/** Kuis "Kamu Shikaku atau Yugeru?" + kartu hasil yang bisa diunduh/dibagikan. */
export function Quiz({ c }: { c: QuizContent }) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const total = c.questions.length;
  const done = step >= total;
  const [lastResult] = useState<ResultKey | null>(() =>
    readStore<ResultKey | null>('quiz-result', null, (v): v is ResultKey | null => isResult(v)),
  );

  const score = useMemo(() => {
    let s = 0;
    let y = 0;
    answers.forEach((ai, qi) => {
      const a = c.questions[qi]?.a[ai];
      if (a) {
        s += a.s;
        y += a.y;
      }
    });
    return { s, y };
  }, [answers, c.questions]);

  const key: ResultKey =
    Math.abs(score.s - score.y) <= 2 ? 'both' : score.s > score.y ? 'shikaku' : 'yugeru';
  const result = c.results[key];

  useEffect(() => {
    if (done) writeStore('quiz-result', key);
  }, [done, key]);

  // pratinjau kartu dibuat saat hasil keluar (dan saat bahasa berubah)
  useEffect(() => {
    if (!done) return;
    let url: string | null = null;
    let alive = true;
    void renderResultCard({
      ...result,
      scoreS: score.s,
      scoreY: score.y,
      title: c.title,
      footer: c.cardFooter,
    }).then((blob) => {
      if (!alive) return;
      url = URL.createObjectURL(blob);
      setPreview(url);
    });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [done, result, score, c.title, c.cardFooter]);

  const choose = (i: number) => {
    playSfx('tick');
    setAnswers((prev) => {
      const next = prev.slice(0, step);
      next[step] = i;
      return next;
    });
    setStep((s) => s + 1);
  };

  const download = async () => {
    const blob = await renderResultCard({
      ...result,
      scoreS: score.s,
      scoreY: score.y,
      title: c.title,
      footer: c.cardFooter,
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `shikaku-quiz-${key}.png`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const share = async () => {
    const text = `${c.title} → ${result.name} (${result.jp}). ${result.tagline}`;
    try {
      const blob = await renderResultCard({
        ...result,
        scoreS: score.s,
        scoreY: score.y,
        title: c.title,
        footer: c.cardFooter,
      });
      const file = new File([blob], `shikaku-quiz-${key}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: c.title, text });
        setStatus(c.shared);
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: c.title, text, url: window.location.href });
        setStatus(c.shared);
        return;
      }
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      setStatus(c.copied);
    } catch {
      /* pengguna membatalkan dialog share */
    }
  };

  if (step < 0) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="max-w-prose text-lg">{c.intro}</p>
        {lastResult && (
          <p className="t-label text-ink-soft">
            ↺ {c.results[lastResult].name} ({c.results[lastResult].jp})
          </p>
        )}
        <Button onClick={() => setStep(0)} icon="arrow">
          {c.start}
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]" aria-live="polite">
        <div className="flex flex-col gap-4">
          <span lang="ja" className="jp text-8xl leading-none">
            {result.jp}
          </span>
          <h3 className="t-shikaku text-5xl">{result.name}</h3>
          <p className="t-yugeru text-2xl">{result.tagline}</p>
          <p className="max-w-prose text-lg">{result.body}</p>
          <div
            className="flex items-center gap-2 font-mono text-sm"
            aria-label={`Shikaku ${score.s} · Yugeru ${score.y}`}
          >
            <span>SHIKAKU</span>
            <span className="relative h-3 flex-1 border-2 border-ink">
              <span
                className="absolute inset-0 origin-left bg-ink"
                style={{ transform: `scaleX(${score.s / Math.max(1, score.s + score.y)})` }}
              />
            </span>
            <span>YUGERU</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void download()}>{c.download}</Button>
            <Button variant="paper" onClick={() => void share()}>
              {c.share}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setAnswers([]);
                setStep(0);
                setStatus('');
              }}
            >
              {c.retry}
            </Button>
          </div>
          <p role="status" className="t-label min-h-5">
            {status}
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm">
          {preview ? (
            <img
              src={preview}
              alt={`${c.title}: ${result.name} — ${result.tagline}`}
              className="w-full border-[3px] border-ink shadow-[8px_8px_0_var(--ink)]"
            />
          ) : (
            <div className="aspect-[4/5] w-full animate-pulse border-[3px] border-ink bg-paper-deep" />
          )}
        </div>
      </div>
    );
  }

  const q = c.questions[step];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <p className="t-label">
          {c.progress.replace('{{n}}', String(step + 1)).replace('{{total}}', String(total))}
        </p>
        <span className="relative h-2 flex-1 border border-ink">
          <span
            className="absolute inset-0 origin-left bg-ink transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${step / total})` }}
          />
        </span>
      </div>
      <fieldset key={step} className="quiz-step flex flex-col gap-4">
        <legend className="mb-4 text-3xl font-bold md:text-4xl">{q.q}</legend>
        {q.a.map((a, i) => (
          <button
            key={a.t}
            type="button"
            onClick={() => choose(i)}
            aria-pressed={answers[step] === i}
            className="group flex items-center gap-4 border-[3px] border-ink bg-paper px-5 py-4 text-left text-lg transition-[transform,background-color,color] duration-200 ease-snap hover:-translate-y-0.5 hover:bg-ink hover:text-paper active:scale-[0.98] aria-pressed:bg-ink aria-pressed:text-paper"
          >
            <span className="t-label grid h-8 w-8 shrink-0 place-items-center border-2 border-current">
              {String.fromCharCode(65 + i)}
            </span>
            {a.t}
          </button>
        ))}
      </fieldset>
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="t-label self-start underline"
        >
          ← {c.back}
        </button>
      )}
    </div>
  );
}
