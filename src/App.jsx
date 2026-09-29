import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionPreferenceProvider } from './lib/motionPreference';
import Layout from './components/layout/Layout';
import { TOPICS } from './content/ro/topics';

const Contents = lazy(() => import('./pages/Contents'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const Glossary = lazy(() => import('./pages/Glossary'));
const About = lazy(() => import('./pages/About'));
const Credits = lazy(() => import('./pages/Credits'));
const GamesIndex = lazy(() => import('./pages/GamesIndex'));
const GamePage = lazy(() => import('./pages/GamePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Dev-only pages. In production import.meta.env.DEV is false, so these imports are dropped from the bundle.
const DesignSystem = import.meta.env.DEV ? lazy(() => import('./pages/DesignSystem')) : null;
const DevCrash = import.meta.env.DEV ? lazy(() => import('./pages/DevCrash')) : null;
const DESIGN_SYSTEM_ROUTE = 'sistem-de-design';

export default function App() {
  return (
    <MotionPreferenceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Contents />} />
            {TOPICS.map((topic) => (
              <Route key={topic.slug} path={topic.slug} element={<TopicPage slug={topic.slug} />} />
            ))}
            <Route path="jocuri" element={<GamesIndex />} />
            <Route path="joc/:gameId" element={<GamePage />} />
            <Route path="dictionar" element={<Glossary />} />
            <Route path="despre" element={<About />} />
            <Route path="credite" element={<Credits />} />
            {DesignSystem && <Route path={DESIGN_SYSTEM_ROUTE} element={<DesignSystem />} />}
            {DevCrash && <Route path="__eroare" element={<DevCrash />} />}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionPreferenceProvider>
  );
}
