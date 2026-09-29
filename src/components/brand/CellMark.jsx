import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { breathing, stillPose } from '../../lib/motion';

/** Hand-drawn cell: wobbly membrane, eosin nucleus, a couple of organelles. */
export default function CellMark({ className, breathe = true }) {
  const reduce = useReducedMotion();
  const loop = breathe && !reduce ? breathing({ duration: 8, amount: 0.04 }) : stillPose;

  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={cx('shrink-0 overflow-visible', className)}
      aria-hidden="true"
      focusable="false"
      {...loop}
    >
      <path
        d="M25 4.5c10.5-.4 19 7.3 18.6 18.4-.4 11.6-8.2 20.6-19.4 20.6C13 43.6 4.2 35.3 4.6 24 5 13 13.8 5 25 4.5Z"
        fill="var(--paper-bright)"
        stroke="var(--ink)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Second, offset pass of the membrane to read as a quick pen sketch */}
      <path
        d="M9.5 15.5C13 9.5 19 6.4 26 6.8"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M25.5 16.5c4.6-.1 8.1 3.1 8 7.6-.1 4.6-3.8 8-8.3 7.9-4.6-.1-8-3.4-7.8-7.8.2-4.4 3.6-7.6 8.1-7.7Z"
        fill="var(--eosin)"
        stroke="var(--ink)"
        strokeWidth="1.8"
      />
      <circle cx="27" cy="22.5" r="2.2" fill="var(--ink)" />
      <ellipse cx="14" cy="30" rx="3.4" ry="1.8" transform="rotate(-30 14 30)" fill="var(--methylene)" />
      <circle cx="34.5" cy="35" r="1.6" fill="var(--iodine)" />
      <circle cx="15.5" cy="15" r="1.2" fill="var(--ink)" opacity="0.6" />
    </motion.svg>
  );
}
