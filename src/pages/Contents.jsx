import { Link } from 'react-router-dom';
import { TOPICS, TOPICS_BY_UNIT, topicPath, sectionIdsOf } from '../content/ro/topics';
import { t } from '../lib/i18n';
import { useProgress } from '../lib/useProgress';
import Container from '../components/primitives/Container';
import SpecimenLabel from '../components/primitives/SpecimenLabel';
import PageMeta from '../components/layout/PageMeta';
import ProgressStamp from '../components/topic/ProgressStamp';
import ResetProgress from '../components/topic/ResetProgress';

function LessonRow({ topic, progress }) {
  const total = sectionIdsOf(topic).length;
  const read = progress.sectionsRead.filter((id) => sectionIdsOf(topic).includes(id)).length;
  return (
    <li className="border-b border-dashed border-ink-faint last:border-0">
      <Link to={topicPath(topic)} className="group grid gap-x-6 gap-y-2 py-5 no-underline sm:grid-cols-[4rem_1fr_auto]">
        <span className="font-display text-4 leading-none text-ink-faint group-hover:text-eosin-deep">
          {String(topic.fig.number).padStart(2, '0')}
        </span>
        <span className="flex flex-col gap-2">
          <span className="flex flex-wrap items-center gap-3">
            <SpecimenLabel fig={topic.fig.number} name={topic.fig.label} />
            {progress.completed && <ProgressStamp size="sm" />}
          </span>
          <span className="font-display text-3 font-medium leading-heading underline decoration-transparent decoration-2 underline-offset-4 group-hover:decoration-eosin">
            {topic.title}
          </span>
          <span className="prose-body text--1 sm:text-0">{topic.summary}</span>
        </span>
        <span className="text-label flex flex-row flex-wrap gap-x-4 gap-y-1 text-ink-soft sm:flex-col sm:items-end sm:text-right">
          <span>{t('common.readMinutes', { n: topic.readMinutes })}</span>
          {read > 0 && <span>{t('contents.sectionsRead', { read, total })}</span>}
          {progress.quizBest && <span>{t('contents.bestScore', progress.quizBest)}</span>}
        </span>
      </Link>
    </li>
  );
}

// Temporary table of contents; the designed home page comes in Module 4.
export default function Contents() {
  const { topic: progressOf, blocked } = useProgress();
  const done = TOPICS.filter((tp) => progressOf(tp.slug).completed).length;

  return (
    <Container size="default" className="flex flex-col gap-12 pt-10 sm:pt-16">
      <PageMeta />
      <header className="flex max-w-measure flex-col items-start gap-5">
        <SpecimenLabel fig={0} name={t('contents.label')} tone="eosin" tilt />
        <h1 className="text-display text-5 sm:text-6">{t('contents.heading')}</h1>
        <p className="prose-body">{t('contents.intro')}</p>
      </header>

      {TOPICS_BY_UNIT.map((unit) => (
        <section key={unit.id} aria-labelledby={`unit-${unit.id}`}>
          <h2 id={`unit-${unit.id}`} className="mb-2 flex flex-wrap items-baseline gap-x-4 text-2">
            <span>
              {t('common.unit', { n: unit.id })}: {unit.title}
            </span>
            <span className="text-label text-ink-soft">{t('common.grade', { grade: unit.grade })}</span>
          </h2>
          <ol>
            {unit.topics.map((topic) => (
              <LessonRow key={topic.slug} topic={topic} progress={progressOf(topic.slug)} />
            ))}
          </ol>
        </section>
      ))}

      <section aria-labelledby="progress-title" className="flex flex-col gap-4 rounded-cell bg-paper-deep p-6 shadow-well">
        <h2 id="progress-title" className="text-2">
          {t('progress.heading')}
        </h2>
        <p>{t('progress.completedCount', { done, total: TOPICS.length })}</p>
        <p className="text--1 text-ink-soft">{t(blocked ? 'progress.blocked' : 'progress.stored')}</p>
        <ResetProgress />
      </section>
    </Container>
  );
}
