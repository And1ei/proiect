// Tuning for Sandbox A, shared by the React wrapper and the scene. No Phaser import here.

/** Logical design size (16:10). Scene code uses these coordinates only. */
export const DESIGN = { width: 960, height: 600 };

/** Organisms to catch, with the palette tone for each silhouette. */
export const GOOD = [
  { id: 'parameci', tone: 'methylene-deep' },
  { id: 'euglena', tone: 'eosin-deep' },
  { id: 'amoeba', tone: 'iodine-deep' },
  { id: 'volvox', tone: 'methylene' },
] as const;

/** Organisms that cost a life. Palette-coloured asset, so no tone. */
export const BAD = ['bacteriofag'] as const;

export const TARGET = 15;
export const LIVES = 3;
/** Sprite size in design units. At phone width (≈0.4 scale) the hit circle stays ≥ 44 CSS px. */
export const SIZE = 100;
export const HIT_RADIUS = SIZE * 0.72;
export const SPAWN_MS = 850;
export const BAD_CHANCE = 0.25;
