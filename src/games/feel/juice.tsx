// "Juice": small spring-driven reactions that make actions feel physical. Springs only (no linear
// or default easing); every helper degrades to "no movement" under reduced motion, while the
// essential feedback (text, colour, sound, aria-live) stays.
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimate, type Transition } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { spring, squash } from '../../lib/motion';
import { cx } from '../../lib/cx';

/** Low-damping spring: an offset released from here rings out in 3–4 shrinking swings. */
const SHAKE_SPRING: Transition = { type: 'spring', stiffness: 600, damping: 10, mass: 0.6 };
const POP_SPRING: Transition = { type: 'spring', stiffness: 320, damping: 14 };

/**
 * Small horizontal shake for "that was wrong" / "you lost a life". Attach `ref` to the element.
 * `strength` is the starting offset in px (keep it ≤ 8).
 */
export function useShake<T extends HTMLElement = HTMLDivElement>(strength = 6) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<T>();
  const shake = useCallback(() => {
    if (reduce || !scope.current) return;
    animate(scope.current, { x: [-strength, 0] }, SHAKE_SPRING);
  }, [reduce, animate, scope, strength]);
  return { ref: scope, shake };
}

/**
 * Pop a value when it changes (score, counters): spread the returned props on a motion element and
 * give it key={value}, so every change remounts it and replays the pop.
 */
export function usePulse(amount = 1.25) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { scale: amount },
    animate: { scale: 1 },
    transition: POP_SPRING,
  } as const;
}

/**
 * Squash-and-stretch press feel for tokens and buttons: spread on a motion element.
 * Same presets as BlobButton so everything tactile feels like one material.
 */
export function useSquash() {
  const reduce = useReducedMotion();
  return reduce
    ? {}
    : ({ whileHover: squash.hover, whileTap: squash.tap, transition: spring } as const);
}

export interface FloatingItem {
  id: number;
  text: string;
  x: number;
  y: number;
  tone: 'eosin' | 'methylene' | 'iodine' | 'ink';
}

let floatId = 0;

/** Floating "+10" texts. Render <FloatingText items={items} /> inside a `relative` container. */
export function useFloatingText(lifetimeMs = 900) {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const spawn = useCallback(
    (text: string, x: number, y: number, tone: FloatingItem['tone'] = 'methylene') => {
      const id = ++floatId;
      setItems((list) => [...list.slice(-5), { id, text, x, y, tone }]);
      const timer = setTimeout(() => {
        setItems((list) => list.filter((i) => i.id !== id));
        timers.current.delete(timer);
      }, lifetimeMs);
      timers.current.add(timer);
    },
    [lifetimeMs],
  );
  return { items, spawn };
}

const TONES: Record<FloatingItem['tone'], string> = {
  eosin: 'text-eosin-deep',
  methylene: 'text-methylene-deep',
  iodine: 'text-iodine-deep',
  ink: 'text-ink',
};

/** Decorative: the same information must also reach the HUD / aria-live. */
export function FloatingText({ items }: { items: FloatingItem[] }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            className={cx('absolute -translate-x-1/2 -translate-y-1/2 font-mono text-1 font-medium tabular-nums', TONES[item.tone])}
            style={{ left: item.x, top: item.y, textShadow: '0 1px 0 var(--paper-bright)' }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.7 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
          >
            {item.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** A value that springs in whenever it changes; e.g. <Pulse value={score}>{score}</Pulse>. */
export function Pulse({ value, className, children }: { value: number | string; className?: string; children: ReactNode }) {
  const pulse = usePulse();
  return (
    <motion.span key={String(value)} {...pulse} className={cx('inline-block', className)}>
      {children}
    </motion.span>
  );
}
