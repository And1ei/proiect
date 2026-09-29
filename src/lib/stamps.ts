// The three progress stamps of a topic, computed from progress and the registry (never stored):
//   citit    every section has been seen
//   jucat    at least one of its games was played
//   stăpânit a game at 2+ stars, or the "Verifică-te" check at 2 of 3 or better
import { getLesson, LESSONS, sectionPath, type Lesson } from '../content/ro/lessons/index.ts';
import { gamesForTopic, gamePath } from '../games/registry';
import { EMPTY_GAME, EMPTY_TOPIC } from './progress';

type Data = { topics: Record<string, { sectionsRead: string[]; quizBest: { score: number; total: number } | null }>; games: Record<string, typeof EMPTY_GAME>; lastGame?: string | null };

export interface Stamps {
  citit: boolean;
  jucat: boolean;
  stapanit: boolean;
  /** Sections seen, of all. */
  read: number;
  total: number;
}

export function stampsOf(lesson: Lesson, data: Data): Stamps {
  const t = data.topics[lesson.slug] ?? EMPTY_TOPIC;
  const ids = lesson.sections.map((s) => s.id);
  const read = ids.filter((id) => t.sectionsRead.includes(id)).length;
  const games = gamesForTopic(lesson.slug).map((g) => data.games[g.id] ?? EMPTY_GAME);
  return {
    citit: read === ids.length,
    jucat: games.some((g) => g.plays > 0),
    stapanit: games.some((g) => g.stars >= 2) || (t.quizBest !== null && t.quizBest.score >= 2),
    read,
    total: ids.length,
  };
}

/** The first section of a lesson not yet read (null when all are read). */
export function nextUnread(lesson: Lesson, data: Data) {
  const read = data.topics[lesson.slug]?.sectionsRead ?? [];
  return lesson.sections.find((s) => !read.includes(s.id)) ?? null;
}

/** Where "continuă" goes: the last game played, else the next unread section. Null with no progress. */
export function continueTarget(data: Data): { to: string; label: string } | null {
  const anyRead = LESSONS.some((l) => (data.topics[l.slug]?.sectionsRead.length ?? 0) > 0);
  if (!anyRead && !data.lastGame) return null;
  for (const lesson of LESSONS) {
    const s = nextUnread(lesson, data);
    if (s) return { to: sectionPath(lesson.slug, s.id), label: s.title };
  }
  if (data.lastGame) return { to: gamePath(data.lastGame), label: data.lastGame };
  return null;
}

export { getLesson };
