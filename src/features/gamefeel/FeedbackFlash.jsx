import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { BLOB_PATHS } from '../../components/primitives/Blob';

const TINTS = ['var(--eosin)', 'var(--methylene)', 'var(--iodine)'];
const SHAPES = Object.values(BLOB_PATHS);

/**
 * A handle for one element's feedback. Pass it to <FeedbackFlash flash={…}> and call fire().
 * `origin` ({ x, y } in px inside the wrapper) makes the burst start there instead of the centre.
 */
export function useFlash() {
  const [signal, setSignal] = useState(null);
  const fire = useCallback((kind, origin) => setSignal({ kind, origin, id: `${Date.now()}-${Math.random()}` }), []);
  return useMemo(() => ({ signal, fire }), [signal, fire]);
}

function Burst({ id, origin }) {
  // 5 particles at even angles with a little jitter derived from the id (stable per burst)
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 + (seed % 7) * 0.2;
    const dist = 28 + ((seed + i * 13) % 16);
    return (
      <motion.svg
        key={i}
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="pointer-events-none absolute -ml-[5px] -mt-[5px] size-[10px] overflow-visible"
        style={{ left: origin ? origin.x : '50%', top: origin ? origin.y : '50%' }}
        initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
        animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 1, opacity: 0 }}
        transition={{
          x: { type: 'spring', stiffness: 180, damping: 16 },
          y: { type: 'spring', stiffness: 180, damping: 16 },
          scale: { type: 'spring', stiffness: 180, damping: 16 },
          opacity: { type: 'spring', duration: 0.5, bounce: 0 },
        }}
      >
        <path d={SHAPES[(seed + i) % SHAPES.length]} fill={TINTS[i % TINTS.length]} />
      </motion.svg>
    );
  });
}

/**
 * Wraps an element that can be judged. Correct: blob particles pop outward and the element
 * scales up and settles. Incorrect: a small spring-damped horizontal wobble (max 4px).
 * Reduced motion: no movement, just a brief border colour flash.
 */
export default function FeedbackFlash({ flash, as = 'div', className, particles = true, pop = 1.06, children, ...rest }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();
  const [bursts, setBursts] = useState([]);
  const [ring, setRing] = useState(null);
  const signal = flash?.signal;

  useEffect(() => {
    if (!signal || !scope.current) return undefined;
    if (reduce) {
      setRing(signal.kind);
      const timer = setTimeout(() => setRing(null), 650);
      return () => clearTimeout(timer);
    }
    if (signal.kind === 'correct') {
      animate(scope.current, { scale: [pop, 1] }, { type: 'spring', stiffness: 300, damping: 12 });
      if (particles) {
        setBursts((b) => [...b, { id: signal.id, origin: signal.origin }]);
        // Not tied to this effect's cleanup: a quick second answer must not strand the first burst
        setTimeout(() => setBursts((b) => b.filter((x) => x.id !== signal.id)), 700);
      }
    } else {
      // Starts 4px left and springs home with low damping: about three shrinking oscillations
      animate(scope.current, { x: [-4, 0] }, { type: 'spring', stiffness: 520, damping: 9 });
    }
    return undefined;
    // Only a new signal should trigger; animate/scope are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  const Tag = motion[as];
  return (
    <Tag
      ref={scope}
      data-flash={ring ?? undefined}
      className={cx('relative', className)}
      {...rest}
    >
      {children}
      <AnimatePresence>
        {bursts.map((b) => (
          <Burst key={b.id} id={b.id} origin={b.origin} />
        ))}
      </AnimatePresence>
    </Tag>
  );
}
