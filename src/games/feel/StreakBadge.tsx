import { AnimatePresence, motion } from 'motion/react';
import { spring } from '../../lib/motion';
import { t } from '../../lib/i18n';
import { useReducedMotion } from '../../lib/motionPreference';

interface Props {
  value: number;
  /** Current score multiplier; shown as "puncte ×2" from ×2 up. */
  multiplier?: number;
}

/**
 * "SERIE: 3" specimen tag, visible from a streak of 2. Only the number pops when the streak grows;
 * the iodine "flame" dot swells with the multiplier. Disappears quietly when the streak resets.
 */
export default function StreakBadge({ value, multiplier = 1 }: Props) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {value >= 2 && (
        <motion.span
          key="streak"
          data-streak-badge
          className="text-label inline-flex items-center gap-2 rounded-tag bg-iodine-100 px-2.5 py-1 text-iodine-deep shadow-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={spring}
        >
          <motion.span
            aria-hidden="true"
            className="size-2 rounded-blob-a bg-iodine"
            animate={{ scale: 1 + (multiplier - 1) * 0.35 }}
            transition={spring}
          />
          <span>
            {t('games.hud.streak')}:{' '}
            <motion.span
              key={value}
              className="inline-block tabular-nums"
              initial={reduce ? false : { scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={spring}
            >
              {value}
            </motion.span>
          </span>
          {multiplier > 1 && <span className="normal-case">{t('games.hud.multiplier', { n: multiplier })}</span>}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
