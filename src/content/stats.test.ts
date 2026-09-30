import { describe, expect, it } from 'vitest';
import { FAMILIES, gameCount, isAdvanced, levelCount, plural, PLAYABLE, topicsWithGames, topicsWithoutGames, firstPlayable } from './stats';
import { LESSONS } from './ro/lessons/index.ts';

describe('stats', () => {
  it('pluralizes like Romanian', () => {
    expect(plural(1, 'joc')).toBe('1 joc');
    expect(plural(0, 'joc')).toBe('0 jocuri');
    expect(plural(3, 'joc')).toBe('3 jocuri');
    expect(plural(19, 'lectie')).toBe('19 lecții');
    expect(plural(20, 'nivel')).toBe('20 de niveluri');
    expect(plural(101, 'minut')).toBe('101 minute');
    expect(plural(120, 'minut')).toBe('120 de minute');
  });

  it('counts families and levels from the registry', () => {
    expect(PLAYABLE.every((g) => !g.sandbox)).toBe(true);
    expect(levelCount).toBe(PLAYABLE.length);
    expect(gameCount).toBe(FAMILIES.length);
    expect(FAMILIES.flatMap((f) => f.levels)).toHaveLength(levelCount);
    for (const f of FAMILIES) {
      expect(isAdvanced(f.base)).toBe(false);
      expect(new Set(f.levels.map((g) => g.topicSlug)).size).toBe(1);
    }
    expect(topicsWithGames.length + topicsWithoutGames.length).toBe(LESSONS.length);
  });

  it('places every playable level in its lesson, and "start here" is a base level', () => {
    for (const g of PLAYABLE) {
      const lesson = LESSONS.find((l) => l.slug === g.topicSlug);
      expect(lesson?.games.some((x) => x.gameId === g.id), g.id).toBe(true);
    }
    const start = firstPlayable();
    if (start) expect(isAdvanced(start.game)).toBe(false);
  });
});
