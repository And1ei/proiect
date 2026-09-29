// Layout and tuning of the microscope field (no Phaser import: shared by the wrapper and the scene).

/** Square field; at 375 px the canvas is ~320 CSS px wide (scale ≈ 0.57), so 44 CSS px ≈ 77 units. */
export const DESIGN = { width: 560, height: 560 };
export const FIELD = { cx: 280, cy: 280, r: 262 };
export const MAX_HEIGHT = '62dvh';

/** Drawn size per size class (one scale grid), and the smallest hit radius (≥ 44 CSS px on a phone). */
export const SIZE = { s: 50, m: 86, l: 118 } as const;
export const MIN_HIT_R = 42;

export const LIVES = 3;
export const POINTS = { group: 10, type: 5 };
export const BANNER_MS = 2200;
/** A selected organism slows down to this fraction of its speed, so its card can be read. */
export const SELECTED_SPEED = 0.25;
export const STAR_ACCURACY = { three: 0.9, two: 0.72 };
