import Container from '../components/primitives/Container';
import SpecimenLabel from '../components/primitives/SpecimenLabel';
import HandUnderline from '../components/primitives/HandUnderline';
import HandArrow from '../components/primitives/HandArrow';
import { addStrings, t } from '../lib/i18n';
import ds from '../content/ro/ds';
import PageMeta from '../components/layout/PageMeta';
import ColorSection from './design-system/ColorSection';
import TypeSection from './design-system/TypeSection';
import SurfaceSection from './design-system/SurfaceSection';
import ButtonSection from './design-system/ButtonSection';
import CardSection from './design-system/CardSection';
import AnnotationSection from './design-system/AnnotationSection';
import MotionSection from './design-system/MotionSection';
import CursorSection from './design-system/CursorSection';
import FocusSection from './design-system/FocusSection';
import GamesKitSection from './design-system/GamesKitSection';

// This page's strings live outside ui.js so they never reach the production bundle
addStrings('ds', ds);

const PLATES = ['color', 'type', 'surface', 'buttons', 'cards', 'annotation', 'motion', 'cursor', 'focus', 'games'];

// Temporary review page. Remove or hide before launch.
export default function DesignSystem() {
  const heading = t('ds.heading');

  return (
    <Container size="wide" className="flex flex-col gap-section pt-10 sm:pt-16">
      <PageMeta title={t('ds.title')} />
      <header className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div className="flex flex-col items-start gap-5">
          <SpecimenLabel tone="methylene" tilt>
            {t('ds.label')}
          </SpecimenLabel>
          <h1 className="text-display text-5 sm:text-6">
            {heading.before}
            <HandUnderline variant="scribble">{heading.mark}</HandUnderline>
          </h1>
          <p className="prose-body">{t('ds.intro')}</p>
        </div>

        <nav aria-label={t('ds.contentsAria')} className="relative rounded-cell bg-paper-deep p-5 shadow-well">
          <HandArrow
            variant="loop"
            className="absolute -top-12 right-6 hidden w-24 rotate-[160deg] text-eosin-deep lg:block"
          />
          <p className="text-label mb-3 text-ink-soft">{t('ds.contentsLabel')}</p>
          <ol className="grid grid-cols-2 gap-x-4 gap-y-1">
            {PLATES.map((id, i) => (
              <li key={id}>
                <a href={`#${id}`} className="flex items-baseline gap-2 rounded-tag py-1 no-underline hover:underline">
                  <span className="text-label text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
                  <span>{t(`ds.plates.${id}`)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <ColorSection />
      <TypeSection />
      <SurfaceSection />
      <ButtonSection />
      <CardSection />
      <AnnotationSection />
      <MotionSection />
      <CursorSection />
      <FocusSection />
      <GamesKitSection />
    </Container>
  );
}
