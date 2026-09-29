import { useMemo, useRef } from 'react';
import { getTopic, isPublished, neighbors, sectionIdsOf, UNITS } from '../content/ro/topics';
import { t } from '../lib/i18n';
import { useProgress } from '../lib/useProgress';
import Container from '../components/primitives/Container';
import PageMeta from '../components/layout/PageMeta';
import TopicHeader from '../components/topic/TopicHeader';
import BlockList from '../components/topic/BlockList';
import SectionIndex from '../components/topic/SectionIndex';
import ReadingProgress from '../components/topic/ReadingProgress';
import TopicNav from '../components/topic/TopicNav';
import BacQuiz from '../components/quiz/BacQuiz';
import { useSectionTracking } from '../components/topic/useSectionTracking';
import NotFound from './NotFound';
import TopicComingSoon from './TopicComingSoon';
import TopicGames from '../games/core/TopicGames';

/**
 * Lesson template. From 1024px: section index | reading column (40rem, about 65 characters of text) | margin notes.
 * Below that everything stacks and notes sit inline.
 */
export default function TopicPage({ slug }) {
  const topic = getTopic(slug);
  const article = useRef(null);
  const sectionIds = useMemo(() => (topic ? sectionIdsOf(topic) : []), [topic]);
  const activeId = useSectionTracking(slug, sectionIds);
  const { topic: progressOf } = useProgress();

  if (!topic) return <NotFound />;
  if (!isPublished(topic)) return <TopicComingSoon topic={topic} />;
  const progress = progressOf(slug);
  const unit = UNITS.find((u) => u.id === topic.unit);
  const { prev, next } = neighbors(slug);

  return (
    <>
      <PageMeta title={topic.title} description={topic.summary} />
      <ReadingProgress target={article} />

      <Container size="wide" className="flex flex-col gap-section pt-10 sm:pt-14">
        <TopicHeader topic={topic} unit={unit} completed={progress.completed} />

        <div className="grid gap-10 lg:grid-cols-[11rem_minmax(0,40rem)_13rem] lg:gap-x-12">
          <div className="hidden lg:block">
            <SectionIndex sections={topic.sections} activeId={activeId} readIds={progress.sectionsRead} />
          </div>

          <article ref={article} className="lesson flex min-w-0 flex-col gap-16">
            {topic.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id} className="flex flex-col gap-5">
                <h2 id={section.id} className="scroll-mt-8 text-3">
                  {section.heading}
                </h2>
                <BlockList blocks={section.blocks} topic={topic} />
                <div data-section-end={section.id} aria-hidden="true" className="h-px" />
              </section>
            ))}

            <section aria-labelledby="test" className="flex flex-col gap-5">
              <h2 id="test" className="scroll-mt-8 text-3">
                {t('topic.quizHeading')}
              </h2>
              <p className="prose-body">{t('topic.quizIntro')}</p>
              <BacQuiz topic={topic} />
            </section>
          </article>
        </div>

        <TopicGames slug={topic.slug} fig={topic.fig.number} />

        <TopicNav prev={prev} next={next} />
      </Container>
    </>
  );
}
