import { AnimatePresence, motion } from 'motion/react';
import { BLOB_PATHS } from '../../components/primitives/Blob';
import { spring } from '../../lib/motion';
import { cx } from '../../lib/cx';

const CELL = (BLOB_PATHS as Record<string, string>).cell;

/**
 * Lives as the design system's cell blob: stained eosin while alive, a dashed empty membrane once
 * lost. The lost cell deflates with a spring. Decorative: the value is given in text by the HUD.
 */
export default function Lives({ lives, max, className }: { lives: number; max: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cx('inline-flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const alive = i < lives;
        return (
          <span key={i} className="relative inline-block size-5">
            <svg viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible">
              <path d={CELL} fill="none" stroke="var(--ink-faint)" strokeWidth="14" strokeDasharray="1 26" strokeLinecap="round" />
            </svg>
            <AnimatePresence initial={false}>
              {alive && (
                <motion.svg
                  key="alive"
                  viewBox="0 0 200 200"
                  className="absolute inset-0 size-full overflow-visible"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.2, opacity: 0 }}
                  transition={spring}
                >
                  <path d={CELL} fill="var(--eosin)" stroke="var(--ink)" strokeWidth="10" />
                  <circle cx="112" cy="92" r="30" fill="var(--eosin-deep)" />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
