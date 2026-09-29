// Osmosis in one animal cell (an erythrocyte), as a pure model. No Phaser, no DOM: unit-tested in
// osmosisModel.test.ts and stepped by the scene every frame.
//
//   The solute amount inside the cell, n, is constant (it can't cross the membrane).
//   C_in = n / V
//   dV/dt = -k · (C_out − C_in)
//
// Water moves toward the higher solute concentration: when the outside is more concentrated
// (hipertonic) water leaves and the cell shrinks (crenare); when the outside is less concentrated
// (hipotonic) water enters and the cell swells, up to liză. The numbers are tuned for play, not
// realism, but the direction is always right (the tests check it).

export interface OsmosisConfig {
  /** Solute amount inside the cell (constant). With n = 1, the resting volume 1 is isotonic at C_out = 1. */
  n: number;
  /** Water permeability: volume change per second per unit of concentration difference. */
  k: number;
  /** The safe volume band [min, max]; outside it the membrane is damaged. */
  safe: readonly [number, number];
  /** Hard limits [crenated floor, lysis ceiling]; the model never leaves them. */
  limits: readonly [number, number];
  /** Controls: the outside concentration stays inside this range. */
  cOutRange: readonly [number, number];
}

export const OSMOSIS: OsmosisConfig = {
  n: 1,
  k: 0.16,
  safe: [0.84, 1.18],
  limits: [0.6, 1.42],
  cOutRange: [0.2, 2.4],
};

export type Tonicity = 'hipotonica' | 'izotonica' | 'hipertonica';
export type VolumeZone = 'crenare' | 'sigur' | 'liza';

/** Largest integration step (s); bigger frames are split so the model stays stable. */
const MAX_STEP = 1 / 120;
/** Concentrations this close count as equal (izotonic). */
const ISO_TOLERANCE = 0.05;

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));

export const concentrationInside = (c: OsmosisConfig, volume: number) => c.n / volume;

/** dV/dt. Positive (water enters) when the inside is more concentrated than the outside. */
export const volumeRate = (c: OsmosisConfig, volume: number, cOut: number) =>
  -c.k * (cOut - concentrationInside(c, volume));

/** The volume at which C_in = C_out (clamped to the hard limits). */
export const equilibriumVolume = (c: OsmosisConfig, cOut: number) => clamp(c.n / cOut, c.limits);

/**
 * Advances the volume by `dt` seconds at a fixed outside concentration. Never overshoots the
 * equilibrium, never leaves the hard limits, and treats a non-finite or negative dt as 0.
 */
export function stepVolume(c: OsmosisConfig, volume: number, cOut: number, dt: number): number {
  if (!(dt > 0) || !Number.isFinite(dt)) return clamp(volume, c.limits);
  const target = equilibriumVolume(c, cOut);
  let v = clamp(volume, c.limits);
  let left = Math.min(dt, 5);
  while (left > 0) {
    const h = Math.min(MAX_STEP, left);
    left -= h;
    const next = v + volumeRate(c, v, cOut) * h;
    // Water flow stops at equilibrium: never cross it
    v = (v - target) * (next - target) <= 0 ? target : next;
    v = clamp(v, c.limits);
  }
  return v;
}

/** Tonicity of the outside solution relative to the cell. */
export function tonicity(c: OsmosisConfig, volume: number, cOut: number): Tonicity {
  const diff = cOut - concentrationInside(c, volume);
  if (Math.abs(diff) <= ISO_TOLERANCE) return 'izotonica';
  return diff > 0 ? 'hipertonica' : 'hipotonica';
}

/** Where the volume is relative to the safe band. */
export function volumeZone(c: OsmosisConfig, volume: number): VolumeZone {
  if (volume < c.safe[0]) return 'crenare';
  if (volume > c.safe[1]) return 'liza';
  return 'sigur';
}

/** Applies a control (or an event) to the outside concentration, within the allowed range. */
export const adjustOutside = (c: OsmosisConfig, cOut: number, delta: number) => clamp(cOut + delta, c.cOutRange);

/** 0 at the crenated floor, 1 at the lysis ceiling: for gauges. */
export const volumeFraction = (c: OsmosisConfig, volume: number) =>
  (clamp(volume, c.limits) - c.limits[0]) / (c.limits[1] - c.limits[0]);
