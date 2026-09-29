import { describe, expect, it } from 'vitest';
import { TUNING, createRun, groupsFor, nextSpawn, record, slideDone, speedAt, spreadOut, startSlide, type SafariRun } from './safariModel.ts';
import { organismsFor } from '../../../content/ro/safari-organisms.ts';

const rng = (seed = 1) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

/** Spawns everything on the current slide with nothing staying on screen. */
const drain = (run: SafariRun) => {
  const ids: string[] = [];
  let r = run;
  for (let i = 0; i < 100; i += 1) {
    const n = nextSpawn(r, []);
    if (!n.id) break;
    ids.push(n.id);
    r = n.run;
  }
  return { run: r, ids };
};

describe('safariModel', () => {
  it('group availability per mode', () => {
    expect(groupsFor('baza')).toEqual(['bacterii', 'protozoare', 'chromista', 'fungi', 'plante']);
    expect(groupsFor('avansat')).toContain('arhee');
    expect(groupsFor('avansat')).toContain('animale');
    expect(groupsFor('baza')).not.toContain('arhee');
  });

  it('three slides in base mode, four in advanced; each slide spawns exactly its own organisms', () => {
    for (const mode of ['baza', 'avansat'] as const) {
      let run = createRun(mode);
      expect(run.slides.length).toBe(mode === 'baza' ? 3 : 4);
      const seen: string[] = [];
      for (let s = 0; s < run.slides.length; s += 1) {
        run = startSlide(run, rng(s + 3));
        const d = drain(run);
        seen.push(...d.ids);
        run = d.run;
        expect(slideDone(run, [])).toBe(true);
      }
      expect(seen.sort()).toEqual(organismsFor(mode).map((o) => o.id).sort());
    }
  });

  it('never spawns the same organism twice in a row, nor one already on screen', () => {
    const out = spreadOut(['a', 'a', 'b', 'a', 'c']);
    for (let i = 1; i < out.length; i += 1) expect(out[i]).not.toBe(out[i - 1]);
    let run = startSlide(createRun('avansat'), rng(2));
    const first = nextSpawn(run, []);
    run = first.run;
    const second = nextSpawn(run, [first.id!]);
    expect(second.id).not.toBe(first.id);
  });

  it('misses and wrong answers come back in a later slide, at most twice', () => {
    let run = startSlide(createRun('baza'), rng(5));
    const d = drain(run);
    run = d.run;
    const missed = d.ids[0];
    run = record(run, missed, 'escaped', 1).run;
    run = startSlide(run, rng(6));
    expect(run.queue).toContain(missed);
    expect(run.queue[0]).not.toBe(missed); // a slide opens with its own sample
    run = record(run, missed, 'wrong', 2).run;
    run = startSlide(run, rng(7)); // last slide
    expect(run.queue).toContain(missed);
    run = record(run, missed, 'wrong', 3).run; // third miss: no more returns
    expect(drain(run).ids.filter((id) => id === missed).length).toBe(1);
  });

  it('on the last slide a miss returns to the same slide', () => {
    let run = createRun('baza');
    for (let i = 0; i < 3; i += 1) run = startSlide(run, rng(i + 1));
    const d = drain(run);
    run = record(d.run, d.ids[0], 'escaped', 0).run;
    expect(run.queue).toContain(d.ids[0]);
  });

  it('three misses in a row slow the field for a while; a correct answer resets the count', () => {
    let run = startSlide(createRun('baza'), rng(1));
    run = record(run, 'a', 'wrong', 0).run;
    run = record(run, 'b', 'escaped', 1).run;
    run = record(run, 'c', 'correct', 2).run;
    expect(run.missesInRow).toBe(0);
    run = record(run, 'a', 'wrong', 3).run;
    run = record(run, 'b', 'wrong', 4).run;
    const r = record(run, 'c', 'escaped', 5);
    expect(r.slowed).toBe(true);
    expect(speedAt(r.run, 6)).toBe(TUNING.helpFactor);
    expect(speedAt(r.run, 5 + TUNING.helpS + 1)).toBe(1);
  });

  it('the first slide is gentle: few on screen at once', () => {
    const run = startSlide(createRun('avansat'), rng(1));
    expect(nextSpawn(run, ['x', 'y', 'z']).id).toBeNull();
  });
});
