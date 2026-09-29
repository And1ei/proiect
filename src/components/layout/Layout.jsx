import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SoftCursor from '../primitives/SoftCursor';
import { t } from '../../lib/i18n';
import Nav from './Nav';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

function PageLoading() {
  return (
    <p role="status" className="text-label px-gutter pt-16 text-ink-soft">
      {t('common.loading')}
    </p>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Leave hash links to the browser's own anchor scrolling
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link text-label">
        {t('a11y.skipLink')}
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <SoftCursor />
    </div>
  );
}
