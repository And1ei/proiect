import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import SpecimenLabel from '../../components/primitives/SpecimenLabel';
import SpecimenStamp from './SpecimenStamp';
import StreakBadge from './StreakBadge';
import SoundToggle from './SoundToggle';

/** Shared shell for every interactive: tag, title, streak, sound toggle, stamp, reaction line. */
export default function InteractiveFrame({ topic, title, intro, session, children, className }) {
  const { message, streak, stamp, completedNow } = session;
  return (
    <div className={cx('flex flex-col gap-6 rounded-cell bg-paper-bright p-5 shadow-card sm:p-7', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <SpecimenLabel fig={topic.fig.number} name={t('interactive.label')} tone="methylene" />
            {stamp && <SpecimenStamp variant={stamp} stampIn={Boolean(completedNow)} />}
          </div>
          <h3 className="font-display text-3 font-medium leading-heading">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StreakBadge value={streak} />
          <SoundToggle />
        </div>
      </div>

      {intro && <p className="prose-body text--1 sm:text-0">{intro}</p>}

      {children}

      <p
        role="status"
        aria-live="polite"
        className={cx(
          'text-label min-h-[1.5em]',
          message?.kind === 'correct' ? 'text-methylene-deep' : 'text-iodine-deep',
        )}
      >
        {message && <span key={message.id}>{message.text}</span>}
      </p>
    </div>
  );
}
