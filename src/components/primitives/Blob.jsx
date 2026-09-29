import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { breathing, stillPose } from '../../lib/motion';

// Organic cell outlines, all in a 200×200 box.
export const BLOB_PATHS = {
  cell: 'M104 12C150 10 190 44 188 98C186 150 150 188 98 186C48 184 12 150 14 100C16 52 56 14 104 12Z',
  amoeba:
    'M96 14C128 8 148 34 170 50C194 68 192 104 178 132C164 162 134 190 98 184C66 180 52 160 32 142C10 122 8 88 22 62C38 34 64 20 96 14Z',
  bean: 'M60 30C96 6 150 14 176 50C200 84 186 128 160 150C132 174 114 150 90 168C62 190 22 172 14 134C6 98 28 52 60 30Z',
  vesicle: 'M100 20C142 18 180 48 180 96C180 146 146 182 100 180C54 178 22 150 20 102C18 58 58 22 100 20Z',
};

const fills = {
  eosin: 'text-eosin-200',
  methylene: 'text-methylene-100',
  iodine: 'text-iodine-100',
  paper: 'text-paper-deep',
};

/**
 * Decorative organic shape. `membrane` draws a phospholipid-style double outline
 * (dotted heads + thin inner line). Breathes slowly unless reduced motion is on.
 */
/**
 * @param {Object & Record<string, unknown>} props
 * @param {keyof typeof BLOB_PATHS} [props.shape]
 * @param {'eosin' | 'methylene' | 'iodine' | 'paper'} [props.tone]
 * @param {boolean} [props.membrane]
 * @param {boolean} [props.breathe]
 * @param {number} [props.duration]
 * @param {number} [props.delay]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} [props.children]
 */
export default function Blob({
  shape = 'cell',
  tone = 'eosin',
  membrane = false,
  breathe = true,
  duration = 7.5,
  delay = 0,
  className,
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const d = BLOB_PATHS[shape];
  const loop = breathe && !reduce ? breathing({ duration, delay }) : stillPose;

  return (
    <motion.div className={cx(!/\b(absolute|fixed)\b/.test(className ?? '') && 'relative', className)} {...loop} {...rest}>
      <svg viewBox="0 0 200 200" className={cx('absolute inset-0 size-full overflow-visible', fills[tone])} aria-hidden="true" focusable="false">
        <path d={d} fill="currentColor" />
        {membrane && (
          <g fill="none" className="text-ink">
            {/* Lipid heads: round dashes of zero length become dots */}
            <path d={d} stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="0 7" opacity="0.55" />
            <path
              d={d}
              stroke="currentColor"
              strokeWidth="0.9"
              opacity="0.35"
              transform="translate(100 100) scale(0.955) translate(-100 -100)"
            />
          </g>
        )}
      </svg>
      {children && <div className="relative">{children}</div>}
    </motion.div>
  );
}
