import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { springSettle } from '../../lib/motion';

// Paths are drawn in a 200×20 box (circle: 200×60) and stretched to the word's width.
const strokes = {
  scribble: ['M3 13 C 40 6, 78 16, 118 10 S 176 7, 197 11'],
  wave: ['M2 12 C 18 4, 30 18, 48 11 S 78 4, 96 12 S 128 18, 146 10 S 178 5, 198 12'],
  double: ['M4 8 C 60 4, 130 10, 196 6', 'M10 15 C 70 12, 140 17, 190 13'],
  circle: [
    'M108 6 C 50 2, 6 14, 5 31 C 4 49, 52 57, 104 56 C 158 55, 196 46, 195 29 C 194 12, 150 3, 96 5 C 80 6, 66 9, 58 12',
  ],
};

const colors = {
  eosin: 'text-eosin',
  methylene: 'text-methylene',
  iodine: 'text-iodine',
  ink: 'text-ink',
};

/**
 * Wraps inline text with a hand-drawn stroke that draws itself in when scrolled into view.
 * `variant`: scribble | wave | double | circle.
 */
export default function HandUnderline({ variant = 'scribble', color = 'eosin', className, children }) {
  const reduce = useReducedMotion();
  const isCircle = variant === 'circle';
  const paths = strokes[variant];

  return (
    <span className={cx('relative inline-block whitespace-nowrap', className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={isCircle ? '0 0 200 60' : '0 0 200 20'}
        preserveAspectRatio="none"
        className={cx(
          'pointer-events-none absolute overflow-visible',
          colors[color],
          isCircle ? '-left-[12%] -top-[30%] h-[160%] w-[124%]' : '-bottom-[0.28em] left-0 h-[0.45em] w-full',
        )}
      >
        {paths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={isCircle ? 3 : 5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ ...springSettle, delay: 0.15 + i * 0.18 }}
          />
        ))}
      </svg>
    </span>
  );
}
