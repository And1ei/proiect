import type { RefObject } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import type { Stain } from '../../content/ro/lessons/index.ts';

/**
 * Reading progress as a notebook margin rule: a faint vertical line down the left edge of the page
 * that fills with the topic's stain as you read. Never a bar under the header.
 */
export default function ReadingRule({ target, stain }: { target: RefObject<HTMLElement | null>; stain: Stain }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start 40%', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-[12vh] left-1.5 top-[18vh] z-30 w-2 sm:left-3">
      <svg viewBox="0 0 8 400" preserveAspectRatio="none" className="size-full overflow-visible">
        <path d="M4 2 C 3 80, 5 160, 4 240 S 3 340, 4 398" fill="none" stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
        <motion.path
          d="M4 2 C 3 80, 5 160, 4 240 S 3 340, 4 398"
          fill="none"
          stroke={`var(--${stain})`}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduce ? scrollYProgress : smooth }}
        />
      </svg>
    </div>
  );
}
