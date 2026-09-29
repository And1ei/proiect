// How each scenario is drawn: plate zones, sprite sizes (one scale grid), how many individuals a
// population shows, tones, food-web layout and chart line styles. No React here.
import type { ScenarioId } from '../../content/ro/ecosystem-species';
import type { SpriteTone } from '../../components/illustration/Sprite';

export const PLATE = { width: 800, height: 380 };
/** Most individuals any species may show, and the total stays under ~150 SVG elements. */
export const MAX_FACTOR = 2.4;

export interface SpeciesView {
  /** Where its individuals stand: a rectangle in plate units. */
  zone: { x: number; y: number; w: number; h: number };
  /** Sprite size in plate units. */
  size: number;
  /** Individuals drawn at population 1. */
  base: number;
  tone: SpriteTone;
  /** Food-web node position (0..1 of the panel). */
  node: { x: number; y: number };
  /** Chart line dash pattern (lines differ by style, not only colour). */
  dash: string;
  /** Mirror some individuals so the plate doesn't look stamped. */
  flip?: boolean;
}

export interface ScenarioView {
  kind: 'forest' | 'pond';
  species: Record<string, SpeciesView>;
}

const DASHES = ['', '8 5', '2.5 4', '12 4 2 4', '1 6'];

export const VIEW: Record<ScenarioId, ScenarioView> = {
  padure: {
    kind: 'forest',
    species: {
      stejar: { zone: { x: 40, y: 150, w: 720, h: 60 }, size: 118, base: 5, tone: 'methylene-deep', node: { x: 0.5, y: 0.86 }, dash: DASHES[0] },
      molia: { zone: { x: 60, y: 76, w: 680, h: 84 }, size: 32, base: 12, tone: 'iodine', node: { x: 0.24, y: 0.52 }, dash: DASHES[1], flip: true },
      soarece: { zone: { x: 40, y: 312, w: 720, h: 34 }, size: 34, base: 9, tone: 'ink', node: { x: 0.76, y: 0.52 }, dash: DASHES[2], flip: true },
      vulpe: { zone: { x: 80, y: 280, w: 640, h: 30 }, size: 66, base: 3, tone: 'eosin-deep', node: { x: 0.3, y: 0.14 }, dash: DASHES[3], flip: true },
      huhurez: { zone: { x: 110, y: 168, w: 580, h: 34 }, size: 44, base: 2, tone: 'iodine-deep', node: { x: 0.7, y: 0.14 }, dash: DASHES[4] },
    },
  },
  balta: {
    kind: 'pond',
    species: {
      fitoplancton: { zone: { x: 30, y: 170, w: 740, h: 70 }, size: 16, base: 18, tone: 'methylene', node: { x: 0.7, y: 0.88 }, dash: DASHES[0] },
      daphnia: { zone: { x: 40, y: 200, w: 720, h: 90 }, size: 20, base: 14, tone: 'iodine-deep', node: { x: 0.27, y: 0.63 }, dash: DASHES[1] },
      platica: { zone: { x: 60, y: 230, w: 680, h: 90 }, size: 50, base: 6, tone: 'ink', node: { x: 0.62, y: 0.37 }, dash: DASHES[2], flip: true },
      stiuca: { zone: { x: 70, y: 280, w: 660, h: 60 }, size: 76, base: 2, tone: 'methylene-deep', node: { x: 0.26, y: 0.1 }, dash: DASHES[3], flip: true },
      pelican: { zone: { x: 80, y: 40, w: 640, h: 70 }, size: 70, base: 3, tone: 'eosin-deep', node: { x: 0.74, y: 0.1 }, dash: DASHES[4], flip: true },
    },
  },
};

/** How many individuals to draw for population x (0 when extinct). */
export const headcount = (v: SpeciesView, x: number, extinct: boolean) =>
  extinct ? 0 : Math.max(1, Math.min(Math.round(v.base * MAX_FACTOR), Math.round(v.base * x)));

/** Stable pseudo-random positions per species and index, so individuals don't jump around. */
export function spot(v: SpeciesView, speciesSeed: number, i: number) {
  const h = (n: number) => {
    const s = Math.sin(n * 127.1 + speciesSeed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return { x: v.zone.x + h(i * 2 + 1) * v.zone.w, y: v.zone.y + h(i * 2 + 2) * v.zone.h, flip: !!v.flip && h(i * 7 + 3) > 0.5, phase: h(i + 9) };
}

/** Season of a year fraction: 0 primăvară, 1 vară, 2 toamnă, 3 iarnă. */
export const seasonOf = (t: number) => Math.min(3, Math.floor((t - Math.floor(t)) * 4));
