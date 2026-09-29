import { Link } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import { lessonPath } from '../../content/ro/lessons/index.ts';
import HandArrow from '../primitives/HandArrow';

function NavCard({ topic, direction }) {
  const next = direction === 'next';
  return (
    <Link
      to={lessonPath(topic.slug)}
      rel={direction}
      className={cx(
        'group flex flex-col gap-1 rounded-cell bg-paper-bright p-5 no-underline shadow-card hover:bg-eosin-50',
        next ? 'items-end text-right sm:col-start-2' : 'items-start',
      )}
    >
      <span className="text-label flex items-center gap-2 text-ink-soft">
        {!next && <HandArrow variant="short" animate={false} className="w-6 -scale-x-100" />}
        {t(next ? 'topic.next' : 'topic.prev')}
        {next && <HandArrow variant="short" animate={false} className="w-6" />}
      </span>
      <span className="font-display text-2 font-medium leading-heading">{topic.title}</span>
    </Link>
  );
}

/** Previous / next lesson links, in curriculum order. */
export default function TopicNav({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={t('topic.lessonsNav')} className="grid gap-4 sm:grid-cols-2">
      {prev && <NavCard topic={prev} direction="prev" />}
      {next && <NavCard topic={next} direction="next" />}
    </nav>
  );
}
