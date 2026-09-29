import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';

/** Slim hand-drawn line across the top of the screen on phones and tablets (below lg). */
export default function ReadingProgress({ target }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-40 h-2 lg:hidden">
      <svg viewBox="0 0 400 8" preserveAspectRatio="none" className="size-full overflow-visible">
        <motion.path
          d="M2 5 C 50 2.6, 110 6.4, 170 4.2 S 290 3, 398 4.8"
          fill="none"
          stroke="var(--eosin)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: reduce ? scrollYProgress : smooth }}
        />
      </svg>
    </div>
  );
}
