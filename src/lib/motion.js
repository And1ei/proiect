// Shared spring presets. Every animated value in the app uses one of these; no tweens.

/**
 * Default interaction spring: presses, hovers, toggles.
 * @type {import('motion/react').Transition}
 */
export const spring = { type: 'spring', stiffness: 180, damping: 16, mass: 1 };

/**
 * Heavier, slower settle for things that move across space (menus, reveals).
 * @type {import('motion/react').Transition}
 */
export const springSettle = { type: 'spring', stiffness: 120, damping: 20, mass: 1.2 };

/**
 * Snappy follow for pointer-tracking elements like the cursor.
 * @type {import('motion/react').SpringOptions}
 */
export const springFollow = { stiffness: 420, damping: 32, mass: 0.6 };

/** Squash on press, slight stretch on hover — gives elements a sense of mass. */
export const squash = {
  hover: { scaleX: 0.985, scaleY: 1.03 },
  tap: { scaleX: 1.07, scaleY: 0.9 },
};

/**
 * Rest pose used instead of `breathing()` under reduced motion, so a stopped loop doesn't freeze mid-breath.
 * @type {{ animate: import('motion/react').TargetAndTransition, transition: import('motion/react').Transition }}
 */
export const stillPose = { animate: { scale: 1, rotate: 0 }, transition: { duration: 0 } };

/**
 * Idle "breathing" loop for blob shapes. Returns props to spread on a motion element.
 * The one allowed exception to springs-only: springs aren't meant to repeat, so this is an
 * easeInOut tween mirrored forever. `duration` is one full breath (in + out).
 */
export function breathing({ duration = 7.5, delay = 0, amount = 0.02 } = {}) {
  const half = {
    type: 'tween',
    ease: 'easeInOut',
    duration: duration / 2,
    repeat: Infinity,
    repeatType: 'mirror',
    delay,
  };
  return {
    initial: { scale: 1, rotate: 0 },
    animate: { scale: 1 + amount, rotate: 0.8 },
    transition: { scale: half, rotate: { ...half, duration: duration * 0.62 } },
  };
}
