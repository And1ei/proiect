import { AnimatePresence, motion } from 'motion/react';
import { spring } from '../../lib/motion';
import { t } from '../../lib/i18n';

/** "SERIE: 3" specimen tag, visible from a streak of 2. Disappears silently when it resets. */
export default function StreakBadge({ value }) {
  const [before, after] = t('game.streak', { n: '\u0000' }).split('\u0000');
  return (
    <AnimatePresence>
      {value >= 2 && (
        <motion.span
          key="streak"
          className="text-label inline-flex items-center gap-2 rounded-tag bg-iodine-100 px-2.5 py-1 text-iodine-deep shadow-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={spring}
        >
          <span aria-hidden="true" className="size-2 rounded-full border border-current" />
          <span>
            {before}
            {/* Only the number pops when the streak grows */}
            <motion.span key={value} className="inline-block" initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={spring}>
              {value}
            </motion.span>
            {after}
          </span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}
