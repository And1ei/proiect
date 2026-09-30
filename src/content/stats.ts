// Every count the site shows, computed from the game registry and the lesson files. Nothing that is
// shown as a number anywhere is typed by hand: read it from here.
//   family  a game (a base entry and its advanced twin are one game with two levels)
//   level   a registry entry (/joc/:id)
import { LESSONS, type Lesson } from './ro/lessons/index.ts';
import { GAMES } from '../games/registry';
import type { GameDefinition } from '../games/core/types';

/** Production games only (the dev sandbox never counts). */
export const PLAYABLE: readonly GameDefinition[] = GAMES.filter((g) => !g.sandbox);

export const familyOf = (g: GameDefinition) => g.family ?? g.id;

export interface GameFamily {
  id: string;
  topicSlug: string;
  /** Registry order: the base level first. */
  levels: GameDefinition[];
  base: GameDefinition;
}

export const FAMILIES: readonly GameFamily[] = PLAYABLE.reduce<GameFamily[]>((out, g) => {
  const f = out.find((x) => x.id === familyOf(g));
  if (f) f.levels.push(g);
  else out.push({ id: familyOf(g), topicSlug: g.topicSlug, levels: [g], base: g });
  return out;
}, []);

/** A level that is not the first of its family is the advanced one ("Avansat · CS"). */
export const isAdvanced = (g: GameDefinition) => FAMILIES.some((f) => f.id === familyOf(g) && f.base.id !== g.id);

export const familiesForTopic = (slug: string) => FAMILIES.filter((f) => f.topicSlug === slug);
export const levelsForTopic = (slug: string) => PLAYABLE.filter((g) => g.topicSlug === slug);
export const topicHasGames = (slug: string) => levelsForTopic(slug).length > 0;

export const gameCount = FAMILIES.length;
export const levelCount = PLAYABLE.length;
/** Games that have an advanced level. */
export const advancedCount = FAMILIES.filter((f) => f.levels.length > 1).length;
export const lessonCount = LESSONS.length;
export const topicsWithGames: readonly Lesson[] = LESSONS.filter((l) => topicHasGames(l.slug));
export const topicsWithoutGames: readonly Lesson[] = LESSONS.filter((l) => !topicHasGames(l.slug));
export const playMinutes = PLAYABLE.reduce((n, g) => n + g.estimatedMinutes, 0);

export const perTopic = LESSONS.map((l) => ({
  slug: l.slug,
  games: familiesForTopic(l.slug).length,
  levels: levelsForTopic(l.slug).length,
  minutes: levelsForTopic(l.slug).reduce((n, g) => n + g.estimatedMinutes, 0),
  quiz: l.check.length,
}));

/** The first playable base level, in topic order (null while no game ships). */
export function firstPlayable() {
  for (const lesson of LESSONS) {
    const f = familiesForTopic(lesson.slug)[0];
    if (f) {
      const placed = lesson.games.find((x) => x.gameId === f.base.id);
      return { lesson, game: f.base, afterSection: placed?.afterSection ?? null };
    }
  }
  return null;
}

// ── Romanian plurals: 1 joc, 2–19 jocuri, 20+ de jocuri (and 0 jocuri, 101 de jocuri…) ──
type Forms = readonly [one: string, few: string, other: string];
export const NOUNS = {
  joc: ['joc', 'jocuri', 'de jocuri'],
  lectie: ['lecție', 'lecții', 'de lecții'],
  nivel: ['nivel', 'niveluri', 'de niveluri'],
  minut: ['minut', 'minute', 'de minute'],
  intrebare: ['întrebare', 'întrebări', 'de întrebări'],
} as const satisfies Record<string, Forms>;

/** Romanian plural category: "few" also covers 0 and numbers ending in 01–19 above 100. */
export function pluralForm(n: number): 0 | 1 | 2 {
  if (n === 1) return 0;
  const r = Math.abs(n) % 100;
  return n === 0 || (r >= 1 && r <= 19) ? 1 : 2;
}

/** `plural(3, 'joc')` → "3 jocuri", `plural(20, 'joc')` → "20 de jocuri". */
export const plural = (n: number, noun: keyof typeof NOUNS) => `${n} ${NOUNS[noun][pluralForm(n)]}`;

/** Exposed on window for the site check, which compares rendered text with these values. */
export const SITE_STATS = {
  gameCount,
  levelCount,
  advancedCount,
  lessonCount,
  playMinutes,
  topicsWithGames: topicsWithGames.map((l) => l.slug),
  topicsWithoutGames: topicsWithoutGames.map((l) => l.slug),
  perTopic,
  games: FAMILIES.map((f) => ({ family: f.id, topic: f.topicSlug, levels: f.levels.map((g) => g.id) })),
};
