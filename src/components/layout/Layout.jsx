import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import SoftCursor from '../primitives/SoftCursor';
import { t } from '../../lib/i18n';
import Nav from './Nav';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

function PageLoading() {
  return (
    <p role="status" className="text-label min-h-dvh px-gutter pt-16 text-ink-soft">
      {t('common.loading')}
    </p>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const inGame = useMatch('/joc/:gameId');
  useEffect(() => {
    // Leave hash links to the browser's own anchor scrolling
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className={inGame ? "flex min-h-dvh flex-col" : "flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0"}>
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
