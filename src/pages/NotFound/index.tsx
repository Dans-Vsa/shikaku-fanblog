import { useTranslation } from 'react-i18next';
import { ButtonLink } from '@/components/ui/Button';
import { InkBlot } from '@/components/manga/InkBlot';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <main id="main" className="container-ink grid min-h-[70vh] place-items-center py-20">
      <div className="relative flex max-w-xl flex-col items-start gap-6">
        <InkBlot variant={1} className="absolute -left-10 -top-14 h-40 w-40 opacity-10" />
        <p className="t-label">404</p>
        <h1 className="t-display">{t('notFound.title')}</h1>
        <p className="text-xl text-ink-soft">{t('notFound.body')}</p>
        <ButtonLink to="/">{t('notFound.cta')}</ButtonLink>
      </div>
    </main>
  );
}
