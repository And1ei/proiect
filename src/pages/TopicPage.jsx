import { useRef } from 'react';
import { getLesson, neighbors, catalogNumber, readingMinutes, sectionPath } from '../content/ro/lessons/index.ts';
import { t, tp } from '../lib/i18n';
import { cx } from '../lib/cx';
import { STAIN } from '../lib/stains';
import { gamesForTopic } from '../games/registry';
import Container from '../components/primitives/Container';
import PageMeta from '../components/layout/PageMeta';
import Lesson from '../components/lesson/Lesson';
import Stamps from '../components/lesson/Stamps';
import ReadingRule from '../components/lesson/ReadingRule';
import TopicNav from '../components/topic/TopicNav';
import Quiz from '../components/quiz/Quiz';
import NotFound from './NotFound';

/** A topic: its lesson in page mode (sections, margin notes, games in place), then "Verifică-te". */
export default function TopicPage({ slug }) {
  const lesson = getLesson(slug);
  const article = useRef(null);
  if (!lesson) return <NotFound />;
  const { prev, next } = neighbors(slug);
  const s = STAIN[lesson.stain];
  const games = gamesForTopic(slug);

  return (
    <>
      <PageMeta title={lesson.title} description={lesson.hook.replace(/\*/g, '')} />
      <ReadingRule target={article} stain={lesson.stain} />
      <Container size="wide" className="flex flex-col gap-section pt-10 sm:pt-14">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,40rem)_minmax(0,15rem)] lg:gap-x-10">
          <div className="flex flex-col items-start gap-4">
            <p className={cx('font-mono text--1 uppercase tracking-[0.1em]', s.text)}>{t('lesson.preparat', { n: catalogNumber(lesson) })}</p>
            <h1 className="text-display text-5 sm:text-6">{lesson.title}</h1>
            <p className="font-display text-2 leading-heading text-ink-soft">{lesson.hook.replace(/\*/g, '')}</p>
          </div>
          <dl className="flex flex-col gap-3 self-end border-l-2 border-dashed border-ink-faint pl-4 text--1">
            <div>
              <dt className="text-label text-ink-soft">{t('topicPage.reading')}</dt>
              <dd>{t('lesson.readingTime', { n: readingMinutes(lesson) })}</dd>
            </div>
            <div>
              <dt className="text-label text-ink-soft">{t('topicPage.games')}</dt>
              <dd>{games.length ? tp('topicPage.gameCount', games.length) : t('topicPage.noGames')}</dd>
            </div>
            <div>
              <dt className="text-label text-ink-soft">{t('topicPage.progress')}</dt>
              <dd className="pt-1">
                <Stamps lesson={lesson} />
              </dd>
            </div>
          </dl>
        </header>

        <div ref={article}>
          <Lesson lesson={lesson} mode="page">
            <section aria-labelledby="verifica" className="flex max-w-[40rem] flex-col gap-4 pt-6">
              <h2 id="verifica" className="text-3">
                {t('lesson.check')}
              </h2>
              <p className="lesson-body text-ink-soft">{t('lesson.checkIntro')}</p>
              <Quiz lesson={lesson} sectionHref={(id) => sectionPath(slug, id)} />
            </section>
          </Lesson>
        </div>

        <TopicNav prev={prev} next={next} />
      </Container>
    </>
  );
}
