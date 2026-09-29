import { Link } from 'react-router-dom';
import Container from '../primitives/Container';
import SpecimenLabel from '../primitives/SpecimenLabel';
import Blob from '../primitives/Blob';
import Wordmark from '../brand/Wordmark';
import { t } from '../../lib/i18n';
import { PAGE_LINKS } from './navLinks';
import { DESIGN_SYSTEM_PATH } from '../../pages/design-system/path';

const linkClass = 'text-ink-soft underline decoration-ink-faint hover:text-ink hover:decoration-eosin';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-section overflow-hidden border-t border-dashed border-ink-faint bg-paper-deep">
      <Blob
        shape="amoeba"
        tone="eosin"
        membrane
        duration={9}
        className="pointer-events-none absolute -right-32 -top-32 size-64 opacity-60 sm:-right-10 sm:-top-20 sm:size-96"
      />

      <Container size="wide" className="relative grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr] sm:py-16">
        <div className="flex flex-col gap-4">
          <Wordmark />
          <p className="prose-body max-w-[38ch] text--1 sm:text-0">{t('footer.blurb')}</p>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          <nav aria-label={t('footer.label')}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
              {PAGE_LINKS.map(({ to, labelKey }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
              {import.meta.env.DEV && (
                <li>
                  <Link to={DESIGN_SYSTEM_PATH} className={linkClass}>
                    {t('footer.designSystem')}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <SpecimenLabel tone="ink" className="self-start sm:self-end">
            {t('footer.slideSet', { year })}
          </SpecimenLabel>
        </div>
      </Container>

      <Container size="wide" className="relative pb-6">
        <p className="text-label text-ink-soft">{t('footer.credit')}</p>
      </Container>
    </footer>
  );
}
