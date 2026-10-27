import { useTranslation } from 'react-i18next';
import { footerNav, mainNav, network } from '@/config/site';
import { TransitionLink } from '@/features/page-transition/TransitionLink';
import { LogoMark } from '../ui/icons';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-24 border-t-[3px] border-ink bg-ink text-paper">
      <div className="container-ink grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="text-paper" />
            <span className="t-shikaku text-2xl">{t('brand')}</span>
            <span lang="ja" className="jp text-2xl">
              シカク
            </span>
          </div>
          <p className="max-w-md text-base text-paper/80">{t('footer.disclaimer')}</p>
        </div>
        <nav aria-label={t('nav.main')}>
          <ul className="flex flex-col gap-2">
            {mainNav.map((n) => (
              <li key={n.to}>
                <TransitionLink to={n.to} className="link-ink-light text-lg">
                  {t(n.key)}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-4">
          <p className="t-label text-paper/70">{t('footer.support')}</p>
          <ul className="flex flex-col gap-2">
            {footerNav.map((n) => (
              <li key={n.to}>
                <TransitionLink to={n.to} className="link-ink-light text-lg">
                  {t(n.key)}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-paper/30 pt-4">
            <p className="t-label mb-2 text-paper/70">{t('footer.network')}</p>
            <ul className="flex flex-col gap-1 text-base">
              <li>
                <a href={network.archive} className="link-ink-light">
                  {t('footer.archive')} ↗
                </a>
              </li>
              <li>
                <a href={network.hub} className="link-ink-light">
                  {t('footer.hub')} ↗
                </a>
              </li>
            </ul>
          </div>
          <p className="t-scrawl mt-auto text-2xl text-paper/80">{t('footer.made')}</p>
        </div>
      </div>
    </footer>
  );
}
