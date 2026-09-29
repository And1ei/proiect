import { describe, expect, it } from 'vitest';
import { createGameSession } from './session';

const item = (n: number) => ({ title: `T${n}`, text: `Text ${n}.` });

describe('session recap (optional, G2)', () => {
  it('a run without a recap has no recap field (backward compatible)', () => {
    const s = createGameSession({ lives: 3 });
    s.start();
    s.finish('won');
    expect('recap' in s.result()).toBe(false);
  });

  it('finish(outcome, recap) keeps at most 3 items', () => {
    const s = createGameSession({});
    s.start();
    s.finish('won', [item(1), item(2), item(3), item(4)]);
    expect(s.result().recap?.map((r) => r.title)).toEqual(['T1', 'T2', 'T3']);
  });

  it('a recap set before the last life is lost is on the lost result', () => {
    const s = createGameSession({ lives: 1 });
    s.start();
    s.setRecap([item(1)]);
    s.loseLife();
    expect(s.get().status).toBe('lost');
    expect(s.result().recap).toEqual([item(1)]);
  });

  it('is ignored outside a run and cleared by a restart', () => {
    const s = createGameSession({});
    s.setRecap([item(1)]);
    expect(s.get().recap).toEqual([]);
    s.start();
    s.setRecap([item(2)]);
    s.restart();
    expect(s.get().recap).toEqual([]);
  });
});
