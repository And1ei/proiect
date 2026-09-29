import { motion } from 'motion/react';
import { BLOB_PATHS } from '../../components/primitives/Blob';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';
import { t } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import type { Stars as StarCount } from './types';

const SHAPES = ['cell', 'bean', 'vesicle'].map((k) => (BLOB_PATHS as Record<string, string>)[k]);

/**
 * 0–3 "stars" drawn as stained specimen blobs (iodine when earned, empty membrane when not).
 * `animate` drops them in one by one, for the results screen.
 */
export default function Stars({ value, size = 'md', animate = false, className }: { value: StarCount; size?: 'sm' | 'md' | 'lg'; animate?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const px = { sm: 'size-4', md: 'size-7', lg: 'size-11' }[size];
  return (
    <span role="img" aria-label={t('games.stars', { n: value })} className={cx('inline-flex items-end gap-1.5', className)}>
      {SHAPES.map((d, i) => {
        const earned = i < value;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 200 200"
            aria-hidden="true"
            className={cx(px, 'overflow-visible', i === 1 && 'mb-1')}
            initial={animate && earned && !reduce ? { scale: 0, rotate: -25 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...spring, delay: animate ? 0.25 + i * 0.22 : 0 }}
          >
            {earned ? (
              <>
                <path d={d} fill="var(--iodine)" stroke="var(--ink)" strokeWidth="9" />
                <ellipse cx="78" cy="74" rx="26" ry="18" transform="rotate(-30 78 74)" fill="var(--iodine-200)" />
              </>
            ) : (
              <path d={d} fill="var(--paper-deep)" stroke="var(--ink-faint)" strokeWidth="9" strokeDasharray="2 22" strokeLinecap="round" />
            )}
          </motion.svg>
        );
      })}
    </span>
  );
}
