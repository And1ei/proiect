// Population dynamics for "Echilibrul", as pure functions. No DOM, no React: unit-tested in
// ecosystemModel.test.ts and stepped by the game loop.
//
// Every population is a fraction of its reference level (1 = the undisturbed baseline).
//   Producers:  dx/dt = x · [ r·s(t)·(1 − x/K) − grazing ]
//   Consumers:  dx/dt = x · [ e·Σ a·prey/(h + prey) − m − q·x − predation − external ]
// Feeding saturates (Holling type II: nothing explodes forever), consumers limit themselves a
// little (q: territory, disease), s(t) is a gentle seasonal swing, and a seeded RNG adds small
// yearly noise. Baseline death rates m (and producer growth r) are solved so that x = 1 for every
// species is an equilibrium; the tests check the ecological directions (removing a predator,
// drought, protection) and that the same seed gives the same run.

// ── Seeded RNG (mulberry32) ─────────────────────────────────────────
export type Rng = () => number;
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Configuration ───────────────────────────────────────────────────
export interface SpeciesParams {
  id: string;
  /** Producers only: carrying capacity (in reference units). */
  K?: number;
  /** Consumers only: conversion of food into growth. */
  e?: number;
  /** Self-limitation (per year per unit). */
  q: number;
}

export interface Link {
  predator: string;
  prey: string;
  /** Attack rate (per year). */
  a: number;
  /** Half-saturation (in prey reference units). */
  h: number;
}

export interface ModelConfig {
  species: SpeciesParams[];
  links: Link[];
  /** Amplitude of the seasonal swing of producer growth (0..1). */
  season: number;
  /** Yearly multiplicative noise (standard-ish deviation). */
  noise: number;
  /** Below this a population is extinct. */
  extinctAt: number;
  /** Eutrophication: producer level that starts an oxygen crisis if held for `crisisAfter` years. */
  bloomAt: number;
  crisisAfter: number;
  /** Extra fish mortality per year during an oxygen crisis. */
  crisisMortality: number;
}

/** Per-species modifiers that events and tools set for a while. */
export interface Modifiers {
  /** Producers: K multiplier. */
  k: number;
  /** Producers: growth multiplier. Consumers: feeding multiplier (an outbreak). */
  growth: number;
  /** External mortality per year (hunting, fishing, an oxygen crisis). */
  mortality: number;
  /** Multiplier on external mortality (Protejează: 0.5). */
  protect: number;
}

export const NEUTRAL: Modifiers = { k: 1, growth: 1, mortality: 0, protect: 1 };

export interface ModelState {
  /** Years since the start. */
  t: number;
  x: number[];
  extinct: boolean[];
  /** Years the producers have been above `bloomAt` (eutrophication). */
  bloom: number;
  /** True while the oxygen crisis lasts. */
  crisis: boolean;
  /** Next yearly noise draw per species (resampled every year). */
  jitter: number[];
  /** Integer part of t when the jitter was last drawn. */
  jitterYear: number;
}

export interface Model {
  config: ModelConfig;
  ids: string[];
  /** Producer growth r and consumer baseline death m, solved for the x = 1 equilibrium. */
  r: number[];
  m: number[];
  producer: boolean[];
  /** Fish (for the oxygen crisis): every non-producer in water scenarios, set by the caller. */
  aquatic: boolean[];
}

const idx = (model: Model, id: string) => {
  const i = model.ids.indexOf(id);
  if (i < 0) throw new Error(`[ecosystem] unknown species "${id}"`);
  return i;
};

const response = (link: Link, prey: number) => (link.a * prey) / (link.h + prey);

/**
 * Builds a model and solves the baseline so that every population at 1 is in balance:
 * producers get the growth rate that exactly replaces grazing at x = 1; consumers get the death
 * rate that exactly balances food minus predation at x = 1.
 */
export function createModel(config: ModelConfig, aquaticIds: string[] = []): Model {
  const ids = config.species.map((s) => s.id);
  const model: Model = {
    config,
    ids,
    r: ids.map(() => 0),
    m: ids.map(() => 0),
    producer: config.species.map((s) => s.K !== undefined),
    aquatic: ids.map((id) => aquaticIds.includes(id)),
  };
  config.species.forEach((s, i) => {
    const grazing = config.links.filter((l) => l.prey === s.id).reduce((sum, l) => sum + response(l, 1), 0);
    if (s.K !== undefined) {
      if (s.K <= 1) throw new Error(`[ecosystem] ${s.id}: K must be above the reference level 1`);
      model.r[i] = grazing / (1 - 1 / s.K);
    } else {
      const food = config.links.filter((l) => l.predator === s.id).reduce((sum, l) => sum + response(l, 1), 0);
      model.m[i] = (s.e ?? 1) * food - s.q - grazing;
      if (model.m[i] <= 0) throw new Error(`[ecosystem] ${s.id}: baseline death rate must be positive (${model.m[i].toFixed(3)})`);
    }
  });
  return model;
}

export function initialState(model: Model, rng: Rng): ModelState {
  return {
    t: 0,
    x: model.ids.map(() => 1),
    extinct: model.ids.map(() => false),
    bloom: 0,
    crisis: false,
    jitter: model.ids.map(() => 1 + (rng() - 0.5) * 2 * model.config.noise),
    jitterYear: 0,
  };
}

/** Per-capita growth rate of every species (per year) at the current state. */
export function rates(model: Model, s: ModelState, mods: Modifiers[]): number[] {
  const { config } = model;
  const season = 1 + config.season * Math.sin(2 * Math.PI * s.t);
  return model.ids.map((id, i) => {
    if (s.extinct[i]) return 0;
    const sp = config.species[i];
    const mod = mods[i] ?? NEUTRAL;
    let g = 0;
    if (model.producer[i]) {
      const K = (sp.K ?? 2) * mod.k;
      g += model.r[i] * mod.growth * season * s.jitter[i] * (1 - s.x[i] / K);
    } else {
      for (const l of config.links) if (l.predator === id) g += (sp.e ?? 1) * mod.growth * s.jitter[i] * response(l, s.x[idx(model, l.prey)]);
      g -= model.m[i] + sp.q * s.x[i];
    }
    // predation on it: Σ a·pred/(h + x)
    for (const l of config.links) {
      if (l.prey !== id) continue;
      const pred = s.x[idx(model, l.predator)];
      g -= (l.a * pred) / (l.h + s.x[i]);
    }
    const crisis = s.crisis && model.aquatic[i] && !model.producer[i] ? config.crisisMortality : 0;
    g -= (mod.mortality + crisis) * mod.protect;
    return g;
  });
}

const STEP = 1 / 200; // years

/**
 * Advances the model by `dt` years with the given modifiers (one per species). Pure: returns a new
 * state. Populations below `extinctAt` go extinct (0) and stay so until reintroduced.
 */
export function step(model: Model, state: ModelState, dt: number, mods: Modifiers[], rng: Rng): ModelState {
  const s: ModelState = { ...state, x: [...state.x], extinct: [...state.extinct], jitter: [...state.jitter] };
  let left = Math.max(0, Math.min(dt, 2));
  while (left > 1e-9) {
    const h = Math.min(STEP, left);
    left -= h;
    const g = rates(model, s, mods);
    for (let i = 0; i < s.x.length; i += 1) {
      if (s.extinct[i]) continue;
      // exponential update keeps populations positive
      s.x[i] *= Math.exp(Math.max(-8, Math.min(8, g[i] * h)));
      if (s.x[i] < model.config.extinctAt) {
        s.x[i] = 0;
        s.extinct[i] = true;
      }
    }
    s.t += h;
    // eutrophication: a producer bloom held too long starts an oxygen crisis
    const bloomNow = Math.max(0, ...s.x.filter((_, i) => model.producer[i]));
    s.bloom = bloomNow > model.config.bloomAt ? s.bloom + h : Math.max(0, s.bloom - h * 2);
    s.crisis = s.bloom >= model.config.crisisAfter;
    if (Math.floor(s.t) !== s.jitterYear) {
      s.jitterYear = Math.floor(s.t);
      s.jitter = s.jitter.map(() => 1 + (rng() - 0.5) * 2 * model.config.noise);
    }
  }
  return s;
}

/** Puts a small population back (Reintroduce). */
export function reintroduce(state: ModelState, i: number, level: number): ModelState {
  const x = [...state.x];
  const extinct = [...state.extinct];
  x[i] = level;
  extinct[i] = false;
  return { ...state, x, extinct };
}

/** Removes a species (tests: extinction of a predator). */
export function remove(state: ModelState, i: number): ModelState {
  const x = [...state.x];
  const extinct = [...state.extinct];
  x[i] = 0;
  extinct[i] = true;
  return { ...state, x, extinct };
}

// ── Health ──────────────────────────────────────────────────────────
export const SAFE_BAND: readonly [number, number] = [0.45, 2];
export const DANGER_BELOW = 0.3;

export type Trend = 'crestere' | 'scadere' | 'stabil';
export type Level = 'disparut' | 'critic' | 'scazut' | 'normal' | 'ridicat';

export const levelOf = (x: number, extinct: boolean): Level =>
  extinct ? 'disparut' : x < DANGER_BELOW ? 'critic' : x < SAFE_BAND[0] ? 'scazut' : x > SAFE_BAND[1] ? 'ridicat' : 'normal';

export const trendOf = (rate: number): Trend => (rate > 0.08 ? 'crestere' : rate < -0.08 ? 'scadere' : 'stabil');

export const healthy = (s: ModelState) => s.x.every((x, i) => !s.extinct[i] && x >= SAFE_BAND[0] && x <= SAFE_BAND[1]);

// ── Inventar (dominanța) ────────────────────────────────────────────
/**
 * A quadrat-style sample: individuals counted per species, proportional to population × a typical
 * abundance (small animals are counted in larger numbers than predators), with a little sampling noise.
 */
export function sampleCounts(state: ModelState, abundance: number[], rng: Rng): number[] {
  return state.x.map((x, i) => (state.extinct[i] ? 0 : Math.max(0, Math.round(x * abundance[i] * (0.9 + rng() * 0.2)))));
}

/** Dominanța: D_i = n_i / N × 100, rounded to one decimal. */
export function dominance(counts: number[]): number[] {
  const N = counts.reduce((a, b) => a + b, 0);
  return counts.map((n) => (N ? Math.round((n / N) * 1000) / 10 : 0));
}

/** Index of the dominant species (the largest count; the first one on a tie). */
export const dominantIndex = (counts: number[]) => counts.reduce((best, n, i) => (n > counts[best] ? i : best), 0);
