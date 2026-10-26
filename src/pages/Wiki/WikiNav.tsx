import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { wikiSections } from '@/config/site';
import { TransitionLink } from '@/features/page-transition/TransitionLink';

/** Indeks laci arsip wiki — tab berbentuk label map berkas. */
export function WikiNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <nav aria-label={t('nav.wiki')} className="container-ink">
      <ul className="flex flex-wrap gap-x-1 gap-y-2 border-b-[3px] border-ink">
        {wikiSections.map((s) => {
          const active = pathname === s.to;
          return (
            <li key={s.to}>
              <TransitionLink
                to={s.to}
                aria-current={active ? 'page' : undefined}
                className={`t-label -mb-[3px] block border-[3px] px-3 py-2 transition-colors duration-200 ${
                  active
                    ? 'border-ink border-b-paper bg-paper'
                    : 'border-transparent hover:border-ink/40 hover:bg-paper-deep/60'
                }`}
              >
                {t(s.key)}
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
