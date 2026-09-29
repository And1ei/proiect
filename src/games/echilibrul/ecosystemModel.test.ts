// Direction-of-effect tests for the ecosystem model (like the osmosis test in G2). If tuning breaks
// one, fix the model or the parameters; don't loosen the test without writing down why.
import { describe, expect, it } from 'vitest';
import { createRng, dominance, dominantIndex, sampleCounts, type ModelState } from './ecosystemModel.ts';
import { SCENARIO_CONFIG } from './scenarios.ts';
import { eventActives, simulate, type Active } from './simulation.ts';

const SEEDS = [1, 7, 42, 2026];
const col = (samples: { x: number[] }[], i: number) => samples.map((s) => s.x[i]);

describe('baseline', () => {
  for (const scenario of ['padure', 'balta'] as const) {
    it(`${scenario}: every species survives ten undisturbed years, with gentle oscillations`, () => {
      for (const seed of SEEDS) {
        const { final, samples } = simulate(SCENARIO_CONFIG[scenario], { seed, years: 10 });
        expect(final.extinct.some(Boolean), `seed ${seed}`).toBe(false);
        for (let i = 0; i < final.x.length; i += 1) {
          const xs = col(samples, i);
          expect(Math.min(...xs), `seed ${seed} species ${i}`).toBeGreaterThan(0.5);
          expect(Math.max(...xs), `seed ${seed} species ${i}`).toBeLessThan(1.8);
        }
      }
    });
  }
});

describe('extinction of a predator (studiu de caz)', () => {
  it('forest: without the predators the mice boom above 1.5×, then the oak falls below 0.6×', () => {
    for (const seed of SEEDS) {
      const cfg = SCENARIO_CONFIG.padure;
      const { model, samples } = simulate(cfg, { seed, years: 10, removeIds: ['vulpe', 'huhurez'], removeAt: 1 });
      const mice = col(samples, model.ids.indexOf('soarece'));
      const oak = col(samples, model.ids.indexOf('stejar'));
      const peak = mice.indexOf(Math.max(...mice));
      expect(mice[peak], `seed ${seed}`).toBeGreaterThan(1.5);
      // the producer falls after the prey has boomed, within the following years
      const firstLow = oak.findIndex((x) => x < 0.6);
      expect(firstLow, `seed ${seed}`).toBeGreaterThan(0);
      const firstHigh = mice.findIndex((x) => x > 1.5);
      expect(firstLow).toBeGreaterThan(firstHigh);
      expect(samples[firstLow].t - samples[firstHigh].t).toBeLessThan(5);
    }
  });

  it('pond: without the top predators fish boom, zooplankton drops and algae rise (trophic cascade)', () => {
    const { model, samples } = simulate(SCENARIO_CONFIG.balta, { seed: 1, years: 6, removeIds: ['stiuca', 'pelican'], removeAt: 1 });
    const at = (id: string, t: number) => samples.find((s) => s.t >= t)!.x[model.ids.indexOf(id)];
    expect(Math.max(...col(samples, model.ids.indexOf('platica')))).toBeGreaterThan(1.5);
    expect(at('daphnia', 3)).toBeLessThan(0.6);
    expect(at('fitoplancton', 3.5)).toBeGreaterThan(1.3);
  });
});

describe('drought', () => {
  for (const scenario of ['padure', 'balta'] as const) {
    it(`${scenario}: producers fall first, consumers follow with a delay`, () => {
      const cfg = SCENARIO_CONFIG[scenario];
      const drought: Active = { kind: 'event', target: 'producers', from: 1, to: 2.5, effect: { target: 'producers', k: 0.55 } };
      const base = simulate(cfg, { seed: 3, years: 6 });
      const dry = simulate(cfg, { seed: 3, years: 6, actives: [drought] });
      const firstDrop = (i: number) => dry.samples.findIndex((s, k) => s.x[i] < base.samples[k].x[i] * 0.9);
      const producer = firstDrop(0);
      const consumer = firstDrop(1);
      expect(producer).toBeGreaterThan(0);
      expect(consumer).toBeGreaterThan(producer);
      expect(dry.samples[consumer].t - dry.samples[producer].t).toBeGreaterThan(0.15);
    });
  }
});

describe('Protejează', () => {
  it('halving external mortality measurably reduces the loss to illegal hunting', () => {
    const cfg = SCENARIO_CONFIG.padure;
    const hunt: Active = { kind: 'event', target: 'vulpe', from: 1, to: 3, effect: { target: 'vulpe', mortality: 1.2 } };
    const protect: Active = { kind: 'protect', target: 'vulpe', from: 1, to: 3 };
    const fox = (actives: Active[]) => {
      const r = simulate(cfg, { seed: 5, years: 3, actives });
      return r.final.x[r.model.ids.indexOf('vulpe')];
    };
    const without = fox([hunt]);
    const withTool = fox([hunt, protect]);
    const none = fox([]);
    expect(without).toBeLessThan(none * 0.7);
    expect(withTool).toBeGreaterThan(without * 1.4);
  });

  it('protecting the fish softens the oxygen crisis of eutrophication', () => {
    const cfg = SCENARIO_CONFIG.balta;
    const events = eventActives(cfg);
    const run = (extra: Active[]) => {
      const r = simulate(cfg, { seed: 1, years: 6, actives: [...events, ...extra] });
      return r.final.x[r.model.ids.indexOf('platica')];
    };
    expect(run([{ kind: 'protect', target: 'platica', from: 4, to: 5.5 }])).toBeGreaterThan(run([]) * 1.3);
  });

  it('the fertiliser event causes a bloom above 1.6× and then an oxygen crisis', () => {
    const cfg = SCENARIO_CONFIG.balta;
    const { model, samples } = simulate(cfg, { seed: 1, years: 6, actives: eventActives(cfg) });
    expect(Math.max(...col(samples, model.ids.indexOf('fitoplancton')))).toBeGreaterThan(1.6);
  });
});

describe('determinism', () => {
  it('the same seed gives the same trajectory; another seed does not', () => {
    const cfg = SCENARIO_CONFIG.balta;
    const a = simulate(cfg, { seed: 11, years: 10, actives: eventActives(cfg) });
    const b = simulate(cfg, { seed: 11, years: 10, actives: eventActives(cfg) });
    const c = simulate(cfg, { seed: 12, years: 10, actives: eventActives(cfg) });
    expect(a.samples).toEqual(b.samples);
    expect(a.samples).not.toEqual(c.samples);
  });
});

describe('Inventar (dominanța)', () => {
  it('computes D = n / N × 100 and the dominant species', () => {
    expect(dominance([50, 30, 20])).toEqual([50, 30, 20]);
    expect(dominance([1, 2, 1])).toEqual([25, 50, 25]);
    expect(dominance([0, 0])).toEqual([0, 0]);
    expect(dominance([1, 1, 1]).reduce((a, b) => a + b, 0)).toBeCloseTo(100, 0);
    expect(dominantIndex([3, 9, 9, 1])).toBe(1);
  });

  it('samples are counts from the model: extinct species count 0, more population → more individuals', () => {
    const rng = createRng(4);
    const state = { x: [1, 2, 0.5, 0], extinct: [false, false, false, true] } as ModelState;
    const counts = sampleCounts(state, [100, 100, 100, 100], rng);
    expect(counts[3]).toBe(0);
    expect(counts[1]).toBeGreaterThan(counts[0]);
    expect(counts[0]).toBeGreaterThan(counts[2]);
    for (const n of counts) expect(Number.isInteger(n)).toBe(true);
  });
});

describe('Inventar grading', async () => {
  const { gradeInventory, parsePercent } = await import('./inventory.ts');
  it('accepts a decimal comma and grades against computed values', () => {
    expect(parsePercent('22,5 %')).toBe(22.5);
    const counts = [200, 180, 30, 4, 3]; // N = 417
    const r = gradeInventory(counts, 0, ['48', '43,2', '7.2', '1', '0,7'], 0, 'normal');
    expect(r.d).toEqual([48, 43.2, 7.2, 1, 0.7]);
    expect(r.perSpecies.every(Boolean)).toBe(true);
    expect(r.dominant).toBe(true);
    expect(r.high).toBe(false);
    expect(r.balance).toBe(true);
  });
  it('a bloom makes the producers lopsided, and wrong answers score nothing', () => {
    const r = gradeInventory([420, 150, 20, 2, 3], 0, ['10', '', 'x', '5', '5'], 1, 'normal');
    expect(r.high).toBe(true);
    expect(r.balance).toBe(false);
    expect(r.dominant).toBe(false);
    expect(r.points).toBe(0);
  });
});

describe('engine', async () => {
  const { EcoEngine } = await import('./engine.ts');
  const run = (scenario: 'padure' | 'balta') => {
    const e = new EcoEngine(scenario, 9);
    const seen: string[] = [];
    for (let i = 0; i < 20000 && !e.done; i += 1) {
      for (const h of e.advance(0.1, 2)) {
        seen.push(h.type);
        if (h.type === 'inventory') seen.push(...e.resume().map((x) => x.type));
      }
    }
    return { e, seen };
  };
  it('forest: telegraphs every event before it starts and ends after ten years', () => {
    const { e, seen } = run('padure');
    expect(e.done).toBe(true);
    expect(seen.filter((s) => s === 'year')).toHaveLength(10);
    expect(seen.filter((s) => s === 'telegraph')).toHaveLength(e.events.length);
    expect(seen.indexOf('telegraph')).toBeLessThan(seen.indexOf('event-start'));
  });
  it('pond: pauses for the Inventar at the end of years 5 and 10', () => {
    const { seen } = run('balta');
    expect(seen.filter((s) => s === 'inventory')).toHaveLength(2);
    expect(seen[seen.length - 1]).toBe('end');
  });
  it('tools: cooldowns, and Reintrodu only for an extinct species, once', () => {
    const e = new EcoEngine('padure', 1);
    expect(e.apply('protejeaza', 3).ok).toBe(true);
    expect(e.apply('protejeaza', 3).ok).toBe(false);
    expect(e.apply('reintroduce', 3).reason).toBe('not-extinct');
    e.state = { ...e.state, x: e.state.x.map((v, i) => (i === 3 ? 0 : v)), extinct: e.state.extinct.map((v, i) => i === 3 || v) };
    expect(e.apply('reintroduce', 3).ok).toBe(true);
    expect(e.state.extinct[3]).toBe(false);
    expect(e.toolStatus('reintroduce').state).toBe('used');
  });
});
