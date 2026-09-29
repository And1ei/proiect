// Turns what is active (events, the player's tools) into per-species model modifiers, and runs
// whole scenarios for the tests and for tuning. Pure; the game loop uses the same functions.
import { NEUTRAL, createModel, createRng, initialState, remove, step, type Model, type Modifiers, type ModelState, type Rng } from './ecosystemModel.ts';
import { PROTECT_FACTOR, REGEN, type EventEffect, type ScenarioConfig } from './scenarios.ts';

export interface Active {
  kind: 'event' | 'protect' | 'regen';
  /** Species id, or 'producers'. */
  target: string;
  from: number;
  to: number;
  effect?: EventEffect;
  /** Adaptive help: events after an extinction are softened (1 = full strength). */
  strength?: number;
}

const soften = (value: number, neutral: number, strength: number) => neutral + (value - neutral) * strength;

export function modifiersAt(model: Model, actives: Active[], t: number): Modifiers[] {
  const mods = model.ids.map(() => ({ ...NEUTRAL }));
  const hits = (target: string, i: number) => (target === 'producers' ? model.producer[i] : model.ids[i] === target);
  for (const a of actives) {
    if (t < a.from || t >= a.to) continue;
    model.ids.forEach((_, i) => {
      if (!hits(a.target, i)) return;
      const m = mods[i];
      if (a.kind === 'protect') m.protect *= PROTECT_FACTOR;
      else if (a.kind === 'regen') {
        m.k *= REGEN.k;
        m.growth *= REGEN.growth;
      } else if (a.effect) {
        const s = a.strength ?? 1;
        if (a.effect.k !== undefined) m.k *= soften(a.effect.k, 1, s);
        if (a.effect.growth !== undefined) m.growth *= soften(a.effect.growth, 1, s);
        if (a.effect.mortality !== undefined) m.mortality += a.effect.mortality * s;
      }
    });
  }
  return mods;
}

export const eventActives = (cfg: ScenarioConfig): Active[] =>
  cfg.events.map((e) => ({ kind: 'event', target: e.effect.target, from: e.at, to: e.at + e.lasts, effect: e.effect }));

export function modelFor(cfg: ScenarioConfig): Model {
  return createModel(cfg.model, cfg.aquatic);
}

export interface RunOptions {
  seed: number;
  years: number;
  actives?: Active[];
  /** Species removed at time `removeAt` (the extinction case study). */
  removeIds?: string[];
  removeAt?: number;
  /** Sampling interval of the returned trajectory (years). */
  every?: number;
}

export interface Sample {
  t: number;
  x: number[];
  extinct: boolean[];
}

/** Runs a scenario headless and returns samples every `every` years. */
export function simulate(cfg: ScenarioConfig, opts: RunOptions): { model: Model; samples: Sample[]; final: ModelState } {
  const model = modelFor(cfg);
  const rng: Rng = createRng(opts.seed);
  let s = initialState(model, rng);
  const every = opts.every ?? 0.05;
  const samples: Sample[] = [{ t: 0, x: [...s.x], extinct: [...s.extinct] }];
  let removed = false;
  while (s.t < opts.years - 1e-9) {
    if (opts.removeIds && !removed && s.t >= (opts.removeAt ?? 0)) {
      for (const id of opts.removeIds) s = remove(s, model.ids.indexOf(id));
      removed = true;
    }
    s = step(model, s, every, modifiersAt(model, opts.actives ?? [], s.t), rng);
    samples.push({ t: s.t, x: [...s.x], extinct: [...s.extinct] });
  }
  return { model, samples, final: s };
}
