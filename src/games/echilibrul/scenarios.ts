// Tuning for the two scenarios of "Echilibrul": model parameters, event effects and schedule, tools,
// and the Inventar sample. No DOM or React here (unit tests and the loop share it). The biology text
// is in src/content/ro/ecosystem-species.ts; ids must match.
import type { EventKind, ScenarioId } from '../../content/ro/ecosystem-species';
import type { ModelConfig } from './ecosystemModel';

export interface EventEffect {
  /** Which species it hits ('producers' for all producers). */
  target: string | 'producers';
  k?: number;
  growth?: number;
  mortality?: number;
}

export interface ScheduledEvent {
  kind: EventKind;
  /** Start, in years since the beginning (the headline shows TELEGRAPH_S seconds before). */
  at: number;
  /** Duration in years. */
  lasts: number;
  effect: EventEffect;
}

export interface ScenarioConfig {
  model: ModelConfig;
  /** Species hit by an oxygen crisis (fish). */
  aquatic: string[];
  events: ScheduledEvent[];
  /** Inventar sample: typical number of individuals counted per species at x = 1. */
  abundance: Record<string, number>;
  /** Advanced mode: Inventar at the end of these years. */
  inventory: number[];
}

const common = { season: 0.12, noise: 0.05, extinctAt: 0.12, bloomAt: 1.6, crisisAfter: 0.5, crisisMortality: 1.4 };

export const SCENARIO_CONFIG: Record<ScenarioId, ScenarioConfig> = {
  padure: {
    model: {
      ...common,
      species: [
        { id: 'stejar', K: 1.8, q: 0 },
        { id: 'molia', e: 2, q: 0.1 },
        { id: 'soarece', e: 3, q: 0.2 },
        { id: 'vulpe', e: 1, q: 0.1 },
        { id: 'huhurez', e: 1.2, q: 0.1 },
      ],
      links: [
        { predator: 'molia', prey: 'stejar', a: 0.75, h: 1 },
        { predator: 'soarece', prey: 'stejar', a: 0.8, h: 1 },
        { predator: 'soarece', prey: 'molia', a: 0.3, h: 1 },
        { predator: 'vulpe', prey: 'soarece', a: 0.9, h: 0.6 },
        { predator: 'huhurez', prey: 'soarece', a: 0.7, h: 0.6 },
      ],
    },
    aquatic: [],
    events: [
      // years 1–2 calm; the first event is mild
      { kind: 'seceta', at: 2.3, lasts: 0.8, effect: { target: 'producers', k: 0.75 } },
      { kind: 'omizi', at: 4.2, lasts: 1.2, effect: { target: 'molia', growth: 2.6 } },
      { kind: 'vanatoare', at: 6.2, lasts: 1.6, effect: { target: 'vulpe', mortality: 1.2 } },
      { kind: 'seceta', at: 8.2, lasts: 1.2, effect: { target: 'producers', k: 0.6 } },
    ],
    abundance: { stejar: 40, molia: 120, soarece: 60, vulpe: 4, huhurez: 3 },
    inventory: [],
  },
  balta: {
    model: {
      ...common,
      species: [
        { id: 'fitoplancton', K: 1.8, q: 0 },
        { id: 'daphnia', e: 2.4, q: 0.1 },
        { id: 'platica', e: 2, q: 0.15 },
        { id: 'stiuca', e: 1, q: 0.1 },
        { id: 'pelican', e: 1.1, q: 0.1 },
      ],
      links: [
        { predator: 'daphnia', prey: 'fitoplancton', a: 1.2, h: 1 },
        { predator: 'platica', prey: 'daphnia', a: 1, h: 0.8 },
        { predator: 'stiuca', prey: 'platica', a: 0.8, h: 0.6 },
        { predator: 'pelican', prey: 'platica', a: 0.7, h: 0.6 },
      ],
    },
    aquatic: ['platica', 'stiuca'],
    events: [
      { kind: 'seceta', at: 2.3, lasts: 0.8, effect: { target: 'producers', k: 0.75 } },
      { kind: 'ingrasaminte', at: 3.6, lasts: 1.3, effect: { target: 'producers', k: 2.6, growth: 1.7 } },
      { kind: 'pescuit', at: 6.3, lasts: 1.5, effect: { target: 'platica', mortality: 1.2 } },
      { kind: 'seceta', at: 8.3, lasts: 1.1, effect: { target: 'producers', k: 0.6 } },
    ],
    abundance: { fitoplancton: 200, daphnia: 180, platica: 30, stiuca: 4, pelican: 3 },
    inventory: [5, 10],
  },
};

export const YEARS = 10;
/** Real seconds per simulated year at ×1. */
export const YEAR_SECONDS = 13;
/** The headline shows this many real seconds before an event starts. */
export const TELEGRAPH_S = 5;
/** After an extinction the next event starts this much later and is softened (adaptive help). */
export const HELP_DELAY_YEARS = 0.6;
export const HELP_SOFTEN = 0.6;

export type ToolId = 'protejeaza' | 'regenereaza' | 'reintroduce';
export const TOOLS: Record<ToolId, { key: number; lasts: number; cooldown: number; needsSpecies: boolean }> = {
  protejeaza: { key: 1, lasts: 1.5, cooldown: 2.2, needsSpecies: true },
  regenereaza: { key: 2, lasts: 1.5, cooldown: 2.6, needsSpecies: false },
  reintroduce: { key: 3, lasts: 0, cooldown: Infinity, needsSpecies: true },
};
export const PROTECT_FACTOR = 0.5;
export const REGEN = { k: 1.35, growth: 1.3 };
export const REINTRODUCE_LEVEL = 0.35;

export const LIVES = 3;
export const POINTS_PER_YEAR = 20;
export const INVENTORY_POINTS = { dominant: 30, perSpecies: 10, question: 20 };
/** Inventar: at x = 1 the producers make up about 48% of the sample; above this the community is
 *  lopsided toward the producers (a bloom). The balance question is computed against it. */
export const PRODUCER_HIGH_D = 55;
/** A typed dominance within this many percentage points counts as right (rounding). */
export const D_TOLERANCE = 0.6;
