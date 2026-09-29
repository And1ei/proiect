import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { springSettle } from '../../lib/motion';

// Shaft and head drawn as separate strokes so the head lands after the line.
const shapes = {
  curve: {
    viewBox: '0 0 120 80',
    shaft: 'M6 70 C 20 30, 58 14, 104 20',
    head: 'M88 9 L 105 20 L 90 32',
  },
  loop: {
    viewBox: '0 0 140 80',
    shaft: 'M6 58 C 30 66, 48 44, 40 30 C 32 16, 12 30, 26 42 C 44 58, 92 54, 126 30',
    head: 'M110 24 L 127 29 L 120 45',
  },
  short: {
    viewBox: '0 0 48 24',
    shaft: 'M3 13 C 14 10, 28 14, 42 12',
    head: 'M34 5 L 43 12 L 35 19',
  },
};

/** Hand-drawn arrow for pointing at things. Decorative unless given a `label`. */
export default function HandArrow({ variant = 'curve', className, label, animate = true }) {
  const reduce = useReducedMotion();
  const s = shapes[variant];
  const draw = animate && !reduce;

  return (
    <svg
      viewBox={s.viewBox}
      className={cx('overflow-visible', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {[s.shaft, s.head].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={draw ? { pathLength: 0 } : false}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ ...springSettle, delay: i * 0.45 }}
        />
      ))}
    </svg>
  );
}
