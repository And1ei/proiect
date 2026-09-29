import { t } from '../lib/i18n';
import Container from '../components/primitives/Container';
import SpecimenLabel from '../components/primitives/SpecimenLabel';
import BlobButton from '../components/primitives/BlobButton';
import Blob from '../components/primitives/Blob';
import PageMeta from '../components/layout/PageMeta';
import TopicNav from '../components/topic/TopicNav';
import { neighbors } from '../content/ro/topics';
import TopicGames from '../games/core/TopicGames';

/** Page for a registered topic whose lesson isn't written yet (status 'coming-soon'). */
export default function TopicComingSoon({ topic }) {
  const { prev, next } = neighbors(topic.slug);
  return (
    <>
      <PageMeta title={topic.title} description={topic.summary} />
      <Container size="default" className="flex flex-col gap-section pt-10 sm:pt-14">
        <header className="flex max-w-measure flex-col items-start gap-5">
          <SpecimenLabel fig={topic.fig.number} name={topic.fig.label} tone="eosin" tilt />
          <h1 className="text-display text-5 sm:text-6">{topic.title}</h1>
          <p className="prose-body text-1">{topic.summary}</p>
        </header>

        <section
          aria-labelledby="stub-heading"
          className="relative flex flex-col items-start gap-4 overflow-hidden rounded-cell border-2 border-dashed border-ink-faint p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
        >
          <Blob shape="amoeba" tone="methylene" membrane className="size-20 shrink-0" />
          <div className="flex flex-col items-start gap-3">
            <h2 id="stub-heading" className="text-3">
              {t('topic.stubHeading')}
            </h2>
            <p className="prose-body">{t('topic.stubBody')}</p>
            <BlobButton to="/" variant="paper" size="sm" shape="b">
              {t('topic.stubBack')}
            </BlobButton>
          </div>
        </section>

        <TopicGames slug={topic.slug} fig={topic.fig.number} />

        <TopicNav prev={prev} next={next} />
      </Container>
    </>
  );
}
