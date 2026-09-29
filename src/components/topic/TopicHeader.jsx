import { useEffect, useRef } from 'react';
import { t } from '../../lib/i18n';
import SpecimenLabel from '../primitives/SpecimenLabel';
import ProgressStamp from './ProgressStamp';

/** Lesson header: FIG tag, title, summary, reading time, objectives, completion stamp. */
export default function TopicHeader({ topic, unit, completed }) {
  // Only animate the stamp when completion happens while the page is open
  const wasCompleted = useRef(completed);
  const stampIn = completed && !wasCompleted.current;
  useEffect(() => {
    wasCompleted.current = completed;
  }, [completed]);

  return (
    <header className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <SpecimenLabel fig={topic.fig.number} name={topic.fig.label} tone="eosin" tilt />
          {completed && <ProgressStamp stampIn={stampIn} />}
        </div>
        <h1 className="text-display text-5 sm:text-6">{topic.title}</h1>
        <p className="prose-body text-1">{topic.summary}</p>
        <p className="text-label flex flex-wrap gap-x-4 gap-y-1 text-ink-soft">
          <span>{t('common.unit', { n: unit.id })} · {unit.title}</span>
          <span>{t('common.grade', { grade: topic.grade })}</span>
          <span>{t('common.readMinutes', { n: topic.readMinutes })}</span>
        </p>
      </div>

      <section aria-labelledby="objectives-title" className="rounded-cell-alt bg-paper-deep p-5 shadow-well sm:p-6">
        <h2 id="objectives-title" className="text-label mb-3 text-ink-soft">
          {t('topic.objectives')}
        </h2>
        <ol className="lesson-ol text--1 sm:text-0">
          {topic.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
      </section>
    </header>
  );
}
