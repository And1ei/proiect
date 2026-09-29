import { NavLink } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import ProgressStamp from '../topic/ProgressStamp';
import { LESSON_GROUPS } from './navLinks';

/** Lessons grouped by unit. Shared by the desktop dropdown and the mobile menu. */
export default function LessonsList({ onNavigate, large = false }) {
  const { topic } = useProgress();

  return (
    <div className={cx('grid gap-8', !large && 'sm:grid-cols-2')}>
      {LESSON_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`unit-${group.id}-${large ? 'l' : 's'}`}>
          <h2 id={`unit-${group.id}-${large ? 'l' : 's'}`} className="text-label mb-2 text-ink-soft">
            {t('common.unit', { n: group.id })} · {group.title} · {t('common.grade', { grade: group.grade })}
          </h2>
          <ul className="flex flex-col">
            {group.links.map((link) => (
              <li key={link.slug}>
                <NavLink
                  to={link.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cx(
                      'flex items-baseline gap-3 rounded-tag px-2 py-2 no-underline hover:bg-paper-deep',
                      isActive && 'bg-eosin-50',
                      large ? 'text-2 font-display' : 'text-0',
                    )
                  }
                >
                  <span className="text-label shrink-0 text-ink-soft">{link.number}</span>
                  <span className="flex-1">{link.title}</span>
                  {topic(link.slug).completed && <ProgressStamp size="sm" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
