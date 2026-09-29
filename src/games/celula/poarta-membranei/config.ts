// Tuning and layout for "Poarta membranei". Shared by the React wrapper, the DOM overlay, the intro
// and the scene, so it must not import Phaser. All coordinates are logical design units.
import type { MembraneMode, Route } from '../../../content/ro/membrane-molecules';
import { MODE_ROUTES } from '../../../content/ro/membrane-molecules';

/**
 * Near-square, so one layout works on a phone (≈ 320 CSS px wide, scale ≈ 0.57) and on a desktop.
 * At phone scale a 44 CSS px target is ≈ 77 units: every hit area below is at least that.
 */
export const DESIGN = { width: 560, height: 600 };
export const MAX_HEIGHT = '64dvh';

export const MEMBRANE_Y = 300;
/** Half the bilayer thickness (heads included). */
export const MEMBRANE_HALF = 32;
/** How far above/below the bilayer a gate accepts a drop. */
export const GATE_REACH = 118;
export const MIN_HIT = 80;

export interface GateLayout {
  route: Route;
  /** Key that selects it (1–4), shown on the gate. */
  key: number;
  x: number;
  width: number;
}

/** Gates in key order, spread along the membrane. */
export function gatesFor(mode: MembraneMode): GateLayout[] {
  const routes = MODE_ROUTES[mode];
  const width = mode === 'baza' ? 168 : 124;
  const gap = mode === 'baza' ? 56 : 12;
  const total = routes.length * width + (routes.length - 1) * gap;
  const left = (DESIGN.width - total) / 2;
  return routes.map((route, i) => ({ route, key: i + 1, x: left + width / 2 + i * (width + gap), width }));
}

/** Visual radius of each molecule drawing (one scale grid: atoms are the same size everywhere). */
export const ATOM_R = { O: 12, C: 12.5, H: 7, Na: 15, K: 19, bead: 8.5 } as const;

export interface WaveConfig {
  count: number;
  /** Time between spawns (ms). */
  spawnMs: number;
  /** Drift speed range toward the membrane (units / s). */
  speed: [number, number];
  /** Never more than this many unresolved molecules on screen. */
  maxAlive: number;
  /** Wave 1: the first molecule's gate is highlighted for free, and spawns stay slow. */
  tutorial?: boolean;
}

export type Phase = { kind: 'wave'; wave: WaveConfig } | { kind: 'osmosis'; event: number };

const W = (count: number, spawnMs: number, speed: [number, number], maxAlive: number, tutorial = false): Phase => ({
  kind: 'wave',
  wave: { count, spawnMs, speed, maxAlive, tutorial },
});

/** Base: 3 waves + 1 osmosis event (about 4 minutes). Advanced: 4 waves + 2 events. */
export const SCHEDULE: Record<MembraneMode, Phase[]> = {
  baza: [W(7, 4300, [17, 22], 2, true), W(10, 3200, [22, 29], 3), { kind: 'osmosis', event: 0 }, W(12, 2600, [27, 36], 4)],
  avansat: [
    W(8, 4300, [16, 21], 2, true),
    W(10, 3300, [21, 28], 3),
    { kind: 'osmosis', event: 0 },
    W(11, 2900, [25, 33], 4),
    { kind: 'osmosis', event: 1 },
    W(13, 2500, [28, 37], 4),
  ],
};

export const LIVES = 5;
export const POINTS = 10;
/** Adaptive help: after this many failures in a row, spawns slow down for a while. */
export const FAILS_BEFORE_HELP = 3;
export const HELP_SLOWDOWN = 0.55;
export const HELP_MS = 18_000;
/** Pause between phases (the banner shows). */
export const BREAK_MS = 2600;

/** Advanced mode: ATP for the pump. Refills slowly; the pump fails (and damages the membrane) at 0. */
export const ATP = { max: 3, start: 2, refillMs: 5200, cost: 1 };

// ── Osmosis events ──────────────────────────────────────────────────
export interface OsmosisStep {
  /** Seconds after the event starts. */
  at: number;
  /** New outside concentration (the osmosis model's units; the cell is isotonic at 1). */
  cOut: number;
  /** Key of the Romanian line announcing it (strings.osmosis.changes). */
  say: 'distilata' | 'sare' | 'ser';
}

export interface OsmosisEvent {
  steps: OsmosisStep[];
  durationS: number;
  /** Key of the takeaway line shown after the event (strings.osmosis.takeaways). */
  takeaway: 'perfuzie' | 'crenare';
}

export const OSMOSIS_EVENTS: OsmosisEvent[] = [
  {
    steps: [
      { at: 0, cOut: 0.3, say: 'distilata' },
      { at: 14, cOut: 1.9, say: 'sare' },
    ],
    durationS: 27,
    takeaway: 'perfuzie',
  },
  {
    steps: [
      { at: 0, cOut: 2.1, say: 'sare' },
      { at: 12, cOut: 0.4, say: 'distilata' },
      { at: 22, cOut: 1, say: 'ser' },
    ],
    durationS: 29,
    takeaway: 'crenare',
  },
];

/** Where the osmosis view puts the cell and the volume gauge (the DOM overlay labels the gauge). */
export const OSMOSIS_LAYOUT = { cellX: DESIGN.width / 2, cellY: 250, cellSize: 230, gaugeY: 512, gaugeX0: 70, gaugeX1: DESIGN.width - 70 };

/** One press of "Adaugă sare" / "Diluează" changes the outside concentration by this much. */
export const OSMOSIS_STEP = 0.12;
/** Seconds outside the safe band that cost one unit of membrane integrity (one life). */
export const OSMOSIS_DAMAGE_S = 4;
/** Points per second spent inside the safe band, awarded at the end of the event. */
export const OSMOSIS_POINTS_PER_S = 2;

/** Stars: accuracy on routed molecules, and a clean membrane for 3. */
export const STAR_ACCURACY = { three: 0.9, two: 0.72 };
